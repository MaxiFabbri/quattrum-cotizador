import { useState, useEffect, useContext, use } from "react";
import { QuotationContext } from "../../../context/QuotationContext.jsx";
import { JobContext } from "../../../context/JobContext.jsx";
import SelectSupplier from "../../Utils/Selectors/SelectSupplier.jsx";
import SelectSupplierPayMethod from "../../Utils/Selectors/SelectSupplierPaymentMethod.jsx";
import { apiClient } from "../../../config/axiosConfig.js";
import CurrencySelect from "../../NewQuotation/InputComponents/CurrencySelect.jsx";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import IconButton from "../../Utils/IconButton.jsx";

const NewJobProcess = ({ initialProcessData }) => {
    const { updateProcessInProduct, removeProcessInProduct, quotationData, setIsSaved } = useContext(QuotationContext);
    const { jobData, updateJobProcessInProduct, removeJobProcessInProduct } = useContext(JobContext);

    const [jobProcessData, setJobProcessData] = useState(initialProcessData);
    const [newTempUnitCost, setNewTempUnitCost] = useState(jobProcessData.enteredUnitCost) || 0;
    const [newTempFixedCost, setNewTempFixedCost] = useState(jobProcessData.enteredFixedCost) || 0;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({
        id: `${initialProcessData.jobProductId}#${initialProcessData.jobProcId}`
    })

    useEffect(() => {
        updateJobProcessData();
    }, [jobData]);

    // Actualiza el objeto jobProcessData con la informacion que está en el Contexto,
    const updateJobProcessData = () => {
        const jobProduct = jobData.jobProducts.find(
            (jobProduct) => jobProduct.jobProductId === jobProcessData.jobProductId
        );
        if (jobProduct) {
            const jobProcess = jobProduct.processes.find(
                (process) => process.jobProcId === jobProcessData.jobProcId
            );
            if (jobProcess) {
                if (JSON.stringify(jobProcessData) !== JSON.stringify(jobProcess)) {
                    setJobProcessData(jobProcess);
                }
            }
        }
    };

    // Estado para manejo de debouncing
    const [debouncedProcessData, setDebouncedProcessData] = useState(jobProcessData);
    // Actualizar el estado global al cambiar `debouncedProdData`
    useEffect(() => {
        updateJobProcessInProduct(debouncedProcessData, debouncedProcessData.jobProcId);
    }, [debouncedProcessData]);

    // Debounce: Actualizar `debouncedProdData` después de un retraso
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedProcessData(jobProcessData);
        }, 1000);
        return () => {
            clearTimeout(handler); // Limpiar el temporizador previo
        };
    }, [jobProcessData]);

    useEffect(() => {
        let exchange = 1;
        if (jobProcessData.currency === "Peso") {
            exchange = jobData.exchangeRate;
        }
        // console.log("recalculating costs for jobProcessData: ", quotationData.exchangeRate, " - ", exchange)
        setJobProcessData((prevData) => ({
            ...prevData,
            enteredUnitCost: newTempUnitCost,
            unitCost: newTempUnitCost / exchange,
            tempunitCost: newTempUnitCost,
            enteredFixedCost: newTempFixedCost,
            fixedCost: newTempFixedCost / exchange,
            tempfixedCost: newTempFixedCost,
        }))
    }, [newTempFixedCost, newTempUnitCost]);

    const getPaymentMethodData = async (paymentId) => {
        try {
            const response = await apiClient.get(`/supplier-payment-methods/${paymentId}`);
            const paymentMethod = response.data.response;
            return paymentMethod;
        } catch (error) {
            console.error("Error fetching customer payment method:", error);
        }
    };
    const handleCurrencyChange = (e) => {
        setIsSaved(false)
        setNewTempFixedCost(0)
        setNewTempUnitCost(0)
        setJobProcessData((prevData) => ({
            ...prevData,
            unitCost: 0,
            tempunitCost: 0,
            fixedCost: 0,
            tempfixedCost: 0,
            currency: e.target.value,
        }))
    }
    // Manejo de cambios en los inputs
    const handleInputChange = (e) => {
        setIsSaved(false)
        const { name, value } = e.target;
        setJobProcessData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    };
    const handleNoteChange = (e) => {
        setIsSaved(false)
        const { value } = e.target;
        setJobProcessData((prevData) => ({
            ...prevData,
            jobProcessNote: value,
        }))
    };
    const handleStatusChange = (e) => {
        setIsSaved(false)
        const { value } = e.target;
        setJobProcessData((prevData) => ({
            ...prevData,
            jobProcessStatus: value,
        }))
    };

    const handleSupplierUpdate = async (supplier) => {
        setIsSaved(false)
        const paymentMethodData = await getPaymentMethodData(supplier.supplierPaymentMethodId);
        const updatedData = {
            ...jobProcessData,
            jobProductId: jobProcessData.jobProductId,
            jobProcId: jobProcessData.jobProcId,
            supplierId: supplier._id || "",
            supplierName: supplier.name || "",
            supplierPaymentMethodId: paymentMethodData._id || "",
            supplierPaymentMethodName: paymentMethodData.supplier_payment_description || "",
            supplierPaymentDetails: paymentMethodData.supplier_payment_details || [],
        }
        setJobProcessData(updatedData);
    }

    const handleSupplierPaymentMethodUpdate = (supplierPaymentMethod) => {
        setIsSaved(false)
        console.log("updating payment method: ", supplierPaymentMethod)
        setJobProcessData((prevData) => ({
            ...prevData,
            supplierPaymentMethodId: supplierPaymentMethod._id || "",
            supplierPaymentMethodName: supplierPaymentMethod.supplier_payment_description || "",
            supplierPaymentDetails: supplierPaymentMethod.supplier_payment_details || [],
        }))

    }

    const handleDeleteProcess = async (e) => {
        console.log("Deleting process: ", jobProcessData.jobProductId, " - ", jobProcessData.jobProcId)
        e.preventDefault();
        removeJobProcessInProduct(jobProcessData.jobProductId, jobProcessData.jobProcId);
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <td>
                <div {...listeners} style={{ cursor: "grab" }} >
                    <img src="/drag-icon.png" style={{ width: "20px", height: "20px" }} alt="Mover" />
                </div>
            </td>
            <td>
                <input
                    type="text"
                    name="description"
                    placeholder="Descripción"
                    defaultValue={jobProcessData.description}
                    onClick={(e) => e.target.select()}
                    onChange={handleInputChange}
                />
            </td>
            <td>
                <SelectSupplier
                    defaultSupplier={jobProcessData.supplierName || ""}
                    onSelectSupplier={handleSupplierUpdate}
                />
            </td>
            <td>
                <SelectSupplierPayMethod
                    defaultSupplierPay={jobProcessData.supplierPaymentMethodName || ""}
                    onSelectSupplierPayMethod={handleSupplierPaymentMethodUpdate}
                />
            </td>
            <CurrencySelect value={jobProcessData.currency} onChange={handleCurrencyChange} />
            <td>
                <span>Unit: </span>
                <input
                    className="job-input-number"
                    type="number"
                    name="newTempUnitCost"
                    placeholder="$ Unit."
                    value={newTempUnitCost}
                    onClick={(e) => e.target.select()}
                    onInput={e => {
                        setIsSaved(false)
                        setNewTempUnitCost(Number(e.target.value))
                    }}
                />
            </td>
            <td>
                <input
                    className="job-input-number"
                    type="number"
                    name="adjustPercentage"
                    placeholder="% Ajuste"
                    defaultValue={jobProcessData.adjustPercentage}
                    onClick={(e) => e.target.select()}
                    onInput={handleInputChange}
                />
                <span> %</span>
            </td>
            <td>
                <span>Fijo: </span>
                <input
                    className="job-input-number"
                    type="number"
                    name="newTempFixedCost"
                    placeholder="Costo Fijo"
                    value={newTempFixedCost}
                    onClick={(e) => e.target.select()}
                    onInput={e => {
                        setIsSaved(false)
                        setNewTempFixedCost(Number(e.target.value))
                    }}
                />
            </td>
            <td>
                <input
                    type="text"
                    name="jobProcessNote"
                    placeholder="Notas del Proceso"
                    defaultValue={jobProcessData.jobProcessNote}
                    onClick={(e) => e.target.select()}
                    onInput={handleNoteChange}
                />
            </td>
            <td>
                <select
                    id="jobProcessStatus"
                    name="jobProcessStatus"
                    value={jobProcessData.jobProcessStatus}
                    onChange={handleStatusChange}
                    required
                >
                    <option value="Aprobado">Aprobado</option>
                    <option value="En Produccion">En Produccion</option>
                    <option value="Terminado">Terminado</option>
                    <option value="Entregado">Entregado</option>
                </select>
            </td>
            <td>
                <IconButton
                    icon="/delete.png"
                    text="Eliminar Producto"
                    onClick={handleDeleteProcess}
                />
            </td>
        </tr>
    )
};

export default NewJobProcess;