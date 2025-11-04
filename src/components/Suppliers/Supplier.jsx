import { useState, useEffect } from "react";
import IconButton from "../Utils/IconButton.jsx";
import { useNavigate } from "react-router-dom";
// import "./Supplier.css"; 

const Supplier = ({ supplier, onDelete }) => {
    const navigate = useNavigate(); // Hook para la navegación

    // Manejo de clic en la fila
    const handleRowClick = () => {
        navigate(`/suppliers/edit/${supplier._id}`);
    };

    return (
        <tr id={supplier._id} onClick={handleRowClick} style={{ cursor: "pointer" }}>
            <td>
                <IconButton
                    icon="/delete.png"
                    text="Eliminar"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(supplier._id);
                    }}
                />
            </td>
            <td>{supplier.name}</td>
            <td>{supplier.code}</td>
            <td>{supplier.cuit}</td>
            <td>{supplier.email}</td>
            <td>{supplier.supplierPaymentMethodId?.supplier_payment_description}</td>
        </tr>
    );
};

export default Supplier;