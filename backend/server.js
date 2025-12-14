//server.js

require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

connectDB();

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
// 3. JALANKAN SERVER
// =========================================================
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});