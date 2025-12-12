// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import projectService from '../api/projectService';
import { Link, useNavigate } from 'react-router-dom';
import CreateProjectModal from '../components/CreateProjectModal'; 
import AddMemberModal from '../components/AddMemberModal';

const DashboardPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // STATE UNTUK MODAL TAMBAH ANGGOTA
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false); 
    const [selectedProject, setSelectedProject] = useState(null); 
    
    const navigate = useNavigate();
    const currentUserInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    const fetchProjects = async () => {
        try {
            const data = await projectService.getAllProjects(); 
            const enrichedData = data.map(project => {
                const isOwner = currentUserInfo && project.owner && 
                                project.owner._id === currentUserInfo._id; 
                return { ...project, isOwner: isOwner };
            });
            setProjects(enrichedData);
            setLoading(false);
        } catch (err) {
            setError('Gagal memuat proyek. Silakan coba login lagi.');
            setLoading(false);
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('userInfo');
                navigate('/login'); 
            }
        }
    };

    const handleProjectCreated = (newProject) => {
        const enrichedProject = { ...newProject, isOwner: true }; 
        setProjects([enrichedProject, ...projects]); 
        setIsCreateModalOpen(false);
    };
    
    const openMemberModal = (project) => {
        setSelectedProject(project);
        setIsMemberModalOpen(true);
    };
    
    const handleMemberAdded = () => {
        fetchProjects(); 
    };

    useEffect(() => {
        fetchProjects();
    }, [navigate]);

    if (loading) {
        return (
            // Loading Mode Gelap
            <div className="flex justify-center items-center min-h-screen bg-[#2c2c2c] ml-64">
                <div className="text-center text-xl text-white font-semibold flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memuat...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ml-64 flex justify-center p-10 mt-10 bg-[#2c2c2c] min-h-screen">
                <div className="max-w-lg w-full bg-[#383838] border border-red-500/50 text-red-400 px-4 py-3 rounded-xl shadow-lg text-center">
                    <p className="font-semibold text-lg">{error}</p>
                </div>
            </div>
        );
    }

    return (
        // CONTAINER UTAMA: Background #2c2c2c, Teks Putih
        <div className="ml-64 p-8 min-h-screen bg-[#2c2c2c] text-gray-100 font-sans">
            
            <CreateProjectModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onProjectCreated={handleProjectCreated}
            />
            
            {selectedProject && (
                <AddMemberModal
                    isVisible={isMemberModalOpen}
                    onClose={() => setIsMemberModalOpen(false)}
                    project={selectedProject}
                    onMemberAdded={handleMemberAdded} 
                />
            )}

            {/* Header Dashboard */}
            <div className="flex justify-between items-center mb-10 pb-5 border-b border-gray-700">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Ruang kerja & Proyek Anda</p>
                </div>
                
                {/* Tombol Buat Proyek: Putih (Kontras Tinggi) */}
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center space-x-2 bg-white hover:bg-gray-200 text-[#2c2c2c] font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-[1.02]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Proyek Baru</span>
                </button>
            </div>

            {/* Empty State */}
            {projects.length === 0 ? (
                <div className="text-center p-20 bg-[#383838] rounded-xl shadow-sm border border-gray-700 mt-10">
                    <h3 className="text-2xl font-bold text-white mb-3">Workspace Kosong</h3>
                    <p className="text-lg text-gray-400 mb-6">Mulai perjalanan produktivitas Anda sekarang.</p>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)} 
                        className="mt-4 bg-white hover:bg-gray-200 text-[#2c2c2c] font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg"
                    >
                        Buat Proyek Pertama
                    </button>
                </div>

            ) : (
                // Daftar Proyek (Grid)
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projects.map((project) => (
                        <div 
                            key={project._id} 
                            // STYLE KARTU: Background #383838 (Lighter Charcoal), Border halus
                            className="bg-[#383838] p-6 rounded-xl shadow-md border border-gray-700 hover:border-gray-500 hover:shadow-xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between group relative overflow-hidden"
                        >
                            {/* Aksen Putih di Kiri (Gaya Notion/Linear) */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div>
                                <h2 className="text-xl font-bold text-white mb-2 truncate">{project.name}</h2>
                                <p className="mt-1 text-gray-400 text-sm h-12 overflow-hidden leading-relaxed">
                                    {project.description || "Tidak ada deskripsi."}
                                </p>
                                
                                <hr className="my-4 border-gray-600" />
                                
                                {/* Info Metadata */}
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500">
                                        Pemilik: 
                                        <span className="font-medium text-gray-300 ml-1"> 
                                            {project.owner && project.owner.name ? project.owner.name : 'Unknown'}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Anggota: <span className="text-gray-300 font-medium">{project.members?.length || 0}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex justify-between items-center gap-2 pt-2">
                                {/* Tombol Tambah Anggota: Darker Button */}
                                {project.isOwner ? (
                                    <button
                                        onClick={() => openMemberModal(project)}
                                        className="bg-[#2c2c2c] hover:bg-black text-gray-300 border border-gray-600 text-xs font-semibold py-2 px-3 rounded-lg transition duration-200"
                                        title="Tambah Anggota"
                                    >
                                        + Anggota
                                    </button>
                                ) : (
                                    <div/>
                                )}
                                
                                {/* Link Lihat Board: Teks Putih Minimalis */}
                                <Link 
                                    to={`/board/${project._id}`} 
                                    className="text-white hover:text-gray-300 font-semibold text-sm flex items-center group-hover:underline underline-offset-4 decoration-2"
                                >
                                    Buka &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;