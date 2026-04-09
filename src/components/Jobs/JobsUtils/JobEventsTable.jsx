import { useState, useEffect } from "react";
import "./JobEventsTable.css";

const JobEventsTable = ({ events, onClose, onEdit }) => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedNote, setEditedNote] = useState("");
    const [eventsState, setEvents] = useState(events);

    useEffect(() => {
        setEvents(events);
    }, [events]);

    // 🔹 Funciones auxiliares
    const handleEditStart = (index, note) => {
        setEditingIndex(index);
        setEditedNote(note);
    };

    const handleNoteChange = (e) => {
        setEditedNote(e.target.value);
    };

    const saveNote = (index) => {
        const updatedEvents = [...eventsState];
        updatedEvents[index].eventNote = editedNote;
        setEvents(updatedEvents);
        setEditingIndex(null);
        onEdit();
    };

    const handleBlur = (index) => {
        saveNote(index);
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Enter") {
            saveNote(index);
        }
    };

    return (
        <td colSpan={12}>
            <div className="job-events-table-container">
                <table className="event-table">
                    <thead>
                        <tr onClick={onClose}>
                            <th>Fecha</th>
                            <th>Usuario</th>
                            <th>Notas</th>
                        </tr>
                    </thead>

                    <tbody className="event-table-body">
                        {eventsState.map((event, index) => (
                            <tr key={index}>
                                <td className="text-align-center">
                                    {new Date(event.eventDate).toLocaleString("es-AR")}
                                </td>
                                <td className="text-align-center">{event.eventUserName}</td>

                                <td className="text-align-left">
                                    {editingIndex === index ? (
                                        <input
                                            className="event-note-input"
                                            type="text"
                                            value={editedNote}
                                            onChange={handleNoteChange}
                                            onBlur={() => handleBlur(index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            autoFocus
                                        />
                                    ) : (
                                        <span onClick={() => handleEditStart(index, event.eventNote)}>
                                            {event.eventNote}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </td>
    );
};

export default JobEventsTable;
