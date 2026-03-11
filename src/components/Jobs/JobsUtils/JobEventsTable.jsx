
import "./JobEventsTable.css";

const JobEventsTable = ({ events, onClose }) => {
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
                        {events.map((event, index) => (
                            <tr key={index}>
                                <td className="text-align-center">{new Date(event.eventDate).toLocaleString("es-AR")}</td>
                                <td className="text-align-center">{event.eventUserName}</td>
                                <td className="text-align-left">{event.eventNote}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </td>
    );
};

export default JobEventsTable;