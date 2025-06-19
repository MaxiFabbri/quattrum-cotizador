import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../config/axiosConfig.js";
import TextButton from "../Utils/TextButton.jsx";
import { ToastContainer, toast } from "react-toastify";

const PasswordUpdate = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();


    const handleCancel = () => {
        console.log("Cancel button clicked, navigating to /");
        navigate("/users");
    }

    const handleChangePassword = async () => {
        console.log("handleChangePassword called");
        console.log("oldPassword:", oldPassword);
        console.log("newPassword:", newPassword);
        console.log("confirmPassword:", confirmPassword);
    
        // controlo si las contraseñas nuevas coinciden
        if (newPassword !== confirmPassword) {
            console.log("las contraseñas no coinciden");
            toast.error("Las contraseñas no coinciden.",
                { 
                    position: 'top-center', 
            });
            return
        } else {
            console.log("las contraseñas coinciden");
                    // actualizo la contraseña
            const data = {
                oldPassword,
                newPassword,
            };
            console.log("Data to send:", data);
            const response = await apiClient.post("/sessions/update-password", data)
            console.log("Response from server:", response);
            if (response.status === 201) {
                console.log("Contraseña actualizada correctamente");
                toast.success("Contraseña actualizada correctamente.",
                    { 
                        position: 'top-center', 
                });
                navigate("/");
                return
            } else {
                console.error("Error al actualizar la contraseña:", response.data);
                toast.error("Error al actualizar la contraseña.",
                    { 
                        position: 'top-center', 
                });
            }
        }
    }

    return (
        <div className="user-form-container">
            <h2>Actualizacion de Contraseña</h2>
            <div>
                <div className="form-group">
                    <label htmlFor="oldPassword">Contraseña Anterior:</label>
                    <input
                        type="password"
                        id="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required title="La contraseña debe tener al menos 6 caracteres, con letras y números."
                        pattern="^(?=.*[a-zA-Z])(?=.*\d).{6,}$"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="newPassword">Nueva Contraseña:</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required title="La contraseña debe tener al menos 6 caracteres, con letras y números."
                        pattern="^(?=.*[a-zA-Z])(?=.*\d).{6,}$"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirme Contraseña:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required title="La contraseña debe tener al menos 6 caracteres, con letras y números."
                        pattern="^(?=.*[a-zA-Z])(?=.*\d).{6,}$"
                    />
                </div>
                <div className="form-actions">
                    <TextButton text="Cambiar Contraseña" onClick={handleChangePassword} />
                    <TextButton text="Cancelar" onClick={handleCancel} />
                </div>
            </div>
        </div>
    );
};

export default PasswordUpdate;