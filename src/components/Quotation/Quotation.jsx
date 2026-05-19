import { useState, useEffect, useContext } from "react";
import IconButton from "../Utils/IconButton.jsx";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../config/axiosConfig.js";
import { QuotationContext } from "../../context/QuotationContext.jsx";
import "./Quotation.css";

const Quotation = ({ quote, onDelete }) => {
    const navigate = useNavigate();
    const { setIsSaved } = useContext(QuotationContext);

    // Manejo de clic en la fila
    const handleRowClick = () => {
        setIsSaved(true);
        navigate(`/detailed-quotation/${quote._id}`);
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
        <tr id={quote._id} onClick={handleRowClick} style={{ cursor: "pointer" }}>
            <td>
                <IconButton
                    icon="/images/delete.png"
                    text="Eliminar"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(quote._id);
                    }}
                />
            </td>
            <td>{formatDate(quote.date)}</td>
            <td>
                {quote.customer.name}
                {quote.customerNote && quote.customerNote.trim() !== ""
                    ? ` - ${quote.customerNote}`
                    : ""}
            </td>
            <td>{quote.currency}</td>
            <td>{quote.isKit ? "Sí" : "No"}</td>
            <td colSpan="3" style={{ padding: "0px" }}>
                <table className="products-table">
                    <tbody>
                        {quote.products.map((product) => (
                            <tr key={product._id}>
                                <td style={{ textAlign: "right", paddingRight: "2%" }}>{product.quantity}</td>
                                <td>{product.productDescription || "Prod"}</td>
                                <td style={{ textAlign: "right", paddingRight: "2%" }}>$ {(product.unitSellingPrice * quote.exchangeRate).toFixed(0)}.00 </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </td>
            <td>{quote.quoteStatus}</td>
        </tr>
    );
};

export default Quotation;