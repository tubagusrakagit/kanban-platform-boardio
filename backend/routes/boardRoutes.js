// backend/routes/boardRoutes.js
const express = require('express');
const router = express.Router();
const { getBoard, createTask, moveTask, updateTask, deleteTask } = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');


// Rute untuk mendapatkan seluruh board
router.route('/:projectId').get(protect, getBoard);

// Rute untuk Task (membuat tugas dan memindahkannya)
router.route('/:projectId/tasks')
    .post(protect, createTask);

router.route('/:projectId/tasks/:taskId')
    .put(protect, updateTask) // <-- Rute Update Task
    .delete(protect, deleteTask); // <-- Rute Delete Task

router.route('/:projectId/tasks/:taskId/move')
    .put(protect, moveTask);

module.exports = router;