// frontend/src/components/AddMemberModal.jsx
import React, { useState, useEffect } from 'react';
import { searchUsers, addMember } from '../api/memberService';

// Komponen Modal
const AddMemberModal = ({ isVisible, onClose, project, onMemberAdded }) => {
    // State untuk pencarian
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // State untuk notifikasi penambahan
    const [addStatus, setAddStatus] = useState(null); // 'success', 'error', 'loading'

    // Debounce untuk Pencarian
    useEffect(() => {
        if (!searchTerm) {
            setSearchResults([]);
            return;
        }

        const delaySearch = setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const results = await searchUsers(searchTerm);
                setSearchResults(results);
            } catch (err) {
                setError('Gagal mencari pengguna.');
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        }, 500); 

        return () => clearTimeout(delaySearch); 
    }, [searchTerm]);

    // Reset state saat modal dibuka/ditutup
    useEffect(() => {
        if (isVisible) {
            setSearchTerm('');
            setSearchResults([]);
            setSelectedUser(null);
            setAddStatus(null);
        }
    }, [isVisible]);


    // Handler Penambahan Anggota
    const handleAddMember = async () => {
        if (!selectedUser) return;
        
        setAddStatus('loading');
        setError(null);

        try {
            await addMember(project._id, selectedUser.id);
            setAddStatus('success');
            onMemberAdded(); 
            
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err) {
            const message = err.response && err.response.data.message 
                ? err.response.data.message 
                : 'Gagal menambahkan anggota. Coba lagi.';
            setError(message);
            setAddStatus('error');
        }
    };

    if (!isVisible) return null;

    // Cek apakah user sudah menjadi anggota
    const isAlreadyMember = project.members.includes(selectedUser?.id);

    return (
        // Overlay Gelap dengan Blur
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
            
            {/* Modal Box: Background #383838, Border halus */}
            <div 
                className="bg-[#383838] p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-600 pb-2">
                    Tambah Anggota <span className="text-gray-400 text-sm font-normal block mt-1">ke Proyek: {project.name}</span>
                </h2>

                {/* Input Pencarian: Style Gelap */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Cari nama atau email pengguna..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 bg-[#2c2c2c] border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                    />
                    {/* Ikon Search Absolute */}
                    <div className="absolute right-3 top-3 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                {/* Hasil Pencarian: Scrollable Area */}
                <div className="min-h-[150px] max-h-[250px] overflow-y-auto mb-4 border border-gray-600 rounded-lg bg-[#2c2c2c] custom-scrollbar">
                    {loading ? (
                        <p className="p-4 text-center text-gray-400 animate-pulse">Mencari...</p>
                    ) : error && !addStatus ? (
                        <p className="p-4 text-center text-red-400">{error}</p>
                    ) : searchResults.length === 0 && searchTerm ? (
                        <p className="p-4 text-center text-gray-500">Tidak ada pengguna ditemukan.</p>
                    ) : searchResults.length === 0 && !searchTerm ? (
                         <p className="p-4 text-center text-gray-600 italic">Ketik nama untuk mulai mencari...</p>
                    ) : (
                        searchResults.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                // Hover & Selected State: Style Gelap
                                className={`p-3 border-b border-gray-700 cursor-pointer transition duration-150 flex items-center justify-between ${
                                    selectedUser && selectedUser.id === user.id
                                        ? 'bg-[#404040] border-l-4 border-l-white'
                                        : 'hover:bg-[#353535]'
                                }`}
                            >
                                <div>
                                    <p className="font-semibold text-gray-200">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                {selectedUser && selectedUser.id === user.id && (
                                    <span className="text-white text-lg">✓</span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Informasi Pengguna Terpilih & Status */}
                <div className="min-h-[60px]"> {/* Menjaga tinggi agar tidak layout shift */}
                    {selectedUser && (
                        <div className="p-3 bg-[#2c2c2c] rounded-lg border border-gray-600 flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs text-gray-400">Pengguna Terpilih:</p>
                                <p className="font-bold text-white text-sm">{selectedUser.name}</p>
                            </div>
                             {isAlreadyMember && (
                                <span className="text-xs text-yellow-500 bg-yellow-900/30 px-2 py-1 rounded">Sudah Anggota</span>
                            )}
                        </div>
                    )}

                    {/* Status Messages */}
                    <div className="text-center mb-2">
                        {addStatus === 'loading' && <p className="text-gray-400 text-sm flex justify-center items-center"><svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"></svg> Memproses...</p>}
                        {addStatus === 'success' && <p className="text-green-400 font-bold text-sm">✅ Berhasil ditambahkan!</p>}
                        {addStatus === 'error' && <p className="text-red-400 font-medium text-sm">❌ {error}</p>}
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-end space-x-3 mt-2">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition text-sm font-medium"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleAddMember}
                        disabled={!selectedUser || addStatus === 'loading' || isAlreadyMember || addStatus === 'success'}
                        className={`py-2 px-6 rounded-lg font-bold text-sm transition shadow-lg flex items-center ${
                            selectedUser && !isAlreadyMember && addStatus !== 'loading' 
                                ? 'bg-white text-[#2c2c2c] hover:bg-gray-200' 
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                    >
                        {addStatus === 'loading' ? 'Menambahkan...' : 'Tambah'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddMemberModal;