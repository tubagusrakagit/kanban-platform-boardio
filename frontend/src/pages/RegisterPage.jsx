// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../api/authService';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect jika sudah login
  if (localStorage.getItem('userInfo')) {
    navigate('/');
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Role default adalah 'member'
      await authService.register(name, email, password, 'member'); 
      navigate('/');
      window.location.reload(); 
      
    } catch (err) {
      const message = err.response?.data?.message ?? 'Pendaftaran gagal';
      setError(message);
    }
  };

  return (
    // UBAH DISINI: Background utama menjadi #2c2c2c (Charcoal)
    <div className="min-h-screen flex items-center justify-center bg-[#2c2c2c] py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Kartu Register: Tetap Putih (bg-white) agar kontras dengan background gelap */}
      <div className="max-w-sm w-full space-y-8 bg-white p-10 md:p-12 rounded-2xl shadow-2xl border border-gray-100 transition duration-500 ease-in-out transform hover:scale-[1.01]">
        
        <div>
          {/* Judul menggunakan warna #2c2c2c */}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#2c2c2c] tracking-tight">
            Daftar Akun Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Kelola tugas Anda dengan Boardia
          </p>
        </div>
        
        {/* Tampilan Error */}
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg relative text-sm font-medium" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {/* Form Register */}
        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="space-y-4">
            
            {/* Input Nama Lengkap */}
            <div>
              <input
                id="name"
                name="name"
                type="text"
                required
                // Styling Input: Fokus ring menggunakan warna #2c2c2c
                className="w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2c2c2c] focus:border-transparent transition duration-200 shadow-sm text-sm"
                placeholder="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Input Email */}
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2c2c2c] focus:border-transparent transition duration-200 shadow-sm text-sm"
                placeholder="Alamat Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {/* Input Password */}
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2c2c2c] focus:border-transparent transition duration-200 shadow-sm text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Tombol Daftar */}
          <div>
            <button
              type="submit"
              // Styling Tombol: Background #2c2c2c, Hover #404040
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#2c2c2c] hover:bg-[#404040] transition duration-300 transform hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Daftar Akun
            </button>
          </div>
        </form>

        {/* Link Login */}
        <div className="text-center pt-2">
            <Link to="/login" className="font-medium text-[#2c2c2c] hover:text-gray-600 transition duration-200 text-sm hover:underline">
                Sudah punya akun? <span className="font-bold">Login di sini</span>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;