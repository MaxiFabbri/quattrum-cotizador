import { useState, useEffect, useContext, use } from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "../Utils/IconButton.jsx";
import TextButton from "../Utils/TextButton.jsx";
import { apiClient } from "../../config/axiosConfig";
// import SupplierPaymentDetail from "./SupplierPaymentDetail";
import "./PaymentMethods.css"

const SupplierPaymentList = () => {
    const navigate = useNavigate();
    const [supplierPaymentsMethods, setSupplierPaymentsMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSupplierPaymentMethods();
    }, [loading]);

    // Función para realizar la solicitud GET
    const fetchSupplierPaymentMethods = async () => {
        try {
            const response = await apiClient.get('/supplier-payment-methods');
            setSupplierPaymentsMethods(response.data.response);
        } catch (error) {
            setError("Error al cargar las Formas de pago");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentClick = (id) => {
        navigate(`/Suppliers-payments/${id}`);
    };

    const handleDeletePayment = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta forma de pago?")) {
            setLoading(true)
            try {
                await apiClient.delete(`/supplier-payment-methods/${id}`);
            } catch (error) {
                console.error("Error al eliminar la forma de pago:", error);
            }
        }
    };

    return (
        <div>
            <div className="payment-container">
                <div></div>
                <h2>Formas de Pago a proveedores</h2>
                <TextButton
                    text="Nueva Forma de Pago"
                    onClick={() => navigate("/suppliers-payments/new")}
                />
            </div>
            
            <table className="payment-table">
                <tbody>
                    {loading ? (
                        <tr>
                            <td>Cargando Formas de Pago...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td>{error}</td>
                        </tr>
                    ) : supplierPaymentsMethods.length > 0 ? (
                        supplierPaymentsMethods.map((payment) => (
                            <tr key={payment._id} className="payment-element" >
                                <td>
                                    <IconButton
                                        icon="/delete.png"
                                        title="Eliminar Item"
                                        onClick={() => handleDeletePayment(payment._id)}
                                    />
                                </td>
                                <td onClick={() => handlePaymentClick(payment._id)} style={{ cursor: 'pointer' }}>    
                                    {payment.supplier_payment_description}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td>No se encontraron Formas de Pago.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default SupplierPaymentList;