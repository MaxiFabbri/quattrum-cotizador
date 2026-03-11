import { useState, useEffect, useContext } from "react";
import IconButton from "../Utils/IconButton.jsx";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../config/axiosConfig.js";
import { JobContext } from "../../context/JobContext.jsx";
import "./OneJob.css";
import { getInvoiceRowClass, getProcessRowClass } from "./JobsUtils/JobClassValidations.js";

const OneJob = ({ job, onDelete }) => {
    const navigate = useNavigate();

    // Manejo de clic en la fila
    const handleRowClick = () => {
        navigate(`/production/detailed-job/${job._id}`);
    };

    // Formatear la fecha
    const formatDate = (utcDate) => {
        if (!utcDate) return " Pendiente ";
        const date = new Date(utcDate);
        const year = date.getFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Asegura 2 dígitos
        const day = String(date.getUTCDate()).padStart(2, "0"); // Asegura 2 dígitos
        return `${day}-${month}-${year}`;
    };

    // Determinar la clase para la fecha
    const getDateClass = () => {;
        if (job.isDateCritical) return "row-pending";
        if (!job.deliveryDate) return "row-wip";
        return "row-default";
    }
    const dateClass = getDateClass();

    return (<tr id={job._id} onClick={handleRowClick} className="onejob-row" style={{ cursor: "pointer" }}>
        <td className={dateClass}>{formatDate(job.deliveryDate)}</td>
        <td>{job.customer.name}</td>
        <td>{job.jobStatus}</td>
        <td>
            <table className="onejob-invoices-table">
                <tbody>
                    {job.invoices.map((invoice, index) => (
                        <tr key={index} className={getInvoiceRowClass(invoice)}>
                            <td>{invoice.invoiceType}</td>
                            <td>{invoice.invoiceNumber}</td>
                            <td>
                                <ul>
                                    {invoice.collections.map((collection, index) => (
                                        <li key={index}>
                                            {collection.collectionType} -
                                            {formatDate(collection.collectionDate)
                                            }
                                        </li>
                                    ))}
                                </ul>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </td>
        <td colSpan="2" style={{ padding: "0px" }}>
            <table className="onejob-products-table">
                <tbody>
                    {job.jobProducts.map((product) => (
                        <tr key={product._id} className="onejob-products-table-row">
                            <td style={{ textAlign: "right" }}>{product.quantity} - </td>
                            <td>{product.jobProductDescription || "Prod"}</td>
                            <td style={{ textAlign: "right", paddingRight: "5%" }}>$ {(product.unitSellingPrice * job.exchangeRate).toFixed(0)}.00 </td>
                            <td>
                                <table className="onejob-process-table">
                                    <tbody>
                                        {job.jobProcesses
                                        .filter(process => process.jobProductId === product._id)
                                        .map((process) => (
                                            <tr key={process._id}>
                                                <td className="process-supplier-name">{process.supplierName}</td>
                                                <td>
                                                    <table className="onejob-process-invoice-table">
                                                        <tbody>
                                                            {process.invoices.map((invoice, index) => (
                                                                <tr key={index} className={getProcessRowClass(invoice)}>
                                                                    <td>{invoice.invoiceType}</td>
                                                                    <td>{invoice.invoiceNumber}</td>
                                                                    <td>
                                                                        <ul>
                                                                            {invoice.payments.map((payment, index) => (
                                                                                <li key={index}>
                                                                                    {payment.paymentType} -
                                                                                    {formatDate(payment.paymentDate)}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </td>
    </tr>
    );
};

export default OneJob;