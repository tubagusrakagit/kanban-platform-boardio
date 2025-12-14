// frontend/src/pages/JoinProjectPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../api/projectService';
import { getRecentBoards, addRecentBoard } from '../utils/recentBoards';

const JoinProjectPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Memvalidasi link undangan...');
    
    // Cek apakah user sudah login
    const userInfo = localStorage.getItem('userInfo');

    useEffect(() => {
        const handleJoin = async () => {
            // Jika user belum login, arahkan ke login
            if (!userInfo) {
                setMessage('Anda harus login untuk bergabung. Mengalihkan ke halaman login...');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            try {
                // Panggil API join
                const result = await projectService.joinProjectByToken(token);
                
                // Sukses
                setStatus('success');
                setMessage(result.message || `Berhasil bergabung ke proyek: ${result.projectName}`);
                
                // Tambahkan ke recent boards dan redirect
                addRecentBoard(result.projectId, result.projectName);
                
                setTimeout(() => {
                    navigate(`/board/${result.projectId}`);
                }, 2000);

            } catch (err) {
                setStatus('error');
                const errorMessage = err.response?.data?.message || 'Gagal bergabung. Link mungkin tidak valid atau sudah dipakai.';
                setMessage(errorMessage);
                
                // Jika error (misal token expired/invalid), redirect ke dashboard
                setTimeout(() => navigate('/'), 4000);
            }
        };

        if (token) {
            handleJoin();
        } else {
             setMessage('Token tidak ditemukan.');
             setStatus('error');
             setTimeout(() => navigate('/'), 2000);
        }
    }, [token, navigate, userInfo]);


    const statusStyles = {
        loading: { bg: 'bg-blue-900/50', text: 'text-blue-300', icon: 'animate-spin h-6 w-6' },
        success: { bg: 'bg-green-900/50', text: 'text-green-300', icon: 'h-6 w-6' },
        error: { bg: 'bg-red-900/50', text: 'text-red-300', icon: 'h-6 w-6' },
    };
    
    const currentStyle = statusStyles[status];

    return (
        // Karena ini halaman full-page (tanpa sidebar), tidak perlu ml-64
        <div className="flex justify-center items-center min-h-screen bg-[#2c2c2c] p-6">
            <div className={`w-full max-w-md p-8 rounded-xl shadow-2xl border ${currentStyle.bg} ${currentStyle.text} text-center`}>
                <div className="flex justify-center mb-4">
                    {/* Ganti ikon sesuai status */}
                    {status === 'loading' && <svg className={currentStyle.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0012 20c4.418 0 8-3.582 8-8h-4c0 2.21-1.79 4-4 4s-4-1.79-4-4H6c0 3.313 1.33 6.313 3.464 8.464l1.414-1.414z"></path></svg>}
                    {status === 'success' && <svg className={currentStyle.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    {status === 'error' && <svg className={currentStyle.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </div>
                <h1 className="text-xl font-bold mb-2">{status === 'success' ? 'Berhasil!' : status === 'error' ? 'Gagal!' : 'Memproses...'}</h1>
                <p className="text-sm font-medium">{message}</p>
            </div>
        </div>
    );
};

export default JoinProjectPage;