import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://samadhan-setu-kn61.onrender.com/api',
});

// Interceptor to attach Authorization JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('samadhan_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;