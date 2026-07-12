import axios from 'axios';

// Backend base URL comes from Vite env var, falls back to local dev server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the JWT (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('brewhouse_user');
  if (storedUser) {
    const { token } = JSON.parse(storedUser);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized handling for expired/invalid sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('brewhouse_user');
    }
    return Promise.reject(error);
  }
);

export default api;
