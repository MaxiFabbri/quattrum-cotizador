import { useState, useRef, useEffect } from "react";
import { apiClient } from "../../../config/axiosConfig";

const SelectSupplierPayMethod = ({ defaultSupplierPay, onSelectSupplierPayMethod }) => {
    
    const [supplierPayMethodSuggestions, setSupplierPayMethodSuggestions] = useState([]);
    const [searchValue, setSearchValue] = useState(defaultSupplierPay || ""); // Initialize with default value
    const debounceFetch = useRef(null);

    // Ensure the component stays in sync with updated `defaultSupplierPay`
    useEffect(() => {
        setSearchValue(defaultSupplierPay || "");
    }, [defaultSupplierPay]);

    // Fetch payment methods based on user input
    const fetchSuppliersPayMethodByName = async (name) => {
        if (!name.trim()) {
            setSupplierPayMethodSuggestions([]); // Clear suggestions for empty input
            return;
        }
        try {
            const response = await apiClient.post("supplier-payment-methods/name", { name });
            const data = Array.isArray(response.data.response) ? response.data.response : [];
            setSupplierPayMethodSuggestions(data); // Update suggestions
        } catch (error) {
            console.error("Error fetching payment methods:", error);
            setSupplierPayMethodSuggestions([]);
        }
    };

    // Handle input changes with debounce to optimize API calls
    const handleSearchChange = (e) => {
        const name = e.target.value;
        setSearchValue(name); // Update the search value
        if (debounceFetch.current) {
            clearTimeout(debounceFetch.current);
        }
        debounceFetch.current = setTimeout(() => {
            fetchSuppliersPayMethodByName(name);
        }, 500); // Delay fetch to avoid multiple calls
    };

    // Handle selection of a payment method
    const handleSupplierPayMethodSelect = (supplierPayMethod) => {
        setSearchValue(supplierPayMethod.supplier_payment_description); // Update input with selected method
        setSupplierPayMethodSuggestions([]); // Clear suggestions
        onSelectSupplierPayMethod(supplierPayMethod); // Notify parent component
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Buscar Condición de venta"
                value={searchValue}
                onChange={handleSearchChange} // Update value dynamically
            />
            <ul>
                {supplierPayMethodSuggestions.map((supplierPayMethod) => (
                    <li
                        key={supplierPayMethod._id}
                        onClick={() => handleSupplierPayMethodSelect(supplierPayMethod)} // Select method on click
                    >
                        {supplierPayMethod.supplier_payment_description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SelectSupplierPayMethod;
