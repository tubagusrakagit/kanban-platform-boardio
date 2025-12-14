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
        return response.data; 
    } catch (error) {
        throw error;
    }
};

// =======================================================
// FUNGSI 2: MEMBUAT TASK BARU (FIXED)
// =======================================================
// UBAH DISINI: Menerima 'taskData' sebagai object utuh
const createTask = async (projectId, taskData) => {
    try {
        // Langsung kirim taskData apa adanya (berisi title, description, priority, assignedTo)
        const response = await axios.post(
            `${API_URL}/${projectId}/tasks`, 
            taskData, 
            getAuthHeaders()
        );
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
        const response = await axios.put(
            `${API_URL}/${projectId}/tasks/${taskId}/move`, 
            { newStatus }, 
            getAuthHeaders()
        );
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
    updateTask, 
    deleteTask, 
};

export default boardService;