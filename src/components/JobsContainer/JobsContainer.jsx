import { useState, useEffect, useContext } from "react";
import "../QuotationsContainer/QuotationsContainer.css";
import { JobContext } from "../../context/JobContext.jsx";
import { apiClient } from "../../config/axiosConfig.js";
import { Link } from "react-router-dom";
import TextButton from "../Utils/TextButton.jsx";
import IconButton from "../Utils/IconButton.jsx";
import OneJob from "../Jobs/OneJob.jsx";
import StatusFilterSelect from "../NewQuotation/InputComponents/StatusFilterSelect.jsx";
import JobStatusFilterSelect from "./JobStatusFilterSelect.jsx";

const JobsContainer = () => {
    const [jobs, setJobs] = useState([]); // Estado para las cotizaciones
    const [jobPage, setJobPage] = useState(1); // Estado para la página actual
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState(false);
    const { jobStatusFilter, setJobStatusFilter, jobFilter, setJobFilter } = useContext(JobContext);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchJobs();
            setLoading(false);
        };
        loadData();
    }, [jobPage, search]);

    // Función para realizar la solicitud GET
    const fetchJobs = async () => {
        try {
            const response = await apiClient.get(`/jobs/paginated?page=${jobPage}&name=${jobFilter}&status=${jobStatusFilter}&limit=20`);
            setJobs(response.data.response);
        } catch (error) {
            setError("Error al cargar las cotizaciones");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    // Función para eliminar una cotización
    const handleDelete = async (id) => {
        console.log("Deleting job with id: ", id);
        if (window.confirm("¿Estás seguro de que deseas eliminar esta cotización?")) {
            setLoading(true);
            try {
                await apiClient.delete(`/jobs/${id}`);
                await fetchJobs(); // ← recarga los datos actualizados
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
        setJobFilter(value);
        setJobPage(1);
    }
    const handleStatusFilterChange = (e) => {
        const { value } = e.target;
        setSearch(!search);
        setJobStatusFilter(value);
        setJobPage(1);
    };

    // Función para manejar la navegación a la página anterior
    const handlePreviousPage = () => {
        setJobPage(prev => prev - 1)
        setLoading(true);
    }
    const handleNextPage = () => {
        setJobPage(prev => prev + 1)
        setLoading(true);
    }

    return (
        <>
            <div className="quotations-header">
                <input
                    className="quotations-search"
                    type="text"
                    name="filter"
                    value={jobFilter}
                    placeholder="Buscar cotización por cliente"
                    onInput={handleFilterChange}
                />
                <IconButton
                    icon="/search.png"
                    onClick={() => {
                        setSearch(!search);
                    }}
                />
                <h3>Lista de Trabajos</h3>
                <JobStatusFilterSelect value={jobStatusFilter} onChange={handleStatusFilterChange} />
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
                            <td colSpan="9">Cargando trabajos...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="9">{error}</td>
                        </tr>
                    ) : jobs.docs.length > 0 ? (
                        jobs.docs.map((job) => (
                            <OneJob
                                key={job._id}
                                job={job}
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
                {jobs.hasPrevPage ? (
                    <TextButton
                        text="Pagina Anterior"
                        onClick={handlePreviousPage}
                    />
                ) : (
                    <br />
                )}
                <h5>
                    pagina {jobs.page} de {jobs.totalPages}
                </h5>
                {jobs.hasNextPage ? (
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

export default JobsContainer;

