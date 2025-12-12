// frontend/src/components/CreateProjectModal.jsx
import React, { useState } from 'react';
import projectService from '../api/projectService';

// Komponen Modal yang reusable
const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Jika modal tidak terbuka, jangan render apa-apa
    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Panggil service untuk membuat proyek
            const newProject = await projectService.createProject(name, description);
            
            // Panggil fungsi callback untuk memperbarui daftar proyek di Dashboard
            onProjectCreated(newProject); 
            
            // Bersihkan state dan tutup modal
            setName('');
            setDescription('');
            onClose(); 

        } catch (err) {
            const message = err.response?.data?.message || 'Gagal membuat proyek. Coba lagi.';
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
                className="bg-[#383838] p-8 rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 border border-gray-700" 
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Header Modal */}
                <div className="flex justify-between items-center border-b border-gray-600 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-white">Buat Proyek Baru</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white transition duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Error Message: Style Gelap & Merah */}
                {error && (
                    <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-semibold mb-2">Nama Proyek</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                // Input Style: BG #2c2c2c, Text Putih, Border Abu
                                className="w-full px-4 py-3 bg-[#2c2c2c] border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition duration-200 shadow-inner text-sm placeholder-gray-500"
                                placeholder="Masukkan nama proyek..."
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-300 text-sm font-semibold mb-2">Deskripsi (Opsional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                // Textarea Style: BG #2c2c2c, Text Putih
                                className="w-full px-4 py-3 bg-[#2c2c2c] border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition duration-200 shadow-inner text-sm placeholder-gray-500"
                                placeholder="Jelaskan detail proyek..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        {/* Tombol Batal: Transparan/Ghost */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-300 hover:text-white hover:bg-gray-700 font-semibold py-3 px-6 rounded-xl transition duration-200 text-sm disabled:opacity-50"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        
                        {/* Tombol Submit: Putih Solid (Kontras) */}
                        <button
                            type="submit"
                            className="flex items-center space-x-2 bg-white hover:bg-gray-200 text-[#2c2c2c] font-bold py-3 px-6 rounded-xl transition duration-300 shadow-lg text-sm disabled:opacity-70"
                            disabled={loading}
                        >
                             {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-[#2c2c2c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <span>Buat Proyek</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;