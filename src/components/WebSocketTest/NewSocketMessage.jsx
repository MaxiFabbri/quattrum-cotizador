import { useState, useEffect, useRef, useContext } from 'react';
import UserSelector from './SelectSocketUser.jsx';
import './websocket-test.css';

function NewSocketMessage({ activeUsersList, emiterUserId, onSend }) {
    const [messageContent, setMessageContent] = useState('');
    const [target, setTarget] = useState('');

    const sendNewSocketMessage = (target, messageContent) => {
        console.log('Enviando mensaje desde:', emiterUserId, 'hacia:', target, 'con contenido:', messageContent);
        onSend(target, messageContent);
        setMessageContent('');
    }

    return (
        <div className="message-panel">
            <div>
                <UserSelector
                    emiterUserId={emiterUserId}
                    activeUsersList={activeUsersList}
                    onSelect={(e) => setTarget(e)}
                />
            </div>
            <div className="send-message">
                <label htmlFor="message-input">Mensaje</label>
                <textarea
                    id="message-input"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Escribe tu mensaje aquí..."
                    rows="3"
                />
                <button
                    onClick={() => sendNewSocketMessage(target, messageContent)}
                    className="send-btn"
                >
                    Enviar Mensaje
                </button>
            </div>
        </div>
    );
}

export default NewSocketMessage;
