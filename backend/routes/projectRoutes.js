const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  generateInviteToken,
  joinProjectByToken,
  kickMember,
} = require('../controllers/projectController');

const router = express.Router();

// Rute untuk Membuat Proyek dan Mendapatkan Semua Proyek
router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

// Rute untuk Detail, Update, dan Delete
router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

// 1. GENERATE TOKEN
router.put('/:id/generate-invite', protect, generateInviteToken); 
// Catatan: Saya ganti :projectId menjadi :id agar cocok dengan format router.route('/:id') di atas

// 2. JOIN DENGAN TOKEN 
router.post('/join/:token', protect, joinProjectByToken);

// --- ROUTE BARU UNTUK KICK MEMBER ---
router.put('/:projectId/kick/:memberId', protect, kickMember);


module.exports = router;