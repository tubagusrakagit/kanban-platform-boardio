// backend/models/User.js (Diperbarui)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt

const UserSchema = new mongoose.Schema({
  // ... (definisi name, email, password, role tetap sama)
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' },
}, { timestamps: true });

// >>> Tambahkan Middleware Pre-Save (Hashing Password) <<<
UserSchema.pre('save', async function (next) {
  // Hanya jalankan jika password diubah
  if (!this.isModified('password')) {
    next();
  }

  // Generate salt dan hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// >>> Tambahkan Method untuk Membandingkan Password <<<
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);