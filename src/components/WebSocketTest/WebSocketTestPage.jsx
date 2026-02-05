import { useState, useEffect, useRef, useContext, use } from 'react';
import './websocket-test.css';
import { AuthContext } from '../../context/AuthContext';
import { ParametersContext } from '../../context/ParametersContext';
// import SocketMessage from './socketMessage';
import NewSocketMessage from './NewSocketMessage';

function WebSocketTestPage() {
  const { usersList } = useContext(ParametersContext);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);
  const { socket } = useContext(AuthContext);
  const [activeUsersList, setActiveUsersList] = useState([]);
  const [serverUsers, setServerUsers] = useState({});

  // Esta función recibe los datos del hijo
  const handleSendMessage = (target, messageContent) => {
    console.log('En Test Page Enviando mensaje desde:', socket.current.auth.userName, ' hacia: ', target, ' con contenido: ', messageContent);
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

  useEffect(() => {
    updateActiveUsersList(serverUsers);
  }, [usersList]);

  const updateActiveUsersList = (usersMapObj) => {
    const newUsersList = usersList.map(user => {
      const socketId = usersMapObj[user._id]; // clave = userId
      return {
        userId: user._id,
        userName: user.first_name,
        isActive: !!socketId,   // true si existe
        socketId: socketId || null
      };
    });
    setActiveUsersList(newUsersList);
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  useEffect(() => {
    if (socket.current) {
      console.log('Socket en testPage: ', socket.current);

      socket.current.on("connect", () => {
        console.log("Conectado al servidor de WebSocket con ID:", socket.current.id);
        setIsConnected(true);
        addLog(`Conectado con ID: ${socket.current.id}`, 'success');
      });

      // 👇 escuchar mensajes del servidor
      socket.current.on("response", (msg) => {
        console.log("Respuesta recibida: ", msg);
        addLog(`Respuesta recibida:  ${msg}`, 'received');
      });

      socket.current.on("newMessage", (msg) => {
        console.log("Nuevo mensaje recibido: ", msg);
        addLog(`Nuevo mensaje recibido:  ${msg}`, 'received');
      });

      socket.current.on("usersUpdate", (usersMap) => {
        console.log("Usuarios conectados: ", usersMap);
        setServerUsers(usersMap);
        updateActiveUsersList(usersMap)
      });

      socket.current.on("privateMessage", ({msg}) => {
        console.log("Mensaje privado recibido: ", msg);
        // const { from, message } = msg;
        // console.log("Mensaje privado recibido : ", from, " - ", message);
        addLog(`Nuevo mensaje PRIVADO recibido de:  ${msg.from} con contenido: ${msg.message}`, 'received');
      })

      // cleanup: remover listeners al desmontar
      return () => {
        socket.current.off("connect");
        socket.current.off("message");
        socket.current.off("privateMessage");
        socket.current.off("newMessage");
        socket.current.off("usersUpdate");
      };
    }
  }, [socket]);

  const connect = () => {
    console.log('Intentando conectar al servidor de WebSocket...');
    if (socket.current && !socket.current.connected) {
      socket.current.connect();
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

  const disconnect = () => {
    if (socket.current) {
      addLog('Cerrando conexión...', 'info');
      socket.current.close();
      setIsConnected(false);
    }
  };

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
              {activeUsersList.map(user => (
                <li key={user.userId}>
                  {user.isActive ? ' ✅ - ' : ' ❌ - '}
                  {user.userName}
                </li>
              ))}
            </ul>
          </div>
          <div className="connection-controls">
            <div className="connection-status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
              <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>

        </div>

        <div className="message-panel">
          {socket.current?.id && (
            <NewSocketMessage
              activeUsersList={activeUsersList}
              emiterUserId={socket.current.id}
              onSend={handleSendMessage}
            />
          )}
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

