// frontend/src/api/authService.js
import axios from 'axios';

// Ganti dengan port backend Anda
const API_URL = 'http://localhost:5000/api/auth/'; 

const register = async (name, email, password, role = 'member') => {
  const response = await axios.post(API_URL + 'register', { name, email, password, role });

  if (response.data.token) {
    // Simpan data user (termasuk token) ke localStorage
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (email, password) => {
  const response = await axios.post(API_URL + 'login', { email, password });

  if (response.data.token) {
    // Simpan data user (termasuk token) ke localStorage
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('userInfo');
};

const authService = {
  register,
  login,
  logout,
};

export default authService;