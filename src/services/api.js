import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const fetchCategories = async () => {
    return axios.get(`${API_BASE_URL}/menu/categories`);
};

export const fetchMenuItems = async () => {
    return axios.get(`${API_BASE_URL}/menu/items`);
};

