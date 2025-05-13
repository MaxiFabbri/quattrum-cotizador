import { useState, useEffect } from "react";
import "./CustomersContainer.css";
import Customer from "./Customer.jsx";

import { apiClient } from "../../config/axiosConfig.js";
import { Link } from "react-router-dom";

const CustomerContainer = () => {
    console.log("CustomerContainer");
    const [customers, setCustomers] = useState([]); // Estado para las cotizaciones
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updated, setUpdated] = useState(true);

    useEffect(() => {
        // Función para realizar la solicitud GET
        const fetchCustomers = async () => {
            setUpdated(true);
            try {
                const response = await apiClient.get("/customers/populated/");
                setCustomers(response.data.response); // Asigna el array de la respuesta
                console.log("Customers: ", response.data.response);
            } catch (error) {
                setError("Error al cargar los clientes");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, [updated, loading]);


    // Función para eliminar una cotización
    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta cotización?")) {
            setUpdated(false);
            try {
                // await apiClient.delete(`/quotations/${id}`);
                setLoading(true)
            } catch (error) {
                console.error("Error al eliminar la cotización:", error);
            }
        }
    };

    // Renderizado condicional
    if (loading) return <p>Cargando clientes...</p>;
    if (error) return <p>{error}</p>;
    return (
        <div>
            {customers.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Cliente</th>
                            <th>Codigo</th>
                            <th>CUIT</th>
                            <th>E-mail</th>
                            <th>Forma de Pago</th>
                        </tr>
                    </thead>

                    <tbody>
                        {customers.map((customer) => (
                            <Customer
                                key={customer._id}
                                customer={customer}
                                onDelete={handleDelete} // Pasa la función al componente hijo
                            />
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No se encontraron clientes.</p>
            )}
        </div>
    )
}

export default CustomerContainer;