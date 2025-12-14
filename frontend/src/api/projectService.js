// frontend/src/api/projectService.js

import axios from 'axios';

// URL dasar API backend
const API_URL = 'http://localhost:5000/api/projects';

// Fungsi bantuan untuk mendapatkan token otorisasi dari localStorage
const getAuthHeaders = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    // UserInfo berisi token yang dikirimkan dari backend saat login/register
    
    if (userInfo && userInfo.token) {
        return {
            headers: {
                // Skema JWT harus 'Bearer <token>'
                Authorization: `Bearer ${userInfo.token}`,
                'Content-Type': 'application/json',
            },
        };
    } else {
        return {};
    }
};

// =======================================================
// FUNGSI : MENGAMBIL SEMUA PROYEK USER
// =======================================================
const getAllProjects = async () => {
    try {
        // Panggil endpoint GET /api/projects dengan header otorisasi
        const response = await axios.get(API_URL, getAuthHeaders());
        
        // Response.data berisi array proyek
        return response.data; 
        
    } catch (error) {
        // Lempar error ke komponen yang memanggil
        throw error;
    }
};

// FUNGSI 2: MEMBUAT PROYEK BARU

const createProject = async (name, description) => {
    try {
        const projectData = { name, description };
        
        const response = await axios.post(
            API_URL, 
            projectData, 
            getAuthHeaders()
        );
        
        // Response.data berisi proyek yang baru dibuat
        return response.data; 
        
    } catch (error) {
        throw error;
    }
};

// =======================================================
// FUNGSI : GENERATE TOKEN UNDANGAN
// =======================================================
const generateInviteToken = async (projectId) => {
    try {
        const response = await axios.put(
            `${API_URL}/${projectId}/generate-invite`, 
            {}, // Body kosong
            getAuthHeaders()
        );
        // Response akan berisi { token: 'xyz123', message: '...' }
        return response.data;
    } catch (error) {
        throw error;
    }
};

// =======================================================
// FUNGSI : JOIN VIA TOKEN LINK
// =======================================================
const joinProjectByToken = async (token) => {
    try {
        // Karena ini route POST, kita kirim body kosong saja
        const response = await axios.post(
            `${API_URL}/join/${token}`, 
            {}, 
            getAuthHeaders()
        );
        // Response akan berisi { projectId, projectName, message }
        return response.data;
    } catch (error) {
        throw error;
    }
};

// =======================================================
// FUNGSI BARU 3: KICK MEMBER
// =======================================================
const kickMember = async (projectId, memberId) => {
    try {
        // Menggunakan PUT karena kita memodifikasi resource (project.members)
        const response = await axios.put(
            `${API_URL}/${projectId}/kick/${memberId}`, 
            {}, 
            getAuthHeaders()
        );
        // Response akan berisi { message, members }
        return response.data;
    } catch (error) {
        throw error;
    }
};

const projectService = {
    getAllProjects,
    createProject,
    generateInviteToken,
    joinProjectByToken,
    kickMember,
};

export default projectService;