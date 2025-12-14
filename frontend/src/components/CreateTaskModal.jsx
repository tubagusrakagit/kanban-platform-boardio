// frontend/src/components/CreateTaskModal.jsx
import React, { useState } from 'react';
import boardService from '../api/boardService';

const CreateTaskModal = ({ isOpen, onClose, projectId, onTaskCreated, members }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [assignedTo, setAssignedTo] = useState(''); // State untuk assignee
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Kirim assignedTo hanya jika ada isinya
            const taskData = {
                title,
                description,
                priority,
                assignedTo: assignedTo || null 
            };
            
            const newTask = await boardService.createTask(projectId, taskData);
            onTaskCreated(newTask);
            
            // Reset Form
            setTitle('');
            setDescription('');
            setPriority('Medium');
            setAssignedTo('');
            setLoading(false);
        } catch (error) {
            console.error("Gagal membuat tugas:", error);
            setLoading(false);
            alert('Gagal membuat tugas');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-[#383838] p-6 rounded-xl shadow-2xl w-96 border border-gray-600">
                <h2 className="text-xl font-bold mb-4 text-white">Tambah Tugas Baru</h2>
                <form onSubmit={handleSubmit}>
                    
                    {/* Input Judul */}
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-semibold mb-2">Judul</label>
                        <input 
                            type="text" 
                            className="w-full p-2 rounded bg-[#2c2c2c] border border-gray-600 text-white focus:outline-none focus:border-teal-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Contoh: Perbaiki Bug Login"
                        />
                    </div>

                    {/* Input Deskripsi */}
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-semibold mb-2">Deskripsi</label>
                        <textarea 
                            className="w-full p-2 rounded bg-[#2c2c2c] border border-gray-600 text-white focus:outline-none focus:border-teal-500"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                        />
                    </div>

                    {/* Input Prioritas */}
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-semibold mb-2">Prioritas</label>
                        <select 
                            className="w-full p-2 rounded bg-[#2c2c2c] border border-gray-600 text-white focus:outline-none focus:border-teal-500"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    {/* --- INPUT BARU: ASSIGNED TO --- */}
                    <div className="mb-6">
                        <label className="block text-gray-400 text-sm font-semibold mb-2">Ditugaskan Ke (Assign)</label>
                        <select 
                            className="w-full p-2 rounded bg-[#2c2c2c] border border-gray-600 text-white focus:outline-none focus:border-teal-500"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                        >
                            <option value="">-- Pilih Anggota --</option>
                            {members && members.map((member) => (
                                <option key={member._id} value={member._id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-500 transition disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;