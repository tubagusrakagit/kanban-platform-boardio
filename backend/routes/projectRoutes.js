const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
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


module.exports = router;