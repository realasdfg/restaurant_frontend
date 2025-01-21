import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized! Redirecting to login...');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/staff/login';
        }
        return Promise.reject(error);
    }
);

export default API;

export const login = async (username, password) => {
    const response = await API.post('/auth/login', { username, password });
    return response.data;
};

export const fetchCategories = async () => {
    return API.get('/menu/categories');
};

export const fetchMenuItems = async () => {
    return API.get('/menu/items');
};