// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../api/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (localStorage.getItem('userInfo')) {
      navigate('/');
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await authService.login(email, password); 
      navigate('/'); 
      window.location.reload(); 
    } catch (err) {
      const message = err.response?.data?.message ?? 'Login gagal. Periksa kredensial Anda.';
      setError(message);
    }
  };

  return (
    // UBAH DISINI: Background utama menjadi #2c2c2c
    <div className="min-h-screen flex items-center justify-center bg-[#2c2c2c] py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Kartu Login: Tetap Putih (bg-white) agar kontras maksimal dengan background gelap */}
      <div className="max-w-sm w-full space-y-8 bg-white p-10 md:p-12 rounded-2xl shadow-2xl transition duration-500 transform hover:scale-[1.01]">
        
        <div>
          {/* Judul menggunakan warna #2c2c2c agar senada */}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#2c2c2c] tracking-tight">
            Selamat Datang
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Masuk ke Boardia
          </p>
        </div>
        
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
                {error}
            </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="space-y-4">
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

          <div>
            <button
              type="submit"
              // Tombol menggunakan warna #2c2c2c (sama dengan background page)
              // Saat hover menjadi sedikit lebih terang (#404040)
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#2c2c2c] hover:bg-[#404040] transition duration-300 shadow-lg hover:shadow-xl transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Masuk
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
            <Link to="/register" className="font-medium text-[#2c2c2c] hover:text-gray-600 transition duration-200 text-sm hover:underline">
                Belum punya akun? <span className="font-bold">Daftar</span>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;