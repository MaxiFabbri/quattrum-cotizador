import { useState, useEffect, useContext, use } from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "../Utils/IconButton.jsx";
import TextButton from "../Utils/TextButton.jsx";
import { apiClient } from "../../config/axiosConfig";
import CustomerPaymentDetail from "./CustomerPaymentDetail";
import "./PaymentMethods.css"

const CustomerPaymentList = () => {
    const navigate = useNavigate();
    const [customerPaymentsMethods, setCustomerPaymentsMethods] = useState([]);
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
            setError("Error al cargar las Formas de cobro");
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
            <div className="payment-container">
                <div></div>
                <h2>Formas de Cobro a Clientes</h2>
                <TextButton
                    text="Nueva Forma de Cobro"
                    onClick={() => navigate("/customers-payments/new")}
                />
            </div>
            
            <table className="payment-table">
                <tbody>
                    {loading ? (
                        <tr>
                            <td>Cargando Formas de Cobro...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td>{error}</td>
                        </tr>
                    ) : customerPaymentsMethods.length > 0 ? (
                        customerPaymentsMethods.map((payment) => (
                            <tr key={payment._id} className="payment-element" >
                                <td>
                                    <IconButton
                                        icon="/images/delete.png"
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
                        <tr>
                            <td>No se encontraron Formas de Cobro.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default CustomerPaymentList;