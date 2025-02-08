import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserRoleFromAPI } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const role = await getUserRoleFromAPI();
                setUserRole(role);
            } catch (error) {
                setUserRole("guest");
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ userRole, setUserRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
