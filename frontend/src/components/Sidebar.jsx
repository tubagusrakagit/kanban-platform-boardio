// frontend/src/components/Sidebar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getRecentBoards, clearRecentBoards } from '../utils/recentBoards';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
    const recentBoards = getRecentBoards();

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        clearRecentBoards();
        navigate('/login');
        window.location.reload(); 
    };

    if (!userInfo) return null;

    return (
        // BG menggunakan hex #2c2c2c
        <aside className="fixed left-0 top-0 h-full w-64 bg-[#2c2c2c] text-gray-300 shadow-2xl z-50 flex flex-col transition-all duration-300">
            
            {/* Logo Section */}
            <div className="h-20 flex items-center px-8 border-b border-gray-700/50">
                <Link to="/" className="text-2xl font-extrabold tracking-tight text-white hover:text-gray-200 transition duration-200">
                    BOARDIA
                </Link>
            </div>

            {/* Navigasi Utama */}
            <nav className="flex-grow p-5 space-y-6 overflow-y-auto custom-scrollbar">
                
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 px-3">Menu Utama</h3>
                    <Link 
                        to="/" 
                        // Active State: White transparant (Glassmorphism effect)
                        className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                            location.pathname === '/' 
                            ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm' 
                            : 'hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        {/* Icon Dashboard */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="font-medium tracking-wide">Dashboard</span>
                    </Link>
                </div>

                {/* --- Recent Boards --- */}
                {recentBoards.length > 0 && (
                    <div className="pt-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 px-3">Baru Diakses</h3>
                        <ul className="space-y-1">
                            {recentBoards.map(board => (
                                <li key={board.id}>
                                    <Link 
                                        to={`/board/${board.id}`} 
                                        className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition duration-200 group"
                                    >
                                        {/* Dot Indicator: Putih saat hover */}
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3 group-hover:bg-white transition-colors"></span>
                                        <span className="truncate">{board.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </nav>

            {/* Footer User Profile */}
            <div className="p-4 border-t border-gray-700/50 bg-[#252525]">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                    {/* Avatar Monochrome */}
                    <div className="h-10 w-10 rounded-full bg-gray-100 text-[#2c2c2c] flex items-center justify-center font-bold shadow-md">
                        {userInfo.name.substring(0, 1)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                            {userInfo.name.split(' ')[0]}
                        </p>
                        <p className="text-xs text-gray-500 truncate">Online</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="mt-3 w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-900/30 text-red-400 hover:text-red-300 py-2 px-4 rounded-lg transition-all duration-300 text-sm font-medium border border-transparent hover:border-red-900/50"
                >
                    <span>Keluar</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;