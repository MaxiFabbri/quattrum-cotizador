import { io } from "socket.io-client";

const wsUrl = import.meta.env.VITE_WS_URL

let socket = null;

export const initSocket = ( authData) => {
    if (!socket) {
        socket = io(wsUrl, {
            transports: ["websocket"],   // fuerza WebSocket
            withCredentials: true,       // habilita credenciales si backend lo requiere
            auth: authData,              // datos de usuario para handshake
        });

        // Logs básicos para depuración
        socket.on("connect", () => {
            console.log("Conectado al servidor de WebSocket con ID:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("Error de conexión al WebSocket:", err.message);
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket desconectado:", reason);
        });
    }
    return socket;
};

/**
 * Devuelve el socket ya inicializado.
 */
export const getSocket = () => {
    if (!socket) {
        console.warn("Socket aún no inicializado. Llama a initSocket primero.");
    }
    return socket;
};

/**
 * Cierra la conexión del socket.
 */
export const closeSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("Socket cerrado correctamente.");
    }
};
