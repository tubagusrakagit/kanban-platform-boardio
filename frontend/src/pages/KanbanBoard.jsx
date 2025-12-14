// frontend/src/pages/KanbanBoard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import boardService from '../api/boardService';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal'; 
import AddMemberModal from '../components/AddMemberModal'; // <-- 1. IMPORT MODAL
import { addRecentBoard } from '../utils/recentBoards';

// Fungsi bantuan untuk mengelompokkan tasks berdasarkan kolom
const groupTasksByStatus = (tasks, columns) => {
    const grouped = {};
    columns.forEach(col => {
        grouped[col.columnId] = tasks.filter(task => task.status === col.columnId);
    });
    return grouped;
};

const KanbanBoard = () => {
    const { projectId } = useParams(); 
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo')); // Ambil info user login

    // State Modals
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); 
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); 
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false); // <-- 2. STATE MEMBER MODAL
    
    const [selectedTask, setSelectedTask] = useState(null); 
    const [boardData, setBoardData] = useState(null); 
    const [tasksByColumn, setTasksByColumn] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ----------------------------------------------------
    // Handlers
    // ----------------------------------------------------
    const fetchBoard = async () => {
        try {
            const data = await boardService.getBoardData(projectId);
            setBoardData(data);
            setTasksByColumn(groupTasksByStatus(data.tasks, data.columns));
            setLoading(false);
            
            // Tracking Recent Board
            if (data && data.project) {
                addRecentBoard(projectId, data.project); 
            }
        } catch (err) {
            setError('Gagal memuat Board. Pastikan Anda adalah anggota proyek.');
            setLoading(false);
            if (err.response && err.response.status === 403) {
                navigate('/'); 
            }
        }
    };

    const handleTaskCreated = (newTask) => {
        const newStatus = newTask.status || 'todo'; 
        setTasksByColumn(prevTasks => ({
            ...prevTasks,
            [newStatus]: [newTask, ...(prevTasks[newStatus] || [])], 
        }));
        setIsTaskModalOpen(false);
    };

    const openTaskDetail = (task) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    const handleTaskUpdated = (updatedTask) => {
        setTasksByColumn(prevTasks => {
            const newTasks = { ...prevTasks };
            const status = updatedTask.status; 
            newTasks[status] = newTasks[status].map(task => 
                task._id === updatedTask._id ? updatedTask : task
            );
            return newTasks;
        });
    };

    const handleTaskDeleted = (taskId) => {
        setTasksByColumn(prevTasks => {
            const newTasks = { ...prevTasks };
            for (const status in newTasks) {
                newTasks[status] = newTasks[status].filter(task => task._id !== taskId);
            }
            return newTasks;
        });
    };

    // Handler saat member berhasil ditambahkan
    const handleMemberAdded = () => {
        fetchBoard(); // Refresh data board untuk menampilkan member baru
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const startColumnId = source.droppableId;
        const finishColumnId = destination.droppableId;
        const taskId = draggableId;
        
        const newTasksByColumn = { ...tasksByColumn };
        const startTasks = Array.from(newTasksByColumn[startColumnId]);
        const [movedTask] = startTasks.splice(source.index, 1);
        newTasksByColumn[startColumnId] = startTasks;

        const finishTasks = Array.from(newTasksByColumn[finishColumnId] || []);
        finishTasks.splice(destination.index, 0, movedTask);
        newTasksByColumn[finishColumnId] = finishTasks;

        setTasksByColumn(newTasksByColumn);
        
        if (startColumnId !== finishColumnId) {
            try {
                // Pastikan newStatus dikirim sebagai string ID kolom
                await boardService.moveTask(projectId, taskId, finishColumnId);
            } catch (err) {
                console.error("Gagal update status di backend", err);
                fetchBoard(); 
            }
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchBoard();
        }
    }, [projectId, navigate]);


    // Loading & Error UI
    if (loading) return <div className="text-center mt-10 text-xl text-white">Memuat Kanban Board...</div>;
    if (error) return <div className="text-center p-10 mt-10 mx-auto max-w-lg bg-[#383838] border border-red-500 rounded-xl shadow-lg"><p className="text-red-400 font-semibold text-lg">{error}</p></div>;
    if (!boardData) return <div className="text-center mt-10 text-lg text-gray-400">Board tidak ditemukan.</div>;
    
    // Cek apakah user adalah owner
    const isOwner = boardData.owner && userInfo && boardData.owner._id === userInfo._id;
    const allMembers = boardData ? [boardData.owner, ...boardData.members] : [];
    // ----------------------------------------------------
    // RENDERING BOARD
    // ----------------------------------------------------
    return (
        <div className="ml-64 p-6 bg-[#2c2c2c] min-h-screen font-sans text-gray-100">
            
            {/* --- MODALS --- */}
            <CreateTaskModal 
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                projectId={projectId}
                onTaskCreated={handleTaskCreated}
                members={allMembers}
            />
            
            <TaskDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                task={selectedTask} 
                projectId={projectId}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
                members={allMembers}
            />

            {/* 3. Render Modal Add Member (Hanya dirender jika data ada) */}
            <AddMemberModal 
                isVisible={isMemberModalOpen}
                onClose={() => setIsMemberModalOpen(false)}
                project={boardData} // Kirim data project lengkap
                onMemberAdded={handleMemberAdded}
            />

            {/* KONTEN HEADER */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-700"> 
    
                {/* Judul Board & Info Anggota */}
                <div className="flex flex-col">
                    <h1 className="text-3xl font-extrabold text-white">
                        Board: <span className="text-gray-400">{boardData.project}</span>
                    </h1>

                    {/* DAFTAR ANGGOTA TIM */}
                    <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm font-semibold text-gray-500">Tim:</span>
                        
                        <div className="flex items-center">
                            
                            {/* DAFTAR AVATAR */}
                            <div className="flex -space-x-2 overflow-hidden mr-3"> 
                                {/* Owner */}
                                {boardData.owner && (
                                    <span 
                                        className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#2c2c2c] cursor-pointer z-10"
                                        title={`Owner: ${boardData.owner.name}`}
                                    >
                                        {boardData.owner.name.substring(0, 1)}
                                    </span>
                                )}

                                {/* Members */}
                                {boardData.members && boardData.members.map((member) => (
                                    <span 
                                        key={member._id}
                                        className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#2c2c2c] cursor-pointer"
                                        title={`Member: ${member.name}`}
                                    >
                                        {member.name.substring(0, 1)}
                                    </span>
                                ))}
                            </div>

                            {/* 4. TOMBOL TAMBAH ANGGOTA (HANYA OWNER) */}
                            {isOwner && (
                                <button
                                    onClick={() => setIsMemberModalOpen(true)}
                                    className="h-8 w-8 flex items-center justify-center rounded-full bg-teal-600 hover:bg-teal-500 text-white shadow-lg transition duration-200 mr-3"
                                    title="Tambah Anggota Tim"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}

                            <span className="text-xs self-center text-gray-500 ml-1">
                                {1 + (boardData.members?.length || 0)} Orang
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Tombol Kembali */}
                <Link 
                    to="/" 
                    className="flex items-center space-x-1 text-gray-300 hover:text-white font-semibold py-2 px-4 rounded-lg transition duration-200 border border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Kembali ke Dashboard</span>
                </Link>
            </div>
            
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex space-x-4 overflow-x-auto h-full pb-4 custom-scrollbar">
                    {boardData.columns.map((column, columnIndex) => (
                        <Droppable droppableId={String(column.columnId)} key={column.columnId}> 
                            {(provided) => (
                                <div 
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex-shrink-0 w-80 bg-[#383838] rounded-xl shadow-md p-4 border border-gray-700/50"
                                >
                                    <h2 className={`text-lg font-bold mb-4 flex justify-between items-center ${column.columnId === 'done' ? 'text-green-400' : 'text-gray-200'}`}>
                                        <span>{column.title}</span>
                                        <span className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-400">
                                            {tasksByColumn[column.columnId]?.length || 0}
                                        </span>
                                    </h2>

                                    <div className="space-y-3 min-h-[100px]">
                                        {tasksByColumn[column.columnId]?.map((task, index) => (
                                            <Draggable draggableId={String(task._id)} index={index} key={task._id}>
                                                {(provided, snapshot) => (
                                                    <div 
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        key={task._id}
                                                        className={`
                                                            bg-[#454545] p-4 rounded-lg shadow-sm border border-gray-600 border-l-4 border-l-gray-400 hover:border-l-white hover:bg-[#505050] transition duration-150 cursor-pointer
                                                            ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl border-l-white z-50' : ''}
                                                        `}
                                                        onClick={() => openTaskDetail(task)} 
                                                    >
                                                        <h3 className="font-medium text-gray-100 truncate text-sm">{task.title}</h3>
                                                        <div className="mt-2 flex items-center">
                                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded 
                                                                ${task.priority === 'High' ? 'bg-red-900/50 text-red-300' : 
                                                                  task.priority === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' : 
                                                                  'bg-blue-900/50 text-blue-300'}`}>
                                                                {task.priority}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                    
                                    <button 
                                        onClick={() => setIsTaskModalOpen(true)}
                                        className="w-full mt-3 text-gray-400 hover:text-white py-2 rounded-lg transition duration-150 hover:bg-gray-700/50 flex items-center justify-center text-sm"
                                    >
                                        <span className="mr-1 text-lg">+</span> Baru
                                    </button>

                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default KanbanBoard;