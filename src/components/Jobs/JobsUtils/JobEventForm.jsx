import React, { useState, useCallback } from 'react';
import './JobEventForm.css';

const JobEventForm = ({ onAddEvent, productId }) => {
    console.log('JobEventForm renderizado con productId:', productId);
    const [newEvent, setNewEvent] = useState({
        eventProductId: productId || null, // asignamos el productId al nuevo evento
        eventNote: ''
    });

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewEvent((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (onAddEvent) {
            onAddEvent(newEvent); // enviamos el evento al padre
        }
        // no limpiamos porque la idea es cerrar el formulario desde el padre
    }, [newEvent, onAddEvent]);

    return (
        <div className="job-event-form">
            <h4>Agregar nuevo evento</h4>
            <form onSubmit={handleSubmit}>
                <div className="event-note">
                    <label>Nota:</label>
                    <textarea
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