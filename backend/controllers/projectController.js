const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');

// @desc    Buat Proyek Baru
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const { name, description, members } = req.body;

  // req.user.id datang dari authMiddleware (protect)
  const project = new Project({
    name,
    description,
    owner: req.user.id, // Pemilik proyek adalah pengguna yang sedang login
    members: members || [],
  });

  const createdProject = await project.save();
  res.status(201).json(createdProject);
});

// @desc    Dapatkan Semua Proyek (Proyek yang dimiliki atau diikutinya)
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  // Hanya tampilkan proyek di mana pengguna adalah owner ATAU member
  const projects = await Project.find({
    $or: [
      { owner: req.user.id },
      { members: req.user.id }
    ]
  }).populate('owner', 'name email'); // Ambil data owner (nama & email)

  res.json(projects);
});

// @desc    Dapatkan Detail Proyek
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('members', 'name email');
  
  // Otorisasi: Hanya pemilik, member, atau Admin yang bisa melihat detail
  const isAuthorized = project.owner._id.equals(req.user.id) || project.members.some(member => member._id.equals(req.user.id)) || req.user.role === 'admin';

  if (project && isAuthorized) {
    res.json(project);
  } else if (!project) {
    res.status(404);
    throw new Error('Proyek tidak ditemukan');
  } else {
    res.status(403); // Forbidden
    throw new Error('Akses ditolak ke proyek ini');
  }
});

// @desc    Update Proyek
// @route   PUT /api/projects/:id
// @access  Private/Owner or Admin
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    // Otorisasi: Hanya pemilik proyek ATAU Admin yang dapat update
    const isOwner = project.owner.equals(req.user.id);
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Akses ditolak. Hanya pemilik atau Admin yang dapat memperbarui.');
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    project.members = req.body.members || project.members;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Proyek tidak ditemukan');
  }
});


// @desc    Hapus Proyek
// @route   DELETE /api/projects/:id
// @access  Private/Owner or Admin
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    // Otorisasi: Hanya pemilik proyek ATAU Admin yang dapat menghapus
    const isOwner = project.owner.equals(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Akses ditolak. Hanya pemilik atau Admin yang dapat menghapus.');
    }

    await Project.deleteOne({ _id: req.params.id });
    res.json({ message: 'Proyek berhasil dihapus' });
  } else {
    res.status(404);
    throw new Error('Proyek tidak ditemukan');
  }
});


module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};