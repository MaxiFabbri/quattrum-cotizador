import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TextButton from "../Utils/TextButton.jsx";
import { apiClient } from "../../config/axiosConfig.js";
import "./UserForm.css";

const EditUserForm = () => {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("user");

    const { id } = useParams()

    const getUserData = async () => {
        if (id && id !== "new") {
            console.log("User ID:", id);
            try {
                setLoading(true);
                const response = await apiClient.get(`/users/${id}`);
                const userData = response.data.response;
                console.log("User Data:", userData);
                if (userData) {
                    setFirstName(userData.first_name || "");
                    setLastName(userData.last_name || "");
                    setEmail(userData.email );
                    setRole(userData.role || "user");
                } else {
                    console.error("No user data found for the given ID.");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        } else {
            console.log("New user form");
        }
    }

    useEffect(() => {
        getUserData()
    }, []);

    const handleCancel = () => {
        console.log("Cancel button clicked, navigating to /");
        navigate("/users");
    }

    const handleUpdateUser = async (e) => {
        e.preventDefault(); // Previene envío por defecto
        // const form = formRef.current;
        const userData = {
            first_name: firstName,
            last_name: lastName,
            email,
            role
        };
        console.log("Form OK ✅ UserData: ", userData);
        const response = await apiClient.put(`/users/${id}`, userData);
        navigate('/users')
    };



    return (
        <>
            {loading ?
                <p>Cargando...</p>
                :
                <div className="user-form-container">
                    <h2>Usuario</h2>
                    <form ref={formRef}>
                        <div className="form-group">
                            <label htmlFor="first_name">Nombre:</label>
                            <input
                                type="text"
                                id="first_name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required title="Por favor, ingrese un nombre."
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="last_name">Apellido:</label>
                            <input
                                type="text"
                                id="last_name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico:   </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                disabled
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="role">Rol:   </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="ADMIN">Administrador</option>
                                <option value="USER">Usuario</option>
                            </select>
                        </div>
                        <div className="form-actions">
                            <TextButton text="Modificar Usuario" onClick={handleUpdateUser} />
                            <TextButton text="Cancelar" onClick={handleCancel} />
                        </div>
                    </form>
                </div>
            }
        </>
    )
}

export default EditUserForm;