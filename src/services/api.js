import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';

const API = axios.create({
    baseURL: BASE_URL,
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
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(
                        `${BASE_URL}/auth/token/refresh?refresh_token=${refreshToken}`
                    );
                    const {access_token, refresh_token} = response.data;

                    localStorage.setItem('access_token', access_token);
                    localStorage.setItem('refresh_token', refresh_token);

                    originalRequest.headers.Authorization = `Bearer ${access_token}`;

                    return API(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/staff/login';
                    console.error(originalRequest);
                    return Promise.reject(refreshError);
                }
            } else {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/staff/login';
            }
        }

        return Promise.reject(error);
    }
);


export const login = async (username, password) => {
    const response = await API.post('/auth/login', {username, password});
    return response.data;
};

export const fetchCategories = async () => {
    return await API.get('/menu-categories');
};

export const fetchMenuItemsByCategoryId = async (categoryId) => {
    return await API.get(`/menu-categories/${categoryId}/menu-items`);
};

export const fetchMenuItems = async () => {
    return await API.get('/menu-items');
};

export const fetchMenuItemById = async (menuItemId) => {
    return await API.get(`/menu-items/${menuItemId}`);
};

export const fetchTables = async () => {
    return await API.get('/tables');
};

export const fetchTableById = async (tableId) => {
    return await API.get(`/tables/${tableId}`);
};

export const fetchOrders = async (current_only) => {
    return await API.get('/orders', {params: {current_only: current_only}});
};

export const fetchOrderById = async (orderId) => {
    return await API.get(`/orders/${orderId}`);
};

export const createOrder = async (orderData) => {
    return await API.post('/orders', orderData);
};

export const closeOrder = async (orderId, paymentData) => {
    return await API.patch(`/orders/${orderId}`, paymentData);
};

export const changeOrderInfo = async (orderId, data) => {
    return await API.patch(`/orders/${orderId}`, data);
};

export const fetchOrderItemsByOrderId = async (orderId) => {
    return await API.get(`/orders/${orderId}/menu-items`);
};

export const addOrUpdateOrderItemQuantity = async (orderId, itemId, quantity) => {
    return await API.patch(`/orders/${orderId}/menu-items/${itemId}`, null, {params: {quantity: quantity}});
};

export const deleteOrderItem = async (orderId, itemId) => {
    return await API.delete(`/orders/${orderId}/menu-items/${itemId}`);
};

export const fetchUserById = async (userId) => {
    return await API.get(`/users/${userId}`);
};
