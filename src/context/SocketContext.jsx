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
    const [message, setMessage] = useState(null);

    useEffect(() => {
        console.log("Connected Users: ", connectedUsers);
    }, [connectedUsers]);

    useEffect(() => {
        if (isAuthenticated) {
            const authData = { userName, userRole, userId };
            const newSocket = initSocket(authData);
            setIsSocketConnected(true);
            setSocket(newSocket);

            // Montar listeners una sola vez
            newSocket.on("usersUpdate", (usersObj) => {
                setSocketUserMap(usersObj);
            });

            newSocket.on("newMessage", (msg) => {
                console.log("Mensaje broadcast recibido:", msg);
            });

            newSocket.on("privateMessage", ({ emiterUserId, message }) => {
                console.log(`Mensaje privado de ${emiterUserId}: ${message}`);
            });


            newSocket.on("job:open:response", ({ jobId }) => {
                console.log("job:open:response recibido para jobId: ", jobId, " Ya está abierto ");
                setMessage({type: "alert", text: `El job ${jobId} ya está abierto por otro usuario`});
            })

            // Cuando otro usuario abre el mismo job
            newSocket.on("job:userJoined", ({ jobId }) => {
                console.log(`El job ${jobId} fue abierto por otro usuario`);
                setMessage({type: "info", text: `Otro usuario está abriendo el job ${jobId} `});
            });

            // Cuando otro usuario cierra el job
            newSocket.on("job:userLeft", ({ jobId, userId }) => {
                console.log(`Usuario ${userId} cerró el job ${jobId}`);
                setMessage({type: "info", text: `Otro usuario cerró el job ${jobId} `});
            });

            return () => {
                // desmontar todos los listeners juntos
                newSocket.off("usersUpdate");
                newSocket.off("newMessage");
                newSocket.off("privateMessage");
                newSocket.off("job:open:response");
                newSocket.off("job:userJoined");
                newSocket.off("job:userLeft");
            };
        } else {
            closeSocket();
            setSocket(null);
            setConnectedUsers({});
        }
    }, [isAuthenticated, userName, userRole, userId]);

    useEffect(() => {	
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
        <SocketContext.Provider value={{ socket, connectedUsers, isSocketConnected, message, setMessage }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
