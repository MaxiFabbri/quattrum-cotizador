import { useState, useEffect, useContext } from "react";
import IconButton from "../Utils/IconButton.jsx";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../config/axiosConfig.js";
import { JobContext } from "../../context/JobContext.jsx";

const OneJob = ({ job, onDelete }) => {
    const navigate = useNavigate();

    // Manejo de clic en la fila
    const handleRowClick = () => {
        navigate(`/production/detailed-job/${job._id}`);
    };

    // Formatear la fecha
    const formatDate = (utcDate) => {
        const date = new Date(utcDate);
        const year = date.getFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Asegura 2 dígitos
        const day = String(date.getUTCDate()).padStart(2, "0"); // Asegura 2 dígitos
        return `${day}-${month}-${year}`;
    };

    return (
        <tr id={job._id} onClick={handleRowClick} style={{ cursor: "pointer" }}>
            <td>
                <IconButton
                    icon="/delete.png"
                    text="Eliminar"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(job._id);
                    }}
                />
            </td>
            <td>{formatDate(job.approvalDate)}</td>
            <td>{job.customer.name}</td>
            <td>{job.currency}</td>
            <td>{job.isKit ? "Sí" : "No"}</td>
            <td colSpan="3" style={{ padding: "0px" }}>
                <table className="products-table">
                    <tbody>
                        {job.jobProducts.map((product) => (
                            <tr key={product._id}>
                                <td style={{ textAlign: "right", paddingRight: "2%" }}>{product.quantity}</td>
                                <td>{product.jobProductDescription || "Prod"}</td>
                                <td style={{ textAlign: "right", paddingRight: "2%" }}>$ {(product.unitSellingPrice * job.exchangeRate).toFixed(0)}.00 </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </td>
            <td>{job.jobStatus}</td>
        </tr>
    );
};

export default OneJob;