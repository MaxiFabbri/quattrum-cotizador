import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomersContainer.css";
import Customer from "./Customer.jsx";
import TextButton from "../Utils/TextButton.jsx";
import { apiClient } from "../../config/axiosConfig.js";
import { Link } from "react-router-dom";

const CustomerContainer = () => {
    const navigate = useNavigate(); // Hook para la navegación
    const [page, setPage] = useState(1); // Estado para la página actual
    const [customers, setCustomers] = useState([]); // Estado para las cotizaciones
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [error, setError] = useState(null);
    const [updated, setUpdated] = useState(true);

    useEffect(() => {
        // Función para realizar la solicitud GET
        const fetchCustomers = async () => {
            try {
                const response = await apiClient.get(`/customers/paginated?page=${page}&limit=50&filter=${filter}`);
                setCustomers(response.data.response); 
            } catch (error) {
                setError("Error al cargar los clientes");
                console.error(error);
            } finally {
                setLoading(false);
                setUpdated(true);
            }
        };
        fetchCustomers();
    }, [updated, loading]);

    // Función para manejar la navegación a la página anterior
    const handlePreviousPage = () => {
        setPage(prev => prev - 1)
        setLoading(true);
    }

    const handleNextPage = () => {
        setPage(prev => prev + 1)
        setLoading(true);
    }

    // Función para eliminar un Cliente
    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este Cliente?")) {
            setUpdated(false);
            try {;
                await apiClient.delete(`/customers/${id}`);
                setLoading(true)
            } catch (error) {
                console.error("Error al eliminar el Cliente:", error);
            }
        }
    };

    // Funcion para filtrar clientes
    const handleFilterChange = async (e) => {
        const {value} = e.target;
        setUpdated(false);
        setFilter(value);
        setPage(1);
    }
    // Función para crear un nuevo cliente
    const handleCreateCustomer = () => {
        console.log("Crear nuevo cliente");
        navigate("/customers/edit/new");
    }

    // Renderizado condicional
    if (loading) return <p>Cargando clientes...</p>;
    if (error) return <p>{error}</p>;
    return (
        <>
            <div className="customers-header">
                <input
                    className="customers-search"
                    type="text"
                    name="filter"
                    value={filter}
                    placeholder="Buscar cliente"
                    onInput={handleFilterChange}
                /> 
                <h2>Clientes</h2>
                <TextButton
                    text="Nuevo Cliente"
                    onClick={handleCreateCustomer} />
            </div>
            {customers.docs.length > 0 ? (
                <table className="customers-table">
                    <thead className="customers-table-header">
                        <tr>
                            <th></th>
                            <th>Cliente</th>
                            <th>Codigo</th>
                            <th>CUIT</th>
                            <th>E-mail</th>
                            <th>Forma de Pago</th>
                        </tr>
                    </thead>
                    <tbody className="customers-table-body">
                        {customers.docs.map((customer) => (
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
            <div className="footer">
                {customers.hasPrevPage ? (
                <TextButton 
                    text="Pagina Anterior" 
                    onClick={handlePreviousPage} 
                    />
                ) :(
                    <br />
                )}
                <h5>
                    pagina {customers.page} de {customers.totalPages}
                </h5>
                {customers.hasNextPage ? (
                <TextButton 
                    text="Pagina siguiente" 
                    onClick={handleNextPage} 
                    />
                ) : (
                    <br />
                )}
            </div>
        </>
    )
}

export default CustomerContainer;