// backend/controllers/memberController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Mencari pengguna berdasarkan nama atau email
// @route   GET /api/members?search=keyword
// @access  Private
const searchUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search 
        ? {
            // Logika pencarian: mencari di field name ATAU email, case-insensitive
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ],
        } 
        : {};

    // Ambil user, kecuali user yang sedang login
    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } }).select('id name email');
    
    res.send(users);
});

// @desc    Menambahkan anggota tim ke proyek
// @route   POST /api/members/add
// @access  Private
const addMemberToProject = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.body;

    if (!projectId || !userId) {
        res.status(400);
        throw new Error('Project ID dan User ID wajib diisi.');
    }

    const project = await Project.findById(projectId);

    if (!project) {
        res.status(404);
        throw new Error('Proyek tidak ditemukan.');
    }

    // Otorisasi: Hanya owner yang bisa menambahkan anggota
    if (!project.owner.equals(req.user._id)) {
        res.status(403);
        throw new Error('Akses ditolak. Hanya pemilik proyek yang dapat menambah anggota.');
    }

    // Cek apakah user sudah menjadi member atau owner
    if (project.members.includes(userId) || project.owner.equals(userId)) {
        res.status(400);
        throw new Error('Pengguna sudah menjadi anggota proyek ini.');
    }

    // Tambahkan user ke array members
    project.members.push(userId);
    const updatedProject = await project.save();

    res.json({ message: 'Anggota berhasil ditambahkan', members: updatedProject.members });
});

module.exports = {
    searchUsers,
    addMemberToProject,
};