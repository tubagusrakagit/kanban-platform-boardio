// frontend/src/api/boardService.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/boards';

const getAuthHeaders = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
        return {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
                'Content-Type': 'application/json',
            },
        };
    } else {
        return {};
    }
};

// =======================================================
// FUNGSI 1: MENDAPATKAN DATA BOARD LENGKAP
// =======================================================
const getBoardData = async (projectId) => {
    try {
        const response = await axios.get(`${API_URL}/${projectId}`, getAuthHeaders());
        // Response berisi { project: name, columns: [], tasks: [] }
        return response.data; 
    } catch (error) {
        throw error;
    }
};

// =======================================================
// FUNGSI 2: MEMBUAT TASK BARU
// =======================================================
const createTask = async (projectId, title, description, priority) => {
    try {
        const taskData = { title, description, priority };
        const response = await axios.post(
            `${API_URL}/${projectId}/tasks`, 
            taskData, 
            getAuthHeaders()
        );
        // Response berisi task baru
        return response.data; 
    } catch (error) {
        throw error;
    }
};

// =======================================================
// FUNGSI 3: MEMINDAHKAN TASK (UPDATE STATUS)
// =======================================================
const moveTask = async (projectId, taskId, newStatus) => {
    try {
        // PERHATIAN: Pastikan URL ini sesuai dengan routes/boardRoutes.js
        const response = await axios.put(
            `${API_URL}/${projectId}/tasks/${taskId}/move`, // <-- PATH HARUS MATCH
            { newStatus }, 
            getAuthHeaders()
        );
        // Response berisi task yang sudah diupdate
        return response.data; 
    } catch (error) {
        throw error;
    }
};


// =======================================================
// FUNGSI 4: UPDATE TASK
// =======================================================
const updateTask = async (projectId, taskId, updatedData) => {
    try {
        const response = await axios.put(
            `${API_URL}/${projectId}/tasks/${taskId}`, 
            updatedData, 
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// =======================================================
// FUNGSI 5: DELETE TASK
// =======================================================
const deleteTask = async (projectId, taskId) => {
    try {
        const response = await axios.delete(
            `${API_URL}/${projectId}/tasks/${taskId}`, 
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};


const boardService = {
    getBoardData,
    createTask,
    moveTask,
    updateTask, // <-- REGISTRASI BARU WAJIB
    deleteTask, // <-- REGISTRASI BARU WAJIB
};

export default boardService;