import { useState, useEffect, useContext, use } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../config/axiosConfig";

const CustomerPaymentDetail = () => {
    const { id } = useParams()

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [payment, setPayment] = useState(null);
    const [paymentItems, setPaymentItems] = useState([]);
    const [paymentDescription, setPaymentDescription] = useState('');

    useEffect(() => {
        fetchPayment(id);
    }, [loading]);

    const fetchPayment = async (id) => {
        try {
            const response = await apiClient.get(`/customer-payment-methods/${id}`);
            console.log("Fetch Payment: ", response.data.response)
            setPayment(response.data.response);
        } catch (error) {
            setError("Error al cargar las cotizaciones");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading ? (
                <h3>Cargando Formas de Cobro...</h3>
            ) : error ? (
                <h3>{error}</h3>
            ) : payment ? (
                <>
                    <div className="payment-header">
                        <h3>Forma de Cobro:</h3>
                        <h3>{payment.customer_payment_description}</h3>
                    </div>
                    <div>
                        <p>Detalles de pago: {id}</p>
                    </div>
                </>
            ) : (
                <h3>No se encontraron Formas de Cobro.</h3>
            )}
        </>
    );
}

export default CustomerPaymentDetail;