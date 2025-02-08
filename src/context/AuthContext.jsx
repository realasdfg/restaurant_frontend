import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserRoleFromAPI } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const role = await getUserRoleFromAPI();
                setUser(role);
            } catch (error) {
                setUser("guest");
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
