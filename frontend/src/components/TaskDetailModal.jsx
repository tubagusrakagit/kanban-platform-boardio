// frontend/src/components/TaskDetailModal.jsx
import React, { useState, useEffect } from 'react';
import boardService from '../api/boardService';

const TaskDetailModal = ({ isOpen, onClose, task, projectId, onTaskUpdated, onTaskDeleted }) => {
    // Menggunakan state lokal untuk editing
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reset state jika task berubah (saat modal dibuka atau tugas lain dipilih)
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setPriority(task.priority);
        }
    }, [task]);

    if (!isOpen || !task) return null;

    // --- Update Logic ---
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updatedData = { title, description, priority };
            const updatedTask = await boardService.updateTask(projectId, task._id, updatedData);
            
            // Panggil callback di KanbanBoard untuk update state
            onTaskUpdated(updatedTask); 
            
            // Tutup modal
            onClose(); 
        } catch (err) {
            const message = err.response?.data?.message || 'Gagal memperbarui tugas.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // --- Delete Logic ---
    const handleDelete = async () => {
        if (!window.confirm(`Anda yakin ingin menghapus tugas "${task.title}"? Aksi ini tidak bisa dibatalkan.`)) return;

        setLoading(true);
        try {
            await boardService.deleteTask(projectId, task._id);
            
            // Panggil callback di KanbanBoard untuk menghapus dari state
            onTaskDeleted(task._id); 
            
            // Tutup modal (onTaskDeleted akan memicu onClose di KanbanBoard)
        } catch (err) {
            const message = err.response?.data?.message || 'Gagal menghapus tugas.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };
    
    // Status color helper untuk badge
    const getPriorityColor = (p) => {
        switch (p) {
            case 'Critical': return 'bg-red-900/50 text-red-300';
            case 'High': return 'bg-orange-900/50 text-orange-300';
            case 'Medium': return 'bg-yellow-900/50 text-yellow-300';
            case 'Low': return 'bg-blue-900/50 text-blue-300';
            default: return 'bg-gray-700 text-gray-400';
        }
    };

    return (
        // Overlay Gelap dengan Blur
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm" onClick={onClose}>
            <div 
                // Modal Box: Background #383838, Border halus, Teks Putih
                className="bg-[#383838] p-8 rounded-2xl shadow-2xl max-w-xl w-full transform transition-all duration-300 scale-100 border border-gray-700" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER MODAL */}
                <div className="flex justify-between items-start border-b border-gray-600 pb-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">
                            Detail Tugas
                        </h2>
                        <span className="text-xs font-medium text-gray-500">Dibuat: {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Tombol Close */}
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl transition duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ERROR MESSAGE */}
                {error && (<div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>)}

                <form onSubmit={handleUpdate}>
                    {/* Status/Priority Display */}
                    <div className="flex justify-between items-center mb-6 p-3 bg-[#2c2c2c] rounded-lg border border-gray-700">
                        <div className="text-sm">
                            <span className="text-gray-500 mr-2">Status:</span>
                            <span className="font-semibold text-white uppercase">{task.status}</span>
                        </div>
                        <span className={`text-xs uppercase font-bold px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </span>
                    </div>

                    {/* Input Title */}
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-semibold mb-2">Judul Tugas</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            // Input Style: BG #2c2c2c, Teks Putih
                            className="w-full px-4 py-3 bg-[#2c2c2c] border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition duration-200 shadow-inner text-sm"
                            required 
                        />
                    </div>
                    
                    {/* Input Description */}
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-semibold mb-2">Deskripsi</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            rows="4" 
                            className="w-full px-4 py-3 bg-[#2c2c2c] border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition duration-200 shadow-inner text-sm" 
                        />
                    </div>
                    
                    {/* Input Priority */}
                    <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-semibold mb-2">Prioritas Baru</label>
                        <div className="relative">
                            <select 
                                value={priority} 
                                onChange={(e) => setPriority(e.target.value)} 
                                className="w-full px-4 py-3 bg-[#2c2c2c] border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition duration-200 shadow-inner text-sm appearance-none cursor-pointer"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER AKSI */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-600">
                        {/* Tombol Delete (Danger Action) */}
                        <button
                            type="button"
                            onClick={handleDelete}
                            // Tombol Delete: Merah (Red) untuk Danger, tapi style dark mode
                            className="bg-red-800/20 hover:bg-red-700/50 text-red-400 font-semibold py-2 px-4 rounded-lg transition duration-200 border border-red-900/50 text-sm"
                            disabled={loading}
                        >
                            Hapus Tugas
                        </button>
                        <div className="space-x-3">
                            {/* Tombol Batal (Ghost) */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-400 hover:text-white hover:bg-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm"
                                disabled={loading}
                            >
                                Batal
                            </button>
                            {/* Tombol Simpan (Primary/White) */}
                            <button
                                type="submit"
                                // Tombol Simpan: Putih Solid (Kontras)
                                className="bg-white hover:bg-gray-200 text-[#2c2c2c] font-bold py-2 px-4 rounded-lg transition duration-200 text-sm shadow-md"
                                disabled={loading}
                            >
                                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskDetailModal;