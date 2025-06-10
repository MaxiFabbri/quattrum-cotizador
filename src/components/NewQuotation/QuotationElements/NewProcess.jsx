import { useState, useEffect, useContext } from "react";
import { QuotationContext } from "../../../context/QuotationContext";
import SelectSupplier from "../../Utils/Selectors/SelectSupplier.jsx";
import SelectSupplierPayMethod from "../../Utils/Selectors/SelectSupplierPaymentMethod.jsx";
import { apiClient } from "../../../config/axiosConfig";
import CurrencySelect from "../InputComponents/CurrencySelect.jsx";

import IconButton from "../../Utils/IconButton";

const NewProcess = ({ initialProcessData }) => {
    const { updateProcessInProduct, removeProcessInProduct, updateProduct, quotationData } = useContext(QuotationContext);

    const [processData, setProcessData] = useState(initialProcessData);
    const [newTempUnitCost, setNewTempUnitCost] = useState(processData.tempunitCost);
    const [newTempFixedCost, setNewTempFixedCost] = useState(processData.tempfixedCost);


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
        console.log("Change in processData: ", processData);
        const handler = setTimeout(() => {
            setDebouncedProcessData(processData);
        }, 300);
        return () => {
            clearTimeout(handler); // Limpiar el temporizador previo
        };
    }, [processData]);

    useEffect(() => {
        var exchange = 1;
        if (processData.currency === "Peso") {
            exchange = quotationData.exchangeRate;
        }
        setProcessData((prevData) => ({
            ...prevData,
            unitCost: newTempUnitCost / exchange,
            tempunitCost: newTempUnitCost,
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
    const handleCurrencyChange = (e) =>{
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
        const { name, value } = e.target;        
        setProcessData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    };

    const handleSupplierUpdate = async (supplier) => {
        const paymentMethodData = await getPaymentMethodData(supplier.supplierPaymentMethodId);
        const updatedData = {
            ...processData,
            productId: processData.productId,
            processId: processData.processId,
            supplierId: supplier._id || "",
            supplierName: supplier.name || "",
            supplierPaymentMethodId: paymentMethodData._id || "",
            supplierPaymentMethodName: paymentMethodData.supplier_payment_description || "",
            daysToPayment: paymentMethodData.days_to_payment || 0,
        }
        setProcessData(updatedData);
    }

    const handleSupplierPaymentMethodUpdate = async (supplierPaymentMethod) => {
        console.log("Supplier Payment Method en handle supplier payment method update: ", supplierPaymentMethod);
        const updatedData = {
            ...processData,            
            supplierPaymentMethodId: supplierPaymentMethod._id || "",
            supplierPaymentMethodName: supplierPaymentMethod.supplier_payment_description || "",
            daysToPayment: supplierPaymentMethod.days_to_payment || 0,
        }

        setProcessData(updatedData);
        updateProcessInProduct(updatedData)
    }

    const handleDeleteProcess = async (e) => {
        e.preventDefault();
        removeProcessInProduct(processData.productId, processData.processId);
    };

    return (
        <>
            <td>
                <input
                    type="text"
                    name="description"
                    placeholder="Descripción"
                    defaultValue={processData.description}
                    onInput={handleInputChange}
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
                    onInput={e => setNewTempUnitCost(e.target.value)}
                />
            </td>
            <td>
                <input
                    className="input-number"
                    type="number"
                    name="adjustPercentage"
                    placeholder="% Ajuste"
                    defaultValue={processData.adjustPercentage}
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
                    onInput={e => setNewTempFixedCost(e.target.value)}
                />
            </td>
            {/* <td>
                <span>
                    U$S {processData.subTotalProcessCost}
                </span>
            </td> */}
            <td>
                <IconButton
                    icon="/delete.png"
                    text="Eliminar Producto"
                    onClick={handleDeleteProcess}
                />
            </td>
        </>
    )
};

export default NewProcess;