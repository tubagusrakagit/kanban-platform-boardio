// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Terhubung: ${conn.connection.host}`);
  } catch (error) {
    // PENTING: Jika gagal, ini yang harusnya muncul di terminal Anda
    console.error(`❌ Error Koneksi MongoDB: ${error.message}`); 
    process.exit(1); // Ini akan menghentikan server dan menampilkan error
  }
};

module.exports = connectDB;