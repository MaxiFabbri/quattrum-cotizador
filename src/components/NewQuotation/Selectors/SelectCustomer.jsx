import { useState, useRef } from "react";
import { apiClient } from "../../../config/axiosConfig";

const SelectCustomer = ({ defaultCustomer, onSelectCustomer }) => {;
    const [customerSuggestions, setCustomerSuggestions] = useState([]);
    const [searchValue, setSearchValue] = useState(defaultCustomer); // Controla el valor del input
    const debounceFetch = useRef(null);

    // Función para buscar clientes por nombre
    const fetchCustomersByName = async (name) => {
        if (!name.trim()) { // Validación para entradas vacías
            setCustomerSuggestions([]);
            return;
        }
        try {
            const response = await apiClient.post("/customers/name", { name });
            const data = Array.isArray(response.data.response) ? response.data.response : [];
            setCustomerSuggestions(data); // Almacena las sugerencias
        } catch (error) {
            console.error("Error al buscar clientes:", error);
            setCustomerSuggestions([]); // Restablece a vacío en caso de error
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
            fetchCustomersByName(name); // Busca después de un breve retraso
        }, 300);
    };

    // Maneja la selección de un cliente
    const handleCustomerSelect = (customer) => {
        setSearchValue(customer.name); // Establece el nombre del cliente seleccionado en el input
        setCustomerSuggestions([]); // Limpia las sugerencias
        onSelectCustomer(customer); // Notifica al componente padre sobre la selección
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Buscar cliente"
                value={searchValue}
                onChange={handleSearchChange} // Maneja la entrada del usuario
            />
            <ul>
                {customerSuggestions.map((customer) => (
                    <li
                        key={customer._id}
                        onClick={() => handleCustomerSelect(customer)} // Selecciona el cliente
                    >
                        {customer.name} {/* Muestra nombre */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SelectCustomer;

