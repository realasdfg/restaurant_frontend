import axios from "axios";
import {BASE_URL} from "./api.js";

export const getUserRoleFromAPI = async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            return "guest";
        }
        const response = await axios.get(`${BASE_URL}/users/me`, {headers: {Authorization: `Bearer ${token}`}});
        return response.data.role;
    } catch (error) {
        return "guest";
    }
};
