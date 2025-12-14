// frontend/src/components/TaskDetailModal.jsx
import React, { useState, useEffect } from 'react';
import boardService from '../api/boardService';

const TaskDetailModal = ({ isOpen, onClose, task, projectId, onTaskUpdated, onTaskDeleted, members }) => {
    // State lokal untuk edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [assignedTo, setAssignedTo] = useState(''); // State assignee

    // Isi state saat modal dibuka atau task berubah
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setPriority(task.priority || 'Medium');
            // Cek apakah task.assignedTo itu object (populate) atau string ID
            if (task.assignedTo && task.assignedTo._id) {
                setAssignedTo(task.assignedTo._id);
            } else if (task.assignedTo) {
                setAssignedTo(task.assignedTo);
            } else {
                setAssignedTo('');
            }
        }
    }, [task, isOpen]);

    if (!isOpen || !task) return null;

    const handleSave = async () => {
        try {
            const updatedData = {
                title,
                description,
                priority,
                assignedTo: assignedTo || null // Kirim null jika kosong
            };

            const updatedTask = await boardService.updateTask(projectId, task._id, updatedData);
            
            // Perlu update manual assignedTo object agar UI langsung berubah tanpa refresh
            // Karena backend mungkin hanya mengembalikan ID, kita cari object user lengkap dari props 'members'
            if (updatedTask.assignedTo) {
                const assignedUser = members.find(m => m._id === updatedTask.assignedTo || m._id === updatedTask.assignedTo._id);
                updatedTask.assignedTo = assignedUser; 
            }

            onTaskUpdated(updatedTask);
            setIsEditing(false);
        } catch (error) {
            console.error("Gagal update task:", error);
            alert("Gagal menyimpan perubahan.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Yakin ingin menghapus tugas ini?')) {
            try {
                await boardService.deleteTask(projectId, task._id);
                onTaskDeleted(task._id);
                onClose();
            } catch (error) {
                console.error("Gagal hapus task:", error);
                alert("Gagal menghapus tugas.");
            }
        }
    };

    // Ambil nama user yang ditugaskan untuk tampilan (Read Mode)
    const getAssignedUserName = () => {
        if (!assignedTo) return "Belum ada";
        const member = members.find(m => m._id === assignedTo);
        return member ? member.name : "User tidak dikenal";
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 backdrop-blur-sm p-4">
            <div className="bg-[#383838] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-600 flex flex-col max-h-[90vh]">
                
                {/* Header Modal */}
                <div className="flex justify-between items-start p-6 border-b border-gray-700">
                    <div className="flex-1 mr-4">
                        {isEditing ? (
                            <input 
                                type="text" 
                                className="w-full text-xl font-bold bg-[#2c2c2c] text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-white leading-tight">{title}</h2>
                        )}
                        <p className="text-gray-400 text-sm mt-1">Di kolom: <span className="uppercase font-semibold tracking-wider text-teal-400">{task.status}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kolom Kiri: Deskripsi */}
                        <div className="md:col-span-2">
                            <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Deskripsi</h3>
                            {isEditing ? (
                                <textarea 
                                    className="w-full bg-[#2c2c2c] text-gray-200 p-3 rounded-lg border border-gray-600 focus:border-teal-500 outline-none min-h-[120px]"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            ) : (
                                <div className="bg-[#2c2c2c] p-4 rounded-lg text-gray-300 min-h-[80px] whitespace-pre-wrap leading-relaxed">
                                    {description || <span className="italic text-gray-500">Tidak ada deskripsi.</span>}
                                </div>
                            )}
                        </div>

                        {/* Info Detail */}
                        <div>
                            <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Prioritas</h3>
                            {isEditing ? (
                                <select 
                                    className="w-full bg-[#2c2c2c] text-white p-2 rounded border border-gray-600"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            ) : (
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold 
                                    ${priority === 'High' ? 'bg-red-900/50 text-red-300' : 
                                      priority === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' : 
                                      'bg-blue-900/50 text-blue-300'}`}>
                                    {priority}
                                </span>
                            )}
                        </div>

                        {/* --- DROPDOWN ASSIGNED TO --- */}
                        <div>
                            <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Ditugaskan Ke</h3>
                            {isEditing ? (
                                <select 
                                    className="w-full bg-[#2c2c2c] text-white p-2 rounded border border-gray-600"
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                >
                                    <option value="">-- Tidak Ada --</option>
                                    {members && members.map((member) => (
                                        <option key={member._id} value={member._id}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="flex items-center space-x-2 bg-[#2c2c2c] p-2 rounded-lg w-max pr-4">
                                    {assignedTo ? (
                                        <>
                                            <div className="h-6 w-6 rounded-full bg-teal-600 flex items-center justify-center text-xs text-white font-bold">
                                                {getAssignedUserName().substring(0, 1)}
                                            </div>
                                            <span className="text-gray-200 font-medium">{getAssignedUserName()}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-500 italic text-sm px-2">Belum ditugaskan</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-gray-700 flex justify-between items-center bg-[#333]">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={handleDelete}
                                className="text-red-400 hover:text-red-300 text-sm font-semibold px-3 py-2 rounded hover:bg-red-900/30 transition"
                            >
                                Hapus Tugas
                            </button>
                            <div className="space-x-3">
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded font-medium transition"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded font-bold shadow-lg transition"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-end w-full">
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow-lg transition flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                Edit Tugas
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TaskDetailModal;