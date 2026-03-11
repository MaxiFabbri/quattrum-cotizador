import { useState, useEffect } from "react";
import IconButton from "../Utils/IconButton.jsx";
import { useNavigate } from "react-router-dom";

const Customer = ({ customer, onDelete }) => {
    const navigate = useNavigate(); // Hook para la navegación

    // Manejo de clic en la fila
    const handleRowClick = () => {
        console.log("Row Clicked: ",customer._id);
        navigate(`/customers/edit/${customer._id}`);
    };

    return (
        <tr id={customer._id} onClick={handleRowClick} style={{ cursor: "pointer" }}>
            <td>
                <IconButton
                    icon="/images/delete.png"
                    text="Eliminar"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(customer._id);
                    }}
                />
            </td>
            <td>{customer.name}</td>
            <td>{customer.code}</td>
            <td>{customer.cuit}</td>
            <td>{customer.email}</td>
            <td>{customer.customerPaymentMethodId?.customer_payment_description}</td>
        </tr>
    );
};

export default Customer;