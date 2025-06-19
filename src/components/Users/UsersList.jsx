import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/axiosConfig.js';
import IconButton from '../Utils/IconButton.jsx';
import TextButton from '../Utils/TextButton.jsx';
import './UsersList.css';

const UsersList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([])
    const [updated, setUpdated] = useState(true);
    const [loading, setLoading] = useState(true);

    // Función para realizar la solicitud GET
    const fetchUsers = async () => {
        setUpdated(true);
        try {
            const response = await apiClient.get(`/users/`);
            setUsers(response.data.response);
        } catch (error) {
            setError("Error al cargar los usuarios");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, [updated]);

    const handleRowClick = (id) => {
        navigate(`/users/edit/${id}`);
    };
    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este Usuario?")) {
            setUpdated(false);
            try {
                await apiClient.delete(`/users/${id}`);
                setLoading(true)
            } catch (error) {
                console.error("Error al eliminar el usuario:", error);
            } finally {
                setUpdated(true);
            }
        }
    };

    if (loading) {
        return <p>Cargando Usuarios...</p>;
    }

    return (
        <div className="users-list">
            <div className="users-list-header">
                <h2>Usuarios</h2>
                <TextButton
                    text="Crear Usuario"
                    onClick={() => navigate("/users/new")}
                />
            </div>

            <table className='users-table'>
                <thead>
                    <tr key="users-thead">
                        <th> </th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Email</th>
                        <th>Rol</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id} onClick={() => handleRowClick(user._id)} style={{ cursor: "pointer" }}>
                            <td>
                                <IconButton
                                    icon="/delete.png"
                                    text="Eliminar"
                                    onClick={ (e) => {
                                        e.stopPropagation(); // Evita que el evento de clic se propague al transición de la página                                        
                                        handleDelete(user._id)
                                    }}
                                />
                            </td>
                            <td>{user.first_name}</td>
                            <td>{user.last_name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    )
}

export default UsersList;