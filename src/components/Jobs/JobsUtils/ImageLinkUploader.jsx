import { useState } from "react";

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
            <button onClick={() => setIsOpen(true)}>Subir Imagen</button>

            {isOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>Agregar link de imagen</h3>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            style={styles.input}
                        />
                        <input 
                            type="text" 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción (opcional)"
                        />
                        <div style={styles.actions}>
                            <button onClick={handleSubmit}>Agregar</button>
                            <button onClick={() => setIsOpen(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ImageLinkUploader;
