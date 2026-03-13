import React, { createContext, useState, useEffect, useRef } from 'react';
import { apiClient } from '../config/axiosConfig.js';
import { io } from 'socket.io-client';


export const AuthContext = createContext();
// const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authenticating, setAuthenticating] = useState(false);
    const [userRole, setUserRole] = useState('')
    const [userName, setUserName] = useState('')
    const [userId, setUserId] = useState('')

    const socketRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated) {
            console.log('Conectando al servidor de WebSocket...');
            socketRef.current = io("http://localhost:8000", {
                auth: {
                    userName,
                    userRole,
                    userId
                },
            });
        }
    }, [isAuthenticated]);

    const login = async (email, password) => {
        try {
            setAuthenticating(true);
            const response = await apiClient.post("sessions/login", { email, password }, { withCredentials: true });
            if (response.status === 200) {
                setIsAuthenticated(true);
                console.log('Login exitoso!!!');
                setUserRole(response.data.response.role);
                setUserName(response.data.response.first_name);
                setUserId(response.data.response.user_id);
            }
        } finally {
            setAuthenticating(false);
        }
    };

    const logout = async () => {
        try {
            const response = await apiClient.post(
                '/sessions/signout',
                {}, // No se envían datos en el cuerpo
                { withCredentials: true } // Incluye cookies en la solicitud
            );
            console.log('Logout response:', response);
            if (response.status === 200) {
                console.log('Cierre de sesión exitoso');

                // prueba de desconexion a websockets
                socketRef.current.on("disconnect", () => {
                    console.log("DESconectado al servidor de WebSocket con ID:", socketRef.current.id);
                });
                setIsAuthenticated(false);
            } else {
                console.error('Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Hubo un error al intentar cerrar sesión:', error);
        }
    };

    const checkAuth = async () => {
        try {
            setAuthenticating(true);
            const response = await apiClient.post(
                '/sessions/online',
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
            console.log('Ususario no autenticado ');
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
                socket: socketRef
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
