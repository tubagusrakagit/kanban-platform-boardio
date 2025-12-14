// backend/server.js (Perubahan Kritis)

require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Fungsi koneksi DB
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const Project = require('./models/Project'); // <-- BARU: Import Model Project

const app = express();
const PORT = process.env.PORT || 5000;

// =========================================================
// 1. MIDDLEWARE GLOBAL
// =========================================================

app.use(express.json()); 
app.use(cors()); 

app.get('/', (req, res) => {
  res.send('API Kanban Berjalan!');
});

// =========================================================
// 2. DEFINISI RUTE API
// =========================================================

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/boards', require('./routes/boardRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));

// =========================================================
// 3. FUNGSI INI AKAN MENJALANKAN SERVER (BARU)
// =========================================================
const startServer = async () => {
    // 1. Koneksi ke Database (Kita asumsikan connectDB akan menangani kegagalan)
    await connectDB();
    
    // 2. FORCE DROP INDEX BERMASALAH
    // Jalankan ini setelah koneksi berhasil, sebelum server listen
    try {
        await Project.collection.dropIndex('inviteToken_1'); 
        console.log("🛠️ Index 'inviteToken_1' (unique) lama berhasil dihapus secara paksa.");
    } catch (error) {
        if (error.codeName !== 'IndexNotFound') {
             console.warn("⚠️ Peringatan saat drop index (abaikan jika IndexNotFound):", error.message);
        }
    }
    
    // 3. Jalankan Server
    app.listen(PORT, () => {
        console.log(`Server berjalan di port ${PORT}`);
    });
};

startServer(); // <-- Panggil fungsi untuk memulai proses