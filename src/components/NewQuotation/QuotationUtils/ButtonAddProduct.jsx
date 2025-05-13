import { useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { QuotationContext } from "../../../context/QuotationContext.jsx";


import TextButton from "../../Utils/TextButton";

const ButtonAddProduct = () => {
    const { quotationData, addProduct } = useContext(QuotationContext);
    const [tempId, setTempId] = useState(uuidv4());

    const [prodData, setProdData] = useState({
        productId: tempId,
        quotationId: quotationData.id,
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

    useEffect(() => {
        setTempId(uuidv4());
    }, [prodData]);

    useEffect(() => {
        setProdData((prevData) => ({
            ...prevData,
            productId: tempId,
        }));
    }, [quotationData]);

    const handleAddProduct = () => {
        addProduct(prodData);
    };

    return (
        <TextButton
            text="Agregar Producto"
            onClick={handleAddProduct}
        />
    );
}

export default ButtonAddProduct;