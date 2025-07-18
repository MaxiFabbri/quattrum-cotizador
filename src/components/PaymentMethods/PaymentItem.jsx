import { useState, useEffect, useContext, use } from "react";
import { apiClient } from "../../config/axiosConfig";	

import IconButton from "../../Utils/IconButton";

const PaymentItem = () => {

    return (
        <>
            <td>
                <IconButton
                    icon="/delete.png"
                    title="Eliminar Item"
                    onClick={() => console.log("Eliminar Item")}
                />
            </td>
            <td>
                <h4>
                    Porcentaje
                </h4>
            </td>
            <td>
                <h4>
                    Anticipo
                </h4>
            </td>
            <td>
                <h4>
                    Nombre del Método de Pago
                </h4>
            </td>
            <td>
                <h4>
                    Dias
                </h4>
            </td>
        </>
    )
}
export default PaymentItem;
