import { useState, useEffect, useRef, useContext } from 'react';
import './websocket-test.css';
import { AuthContext } from '../../context/AuthContext';

function SocketMessage({ from, target, content, date }) {

    const replyMessage = () => {
        console.log('Respondiendo al mensaje de:', from);
        // Aquí puedes implementar la lógica para responder al mensaje
    };

    return (
        <div className="message-panel">
            <div className="send-message">
                <label htmlFor="message-input">Mensaje</label>
                <textarea
                    id="message-received"
                    value={content}
                    rows="3"
                />
                <button
                    onClick={replyMessage}
                    className="send-btn"
                >
                    Responder Mensaje
                </button>
            </div>
        </div>
    );
}

export default SocketMessage;