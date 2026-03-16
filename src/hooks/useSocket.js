// src/hooks/useSocket.js
import { useContext } from "react";
import { SocketContext } from "../contexts/SocketContext.jsx";

export const useSocket = () => {
    const { socket } = useContext(SocketContext);

    if (!socket) {
        console.warn("Socket aún no inicializado o usuario no autenticado.");
    }

    return socket;
};
