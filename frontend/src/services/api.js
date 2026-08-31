import axios from 'axios';
import { getApiBaseUrl } from '../utils/imageUrl';

const API = axios.create({
  baseURL: getApiBaseUrl(),
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