// backend/models/Project.js
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  owner: {
    // Menghubungkan Proyek ke Pengguna (Foreign Key di SQL)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  members: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        role: { 
            type: String, 
            enum: ['Owner', 'Admin', 'Editor', 'Viewer'], 
            default: 'Editor' 
        }
    }],
  inviteToken: {
        type: String,
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);