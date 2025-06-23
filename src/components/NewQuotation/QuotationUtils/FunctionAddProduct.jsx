import { useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { QuotationContext } from "../../../context/QuotationContext.jsx";


const FunctionAddProduct = (quotationId) => {
    console.log("FunctionAddProduct: ",quotationId)
    const { quotationData, addProduct } = useContext(QuotationContext);
    const [tempId, setTempId] = useState(uuidv4());

    const [prodData, setProdData] = useState({
        productId: tempId,
        quotationId: quotationId,
        quantity: 1,
        productionDays: 15,
        financingCost: 0,
        tempfinancingCost: 0,
        shipmentCost: 0,
        tempshipmentCost: 0,
        otherCost: 0,
        tempotherCost: 0,
        unitSellingPrice: 0,
        productDescription: "",
        processes: [],
        savedToDb: false,
    });

    setTempId(uuidv4())
    addProduct(prodData)

    return null
}

export default FunctionAddProduct;