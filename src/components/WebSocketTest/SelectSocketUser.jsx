import { useState } from 'react';

function UserSelector({ emiterUserId, activeUsersList, onSelect }) {
    const [selectedUser, setSelectedUser] = useState('');
    const loggedUsers = activeUsersList.filter(
        user => user.socketId !== emiterUserId
    );

    const handleChange = (e) => {
        const userId = e.target.value;
        setSelectedUser(userId);
        if (onSelect) {
            onSelect(userId); // notifica al padre el usuario elegido
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
                    <option key={user.socketId} value={user.socketId}>
                        {user.userName}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default UserSelector;
