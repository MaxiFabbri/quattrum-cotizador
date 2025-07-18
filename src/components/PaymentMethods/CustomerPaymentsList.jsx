import { useState, useEffect, useContext, use } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../config/axiosConfig";
import CustomerPaymentDetail from "./CustomerPaymentDetail";
import "./PaymentMethods.css"

const CustomerPaymentList = () => {
    const navigate = useNavigate();
    const [customerPaymentsMethods, setCustomerPaymentsMethods] = useState([]); // Estado para las cotizaciones
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCustomerPaymentMethods();
    }, [loading]);

    // Función para realizar la solicitud GET
    const fetchCustomerPaymentMethods = async () => {
        try {
            const response = await apiClient.get('/customer-payment-methods');
            setCustomerPaymentsMethods(response.data.response);
        } catch (error) {
            setError("Error al cargar las cotizaciones");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentClick = (id) => {
        navigate(`/customers-payments/${id}`);
    };

    return (
        <div>
            <h2>Formas de Cobro a Clientes</h2>
            <div>
                <ul>
                    {loading ? (
                        <li>Cargando Formas de Cobro...</li>
                    ) : error ? (
                        <li>
                            {error}
                        </li>
                    ) : customerPaymentsMethods.length > 0 ? (
                        customerPaymentsMethods.map((payment) => (
                            <li
                                key={payment._id}
                                onClick={() => handlePaymentClick(payment._id)}
                            >
                                {payment.customer_payment_description}
                            </li>
                        ))
                    ) : (
                        <li>No se encontraron Formas de Cobro.</li>
                    )}

                </ul>
            </div>
        </div>
    );
}

export default CustomerPaymentList;