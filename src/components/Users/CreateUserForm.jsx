import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TextButton from "../Utils/TextButton.jsx";
import { apiClient } from "../../config/axiosConfig.js";
import "./UserForm.css";

const CreateUserForm = () => {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [emailError, setEmailError] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("USER");

    const handleCancel = () => {
        console.log("Cancel button clicked, navigating to /");
        navigate("/users");
    }

    const checkIfUserExists = async (email) => {
        setEmailError("Verificando usuario..."); // Mensaje temporal mientras se verifica
        try {
            const response = await apiClient.get(`/users/check-email?email=${email}`);
            return response.data.exists;
        } catch (error) {
            console.error("Error al verificar el usuario:", error);
            return false;
        }
    };

    const handleEmailBlur = async () => {
        setIsEmailValid(false); // Resetea el estado de validez del email
        const emailValue = formRef.current.querySelector("#email").value;
        if (!emailValue) return; // No validar si el campo está vacío
        const exists = await checkIfUserExists(emailValue);
        if (exists) {
            setEmailError("Este correo ya está registrado.");
        } else {
            setEmailError(""); // Limpia el error si el email es válido
            setIsEmailValid(true); // Marca el email como válido
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault(); // Previene envío por defecto
        const form = formRef.current;
        if (form && form.checkValidity() && emailError === "") {
            const userData = {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                role
            };
            console.log("Form OK ✅ UserData: ", userData);
            const response = await apiClient.post("/sessions/register", userData);
            navigate("/users"); // Redirige a la página de usuarios
        } else {
            form.reportValidity(); // Muestra mensajes nativos del navegador
            console.log("Formulario inválido ❌");
        }
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
                            <label htmlFor="firstName">Nombre:</label>
                            <input
                                type="text"
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required title="Por favor, ingrese un nombre."
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Apellido:</label>
                            <input
                                type="text"
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico:   </label>
                            {emailError && <span className="error-message">{emailError}</span>}
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={handleEmailBlur} // Verifica si el email ya existe al perder el foco
                            />

                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Contraseña:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required title="La contraseña debe tener al menos 6 caracteres, con letras y números."
                                pattern="^(?=.*[a-zA-Z])(?=.*\d).{6,}$"
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
                            {isEmailValid ? (
                                <TextButton text="Guardar Usuario" onClick={handleSaveUser} />
                            ) : null}
                            <TextButton text="Cancelar" onClick={handleCancel} />
                        </div>
                    </form>
                </div>
            }
        </>
    )
}

export default CreateUserForm;