import { useState } from 'react';

function UserSelector({ emiterUserId, activeUsersList, onSelect }) {
    const [selectedUser, setSelectedUser] = useState('');

    // Filtramos los usuarios activos que no sean el emisor
    const loggedUsers = activeUsersList.filter(
        user => user.socketId !== emiterUserId
    );

    const handleChange = (e) => {
        const userId = e.target.value; // ahora devuelve el userId
        console.log("Usuario seleccionado (userId):", userId);
        setSelectedUser(userId);
        if (onSelect) {
            onSelect(userId); // notifica al padre el userId elegido
        }
    };

    return (
        <div className="user-selector">
            <label htmlFor="user-select">Destinatario:</label>
            <select
                id="user-select"
                value={selectedUser}
                onChange={handleChange}
            >
                <option value="">-- Selecciona un usuario --</option>
                {loggedUsers.map((user) => (
                    <option key={user.userId} value={user.userId}>
                        {user.userName}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default UserSelector;

