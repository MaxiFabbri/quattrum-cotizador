import { useState, useRef } from "react";
import { apiClient } from "../../../config/axiosConfig";

const SelectSupplier = ({ defaultSupplier, onSelectSupplier }) => {
    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [searchValue, setSearchValue] = useState(defaultSupplier); // Controla el valor del input
    const debounceFetch = useRef(null);

    // Función para buscar proveedores por nombre
    const fetchSuppliersByName = async (name) => {
        if (!name.trim()) { // Validación para entradas vacías
            setSupplierSuggestions([]);
            return;
        }
        try {
            const response = await apiClient.post("/suppliers/name", { name });
            const data = Array.isArray(response.data.response) ? response.data.response : [];
            setSupplierSuggestions(data); // Almacena las sugerencias
        } catch (error) {
            console.error("Error al buscar proveedores:", error);
            setSupplierSuggestions([]); // Restablece a vacío en caso de error
        }
    };

    // Maneja los cambios en el input de búsqueda
    const handleSearchChange = (e) => {
        const name = e.target.value;
        setSearchValue(name); // Actualiza el valor del input
        // Debounce para evitar múltiples llamadas mientras se escribe
        if (debounceFetch.current) {
            clearTimeout(debounceFetch.current);
        }
        debounceFetch.current = setTimeout(() => {
            fetchSuppliersByName(name); // Busca después de un breve retraso
        }, 300);
    }

    // Maneja la selección de un proveedor
    const handleSupplierSelect = (supplier) => {
        setSearchValue(supplier.name); // Establece el nombre del proveedor seleccionado en el input
        setSupplierSuggestions([]); // Limpia las sugerencias
        onSelectSupplier(supplier); // Notifica al componente padre sobre la selección
    }

    return (
        <div>
            <input
                type="text"
                placeholder="Buscar proveedor"
                value={searchValue}
                onChange={handleSearchChange} // Maneja la entrada del usuario
            />
            <ul>
                {supplierSuggestions.map((supplier) => (
                    <li
                        key={supplier._id}
                        onClick={() => handleSupplierSelect(supplier)} // Selecciona el proveedor
                    >
                        {supplier.name} {/* Muestra nombre */}
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default SelectSupplier;