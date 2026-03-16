import { useState, useEffect, useContext } from "react";
import { JobContext } from "../../../context/JobContext.jsx";
import SelectSupplier from "../../Utils/Selectors/SelectSupplier.jsx";
import SelectSupplierPayMethod from "../../Utils/Selectors/SelectSupplierPaymentMethod.jsx";
import { apiClient } from "../../../config/axiosConfig.js";
import CurrencySelect from "../../NewQuotation/InputComponents/CurrencySelect.jsx";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./JobProcess.css";
import { getProcessRowClass } from "../JobsUtils/JobClassValidations.js";	
import { calculateProcessInvoicesStatus } from "../../../utils/AdminJobStatusManager.js";
import IconButton from "../../Utils/IconButton.jsx";

const NewJobProcess = ({ initialProcessData, productStatus }) => {
    const { jobData, updateJobProcessInProduct, removeJobProcessInProduct, setIsSaved } = useContext(JobContext);

    const [jobProcessData, setJobProcessData] = useState(initialProcessData);
    const [newTempUnitCost, setNewTempUnitCost] = useState(jobProcessData.enteredUnitCost) || 0;
    const [newTempFixedCost, setNewTempFixedCost] = useState(jobProcessData.enteredFixedCost) || 0;
    const [showInvoices, setShowInvoices] = useState(false);

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
        (false)
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

    const handleInvoiceChange = (index, updatedFields) => {
        setIsSaved(false)
        console.log("updating invoice at index ", index, " with fields: ", updatedFields)

        const updatedInvoices = jobProcessData.invoices.map((invoice, i) =>
            i === index ? { ...invoice, ...updatedFields } : invoice
        );
        const newUpdatedInvoices = calculateProcessInvoicesStatus(updatedInvoices, productStatus)
        setJobProcessData((prevData) => ({
            ...prevData,
            invoices: newUpdatedInvoices,
        }));
    };
    const handleAddInvoice = () => {
        setIsSaved(false)
        const newInvoice = {
            invoiceNumber: "",
            invoiceType: "Total",
            invoiceNote: "",
            isInvoicePendingReception: true,
            hasPaymentsPending: true,
            payments: [{
                paymentDate: "",
                paymentType: "Anticipo",
                paymentNote: "",
            }],
        };
        setJobProcessData((prevData) => ({
            ...prevData,
            invoices: [...prevData.invoices, newInvoice],
        }));
    };
    const handleDeleteInvoice = (index) => {
        setIsSaved(false)
        const updatedInvoices = [...jobProcessData.invoices]; 
        updatedInvoices.splice(index, 1);
        console.log("updated invoices after deletion: ", updatedInvoices)
        const newUpdatedInvoices = calculateProcessInvoicesStatus(updatedInvoices, productStatus)
        setJobProcessData((prevData) => ({
            ...prevData,
            invoices: newUpdatedInvoices,
        }));
    };

    const handlePaymentChange = (invoiceIndex, paymentIndex, updatedFields) => {
        setIsSaved(false)
        const updatedInvoices = [...jobProcessData.invoices]
        const updatedPayment = [...updatedInvoices[invoiceIndex].payments]
        
        updatedPayment[paymentIndex] = { ...updatedPayment[paymentIndex], ...updatedFields }
        updatedInvoices[invoiceIndex].payments = updatedPayment
        const newUpdatedInvoices = calculateProcessInvoicesStatus(updatedInvoices, productStatus)
        setJobProcessData((prevData) => ({
            ...prevData,
            invoices: newUpdatedInvoices,
        }));
    }
    const handleAddPayment = (invoiceIndex) => {
        setIsSaved(false)
        console.log("adding payment to invoice index: ", invoiceIndex)
        const newPayment = {
            paymentDate: "",
            paymentType: "Anticipo",
            paymentNote: "",
        };
        const updatedInvoices = [...jobProcessData.invoices]
        updatedInvoices[invoiceIndex].payments.push(newPayment)
        const newUpdatedInvoices = calculateProcessInvoicesStatus(updatedInvoices, productStatus)
        setJobProcessData((prevData) => ({
            ...prevData,
            invoices: newUpdatedInvoices,
        }));

    }
    const handleDeletePayment = (invoiceIndex, paymentIndex) => {
        setIsSaved(false)
        console.log("deleting payment at index ", paymentIndex, " from invoice index: ", invoiceIndex)

        const updatedInvoices = [...jobProcessData.invoices]
        const updatedPayments = [...updatedInvoices[invoiceIndex].payments]
        updatedPayments.splice(paymentIndex, 1)
        updatedInvoices[invoiceIndex].payments = updatedPayments
        const newUpdatedInvoices = calculateProcessInvoicesStatus(updatedInvoices, productStatus)
        setJobProcessData((prevData) => ({
            ...prevData,
            invoices: newUpdatedInvoices,
        }));

    }

    const formatDateForInput = (dateString) => {
        if (!dateString) return ""; // Si no hay fecha, retorna string vacío para evitar errores
        const newDate = new Date(dateString).toISOString().split("T")[0];
        return newDate; 
    };

    


    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <tbody
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <tr>
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
                    <IconButton
                        icon="/images/delete.png"
                        text="Eliminar Producto"
                        onClick={handleDeleteProcess}
                    />
                </td>
                <td>
                    <IconButton
                        icon={showInvoices ? "/images/collapse.png" : "/images/expand.png"}
                        text={showInvoices ? "Colapsar Facturas" : "Expandir Facturas"}
                        onClick={() => setShowInvoices(!showInvoices)}
                    />
                </td>
            </tr>
            <tr>

                {showInvoices && jobProcessData.invoices.length > 0 && (
                    <td colSpan={12} className="process-invoices-container">
                        <table className="process-invoices-subtable">
                            <tbody key={jobProcessData.invoices.length}>
                                {jobProcessData.invoices.map((invoice, index) => (
                                    
                                    <tr key={index} className={`process-invoice-row ${getProcessRowClass(invoice)}`}>
                                        <td>
                                            {jobProcessData.invoices.length > 1 && (
                                                <IconButton
                                                    icon="/images/delete.png"
                                                    text="Eliminar Factura"
                                                    onClick={() => handleDeleteInvoice(index)}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            <h4>Factura:</h4>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                placeholder="Numero de Factura"
                                                defaultValue={invoice.invoiceNumber}
                                                onChange={(e) => handleInvoiceChange(index, { invoiceNumber: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                defaultValue={invoice.invoiceType}
                                                onChange={(e) => handleInvoiceChange(index, { invoiceType: e.target.value })}
                                            >
                                                <option value="Anticipado">Anticipado</option>
                                                <option value="Contra Entrega">Contra Entrega</option>
                                                <option value="Mensual">Mensual</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                placeholder="Notas"
                                                defaultValue={invoice.invoiceNote}
                                                onChange={(e) => handleInvoiceChange(index, { invoiceNote: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <IconButton
                                                icon="/images/create.png"
                                                text="Agregar Factura"
                                                onClick={() => handleAddInvoice()}
                                            />
                                        </td>
                                        <td>
                                            {invoice.payments && invoice.invoiceType !== "Mensual" && (
                                            <>
                                                {/* {console.log("invoice payments: ", invoice.payments)} */}
                                                <table className="payments-subtable">
                                                    <tbody>
                                                        {invoice.payments.map((payment, pIndex) => (
                                                            <tr key={pIndex} className="payments-row">
                                                                <td>
                                                                    {invoice.payments.length > 1 && (
                                                                        <IconButton
                                                                            icon="/images/delete.png"
                                                                            text="Eliminar Cobranza"
                                                                            onClick={() => handleDeletePayment(index, pIndex)}
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="date"
                                                                        defaultValue={formatDateForInput(payment.paymentDate)}
                                                                        onChange={(e) => handlePaymentChange(index, pIndex, { paymentDate: e.target.value })}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <select
                                                                        defaultValue={payment.paymentType}
                                                                        onChange={(e) => handlePaymentChange(index, pIndex, { paymentType: e.target.value })}
                                                                    >
                                                                        <option value="Anticipo">Anticipo</option>
                                                                        <option value="Saldo">Saldo</option>
                                                                        <option value="Total">Total</option>
                                                                        <option value="Otro">Otro</option>
                                                                    </select>
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Notas"
                                                                        defaultValue={payment.paymentNote}
                                                                        onChange={(e) => handlePaymentChange(index, pIndex, { paymentNote: e.target.value })}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <IconButton
                                                                        icon="/images/create.png"
                                                                        text="Agregar Cobranza"
                                                                        onClick={() => handleAddPayment(index, pIndex)}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>

                                            </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </td>
                )}

            </tr>
        </tbody>
    )
};

export default NewJobProcess;