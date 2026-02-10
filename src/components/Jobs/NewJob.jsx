import { use, useContext, useEffect, useState } from "react";
import { apiClient } from "../../config/axiosConfig.js";
import "./JobContainer.css"

import { QuotationContext } from "../../context/QuotationContext.jsx";
import { ParametersContext } from "../../context/ParametersContext.jsx";
import { JobContext } from "../../context/JobContext.jsx";

import DateField from "../NewQuotation/InputComponents/DateField.jsx";
import CurrencySelect from "../NewQuotation/InputComponents/CurrencySelect.jsx";
import ExchangeRateInput from "../NewQuotation/InputComponents/ExchangeRateInput.jsx";
import QuoteStatusSelect from "../NewQuotation/InputComponents/QuoteStatusSelect.jsx";
import IsKitCheckbox from "../NewQuotation/InputComponents/IsKitCheckbox.jsx";
import MonthlyRateInput from "../NewQuotation/InputComponents/MonthlyRateInput.jsx";
import CalculateFinancingCheckbox from "../NewQuotation/InputComponents/CalculateFinancingCheckBox.jsx";

import SelectCustomer from "../Utils/Selectors/SelectCustomer.jsx";
import SelectCustomerPayMethod from "../Utils/Selectors/SelectCustomerPaymentMethod.jsx";
import { useAddProductWithQuotation } from "../NewQuotation/QuotationUtils/useAddProductWithQuotation.jsx";
import { validateNewQuotation } from "../NewQuotation/QuotationUtils/validateQuotation.jsx";
import IconButton from "../Utils/IconButton.jsx";
import { toast } from "react-toastify";


const NewJob = () => {
    const { getDolarPrice } = useContext(ParametersContext);
    const { quotationData } = useContext(QuotationContext);
    const { jobData, setJobData, updateJobData, setIsUpdated } = useContext(JobContext);
    const [quotationId, setQuotationId] = useState(null);
    const [showInvoices, setShowInvoices] = useState(true);



    // Manejo de cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log("Input changed:", name, value);
        setJobData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
        // setIsUpdated(true);
    };

    const handleChange = (updates) => {
        updateJobData(updates);
        // setIsUpdated(true);
    };
    const handleCustomerPaymentMethodUpdate = (newCustomerPaymentMethod) => {
        setJobData((prevData) => ({
            ...prevData,
            paymentMethodId: newCustomerPaymentMethod._id || "",
            paymentMethodName: newCustomerPaymentMethod.customer_payment_description || "",
            customerPaymentDetails: newCustomerPaymentMethod.customer_payment_details || [],
        }));

        // setIsSaved(false);
        // updateQuotationData({
        //     paymentMethodId: newCustomerPaymentMethod._id || "",
        //     paymentMethodName: newCustomerPaymentMethod.customer_payment_description || "",
        //     customerPaymentDetails: newCustomerPaymentMethod.customer_payment_details || [],
        //     // paymentDaysToCollect: newCustomerPaymentMethod.days_to_collect || 0,
        // });
    };

    const handleAddInvoice = (index) => {
        console.log("Adding new invoice for job: ", jobData);
        const newInvoice = {
            invoiceNumber: "",
            invoiceType: "Contra Entrega",
            invoiceNote: "",
            collections: [
                {
                    collectionDate: "",
                    collectionType: "Total",
                    collectionNote: "",
                }
            ],
        };
        const updatedInvoices = [...jobData.invoices, newInvoice];
        setJobData({ ...jobData, invoices: updatedInvoices });
    }
    const handleDeleteInvoice = (invoiceToDelete) => {
        console.log("Deleting invoice: ", invoiceToDelete, " from job: ", jobData.invoices);
        const updatedInvoices = jobData.invoices.filter((_, index) => index !== invoiceToDelete);
        setJobData({ ...jobData, invoices: updatedInvoices });
    }

    const handleAddCollect = (invoiceIndex, collectionIndex) => {
        console.log("Adding new collection to invoice ", invoiceIndex, " last collect: ", collectionIndex, " JobData: ", jobData.invoices);
        const newCollect = {
            collectionDate: "",
            collectionType: "Total",
            collectionNote: "",
        };
        const updatedInvoices = [...jobData.invoices];
        updatedInvoices[invoiceIndex].collections.push(newCollect);
        setJobData({ ...jobData, invoices: updatedInvoices });
    }
    const handleDeleteCollect = (invoiceIndex, collectionIndex) => {
        console.log("Deleting collection ", collectionIndex, " from invoice ", invoiceIndex, " JobData: ", jobData.invoices);
        const updatedInvoices = [...jobData.invoices];
        updatedInvoices[invoiceIndex].collections = updatedInvoices[invoiceIndex].collections.filter((_, index) => index !== collectionIndex);
        setJobData({ ...jobData, invoices: updatedInvoices });
    }

    const handleInvoiceChange = (index, updates) => {
        console.log("Updating invoice at index ", index, " with updates: ", updates);
        const updatedInvoices = jobData.invoices.map((invoice, i) =>
            i === index ? { ...invoice, ...updates } : invoice
        );
        updateJobData({ invoices: updatedInvoices });
    }

    const handleCollectionChange = (invoiceIndex, collectionIndex, updatedCollection) => {
        console.log("Updating collection at index ", collectionIndex, " of invoice ", invoiceIndex, " with updates: ", updatedCollection);
        const updatedInvoices = [...jobData.invoices];
        const updatedCollections = [...updatedInvoices[invoiceIndex].collections];

        updatedCollections[collectionIndex] = {
            ...updatedCollections[collectionIndex],
            ...updatedCollection,
        };

        updatedInvoices[invoiceIndex].collections = updatedCollections;
        setJobData({ ...jobData, invoices: updatedInvoices });
    };



    return (
        <>
            <tr key={jobData.jobId}>
                <DateField value={jobData.approvalDate} onChange={(e) => handleChange({ approvalDate: e.target.value })} />
                <DateField value={jobData.deliveryDate} onChange={(e) => handleChange({ deliveryDate: e.target.value })} />
                <td>
                    <input
                        type="text"
                        placeholder="Cliente"
                        defaultValue={jobData.customerName}
                    />
                </td>
                <td>
                    <SelectCustomerPayMethod
                        defaultPayment={jobData.paymentMethodName || ""}
                        onSelectCustomerPayMethod={handleCustomerPaymentMethodUpdate}
                    />
                </td>
                <CurrencySelect value={jobData.currency} onChange={(e) => handleChange({ currency: e.target.value })} />
                <ExchangeRateInput value={jobData.exchangeRate} onChange={(e) => handleChange({ exchangeRate: +(e.target.value) })} />
                <td>
                    <input 
                        type="text"
                        placeholder="Status del trabajo"
                        defaultValue={jobData.jobStatus}
                        
                    />
                </td>
                {/* <QuoteStatusSelect value={jobData.jobStatus} onChange={(e) => handleChange({ ...jobData, jobStatus: e.target.value })} /> */}
                <IsKitCheckbox checked={jobData.isKit} onChange={(e) => handleChange({ isKit: e.target.checked })} />
                <td>
                    <input
                        type="text"
                        name="jobNotes"
                        placeholder="Notas del trabajo"
                        defaultValue={jobData.jobNotes}
                        onClick={(e) => e.target.select()}
                        onInput={handleInputChange}
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

            {showInvoices && (
                <tr>
                    <td colSpan={9} className="invoices-container">
                        <table className="invoices-subtable">
                            <tbody>
                                <tr className="invoice-head">
                                    <th>Facturas</th>
                                    <th>Cobranzas</th>
                                </tr>
                                {jobData.invoices.map((invoice, index) => (
                                    <tr key={index} className="invoice-row">
                                        <td>
                                            {jobData.invoices.length > 1 && (
                                                <IconButton
                                                    icon="/images/delete.png"
                                                    text="Eliminar Factura"
                                                    onClick={() => handleDeleteInvoice(index)}
                                                />
                                            )}
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
                                                value={invoice.invoiceType}
                                                onChange={(e) => handleInvoiceChange(index, { invoiceType: e.target.value })}
                                            >
                                                <option value="Anticipado">Anticipado</option>
                                                <option value="Contra Entrega">Contra Entrega</option>
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
                                                onClick={() => handleAddInvoice(invoice)}
                                            />
                                        </td>
                                        <td>
                                            <table className="collections-subtable">
                                                <tbody>
                                                    {invoice.collections.map((collection, cIndex) => (
                                                        <tr key={cIndex} className="collection-row">
                                                            <td>
                                                                {invoice.collections.length > 1 && (
                                                                    <IconButton
                                                                        icon="/images/delete.png"
                                                                        text="Eliminar Cobranza"
                                                                        onClick={() => handleDeleteCollect(index, cIndex)}
                                                                    />
                                                                )}
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="date"
                                                                    defaultValue={collection.collectionDate}
                                                                    onChange={(e) => handleCollectionChange(index, cIndex, { collectionDate: e.target.value })}
                                                                />
                                                            </td>
                                                            <td>
                                                                <select
                                                                    value={collection.collectionType}
                                                                    onChange={(e) => handleCollectionChange(index, cIndex, { collectionType: e.target.value })}
                                                                >
                                                                    <option value="Anticipo">Anticipo</option>
                                                                    <option value="Total">Total</option>
                                                                    <option value="Otro">Otro</option>
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Notas"
                                                                    defaultValue={collection.collectionNote}
                                                                    onChange={(e) => handleCollectionChange(index, cIndex, { collectionNote: e.target.value })}
                                                                />
                                                            </td>
                                                            <td>
                                                                <IconButton
                                                                    icon="/images/create.png"
                                                                    text="Agregar Cobranza"
                                                                    onClick={() => handleAddCollect(index, cIndex)}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </td>
                </tr>
            )}

        </>
    );
};

export default NewJob;
