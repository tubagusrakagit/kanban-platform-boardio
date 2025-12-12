// backend/routes/memberRoutes.js
const express = require('express');
const router = express.Router();
const { searchUsers, addMemberToProject } = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');

// Route untuk mencari user
router.get('/', protect, searchUsers);

// Route untuk menambah user ke project
router.post('/add', protect, addMemberToProject);

module.exports = router;