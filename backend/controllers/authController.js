// backend/controllers/authController.js
const asyncHandler = require('express-async-handler'); // Helper untuk error handling async
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Daftarkan pengguna baru
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Pengguna dengan email tersebut sudah terdaftar');
  }

  const user = await User.create({
    name,
    email,
    password, // Password akan di-hash oleh middleware User.js sebelum disimpan
    role,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id), // Kirim JWT
    });
  } else {
    res.status(400);
    throw new Error('Data pengguna tidak valid');
  }
});

// @desc    Autentikasi pengguna & dapatkan token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // Panggil method matchPassword yang kita definisikan di User.js
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id), // Kirim JWT
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error('Email atau password tidak valid');
  }
});

module.exports = { registerUser, loginUser };