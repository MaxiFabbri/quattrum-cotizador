import { useState, useEffect, useRef, useContext, use } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { ParametersContext } from '../../context/ParametersContext';
import NewSocketMessage from './NewSocketMessage';

import './websocket-test.css';

function WebSocketTestPage() {
    const { usersList } = useContext(ParametersContext);
    const { socket, connectedUsers, isSocketConnected } = useContext(SocketContext);
    const [isConnected, setIsConnected] = useState(false);
    const [message, setMessage] = useState('');
    const [logs, setLogs] = useState([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const logsEndRef = useRef(null);
    


    useEffect(() => {
        console.log("Usuarios conectados en TestPage: ", connectedUsers);
    }, [connectedUsers]);

    // Esta función recibe los datos del hijo
    const handleSendMessage = (target, messageContent) => {
        // console.log('En Test Page Enviando mensaje desde:', socket.current.auth.userName, ' hacia: ', target, ' con contenido: ', messageContent);
        try {
            // Enviar un mensaje a un usuario específico
            socket.current.emit("privateMessage", {
                toUserId: target,   // destinatario
                from: socket.current.auth.userId, // emisor
                message: messageContent
            });
            const response = (`Mensaje enviado: ${messageContent} a: ${target}`, 'sent');
            console.log(response);
        } catch (error) {
            // addLog(`Error al enviar mensaje: ${error.messageContent}`, 'error');
            console.log("Error al enviar mensaje: ", error);
        }
    };

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { message, type, timestamp }]);
    };

    const scrollToBottom = () => {
        if (autoScroll && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // const disconnect = () => {
    // 	if (socket.current) {
    // 		addLog('Cerrando conexión...', 'info');
    // 	}
    // };

    const sendMessage = () => {
        if (!socket.current.connected) {
            addLog('No hay conexión activa', 'error');
            return;
        }

        if (!message.trim()) {
            addLog('El mensaje no puede estar vacío', 'warning');
            return;
        }

        try {
            socket.current.emit("message", message);
            addLog(`Mensaje enviado: ${message}`, 'sent');
            setMessage('');
        } catch (error) {
            addLog(`Error al enviar mensaje: ${error.message}`, 'error');
        }
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="websocket-test-container">
            <div className="websocket-test-header">
                <h1>Prueba de WebSocket</h1>
                <p>Conecta, envía y recibe mensajes de un servidor WebSocket</p>
            </div>

            <div className="websocket-test-content">
                <div className="connection-panel">
                    <div className="users-list">
                        <ul>
                            {connectedUsers.map(user => (
                                <li key={user.userId}>
                                    {user.isActive ? ' ✅ - ' : ' ❌ - '}
                                    {user.userName}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="connection-controls">
                        <div className="connection-status">
                            <span className={`status-indicator ${isSocketConnected ? 'connected' : 'disconnected'}`}></span>
                            <span>{isSocketConnected ? 'Conectado' : 'Desconectado'}</span>
                        </div>
                    </div>

                </div>

                <div className="message-panel">
                    {isSocketConnected ? (
                        <NewSocketMessage
                            activeUsersList={connectedUsers}
                            emiterUserId={socket.current?.id}
                            onSend={handleSendMessage}
                        />
                    ) : null}

                </div>

                <div className="logs-panel">
                    <div className="logs-header">
                        <h3>Logs de Conexión y Mensajes</h3>
                        <div className="logs-controls">
                            <label className="auto-scroll-toggle">
                                <input
                                    type="checkbox"
                                    checked={autoScroll}
                                    onChange={(e) => setAutoScroll(e.target.checked)}
                                />
                                Auto-scroll
                            </label>
                            <button onClick={clearLogs} className="clear-logs-btn">
                                Limpiar Logs
                            </button>
                        </div>
                    </div>

                    <div className="logs-container">
                        <div className="logs-content">
                            {logs.length === 0 ? (
                                <div className="no-logs">No hay logs disponibles</div>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={index} className={`log-entry log-${log.type}`}>
                                        <span className="log-timestamp">[{log.timestamp}]</span>
                                        <span className="log-message">{log.message}</span>
                                    </div>
                                ))
                            )}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WebSocketTestPage;
