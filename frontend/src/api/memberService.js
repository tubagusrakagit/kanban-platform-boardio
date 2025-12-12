// frontend/src/services/memberService.js
import axios from 'axios';

const API_URL = '/api/members';

// Fungsi untuk mencari user berdasarkan keyword (nama/email)
export const searchUsers = async (keyword) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const config = {
        headers: {
            Authorization: `Bearer ${userInfo.token}`,
        },
    };

    const response = await axios.get(`${API_URL}?search=${keyword}`, config);
    return response.data;
};

// Fungsi untuk menambahkan user ke proyek
export const addMember = async (projectId, userId) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo.token}`,
        },
    };

    const response = await axios.post(
        `${API_URL}/add`,
        { projectId, userId },
        config
    );
    return response.data;
};