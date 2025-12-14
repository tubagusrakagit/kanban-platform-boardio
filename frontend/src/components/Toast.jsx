// frontend/src/components/Toast.jsx

import React from 'react';

const Toast = ({ message, type }) => {
    // Tentukan warna berdasarkan tipe
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const title = type === 'success' ? 'Berhasil!' : 'Terjadi Kesalahan';
    
    return (
        <div className="fixed bottom-5 right-5 z-[100]">
            <div className={`p-4 rounded-lg shadow-2xl text-white max-w-xs ${bgColor}`}>
                <p className="font-bold">{title}</p>
                <p className="text-sm mt-1">{message}</p>
            </div>
        </div>
    );
};

export default Toast;