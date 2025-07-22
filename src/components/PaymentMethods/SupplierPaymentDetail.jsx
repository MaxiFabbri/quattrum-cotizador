import { useState, useEffect, } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../config/axiosConfig";
import PaymentItem from "./PaymentItem";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "react-toastify";
import TextButton from "../Utils/TextButton.jsx";

const supplierPaymentDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPercentage, setTotalPercentage] = useState(0);

    const [payment, setPayment] = useState(null);
    const [paymentItems, setPaymentItems] = useState([]);
    const [paymentDescription, setPaymentDescription] = useState('');

    useEffect(() => {
        if(id==="new") {
            setPayment({
                supplier_payment_description: '',
                supplier_payment_details: []
            });
            setLoading(false);
        } else {
            fetchPayment(id);
        }
    }, [loading]);

    useEffect(() => {
        const newTotalPercentage = paymentItems.reduce((acc, item) => acc + (item.id === id ? parseFloat(newValue) : item.percentage), 0);
        setTotalPercentage(newTotalPercentage);
    }, [paymentItems]);

    const fetchPayment = async (id) => {
        try {
            const response = await apiClient.get(`/supplier-payment-methods/${id}`);
            setTotalPercentage(response.data.response.supplier_payment_details.reduce((acc, item) => acc + item.percentage, 0));
            setPayment(response.data.response);
            setPaymentItems(response.data.response.supplier_payment_details);
            setPaymentDescription(response.data.response.supplier_payment_description);
        } catch (error) {
            setError("Error al cargar las Formas de pago");
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
            supplier_payment_description: paymentDescription,
            supplier_payment_details: paymentItems
        };

        try {
            if (id === "new") {
                const response = await toast.promise(
                    apiClient.post("/supplier-payment-methods", paymentToSave),
                    {
                        pending: "Guardando la forma de pago...",
                        success: "Forma de pago guardada correctamente",
                        error: "Error al guardar la forma de pago",
                    },
                    {
                        autoClose: 800,
                    }
                )
            } else {
                const response = await toast.promise(
                    apiClient.put(`/supplier-payment-methods/${id}`, paymentToSave),
                    {
                        pending: "Actualizando la forma de pago...",
                        success: "Forma de pago actualizada correctamente",
                        error: "Error al actualizar la forma de pago",
                    },
                    {
                        autoClose: 800,
                    }
                );
            }
            
        } catch (error) {
            toast.error("Error al guardar la Forma de pago");
        }
        navigate("/suppliers-payments");
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
                        <input 
                            className="description-input" 
                            name="description" 
                            type="string" 
                            value={paymentDescription} 
                            onChange={(el) => setPaymentDescription(el.target.value)}
                        />
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
                                        text={( id === 'new' ? "Guardar" : "Guardar Cambios" )}
                                        onClick={() => {
                                            if (totalPercentage === 100) {
                                                handleSubmit()
                                            }
                                        }}
                                        disabled={totalPercentage !== 100}
                                    />
                                </td>
                                <td>
                                    <TextButton
                                        text="Cancelar"
                                        onClick={() => navigate("/suppliers-payments")}
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

export default supplierPaymentDetail;