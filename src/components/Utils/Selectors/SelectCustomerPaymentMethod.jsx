import { useState, useRef, useEffect } from "react";
import { apiClient } from "../../../config/axiosConfig";

const SelectCustomerPayMethod = ({ defaultPayment, onSelectCustomerPayMethod }) => {
    const [customerPayMethodSuggestions, setCustomerPayMethodSuggestions] = useState([]);
    const [searchValue, setSearchValue] = useState(defaultPayment || ""); // Initialize with default value
    const debounceFetch = useRef(null);

    useEffect(() => {
        setSearchValue(defaultPayment || ""); // Keep in sync with defaultPayment
    }, [defaultPayment]);

    const fetchCustomersPayMethodByName = async (name) => {
        if (!name.trim()) {
            setCustomerPayMethodSuggestions([]);
            return;
        }
        try {
            const response = await apiClient.post("customer-payment-methods/name", { name });
            const data = Array.isArray(response.data.response) ? response.data.response : [];
            setCustomerPayMethodSuggestions(data);
        } catch (error) {
            console.error("Error al buscar métodos de pago:", error);
            setCustomerPayMethodSuggestions([]);
        }
    };

    const handleSearchChange = (e) => {
        const name = e.target.value;
        setSearchValue(name);
        if (debounceFetch.current) {
            clearTimeout(debounceFetch.current);
        }
        debounceFetch.current = setTimeout(() => {
            fetchCustomersPayMethodByName(name);
        }, 500);
    };

    const handleCustomerPayMethodSelect = (customerPayMethod) => {
        setSearchValue(customerPayMethod.customer_payment_description);
        setCustomerPayMethodSuggestions([]);
        onSelectCustomerPayMethod(customerPayMethod);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Buscar Condición de venta"
                value={searchValue}
                onChange={handleSearchChange}
            />
            <ul>
                {customerPayMethodSuggestions.map((customerPayMethod) => (
                    <li
                        key={customerPayMethod._id}
                        onClick={() => handleCustomerPayMethodSelect(customerPayMethod)}
                    >
                        {customerPayMethod.customer_payment_description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SelectCustomerPayMethod;
