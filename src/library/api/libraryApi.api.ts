import axios from 'axios';

export const libraryApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

libraryApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
