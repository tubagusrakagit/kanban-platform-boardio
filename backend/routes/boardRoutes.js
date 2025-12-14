// backend/routes/boardRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getBoard, 
    createTask, 
    moveTask, 
    updateTask, 
    deleteTask,
    addTaskComment,    
    deleteTaskComment  
} = require('../controllers/boardController');


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

router.post('/:projectId/tasks/:taskId/comments', protect, addTaskComment);
router.delete('/:projectId/tasks/:taskId/comments/:commentId', protect, deleteTaskComment);

module.exports = router;