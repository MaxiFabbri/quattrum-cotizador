import { useState, useEffect, } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../config/axiosConfig";
import PaymentItem from "./PaymentItem";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "react-toastify";
import TextButton from "../Utils/TextButton.jsx";

const CustomerPaymentDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPercentage, setTotalPercentage] = useState(0);

    const [payment, setPayment] = useState(null);
    const [paymentItems, setPaymentItems] = useState([]);
    const [paymentDescription, setPaymentDescription] = useState('');

    useEffect(() => {
        fetchPayment(id);
    }, [loading]);

    useEffect(() => {
        const newTotalPercentage = paymentItems.reduce((acc, item) => acc + (item.id === id ? parseFloat(newValue) : item.percentage), 0);
        setTotalPercentage(newTotalPercentage);
    }, [paymentItems]);

    const fetchPayment = async (id) => {
        try {
            const response = await apiClient.get(`/customer-payment-methods/${id}`);
            setTotalPercentage(response.data.response.customer_payment_details.reduce((acc, item) => acc + item.percentage, 0));
            setPayment(response.data.response);
            setPaymentItems(response.data.response.customer_payment_details);
            setPaymentDescription(response.data.response.customer_payment_description);
        } catch (error) {
            setError("Error al cargar las cotizaciones");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        const value = 100 - totalPercentage;
        console.log("Agregar Item");
        setPaymentItems(prevItems => [
            ...prevItems,
            {
                id: uuidv4(),
                percentage: value,
                description: '',
                days: 0,
                downpayment: false
            }
        ]);
    };

    const handleDelete = (id) => {
        console.log("Eliminar Item ", id);
        setPaymentItems(prevItems => prevItems.filter(item => item.id !== id));
    }

    const handleChange = (el, id) => {
        const { name, value, checked, type } = el.target;
        const newValue = type === "checkbox"
            ? checked
            : type === "number"
                ? Number(value)
                : value;

        setPaymentItems(prevItems => prevItems.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    [name]: newValue,
                };
            }
            return item;
        }))
    }

    const handleSubmit = async () => {
        const paymentToSave = {
            customer_payment_description: paymentDescription,
            customer_payment_details: paymentItems
        };

        try {
            const response = await toast.promise(
                apiClient.put(`/customer-payment-methods/${id}`, paymentToSave),
                {
                    pending: "Guardando la forma de cobro...",
                    success: "Forma de cobro guardada correctamente",
                    error: "Error al guardar la forma de cobro",
                },
                {
                    autoClose: 800,
                }
            );
        } catch (error) {
            toast.error("Error al guardar la cotización");
        }
        navigate("/customers-payments");
    }

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
                        <h3>{paymentDescription}</h3>
                    </div>
                    <table className="payment-table">
                        <thead>
                            <tr>
                                <th> </th>
                                <th>Porcentaje</th>
                                <th>Descripción</th>
                                <th>Días</th>
                                <th>Es Anticipo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentItems.length > 0 ? (
                                paymentItems.map((item) => (
                                    <PaymentItem
                                        key={item.id}
                                        item={item}
                                        handleDelete={handleDelete}
                                        handleChange={(e) => handleChange(e, item.id)}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center' }}>
                                        <h3>No hay detalles de pago.</h3>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td>
                                </td>
                                <td>
                                    <h3 style={{ color: totalPercentage !== 100 ? 'red' : 'black' }}>
                                        {totalPercentage} %
                                    </h3>
                                </td>
                                <td>
                                    <TextButton
                                        text="Agregar Item"
                                        onClick={handleAddItem}
                                    />
                                </td>
                                <td>
                                    <TextButton
                                        text="Guardar Cambios"
                                        onClick={() => {
                                            if (totalPercentage === 100) {
                                                console.log("Guardar Cambios");
                                                handleSubmit()
                                            }
                                        }}
                                        disabled={totalPercentage !== 100}
                                    />
                                </td>
                                <td>
                                    <TextButton
                                        text="Volver"
                                        onClick={() => navigate("/customers-payments")}
                                    />
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </>
            ) : (
                <h3>No se encontraron Formas de Cobro.</h3>
            )}
        </>
    );
}

export default CustomerPaymentDetail;