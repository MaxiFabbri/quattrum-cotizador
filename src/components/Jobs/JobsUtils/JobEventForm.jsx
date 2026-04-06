import React, { useState, useCallback, useRef, useEffect } from 'react';
import './JobEventForm.css';

const JobEventForm = ({ onAddEvent, productId }) => {

    const [newEvent, setNewEvent] = useState({
        eventProductId: productId || null,
        eventNote: ''
    });

    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []); // se ejecuta solo al montar

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewEvent((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (onAddEvent) {
            onAddEvent(newEvent);
        }
    }, [newEvent, onAddEvent]);

    return (
        <div className="job-event-form">
            <h4>Agregar nuevo evento</h4>
            <form onSubmit={handleSubmit}>
                <div className="event-note">
                    <label>Nota:</label>
                    <textarea
                        ref={textareaRef} // asignamos el ref
                        name="eventNote"
                        value={newEvent.eventNote}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Agregar evento</button>
            </form>
        </div>
    );
};

export default JobEventForm;