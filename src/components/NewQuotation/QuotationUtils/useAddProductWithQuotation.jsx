import { useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { QuotationContext } from "../../../context/QuotationContext.jsx";

export const useAddProductWithQuotation = (quotationId) => {
    const { addProduct } = useContext(QuotationContext);
    const [tempId] = useState(uuidv4()); // No necesitás actualizar tempId dinámicamente

    useEffect(() => {
        const prodData = {
            productId: tempId,
            quotationId,
            quantity: 1,
            productionDays: 15,
            financingCost: 0,
            tempfinancingCost: 0,
            shipmentCost: 0,
            enteredShipmentCost: 0,
            tempshipmentCost: 0,
            otherCost: 0,
            enteredOtherCost: 0,
            tempotherCost: 0,
            unitSellingPrice: 0,
            productDescription: "",
            processes: [],
            savedToDb: false,
        };

        if (quotationId) {
            addProduct(prodData);
        }
    }, [quotationId]);
};