import { createContext, use, useContext, useEffect, useState } from "react";
import { initSocket, closeSocket } from "../config/socketConfig.js";

import { ParametersContext } from "./ParametersContext.jsx";
import { useAuth } from "../hooks/useAuth.js";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { isAuthenticated, userName, userRole, userId } = useAuth();
    const { usersList } = useContext(ParametersContext);
    const [socket, setSocket] = useState(null);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [socketUserMap, setSocketUserMap] = useState({});
    const [connectedUsers, setConnectedUsers] = useState({});

    useEffect(() => {
        if (isAuthenticated) {
            const authData = { userName, userRole, userId };
            const newSocket = initSocket(authData);
            setIsSocketConnected(true);
            setSocket(newSocket);

            // Montar listeners una sola vez
            newSocket.on("usersUpdate", (usersObj) => {
                console.log("Usuarios conectados actualizados: ", usersObj);
                setSocketUserMap(usersObj);
            });

            newSocket.on("newMessage", (msg) => {
                console.log("Mensaje broadcast recibido:", msg);
            });

            newSocket.on("privateMessage", ({ from, message }) => {
                console.log(`Mensaje privado de ${from}: ${message}`);
            });

            return () => {
                // desmontar todos los listeners juntos
                newSocket.off("usersUpdate");
                newSocket.off("newMessage");
                newSocket.off("privateMessage");
            };
        } else {
            closeSocket();
            setSocket(null);
            setConnectedUsers({});
        }
    }, [isAuthenticated, userName, userRole, userId]);

    useEffect(() => {
        console.log("Socket actualizado en SocketProvider: ", socket, "Usuarios conectados: ", usersList);	
        updateActiveUsersList(socketUserMap);
    }, [socket, usersList, socketUserMap]);

    useEffect(() => {
        updateActiveUsersList(socketUserMap);
    }, [usersList, socketUserMap]);

    const updateActiveUsersList = (usersMapObj) => {
		const newConnectedUsersList = usersList.map(user => {
			const socketId = usersMapObj[user._id]; // clave = userId
			return {
				userId: user._id,
				userName: user.first_name,
				isActive: !!socketId,   // true si existe
				socketId: socketId || null
			};
		});
		setConnectedUsers(newConnectedUsersList);
	};


    return (
        <SocketContext.Provider value={{ socket, connectedUsers, isSocketConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
