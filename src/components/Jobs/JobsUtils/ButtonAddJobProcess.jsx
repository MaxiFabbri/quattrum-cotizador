import { useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { JobContext } from "../../../context/JobContext.jsx";

import IconButton from "../../Utils/IconButton.jsx";
import TextButton from "../../Utils/TextButton.jsx";

const ButtonAddJobProcess = ( {jobProductId} ) => {
    const { jobData, addJobProcessToProduct } = useContext(JobContext);
    const [tempId, setTempId] = useState(uuidv4());

    const [jobProcessData, setJobProcessData] = useState({
        jobProcId: tempId,
        jobProductId: jobProductId,
        description: "",
        supplierId: "",
        supplierName: "",
        supplierPaymentMethodId: "",
        supplierPaymentMethodName: "",
        supplierPaymentDetails: [],
        currency: jobData.currency || "Peso",
        unitCost: 0,
        enteredUnitCost: 0,
        fixedCost: 0,
        enteredFixedCost: 0,
        adjustPercentage: 0,
        subTotalProcessCost: 0,
        jobProcessNote: "",
        jobProcessStatus: "Pendiente",
        tempunitCost: 0,
        tempfixedCost: 0,
        savedToDb: false,
    });

    useEffect(() => {
        setTempId(uuidv4());
        setJobProcessData((prevData) => ({
            ...prevData,
            jobProcId: tempId,
        }));
    }, [jobData]);

    const handleAddJobProcess = () => {
        addJobProcessToProduct(jobProcessData);
    };

    return (
        <IconButton
            icon="/images/create.png"
            tooltip="Agregar Proceso"
            onClick={handleAddJobProcess}
        />
    );
}

export default ButtonAddJobProcess;