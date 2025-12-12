// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Middleware untuk melindungi rute (memastikan pengguna sudah login)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Cek apakah ada token di header (Authorization: Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Ambil token dari format "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // 2. Verifikasi token menggunakan JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Ambil data user dari database (tanpa password)
      // Data user disimpan di req.user, dan ini dapat diakses di controller berikutnya
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Lanjut ke controller/rute berikutnya
    } catch (error) {
      console.error(error);
      res.status(401); // Unauthorized
      throw new Error('Tidak terotorisasi, token gagal');
    }
  }

  // Jika tidak ada token sama sekali
  if (!token) {
    res.status(401);
    throw new Error('Tidak terotorisasi, tidak ada token');
  }
});

// Middleware untuk Otorisasi Berbasis Peran (RBAC)
// Contoh penggunaan: authorize('admin') atau authorize(['manager', 'admin'])
const authorize = (roles = []) => {
  // Jika 'roles' adalah string, ubah menjadi array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // 1. Cek apakah pengguna di-autentikasi (middleware protect harus dijalankan duluan)
    if (!req.user) {
      res.status(401);
      throw new Error('Tidak terautentikasi. Silakan login.');
    }
    
    // 2. Cek apakah peran pengguna termasuk dalam array peran yang diizinkan
    if (roles.length && !roles.includes(req.user.role)) {
      res.status(403); // Forbidden
      throw new Error(`Akses ditolak. Hanya pengguna dengan peran: ${roles.join(', ')} yang diizinkan.`);
    }

    next();
  };
};

module.exports = { protect, authorize };