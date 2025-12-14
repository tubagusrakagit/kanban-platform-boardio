const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const User = require('../models/User');
const crypto = require('crypto');

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
    members: [{ user: req.user.id, role: 'Owner' }],
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
      { 'members.user': req.user.id }
    ]
  }).populate('members.user', 'name email'); // Ambil data owner (nama & email)

  res.json(projects);
});

// @desc    Dapatkan Detail Proyek
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('members.user', 'name email');
  
  // Otorisasi: Hanya pemilik, member, atau Admin yang bisa melihat detail
  const isAuthorized = project.owner._id.equals(req.user.id) || project.members.some(member => member.user._id.equals(req.user.id));

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

// ------------------------------------------------------------------
// FITUR BARU: GENERATE SHAREABLE INVITE TOKEN
// ------------------------------------------------------------------
const generateInviteToken = asyncHandler(async (req, res) => {
  console.log("DEBUG 1: Memproses permintaan generate token...");
    const { id: projectId } = req.params; 

    const project = await Project.findById(projectId);

    if (!project) {
        res.status(404);
        throw new Error('Proyek tidak ditemukan');
    }

    // DEBUG 2: Cek ID Proyek
    console.log(`DEBUG 2: Proyek ID ditemukan: ${project._id}`);

    const currentUserId = req.user._id.toString();
    const isProjectOwner = project.owner.toString() === currentUserId;
    const memberEntry = project.members.find(m => m.user.toString() === currentUserId);
    const memberRole = memberEntry ? memberEntry.role : null;
    

    // DEBUG 3: Cek Role User
    console.log(`DEBUG 3: User ID: ${currentUserId}, Role Ditemukan: ${memberRole}, Is Owner: ${isProjectOwner}`); 
    
    // Jika BUKAN Owner di field owner, DAN role di member array BUKAN Owner/Admin, TOLAK
    if (!isProjectOwner && memberRole !== 'Owner' && memberRole !== 'Admin') {
         // DEBUG 4: Akses Ditolak
         console.log("DEBUG 4: Akses ditolak.");
         res.status(403);
         throw new Error('Hanya Owner atau Admin yang dapat membuat link undangan');
    }
    
    // DEBUG 5: Otorisasi Lolos
    console.log("DEBUG 5: Otorisasi lolos, membuat token.");

    const token = crypto.randomBytes(20).toString('hex');

    project.inviteToken = token;
    await project.save();

    // DEBUG 6: Berhasil
    console.log("DEBUG 6: Token berhasil disimpan, mengirim respons.");

    res.json({ 
        token, 
        message: 'Link undangan berhasil diperbarui.' 
    });
});

// ------------------------------------------------------------------
// FITUR BARU: JOIN PROJECT VIA TOKEN LINK
// ------------------------------------------------------------------
const joinProjectByToken = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const memberId = req.user._id;

    const project = await Project.findOne({ inviteToken: token });

    if (!project) {
        res.status(404);
        throw new Error('Link undangan tidak valid atau sudah kedaluwarsa');
    }

    const isAlreadyMember = project.members.some(m => m.user.toString() === memberId.toString());
    
    if (project.owner.toString() === memberId.toString() || isAlreadyMember) {
        res.status(400);
        throw new Error('Anda sudah menjadi anggota proyek ini.');
    }

    project.members.push({ user: memberId, role: 'Editor' });
    
    project.inviteToken = null; 
    
    await project.save();

    res.json({ 
        projectId: project._id, 
        projectName: project.name,
        message: `Selamat datang di proyek ${project.name}! Anda adalah Editor.` 
    });
});

// @desc    Mengeluarkan anggota dari proyek
// @route   PUT /api/projects/:projectId/kick/:memberId
// @access  Private/Owner or Admin
const kickMember = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params;
    const currentUserId = req.user._id.toString();

    const project = await Project.findById(projectId);

    if (!project) {
        res.status(404);
        throw new Error('Proyek tidak ditemukan');
    }

    // Otorisasi: Hanya Owner proyek yang boleh mengeluarkan anggota
    const isOwner = project.owner.toString() === currentUserId;
    
    // Asumsi: Kita cek Owner dari field owner, atau dari role 'Owner'/'Admin' di array members
    // Mari kita sederhanakan: HANYA jika Owner field sama dengan user login
    if (!isOwner) {
        // Cek jika user login adalah Admin (jika implementasi role admin sudah ada)
        const currentMemberRole = project.members.find(m => m.user.toString() === currentUserId)?.role;
        
        if (currentMemberRole !== 'Admin') {
            res.status(403);
            throw new Error('Hanya Owner atau Admin yang dapat mengeluarkan anggota.');
        }
    }
    
    // Jangan izinkan Owner mengeluarkan dirinya sendiri
    if (memberId === project.owner.toString()) {
         res.status(400);
         throw new Error('Owner tidak dapat mengeluarkan dirinya sendiri.');
    }
    
    // 1. Filter array members (Hapus memberId dari array)
    const initialMemberCount = project.members.length;

    project.members = project.members.filter(member => 
        // Filter berdasarkan ID user di dalam objek member
        member.user.toString() !== memberId
    );

    if (project.members.length === initialMemberCount) {
         res.status(404);
         throw new Error('Anggota tidak ditemukan di proyek ini.');
    }

    await project.save();

    res.json({ 
        message: `Anggota dengan ID ${memberId} berhasil dikeluarkan.`, 
        members: project.members 
    });
});


module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  generateInviteToken, 
  joinProjectByToken,
  kickMember,
};