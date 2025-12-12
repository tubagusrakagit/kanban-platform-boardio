// backend/models/Task.js
const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Project',
        },
        title: {
            type: String,
            required: [true, 'Judul tugas wajib diisi'],
            trim: true,
        },
        description: {
            type: String,
            required: false,
        },
        // Status ini akan menjadi ID dari Kolom (To Do, In Progress, Done)
        status: { 
            type: String, 
            required: true,
        }, 
        // User yang bertanggung jawab (opsional)
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium',
        },
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;