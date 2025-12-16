import { useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { QuotationContext } from "../../../context/QuotationContext.jsx";

import IconButton from "../../Utils/IconButton.jsx";
import TextButton from "../../Utils/TextButton";

const ButtonAddProcess = ( {productId} ) => {
    const { quotationData, addProcessToProduct } = useContext(QuotationContext);
    const [tempId, setTempId] = useState(uuidv4());

    const [processData, setProcessData] = useState({
        processId: tempId,
        productId: productId,
        description: "",
        supplierId: "",
        supplierName: "",
        supplierPaymentMethodId: "",
        supplierPaymentMethodName: "",
        supplierPaymentDetails: [],
        daysToPayment: 0,
        currency: quotationData.currency || "Peso",
        enteredUnitCost: 0,
        unitCost: 0,
        tempunitCost: 0,
        adjustPercentage: 0,
        enteredFixedCost: 0,
        fixedCost: 0,
        tempfixedCost: 0,
        subTotalProcessCost: 0,
        savedToDb: false,
    });

    useEffect(() => {
        // console.log("QuotationData changed in add process: ", quotationData);
        setTempId(uuidv4());
        setProcessData((prevData) => ({
            ...prevData,
            processId: tempId,
        }));
    }, [quotationData]);

    const handleAddNewProcess = () => {
        addProcessToProduct(processData);
    };

    return (
        <IconButton
            icon="/images/create.png"
            tooltip="Agregar Proceso"
            onClick={handleAddNewProcess}
        />
    );
}

export default ButtonAddProcess;