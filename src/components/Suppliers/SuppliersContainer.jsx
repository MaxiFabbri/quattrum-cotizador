import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SuppliersContainer.css";
import Supplier from "./Supplier.jsx";
import TextButton from "../Utils/TextButton.jsx";
import { apiClient } from "../../config/axiosConfig.js";
import { Link } from "react-router-dom";

const SupplierContainer = () => {
    const navigate = useNavigate(); // Hook para la navegación
    const [page, setPage] = useState(1);
    const [suppliers, setSuppliers] = useState([]); // Estado para las cotizaciones
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [error, setError] = useState(null);
    const [updated, setUpdated] = useState(true);

    useEffect(() => {
        // Función para realizar la solicitud GET
        const fetchSuppliers = async () => {
            try {
                const response = await apiClient.get(`/suppliers/paginated?page=${page}&limit=50&filter=${filter}`);
                setSuppliers(response.data.response); // Asigna el array de la respuesta
            } catch (error) {
                setError("Error al cargar los proveedores");
                console.error(error);
            } finally {
                setLoading(false);
                setUpdated(true);
            }
        };
        fetchSuppliers();
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
        if (window.confirm("¿Estás seguro de que deseas eliminar este Proveedor?")) {
            setUpdated(false);
            try {
                ;
                await apiClient.delete(`/suppliers/${id}`);
                setLoading(true)
            } catch (error) {
                console.error("Error al eliminar el Proveedor:", error);
            }
        }
    };

    // Funcion para filtrar clientes
    const handleFilterChange = async (e) => {
        const { value } = e.target;
        setUpdated(false);
        setFilter(value);
        setPage(1);
    }
    // Función para crear un nuevo cliente
    const handleCreateSupplier = () => {
        console.log("Crear nuevo proveedor");
        navigate("/suppliers/edit/new");
    }

    // Renderizado condicional
    if (loading) return <p>Cargando proveedores...</p>;
    if (error) return <p>{error}</p>;
    return (
        <>
            <div className="suppliers-header">
                <input
                    className="suppliers-search"
                    type="text"
                    name="filter"
                    value={filter}
                    placeholder="Buscar proveedor"
                    onInput={handleFilterChange}
                />
                <h2>Proveedores</h2>
                <TextButton
                    text="Nuevo Proveedor"
                    onClick={handleCreateSupplier} />
            </div>
            {suppliers.docs.length > 0 ? (
                <table className="suppliers-table">
                    <thead className="suppliers-table-header">
                        <tr>
                            <th></th>
                            <th>Proveedor</th>
                            <th>Codigo</th>
                            <th>CUIT</th>
                            <th>E-mail</th>
                            <th>Forma de Pago</th>
                        </tr>
                    </thead>
                    <tbody className="suppliers-table-body">
                        {suppliers.docs.map((supplier) => (
                            <Supplier
                                key={supplier._id}
                                supplier={supplier}
                                onDelete={handleDelete} // Pasa la función al componente hijo
                            />
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No se encontraron proveedores.</p>
            )}
            <div className="footer">
                {suppliers.hasPrevPage ? (
                <TextButton 
                    text="Pagina Anterior" 
                    onClick={handlePreviousPage} 
                    />
                ) :(
                    <br />
                )}
                <h5>
                    pagina {suppliers.page} de {suppliers.totalPages}
                </h5>
                {suppliers.hasNextPage ? (
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

export default SupplierContainer;