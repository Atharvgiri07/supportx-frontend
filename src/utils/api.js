import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT to every request, if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('supportx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, clear it and send the user back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('supportx_token');
      localStorage.removeItem('supportx_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
