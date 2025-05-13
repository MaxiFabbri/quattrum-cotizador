import React, { createContext, useState, useEffect } from 'react';
import { apiClient } from '../config/axiosConfig.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = async (email, password) => {
        try {
            const response = await apiClient.post(
                'sessions/login',
                { email, password }, // Datos enviados al servidor
                { withCredentials: true } // Incluye cookies en la solicitud
            );
            console.log('Login response:', response);
            if (response.status === 200) {
                setIsAuthenticated(true);
            } else {
                alert('Error: Credenciales incorrectas');
            }
        } catch (error) {
            console.error('Hubo un error al intentar iniciar sesión:', error);
            alert('Error al conectar con el servidor');
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
                setIsAuthenticated(false);
            } else {
                console.error('Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Hubo un error al intentar cerrar sesión:', error);
        }
    };

    const checkAuth = async () => {
        console.log('Verificando autenticación...');
        try {
            const response = await apiClient.post(
                '/sessions/online',
                { withCredentials: true } // Incluye cookies en la solicitud
            );
            if (response.status === 200) {
                console.log('Usuario autenticado');
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Hubo un error al verificar la autenticación:', error);
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
