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
  members: [
    {
      // Daftar anggota tim yang terlibat dalam proyek
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);