// backend/models/Task.js
const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true // Agar otomatis ada createdAt (jam berapa komen dibuat)
});

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
        dueDate: { 
        type: Date, 
        default: null
        },
        comments: [commentSchema]
        
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;