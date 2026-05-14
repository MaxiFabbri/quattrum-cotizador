import { useState } from "react";
import "./ImageLinkUploader.css";
import TextButton from "../../Utils/TextButton";

function ImageLinkUploader({ onAddImage }) {
    const [isOpen, setIsOpen] = useState(false);
    const [link, setLink] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = () => {
        if (link.trim()) {
            onAddImage(link.trim(), description); // usa la función del padre
            setLink("");
            setDescription("");
            setIsOpen(false);
        }
    };

    return (
        <div className="image-link-uploader">
            {!isOpen && (
                <TextButton text="Subir Imagen" onClick={() => setIsOpen(true)} />
            )}
            {isOpen && (
                <div className="modal-overlay">
                    <div className="image-link-form">
                        <h4>Agregar link de archivo</h4>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción (opcional)"
                        />
                        <div className="image-link-form-buttons">
                            <TextButton text="Agregar" onClick={handleSubmit} />
                            <TextButton text="Cancelar" onClick={() => setIsOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ImageLinkUploader;
