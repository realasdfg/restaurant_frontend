import axios from 'axios';

export const BASE_URL = 'http://localhost:8000/api/v1';

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

// USERS
export const login = async (username, password) => {
    return await API.post('/auth/login', {username, password});
};

export const fetchUsers = async () => {
    return await API.get('/users');
};

export const fetchUserById = async (userId) => {
    return await API.get(`/users/${userId}`);
};

export const updateUserById = async (userId, userData) => {
    return await API.patch(`/users/${userId}`, userData);
};

export const deleteUserById = async (userId) => {
    return await API.patch(`/users/${userId}`);
};

export const addUser = async (userData) => {
    return await API.patch('/users', userData);
};


// CATEGORIES
export const fetchCategories = async () => {
    return await API.get('/menu-categories');
};


// MENU ITEMS
export const fetchMenuItems = async (available = null) => {
    return await API.get('/menu-items', {params: {available: available}});
};

export const fetchMenuItemById = async (menuItemId) => {
    return await API.get(`/menu-items/${menuItemId}`);
};


// TABLES
export const fetchTables = async () => {
    return await API.get('/tables');
};

export const fetchTableById = async (tableId) => {
    return await API.get(`/tables/${tableId}`);
};

export const fetchCurrentOrdersByTableId = async (tableId) => {
    return await API.get(`/tables/${tableId}/orders`, {params: {current_only: true}});
};


// ORDERS
export const fetchOrders = async (params) => {
    return await API.get('/orders', {params: params});
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

export const payOrderOnline = async (orderId) => {
    return await API.patch(`/orders/${orderId}`, {'paid_online': true});
};

export const changeOrderInfo = async (orderId, data) => {
    return await API.patch(`/orders/${orderId}`, data);
};


// ORDER ITEMS
export const fetchOrderItemsByOrderId = async (orderId) => {
    return await API.get(`/orders/${orderId}/menu-items`);
};

export const addOrUpdateOrderItemQuantity = async (orderId, itemId, quantity = null) => {
    return await API.patch(`/orders/${orderId}/menu-items/${itemId}`, {quantity: quantity});
};

export const deleteOrderItem = async (orderId, itemId) => {
    return await API.delete(`/orders/${orderId}/menu-items/${itemId}`);
};
