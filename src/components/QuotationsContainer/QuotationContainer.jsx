import { useState, useEffect, useContext } from "react";
import "./QuotationsContainer.css";
import { QuotationContext } from "../../context/QuotationContext.jsx";
import { apiClient } from "../../config/axiosConfig.js";
import { Link } from "react-router-dom";
import TextButton from "../Utils/TextButton.jsx";
import IconButton from "../Utils/IconButton.jsx";
import Quotation from "../Quotation/Quotation.jsx";
import StatusFilterSelect from "../NewQuotation/InputComponents/StatusFilterSelect.jsx";

const Quotations = () => {
    const [quotations, setQuotations] = useState([]); // Estado para las cotizaciones
    const [page, setPage] = useState(1); // Estado para la página actual
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState(false);
    const { statusFilter, setStatusFilter, filter, setFilter } = useContext(QuotationContext);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchQuotations();
            setLoading(false);
        };
        loadData();
    }, [page, search]);

    // Función para realizar la solicitud GET
    const fetchQuotations = async () => {
        try {
            const response = await apiClient.get(`/quotations/paginated-new?page=${page}&name=${filter}&status=${statusFilter}&limit=10`);
            setQuotations(response.data.response);
        } catch (error) {
            setError("Error al cargar las cotizaciones");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    // Función para eliminar una cotización
    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta cotización?")) {
            setLoading(true);
            try {
                await apiClient.delete(`/quotations/${id}`);
                await fetchQuotations(); // ← recarga los datos actualizados
            } catch (error) {
                console.error("Error al eliminar la cotización:", error);
                setError("Error al eliminar la cotización");
            } finally {
                setLoading(false);
            }
        }
    };
    const handleFilterChange = (e) => {
        const { value } = e.target;
        setFilter(value);
        setPage(1);
    }
    const handleStatusFilterChange = (e) => {
        const { value } = e.target;
        setLoading(true);
        setStatusFilter(value);
        setPage(1);
    };

    // Función para manejar la navegación a la página anterior
    const handlePreviousPage = () => {
        setPage(prev => prev - 1)
        setLoading(true);
    }
    const handleNextPage = () => {
        setPage(prev => prev + 1)
        setLoading(true);
    }

    return (
        <>
            <div className="quotations-header">
                <input
                    className="quotations-search"
                    type="text"
                    name="filter"
                    value={filter}
                    placeholder="Buscar cotización por cliente"
                    onInput={handleFilterChange}
                />
                <IconButton
                    icon="/search.png"
                    onClick={() => {
                        setSearch(!search);
                    }}
                />
                <h3>Lista de Cotizaciones</h3>
                <Link to="/new-quotation">
                    <TextButton text="Nueva Cotización" />
                </Link>
                <StatusFilterSelect value={statusFilter} onChange={handleStatusFilterChange} />
            </div>
            <table className="quotations-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Moneda</th>
                        <th>Kit/Set</th>
                        <th>Cantidad</th>
                        <th>Producto</th>
                        <th>Precio Unitario</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody className="quotations-container-body">
                    {loading ? (
                        <tr>
                            <td colSpan="9">Cargando cotizaciones...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="9">{error}</td>
                        </tr>
                    ) : quotations.docs.length > 0 ? (
                        quotations.docs.map((quote) => (
                            <Quotation
                                key={quote._id}
                                quote={quote}
                                onDelete={handleDelete}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9">No se encontraron cotizaciones.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="footer">
                {quotations.hasPrevPage ? (
                    <TextButton
                        text="Pagina Anterior"
                        onClick={handlePreviousPage}
                    />
                ) : (
                    <br />
                )}
                <h5>
                    pagina {quotations.page} de {quotations.totalPages}
                </h5>
                {quotations.hasNextPage ? (
                    <TextButton
                        text="Pagina siguiente"
                        onClick={handleNextPage}
                    />
                ) : (
                    <br />
                )}
            </div>
        </>
    );
};

export default Quotations;

