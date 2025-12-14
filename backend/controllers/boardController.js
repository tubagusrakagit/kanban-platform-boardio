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
            .populate('members.user', 'name email');

        if (!project) {
            res.status(404);
            throw new Error('Proyek tidak ditemukan.');
        }

        // 2. Otorisasi yang Lebih Aman (Menggunakan toString() untuk menghindari crash tipe data)
        const currentUserId = req.user._id.toString();
        
        // Cek Owner (Safe Check)
        const isOwner = project.owner && project.owner._id.toString() === currentUserId;
        
        // Cek Member (Safe Check)
        const isMember = project.members && project.members.some(member => 
            member.user && member.user._id.toString() === currentUserId 
        );

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
    // LOG: Cek data mentah yang masuk
    console.log("📥 [CREATE TASK] Data Diterima:", req.body);

    const { title, description, assignedTo, priority, dueDate } = req.body; // <--- Ambil dueDate
    const projectId = req.params.projectId;

    if (!title) {
        console.error("❌ [CREATE TASK] Error: Judul kosong");
        res.status(400);
        throw new Error('Judul tugas wajib diisi');
    }

    let validAssignedTo = null;
    if (assignedTo && assignedTo !== "" && assignedTo !== "null") {
        validAssignedTo = assignedTo;
    }

    // LOG: Cek validasi assignee
    console.log(`🔍 [CREATE TASK] Assignee: ${validAssignedTo ? validAssignedTo : 'None'}`);

    let firstColumn = await Column.findOne({ project: projectId }).sort('order');
    if (!firstColumn) {
        await createDefaultColumns(projectId);
        firstColumn = await Column.findOne({ project: projectId }).sort('order');
    }
    
    try {
        const task = await Task.create({
            project: projectId,
            title,
            description,
            assignedTo: validAssignedTo,
            priority,
            dueDate: dueDate || null, // <--- Simpan Due Date
            status: firstColumn.columnId,
        });

        console.log("✅ [CREATE TASK] Sukses! ID:", task._id);
        res.status(201).json(task);
    } catch (error) {
        console.error("🔥 [CREATE TASK] DB Error:", error.message);
        res.status(500);
        throw new Error('Gagal menyimpan tugas.');
    }
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
    const isMember = project.members.some(member => 
        member.user.toString() === currentUserId
    );
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
    
    // LOG: Cek request update
    console.log(`📥 [UPDATE TASK] Request untuk Task ID: ${taskId}`);
    console.log("   Data Update:", req.body);

    const project = await Project.findById(projectId);
    if (!project) { res.status(404); throw new Error('Proyek tidak ditemukan'); }

    const currentUserId = req.user._id.toString();
    const isOwner = project.owner.toString() === currentUserId;
    const isMember = project.members.some(member => 
        member.user.toString() === currentUserId
    );

    if (!isOwner && !isMember) { 
        console.warn(`⛔ [UPDATE TASK] Akses Ditolak User: ${currentUserId}`);
        res.status(403); 
        throw new Error('Akses ditolak'); 
    }

    const task = await Task.findById(taskId);

    if (task) {
        // Update field jika ada di req.body
        task.title = req.body.title !== undefined ? req.body.title : task.title;
        task.description = req.body.description !== undefined ? req.body.description : task.description;
        task.priority = req.body.priority !== undefined ? req.body.priority : task.priority;
        task.assignedTo = req.body.assignedTo !== undefined ? req.body.assignedTo : task.assignedTo;
        
        // --- UPDATE DUE DATE ---
        if (req.body.dueDate !== undefined) {
            task.dueDate = req.body.dueDate;
        }
        // -----------------------

        const updatedTask = await task.save();
        console.log("✅ [UPDATE TASK] Berhasil disimpan.");
        res.json(updatedTask);
    } else {
        console.error("❌ [UPDATE TASK] Task tidak ditemukan di DB");
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
    const isMember = project.members.some(member => 
        // Akses member.user (yang berisi ID String/ObjectID User)
        member.user.toString() === currentUserId
    );

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

const addTaskComment = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { text } = req.body;

    // Validasi input
    if (!text) {
        res.status(400);
        throw new Error('Isi komentar tidak boleh kosong');
    }

    const task = await Task.findById(taskId);

    if (task) {
        // Buat object komentar
        const comment = {
            text,
            user: req.user._id, // Ambil ID user yang sedang login
        };

        task.comments.push(comment); // Masukkan ke array
        await task.save();

        // Kita perlu populate user agar frontend bisa menampilkan nama & avatar penomen
        const updatedTask = await Task.findById(taskId)
            .populate('assignedTo', 'name')
            .populate('comments.user', 'name email'); // Populate user di dalam comments

        res.status(201).json(updatedTask);
    } else {
        res.status(404);
        throw new Error('Task tidak ditemukan');
    }
});

// ------------------------------------------------------------------
// FITUR BARU: HAPUS KOMENTAR
// ------------------------------------------------------------------
const deleteTaskComment = asyncHandler(async (req, res) => {
    const { taskId, commentId } = req.params;

    const task = await Task.findById(taskId);

    if (task) {
        // Cari komentar
        const comment = task.comments.id(commentId);

        if (!comment) {
            res.status(404);
            throw new Error('Komentar tidak ditemukan');
        }

        // Pastikan yang menghapus adalah pemilik komentar ATAU pemilik project (Opsional, saat ini kita buat pemilik komen saja)
        if (comment.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Anda tidak berhak menghapus komentar ini');
        }

        // Hapus komentar dari array
        comment.deleteOne(); 
        await task.save();

        const updatedTask = await Task.findById(taskId)
            .populate('assignedTo', 'name')
            .populate('comments.user', 'name email');

        res.json(updatedTask);
    } else {
        res.status(404);
        throw new Error('Task tidak ditemukan');
    }
});


module.exports = {
    getBoard,
    createTask,
    moveTask,
    updateTask, 
    deleteTask, 
    addTaskComment,   
    deleteTaskComment,
};