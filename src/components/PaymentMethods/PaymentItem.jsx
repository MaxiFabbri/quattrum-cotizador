import { useState, useEffect, useContext, use } from "react";
import { apiClient } from "../../config/axiosConfig";	

import IconButton from "../Utils/IconButton.jsx";

const PaymentItem = ({item, handleDelete, handleChange}) => {
    
    return (
        <tr id={item.id} key={item.id}>
            <td>
                <IconButton
                    icon="/images/delete.png"
                    title="Eliminar Item"
                    onClick={() => handleDelete(item.id)}
                />
            </td>
            <td>
                <input name="percentage" type="number" value={item.percentage} onChange={(el) => handleChange(el)}/>
            </td>
            <td>
                <input name="description" type="string" value={item.description} onChange={(el) => handleChange(el)} />
            </td>
            <td>
                <input name="days" type="number" value={item.days} onChange={(el) => handleChange(el)} />
            </td>
            <td>
                <input type="checkbox" name="downpayment" id="downpayment" checked={item.downpayment} onChange={(el) => handleChange(el)} />
            </td>
        </tr>
    )
}
export default PaymentItem;
