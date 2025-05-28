import { useState, useEffect } from "react"
import { useParams } from "react-router-dom";

import "./DetailedCustomer.css";

import TextButton from "../Utils/TextButton.jsx";
import { apiClient } from "../../config/axiosConfig.js";

const DetailedCustomer = () => {
    const [customerData, setCustomerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams()
    console.log("id: ", id);

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const response = await apiClient.get(`/customers/${id}`);
                setCustomerData(response.data.response); // Asigna el objeto de la respuesta
            } catch (error) {
                console.error("Error al cargar el cliente:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomerData();
    }, [id]);

    console.log("Customer Data: ", customerData)
    return (
        <>
            {loading ?
                <p>Cargando...</p> :
                // <DetailedCustomerContent customerData={customerData} />
                <div className="detailedCustomer">
                    <h2>Detalles del cliente</h2>
                    <div className="customerData">
                        <div className="customerInfo">
                            <p>Nombre: {customerData.name}</p>
                            <p>Código: {customerData.code}</p>
                            <p>CUIT: {customerData.cuit}</p>
                        </div>
                        <div className="customerInfo">
                            <p>Email: {customerData.email}</p>
                            <p>Método de pago: {customerData.customerPaymentMethodId?.customer_payment_description}</p>
                        </div>
                        <div className="customerActions">
                            <TextButton text="Editar" onClick={() => console.log("Editar cliente")} />
                            <TextButton text="Eliminar" onClick={() => console.log("Eliminar cliente")} />
                        </div>
                    </div>
                </div>
            }
        </>
    );
}

export default DetailedCustomer;