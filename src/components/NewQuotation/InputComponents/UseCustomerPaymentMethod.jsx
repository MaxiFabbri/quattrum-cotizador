// useCustomerPaymentMethod.js
import { useState, useEffect } from 'react';
import { apiClient } from '../../../config/axiosConfig.js';

const UseCustomerPaymentMethod = (id) => {
    const [paymentMethodName, setPaymentMethodName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomersPayMethodById = async (id) => {
            setIsLoading(true);
            try {
                const response = await apiClient.get(`customer-payment-methods/${id}`);
                setPaymentMethodName(response.data.response.customer_payment_description);
            } catch (error) {
                console.error("Error al buscar forma de pago:", error);
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCustomersPayMethodById(id);
        } else {
            setPaymentMethodName(""); // Reset if no ID is provided
        }
    }, [id]);

    return { paymentMethodName, isLoading, error };
};

export default UseCustomerPaymentMethod;