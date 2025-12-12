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
// FUNGSI 1: MENGAMBIL SEMUA PROYEK USER
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
        
        // Panggil endpoint POST /api/projects dengan header otorisasi
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


const projectService = {
    getAllProjects,
    createProject,
};

export default projectService;