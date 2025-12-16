import { useState, useEffect, useContext, use } from "react";
import { QuotationContext } from "../../../context/QuotationContext";
import SelectSupplier from "../../Utils/Selectors/SelectSupplier.jsx";
import SelectSupplierPayMethod from "../../Utils/Selectors/SelectSupplierPaymentMethod.jsx";
import { apiClient } from "../../../config/axiosConfig";
import CurrencySelect from "../InputComponents/CurrencySelect.jsx";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import IconButton from "../../Utils/IconButton";

const NewProcess = ({ initialProcessData }) => {
    const { updateProcessInProduct, removeProcessInProduct, quotationData, setIsSaved } = useContext(QuotationContext);

    const [processData, setProcessData] = useState(initialProcessData);
    const [newTempUnitCost, setNewTempUnitCost] = useState(processData.enteredUnitCost) || 0;
    const [newTempFixedCost, setNewTempFixedCost] = useState(processData.enteredFixedCost) || 0;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({
        id: `${initialProcessData.productId}#${initialProcessData.processId}`
    })

    useEffect(() => {
        updateProcessData();
    }, [quotationData]);

    // Actualiza el objeto processData con la informacion que está en el Contexto,
    // para actualizar los cambios en Quotation o en product.
    const updateProcessData = () => {
        const product = quotationData.products.find(
            (product) => product.productId === processData.productId
        );
        if (product) {
            const process = product.processes.find(
                (process) => process.processId === processData.processId
            );
            if (process) {
                if (JSON.stringify(processData) !== JSON.stringify(process)) {
                    setProcessData(process);
                }
            }
        }
    };

    // Estado para manejo de debouncing
    const [debouncedProcessData, setDebouncedProcessData] = useState(processData);
    // Actualizar el estado global al cambiar `debouncedProdData`
    useEffect(() => {
        updateProcessInProduct(debouncedProcessData, debouncedProcessData.processId);
    }, [debouncedProcessData]);

    // Debounce: Actualizar `debouncedProdData` después de un retraso
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedProcessData(processData);
        }, 1000);
        return () => {
            clearTimeout(handler); // Limpiar el temporizador previo
        };
    }, [processData]);

    useEffect(() => {
        let exchange = 1;
        if (processData.currency === "Peso") {
            exchange = quotationData.exchangeRate;
        }
        // console.log("recalculating costs for processData: ", quotationData.exchangeRate, " - ", exchange)
        setProcessData((prevData) => ({
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
        setProcessData((prevData) => ({
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
        setProcessData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    };

    const handleSupplierUpdate = async (supplier) => {
        setIsSaved(false)
        const paymentMethodData = await getPaymentMethodData(supplier.supplierPaymentMethodId);
        const updatedData = {
            ...processData,
            productId: processData.productId,
            processId: processData.processId,
            supplierId: supplier._id || "",
            supplierName: supplier.name || "",
            supplierPaymentMethodId: paymentMethodData._id || "",
            supplierPaymentMethodName: paymentMethodData.supplier_payment_description || "",
            supplierPaymentDetails: paymentMethodData.supplier_payment_details || [],
            daysToPayment: paymentMethodData.days_to_payment || 0,
        }
        setProcessData(updatedData);
    }

    const handleSupplierPaymentMethodUpdate = (supplierPaymentMethod) => {
        setIsSaved(false)
        console.log("updating payment method: ", supplierPaymentMethod)
        setProcessData((prevData) => ({
            ...prevData,
            supplierPaymentMethodId: supplierPaymentMethod._id || "",
            supplierPaymentMethodName: supplierPaymentMethod.supplier_payment_description || "",
            supplierPaymentDetails: supplierPaymentMethod.supplier_payment_details || [],
        }))

    }

    const handleDeleteProcess = async (e) => {
        e.preventDefault();
        removeProcessInProduct(processData.productId, processData.processId);
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
                    <img src="/images/drag-icon.png" style={{ width: "20px", height: "20px" }} alt="Mover" />
                </div>
            </td>
            <td>
                <input
                    type="text"
                    name="description"
                    placeholder="Descripción"
                    defaultValue={processData.description}
                    onClick={(e) => e.target.select()}
                    onChange={handleInputChange}
                />
            </td>
            <td>
                <SelectSupplier
                    defaultSupplier={processData.supplierName || ""}
                    onSelectSupplier={handleSupplierUpdate}
                />
            </td>
            <td>
                <SelectSupplierPayMethod
                    defaultSupplierPay={processData.supplierPaymentMethodName || ""}
                    onSelectSupplierPayMethod={handleSupplierPaymentMethodUpdate}
                />
            </td>
            <CurrencySelect value={processData.currency} onChange={handleCurrencyChange} />
            <td>
                <span>Unit: </span>
                <input
                    className="input-number"
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
                    className="input-number"
                    type="number"
                    name="adjustPercentage"
                    placeholder="% Ajuste"
                    defaultValue={processData.adjustPercentage}
                    onClick={(e) => e.target.select()}
                    onInput={handleInputChange}
                />
                <span> %</span>
            </td>
            <td>
                <span>Fijo: </span>
                <input
                    className="input-number"
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
                <IconButton
                    icon="/images/delete.png"
                    text="Eliminar Producto"
                    onClick={handleDeleteProcess}
                />
            </td>
        </tr>
    )
};

export default NewProcess;