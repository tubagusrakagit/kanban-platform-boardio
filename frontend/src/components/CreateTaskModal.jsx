// frontend/src/components/CreateTaskModal.jsx

import React, { useState } from 'react';
import boardService from '../api/boardService';

const CreateTaskModal = ({ isOpen, onClose, projectId, onTaskCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Panggil service untuk membuat tugas baru
            const newTask = await boardService.createTask(
                projectId, 
                title, 
                description, 
                priority
            );
            
            // Panggil fungsi callback di KanbanBoard untuk update state
            onTaskCreated(newTask); 
            
            // Bersihkan state dan tutup modal
            setTitle('');
            setDescription('');
            setPriority('Medium');
            onClose(); 

        } catch (err) {
            const message = err.response?.data?.message || 'Gagal membuat tugas. Coba lagi.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Overlay Gelap dengan Blur
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity" onClick={onClose}>
            
            {/* Modal Box: Background #383838, Border halus */}
            <div 
                className="bg-[#383838] p-6 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 border border-gray-700" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Modal */}
                <div className="flex justify-between items-center border-b border-gray-600 pb-3 mb-4">
                    <h2 className="text-xl font-bold text-white">Buat Tugas Baru</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white text-2xl transition duration-200"
                    >
                        &times;
                    </button>
                </div>

                {/* Error Message: Style Gelap & Merah */}
                {error && (
                    <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2">Judul Tugas</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            // Input Style: BG #2c2c2c, Text Putih, Border Abu
                            className="w-full px-4 py-2 bg-[#2c2c2c] border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition duration-200 shadow-inner text-sm placeholder-gray-500"
                            placeholder="Contoh: Implementasi Login API"
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2">Deskripsi</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            // Textarea Style: BG #2c2c2c, Text Putih
                            className="w-full px-4 py-2 bg-[#2c2c2c] border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition duration-200 shadow-inner text-sm placeholder-gray-500"
                            placeholder="Tambahkan detail tugas..."
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-bold mb-2">Prioritas</label>
                        <div className="relative">
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                // Select Style: BG #2c2c2c, Text Putih
                                className="w-full px-4 py-2 bg-[#2c2c2c] border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition duration-200 shadow-inner text-sm appearance-none cursor-pointer"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                            {/* Custom Arrow Icon untuk Select */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        {/* Tombol Batal: Ghost Style */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-300 hover:text-white hover:bg-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm disabled:opacity-50"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        
                        {/* Tombol Submit: Putih Solid (Kontras) */}
                        <button
                            type="submit"
                            className="bg-white hover:bg-gray-200 text-[#2c2c2c] font-bold py-2 px-6 rounded-lg transition duration-300 shadow-lg text-sm disabled:opacity-70 flex items-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 mr-2 text-[#2c2c2c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : 'Buat Tugas'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;