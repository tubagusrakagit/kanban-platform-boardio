// frontend/src/components/InviteSettingsModal.jsx
import React, { useState, useEffect } from 'react';
import projectService from '../api/projectService';
import ConfirmKickModal from './ConfirmKickModal';

const InviteSettingsModal = ({ isVisible, onClose, project, projectId, onRefresh, onNotify }) => {    const [token, setToken] = useState(project?.inviteToken || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const FRONTEND_BASE_URL = window.location.origin; // Ambil domain/URL awal frontend
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const [kickLoading, setKickLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
const [memberToKickId, setMemberToKickId] = useState(null);

   const currentUserId = userInfo?._id;

    // --- LOGIKA DE-DUPLICATION BARU ---
    let uniqueMembersMap = {}; 
    if (project?.members) {
        uniqueMembersMap = project.members.reduce((acc, current) => {
            const userId = current.user._id.toString(); 
            if (!acc[userId]) {
                acc[userId] = current;
            }
            return acc;
        }, {});
    }
    const uniqueProjectMembers = Object.values(uniqueMembersMap); // Array member yang unik

    // Daftar lengkap (Owner + Anggota unik non-owner)
    const allUniqueMembersList = project?.owner 
        ? [
            project.owner, 
            ...uniqueProjectMembers
                .filter(member => member.user._id.toString() !== project.owner._id.toString())
                .map(m => m.user)
        ] 
        : [];
        
    useEffect(() => {
        if (project) {
            setToken(project.inviteToken || '');
        }
    }, [project]);

    if (!isVisible || !project) return null;

    const inviteLink = `${FRONTEND_BASE_URL}/invite/${token}`;

    const handleGenerateToken = async () => {
        setLoading(true);
        setError(null);
        const idToUse = projectId || project?._id; 
        
        if (!idToUse) {
            setError('ID Proyek tidak ditemukan. Mohon refresh halaman.');
            setLoading(false);
            return;
        }

        try {
            // Gunakan ID yang sudah divalidasi
            const result = await projectService.generateInviteToken(idToUse); // <--- GUNAKAN idToUse
            setToken(result.token);
            setLoading(false);
            onNotify('Link undangan baru berhasil dibuat!', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat link undangan.');
            setLoading(false);
        }
    };

    const handleKickMember = (memberId) => { 
    setMemberToKickId(memberId);
    setIsConfirmModalOpen(true);
};


        const confirmKick = async () => {
        if (!memberToKickId) return;

        // Tutup modal konfirmasi
        setIsConfirmModalOpen(false); 
        
        setKickLoading(true); // <-- Aktifkan loading di modal utama
        
        try {
            await projectService.kickMember(projectId, memberToKickId);
            
            // Notifikasi Sukses
            if (typeof onNotify === 'function') {
                onNotify("Anggota berhasil dikeluarkan!", 'success');
            }
        } catch (err) {
            // Notifikasi Error
            if (typeof onNotify === 'function') {
                onNotify(err.response?.data?.message || 'Gagal mengeluarkan anggota.', 'error');
            }
        } finally {
            setKickLoading(false);
            setMemberToKickId(null); // Reset ID
            
            if (typeof onRefresh === 'function') {
                onRefresh();
            }
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        onNotify('Link berhasil dicopy ke clipboard!');
    };
    
    
    return (
        
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 backdrop-blur-sm p-4">
            {/* Render Custom Confirmation Modal */}
    <ConfirmKickModal
        isVisible={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmKick}
    />
            <div className="bg-[#383838] p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-600">
                <h2 className="text-2xl font-bold mb-4 text-white border-b border-gray-700 pb-3">
                    Undang Anggota ({project.name})
                </h2>

                <div className="space-y-4">
                    {/* Tampilan Link */}
                    <div>
                        <label className="block text-gray-400 text-sm font-semibold mb-2">
                            Link Undangan Saat Ini
                        </label>
                        {token ? (
                            <div className="flex bg-[#2c2c2c] rounded-lg border border-gray-600">
                                <input 
                                    type="text"
                                    readOnly
                                    value={inviteLink}
                                    className="flex-1 p-3 text-white text-sm bg-transparent outline-none truncate"
                                />
                                <button 
                                    onClick={handleCopy}
                                    className="p-3 bg-teal-600 hover:bg-teal-500 text-white rounded-r-lg transition flex items-center"
                                    title="Copy Link"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2M8 5h.01" /></svg>
                                </button>
                            </div>
                        ) : (
                            <div className="p-3 bg-yellow-900/30 text-yellow-300 rounded-lg border border-yellow-800/50 text-sm">
                                Belum ada link undangan aktif.
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm p-2 bg-red-900/30 rounded border border-red-800/50">
                            {error}
                        </div>
                    )}

                    {/* Tombol Generate/Reset */}
                    <button
                        onClick={handleGenerateToken}
                        disabled={loading}
                        className="w-full mt-4 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Membuat...' : token ? 'Reset & Buat Link Baru' : 'Buat Link Undangan'}
                    </button>
                    <h3 className="text-xl font-bold mt-8 mb-4 border-b border-gray-700 pb-2 text-white">
                        Daftar Anggota ({allUniqueMembersList.length})
                    </h3>

                    <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                        {/* GANTI SUMBER MAP DARI allMembers KE allUniqueMembersList */}
                        {allUniqueMembersList.map((member) => ( 
                            <div 
                                key={member._id} // <- KEY BENAR
                                className="flex items-center justify-between bg-[#2c2c2c] p-3 rounded-lg border border-gray-600"
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="h-8 w-8 rounded-full bg-yellow-600 flex items-center justify-center text-white text-sm font-bold">
                                        {member.name.substring(0, 1)}
                                    </span>
                                    <div>
                                        <p className="text-white font-semibold">{member.name}</p>
                                        {/* Tampilkan Role yang sudah di-populate di project.members */}
                                        <p className="text-xs text-gray-400">
                                            {project.owner._id === member._id ? 'Owner' : project.members.find(m => m.user._id === member._id)?.role || 'Member'}
                                        </p>
                                    </div>
                                </div>

                                {/* Tombol Keluarkan/Kick */}
                               {(project.owner._id === currentUserId && member._id !== currentUserId) && (
                                <button
                                    onClick={() => handleKickMember(member._id)}
                                    disabled={kickLoading} // <-- TAMBAHKAN INI
                                    className="text-red-400 hover:text-red-300 transition text-sm px-3 py-1 bg-red-900/30 rounded disabled:opacity-50" // <-- Tambahkan disabled style
                                    title="Keluarkan Anggota"
                                >
                                    {kickLoading ? '...' : 'Keluarkan'}
                                </button>
                            )}
                            </div>
                        ))}
                    </div>
                    {/* Catatan Penting */}
                    <p className="text-xs text-gray-500 pt-2 border-t border-gray-700/50">
                        *Catatan: Link ini memberikan peran default **Editor**.
                    </p>
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default InviteSettingsModal;