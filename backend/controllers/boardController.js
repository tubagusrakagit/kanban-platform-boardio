// backend/controllers/boardController.js
const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Column = require('../models/Column');

const createDefaultColumns = async (projectId) => {
    try {
        const defaultColumns = [
            { title: 'To Do', columnId: 'todo', order: 1, project: projectId },
            { title: 'In Progress', columnId: 'in-progress', order: 2, project: projectId },
            { title: 'Done', columnId: 'done', order: 3, project: projectId },
        ];
        await Column.insertMany(defaultColumns);
    } catch (error) {
        console.error("Gagal membuat kolom default:", error);
        throw new Error('Gagal menginisialisasi kolom board.');
    }
};


const getBoard = asyncHandler(async (req, res) => {
    const projectId = req.params.projectId;

    try {
        // 1. Ambil Proyek dengan Populate
        const project = await Project.findById(projectId)
            .populate('owner', 'name email')
            .populate('members', 'name email');

        if (!project) {
            res.status(404);
            throw new Error('Proyek tidak ditemukan.');
        }

        // 2. Otorisasi yang Lebih Aman (Menggunakan toString() untuk menghindari crash tipe data)
        const currentUserId = req.user._id.toString();
        
        // Cek Owner (Safe Check)
        const isOwner = project.owner && project.owner._id.toString() === currentUserId;
        
        // Cek Member (Safe Check)
        const isMember = project.members && project.members.some(member => member._id.toString() === currentUserId);

        if (!isOwner && !isMember) {
            res.status(403);
            throw new Error('Akses ditolak ke board ini.');
        }

        // 3. Ambil Kolom (jika belum ada, buat kolom default)
        let columns = await Column.find({ project: projectId }).sort('order');
        
        if (columns.length === 0) {
            console.log(`Menginisialisasi kolom default untuk proyek: ${project.name}`);
            await createDefaultColumns(projectId);
            // Ambil ulang setelah dibuat
            columns = await Column.find({ project: projectId }).sort('order');
        }

        // 4. Ambil Tugas
        const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name');

        // 5. Kirim Response
        res.json({
            project: project.name,
            owner: project.owner,
            members: project.members,
            columns,
            tasks,
        });

    } catch (error) {
        // Log error ke terminal backend agar terlihat
        console.error("Error di getBoard:", error);
        res.status(500);
        throw new Error(error.message || 'Terjadi kesalahan server saat memuat board.');
    }
});


const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, priority } = req.body;
    const projectId = req.params.projectId;

    if (!title) {
        res.status(400);
        throw new Error('Judul tugas wajib diisi'); // <-- KOREKSI: Hapus 'new new'
    }

    // Pastikan kolom ada sebelum membuat tugas
    let firstColumn = await Column.findOne({ project: projectId }).sort('order');
    
    // Fallback jika kolom entah kenapa hilang
    if (!firstColumn) {
        await createDefaultColumns(projectId);
        firstColumn = await Column.findOne({ project: projectId }).sort('order');
    }
    
    const task = await Task.create({
        project: projectId,
        title,
        description,
        assignedTo,
        priority,
        status: firstColumn.columnId,
    });

    res.status(201).json(task);
});


const moveTask = asyncHandler(async (req, res) => {
    const { newStatus } = req.body;
    const { taskId, projectId } = req.params;

    // Cek Proyek
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Proyek tidak ditemukan');
    }

    // Otorisasi Aman
    const currentUserId = req.user._id.toString();
    const isOwner = project.owner.toString() === currentUserId; // Owner belum dipopulate di sini, jadi langsung string
    const isMember = project.members.map(id => id.toString()).includes(currentUserId);

    if (!isOwner && !isMember) {
        res.status(403);
        throw new Error('Akses ditolak: Anda bukan anggota proyek ini.');
    }

    const task = await Task.findById(taskId);

    if (task) {
        task.status = newStatus; 
        await task.save(); 
        res.json(task); 
    } else {
        res.status(404);
        throw new Error('Tugas tidak ditemukan');
    }
});


const updateTask = asyncHandler(async (req, res) => {
    const { taskId, projectId } = req.params;
    
    // Cek Proyek & Otorisasi
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Proyek tidak ditemukan');
    }

    const currentUserId = req.user._id.toString();
    const isOwner = project.owner.toString() === currentUserId;
    const isMember = project.members.map(id => id.toString()).includes(currentUserId);

    if (!isOwner && !isMember) {
        res.status(403);
        throw new Error('Akses ditolak');
    }

    const task = await Task.findById(taskId);

    if (task) {
        task.title = req.body.title !== undefined ? req.body.title : task.title;
        task.description = req.body.description !== undefined ? req.body.description : task.description;
        task.priority = req.body.priority !== undefined ? req.body.priority : task.priority;
        task.assignedTo = req.body.assignedTo !== undefined ? req.body.assignedTo : task.assignedTo; 
        
        const updatedTask = await task.save();
        res.json(updatedTask);
    } else {
        res.status(404);
        throw new Error('Tugas tidak ditemukan');
    }
});


const deleteTask = asyncHandler(async (req, res) => {
    const { taskId, projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Proyek tidak ditemukan');
    }

    const currentUserId = req.user._id.toString();
    const isOwner = project.owner.toString() === currentUserId;
    const isMember = project.members.map(id => id.toString()).includes(currentUserId);

    if (!isOwner && !isMember) {
        res.status(403);
        throw new Error('Akses ditolak');
    }

    const task = await Task.findById(taskId);

    if (task) {
        await Task.deleteOne({ _id: taskId });
        res.json({ message: 'Tugas berhasil dihapus' });
    } else {
        res.status(404);
        throw new Error('Tugas tidak ditemukan');
    }
});


module.exports = {
    getBoard,
    createTask,
    moveTask,
    updateTask, 
    deleteTask, 
};