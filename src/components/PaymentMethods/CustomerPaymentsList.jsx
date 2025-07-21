import { useState, useEffect, useContext, use } from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "../Utils/IconButton.jsx";
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

    const handleDeletePayment = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta forma de cobro?")) {
            setLoading(true)
            try {
                await apiClient.delete(`/customer-payment-methods/${id}`);
            } catch (error) {
                console.error("Error al eliminar la forma de cobro:", error);
            }
        }
    };

    return (
        <div>
            <h2>Formas de Cobro a Clientes</h2>
            <table className="payment-table">
                <tbody>
                    {loading ? (
                        <td>Cargando Formas de Cobro...</td>
                    ) : error ? (
                        <td>{error}</td>
                    ) : customerPaymentsMethods.length > 0 ? (
                        customerPaymentsMethods.map((payment) => (
                            <tr key={payment._id} className="payment-element" >
                                <td>
                                    <IconButton
                                        icon="/delete.png"
                                        title="Eliminar Item"
                                        onClick={() => handleDeletePayment(payment._id)}
                                    />
                                </td>
                                <td onClick={() => handlePaymentClick(payment._id)} style={{ cursor: 'pointer' }}>    
                                    {payment.customer_payment_description}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <td>No se encontraron Formas de Cobro.</td>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default CustomerPaymentList;