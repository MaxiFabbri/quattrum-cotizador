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
        daysToPayment: 0,
        unitCost: 0,
        tempunitCost: 0,
        fixedCost: 0,
        tempfixedCost: 0,
        subTotalProcessCost: 0,
        savedToDb: false,
    });

    useEffect(() => {
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
            icon="/create.png"
            tooltip="Agregar Proceso"
            onClick={handleAddNewProcess}
        />
    );
}

export default ButtonAddProcess;