// frontend/src/components/TaskDetailModal.jsx
import React, { useState, useEffect } from 'react';
import boardService from '../api/boardService';
import { format, formatDistanceToNow } from 'date-fns'; // Import formatDistanceToNow
import { id as ind } from 'date-fns/locale'; // Bahasa Indonesia

const TaskDetailModal = ({ isOpen, onClose, task, projectId, onTaskUpdated, onTaskDeleted, members }) => {
    // ----------------------------------------------------
    // 1. SEMUA STATE DI PALING ATAS (WAJIB)
    // ----------------------------------------------------
    const [isEditing, setIsEditing] = useState(false);
    
    // State Data Task
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [assignedTo, setAssignedTo] = useState(''); 
    const [dueDate, setDueDate] = useState('');
    
    // State Komentar
    const [commentText, setCommentText] = useState('');
    const [isSendingComment, setIsSendingComment] = useState(false);

    // Ambil Info User yang sedang Login (untuk cek hak akses hapus komen)
    const currentUser = JSON.parse(localStorage.getItem('userInfo'));

    // ----------------------------------------------------
    // 2. USE EFFECT (Sinkronisasi Data saat Modal Buka)
    // ----------------------------------------------------
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setPriority(task.priority || 'Medium');

            // Setup Assignee
            if (task.assignedTo && task.assignedTo._id) {
                setAssignedTo(task.assignedTo._id);
            } else if (task.assignedTo) {
                setAssignedTo(task.assignedTo);
            } else {
                setAssignedTo('');
            }

            // Setup Date
            if (task.dueDate) {
                try {
                    const dateObj = new Date(task.dueDate);
                    const dateString = dateObj.toISOString().split('T')[0];
                    setDueDate(dateString);
                } catch (e) {
                    setDueDate('');
                }
            } else {
                setDueDate('');
            }
        }
    }, [task, isOpen]);

    // ----------------------------------------------------
    // 3. EARLY RETURN
    // ----------------------------------------------------
    if (!isOpen || !task) return null;

    // ----------------------------------------------------
    // 4. HANDLERS UTAMA
    // ----------------------------------------------------
    const handleSave = async () => {
        try {
            const updatedData = {
                title,
                description,
                priority,
                assignedTo: assignedTo || null,
                dueDate: dueDate || null
            };

            const updatedTask = await boardService.updateTask(projectId, task._id, updatedData);
            
            // Fix Populate UI
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

    // ----------------------------------------------------
    // 5. HANDLERS KOMENTAR (BARU)
    // ----------------------------------------------------
    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setIsSendingComment(true);
        try {
            // Panggil API addComment
            const updatedTask = await boardService.addComment(projectId, task._id, commentText);
            
            // Update UI Parent
            onTaskUpdated(updatedTask);
            
            // Reset Input
            setCommentText('');
            setIsSendingComment(false);
        } catch (error) {
            console.error("Gagal kirim komentar:", error);
            alert("Gagal mengirim komentar");
            setIsSendingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm("Hapus komentar ini?")) {
            try {
                const updatedTask = await boardService.deleteComment(projectId, task._id, commentId);
                onTaskUpdated(updatedTask);
            } catch (error) {
                console.error("Gagal hapus komentar:", error);
                alert("Gagal menghapus komentar");
            }
        }
    };

    // Helper UI
    const getAssignedUserName = () => {
        if (!assignedTo) return "Belum ada";
        const member = members.find(m => m._id === assignedTo);
        return member ? member.name : "User tidak dikenal";
    };

    // ----------------------------------------------------
    // 6. RENDER UI
    // ----------------------------------------------------
    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 backdrop-blur-sm p-4">
            <div className="bg-[#383838] w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-600 flex flex-col max-h-[90vh]">
                
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
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row">
                    
                    {/* --- BAGIAN KIRI: FORM & DETAIL (60%) --- */}
                    <div className="p-6 md:w-3/5 space-y-6 border-b md:border-b-0 md:border-r border-gray-700">
                        
                        {/* Deskripsi */}
                        <div>
                            <h3 className="text-sm uppercase font-bold text-gray-500 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                                Deskripsi
                            </h3>
                            {isEditing ? (
                                <textarea 
                                    className="w-full bg-[#2c2c2c] text-gray-200 p-3 rounded-lg border border-gray-600 focus:border-teal-500 outline-none min-h-[120px]"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            ) : (
                                <div className="bg-[#2c2c2c] p-4 rounded-lg text-gray-300 min-h-[80px] whitespace-pre-wrap leading-relaxed text-sm">
                                    {description || <span className="italic text-gray-500">Tidak ada deskripsi.</span>}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Prioritas */}
                            <div>
                                <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Prioritas</h3>
                                {isEditing ? (
                                    <select 
                                        className="w-full bg-[#2c2c2c] text-white p-2 rounded border border-gray-600 text-sm"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                ) : (
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold 
                                        ${priority === 'High' ? 'bg-red-900/50 text-red-300' : 
                                        priority === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' : 
                                        'bg-blue-900/50 text-blue-300'}`}>
                                        {priority}
                                    </span>
                                )}
                            </div>

                            {/* Tenggat Waktu */}
                            <div>
                                <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Deadline</h3>
                                {isEditing ? (
                                    <input 
                                        type="date" 
                                        className="w-full bg-[#2c2c2c] text-white p-2 rounded border border-gray-600 text-sm"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                ) : (
                                    <div className="flex items-center text-gray-200 text-sm">
                                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {dueDate ? format(new Date(dueDate), 'dd MMM yyyy', { locale: ind }) : <span className="italic text-gray-500"> - </span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assigned To */}
                        <div>
                            <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Assigned To</h3>
                            {isEditing ? (
                                <select 
                                    className="w-full bg-[#2c2c2c] text-white p-2 rounded border border-gray-600 text-sm"
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
                                            <span className="text-gray-200 font-medium text-sm">{getAssignedUserName()}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-500 italic text-sm px-2">Belum ditugaskan</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- BAGIAN KANAN: KOMENTAR / AKTIVITAS (40%) --- */}
                    <div className="p-6 md:w-2/5 flex flex-col bg-[#303030]">
                        <h3 className="text-sm uppercase font-bold text-gray-400 mb-4 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                            Komentar ({task.comments?.length || 0})
                        </h3>

                        {/* List Komentar (Scrollable Area) */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-2 max-h-[300px]">
                            {task.comments && task.comments.length > 0 ? (
                                task.comments.map((comment) => (
                                    <div key={comment._id} className="flex space-x-3 group">
                                        {/* Avatar Kecil */}
                                        <div className="flex-shrink-0">
                                            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold ring-2 ring-[#383838]">
                                                {comment.user?.name ? comment.user.name.substring(0, 1) : '?'}
                                            </div>
                                        </div>
                                        
                                        {/* Isi Komentar */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm font-bold text-white mr-2">
                                                    {comment.user?.name || 'Unknown'}
                                                </span>
                                                <span className="text-[10px] text-gray-500">
                                                    {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ind }) : ''}
                                                </span>
                                            </div>
                                            <div className="text-gray-300 text-sm mt-0.5 bg-[#3f3f3f] p-2 rounded-lg rounded-tl-none border border-gray-600">
                                                {comment.text}
                                            </div>
                                            
                                            {/* Tombol Hapus (Hanya muncul jika user pemilik komen) */}
                                            {currentUser && comment.user && currentUser._id === comment.user._id && (
                                                <button 
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    className="text-[10px] text-red-400 hover:text-red-300 mt-1 opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 text-sm py-4 italic">
                                    Belum ada komentar. Mulai diskusi!
                                </div>
                            )}
                        </div>

                        {/* Input Komentar */}
                        <form onSubmit={handleSendComment} className="mt-auto">
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-[#222] text-white text-sm p-3 rounded-lg border border-gray-600 focus:border-teal-500 outline-none"
                                    placeholder="Tulis komentar..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    disabled={isSendingComment}
                                />
                                <button 
                                    type="submit" 
                                    disabled={isSendingComment || !commentText.trim()}
                                    className="p-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg disabled:opacity-50 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

                {/* Footer Action (Tetap Ada) */}
                <div className="p-4 border-t border-gray-700 flex justify-between items-center bg-[#333] rounded-b-2xl">
                    {isEditing ? (
                        <>
                            <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-sm font-semibold px-3 py-2 rounded hover:bg-red-900/30 transition">Hapus Tugas</button>
                            <div className="space-x-3">
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded font-medium text-sm transition">Batal</button>
                                <button onClick={handleSave} className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded font-bold shadow-lg text-sm transition">Simpan</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-end w-full">
                            <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow-lg transition flex items-center text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                Edit Detail
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TaskDetailModal;