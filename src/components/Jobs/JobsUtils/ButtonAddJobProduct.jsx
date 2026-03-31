import { useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { JobContext } from "../../../context/JobContext.jsx";

import TextButton from "../../Utils/TextButton.jsx";

const ButtonAddJobProduct = () => {
    const { jobData, addJobProduct } = useContext(JobContext);
    const [tempId, setTempId] = useState(uuidv4());

    const initialJobProdDataState = {
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
        calculatedSellingPrice: 0,        
        isManual: false,
        jobProductDescription: "",
        totalProductCost: 0,
        order: jobData.jobProducts.length + 1,
        jobProductNote: "",
        jobProductStatus: "En Preparación",
        processes: [],
        savedToDb: false,
    }

    const [jobProdData, setJobProdData] = useState(initialJobProdDataState)

    const handleAddJobProduct = () => {
        const newJobProduct = {
            jobProductId: uuidv4(),
            jobId: jobData.jobId,
            ...initialJobProdDataState,
        }
        console.log("Adding job product:", newJobProduct);
        setJobProdData(newJobProduct)
        addJobProduct(newJobProduct);
    };

    return (
        <TextButton
            text="Agregar Producto"
            onClick={handleAddJobProduct}
        />
    );
}

export default ButtonAddJobProduct;