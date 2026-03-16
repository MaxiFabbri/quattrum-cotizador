import { createContext, useState, useEffect } from "react";
import { apiClient } from "../config/axiosConfig.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authenticating, setAuthenticating] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [userName, setUserName] = useState("");
    const [userId, setUserId] = useState("");

    const login = async (email, password) => {
        try {
            setAuthenticating(true);
            const response = await apiClient.post(
                "sessions/login",
                { email, password },
                { withCredentials: true }
            );
            if (response.status === 200) {
                console.log("Login exitoso!!!");
                setUserRole(response.data.response.role);
                setUserName(response.data.response.first_name);
                setUserId(response.data.response.user_id);
                setIsAuthenticated(true);
            }
        } finally {
            setAuthenticating(false);
        }
    };

    const logout = async () => {
        try {
            const response = await apiClient.post(
                "/sessions/signout",
                {},
                { withCredentials: true }
            );
            if (response.status === 200) {
                console.log("Cierre de sesión exitoso");
                setIsAuthenticated(false);
                setUserRole("");
                setUserName("");
                setUserId("");
            } else {
                console.error("Error al cerrar sesión");
            }
        } catch (error) {
            console.error("Hubo un error al intentar cerrar sesión:", error);
        }
    };

    const checkAuth = async () => {
        try {
            setAuthenticating(true);
            const response = await apiClient.post(
                "/sessions/online",
                {},
                { withCredentials: true }
            );
            if (response.status === 200) {
                setUserName(response.data.first_name);
                setUserRole(response.data.role);
                setUserId(response.data.user_id);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.log("Usuario no autenticado");
            setIsAuthenticated(false);
        } finally {
            setAuthenticating(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                authenticating,
                userRole,
                userName,
                userId,
                login,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
