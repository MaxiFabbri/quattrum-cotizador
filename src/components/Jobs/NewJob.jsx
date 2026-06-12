import { use, useContext, useEffect, useState } from "react";
import "./NewJob.css"

import { AuthContext } from "../../context/AuthContext.jsx";
import { JobContext } from "../../context/JobContext.jsx";

import DateField from "../NewQuotation/InputComponents/DateField.jsx";
import CurrencySelect from "../NewQuotation/InputComponents/CurrencySelect.jsx";
import ExchangeRateInput from "../NewQuotation/InputComponents/ExchangeRateInput.jsx";
import IsKitCheckbox from "../NewQuotation/InputComponents/IsKitCheckbox.jsx";

// import SelectCustomer from "../Utils/Selectors/SelectCustomer.jsx";
import SelectCustomerPayMethod from "../Utils/Selectors/SelectCustomerPaymentMethod.jsx";
import IconButton from "../Utils/IconButton.jsx";
import TextButton from "../Utils/TextButton.jsx";
// import { toast } from "react-toastify";
import { getInvoiceRowClass } from "./JobsUtils/JobClassValidations.js";
import { calculateInvoicesStatus } from "../../utils/AdminJobStatusManager.js"
import JobEventsTable from "./JobsUtils/JobEventsTable.jsx";
import ImageLinkUploader from "./JobsUtils/ImageLinkUploader.jsx";

const NewJob = () => {
    const { userId, userName } = useContext(AuthContext);
    const { jobData, setJobData, updateJobData, updateJobDataAndSave, setIsSaved, setIsUpdated } = useContext(JobContext);
    const [showInvoices, setShowInvoices] = useState(false);
    const [showEventsForm, setShowEventsForm] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [showFiles, setShowFiles] = useState(false);

    const handleChange = (updates) => {
        setIsSaved(false)
        updateJobData(updates);
    };

    const handleEditEvent = () => {
        console.log("Eventos actuales: ", jobData.jobEvents);
        const updatedJobData = {
            jobEvents: jobData.jobEvents
        };
        console.log("Actualizando eventos del producto con: ", updatedJobData);
        updateJobData(updatedJobData);
        setIsUpdated(true);
    };

    const handleCustomerPaymentMethodUpdate = (newCustomerPaymentMethod) => {
        setJobData((prevData) => ({
            ...prevData,
            paymentMethodId: newCustomerPaymentMethod._id || "",
            paymentMethodName: newCustomerPaymentMethod.customer_payment_description || "",
            customerPaymentDetails: newCustomerPaymentMethod.customer_payment_details || [],
        }));
    };

    const handleAddInvoice = (index) => {
        setIsSaved(false);
        console.log("Adding new invoice for job: ", jobData);
        const newInvoice = {
            invoiceNumber: "",
            invoiceType: "Contra Entrega",
            invoiceNote: "",
            isPendingIssuance: true,
            hasCollectionsPending: true,
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
        setIsSaved(false);
        console.log("Deleting invoice: ", invoiceToDelete, " from job: ", jobData.invoices);
        const updatedInvoices = jobData.invoices.filter((_, index) => index !== invoiceToDelete);
        const newUpdatedInvoices = calculateInvoicesStatus(updatedInvoices, jobData.jobStatus)
        setJobData({ ...jobData, invoices: newUpdatedInvoices });
    }

    const handleAddCollect = (invoiceIndex, collectionIndex) => {
        setIsSaved(false);
        console.log("Adding new collection to invoice ", invoiceIndex, " last collect: ", collectionIndex, " JobData: ", jobData.invoices);
        const newCollect = {
            collectionDate: "",
            collectionType: "Total",
            collectionNote: "",
        };
        const updatedInvoices = [...jobData.invoices];
        updatedInvoices[invoiceIndex].collections.push(newCollect);
        const newUpdatedInvoices = calculateInvoicesStatus(updatedInvoices, jobData.jobStatus)
        setJobData({ ...jobData, invoices: newUpdatedInvoices });
    }
    const handleDeleteCollect = (invoiceIndex, collectionIndex) => {
        setIsSaved(false);
        console.log("Deleting collection ", collectionIndex, " from invoice ", invoiceIndex, " JobData: ", jobData.invoices);
        const updatedInvoices = [...jobData.invoices];
        updatedInvoices[invoiceIndex].collections = updatedInvoices[invoiceIndex].collections.filter((_, index) => index !== collectionIndex);
        const newUpdatedInvoices = calculateInvoicesStatus(updatedInvoices, jobData.jobStatus)
        setJobData({ ...jobData, invoices: newUpdatedInvoices });
    }

    const handleInvoiceChange = (index, updates) => {
        setIsSaved(false);
        const updatedInvoices = jobData.invoices.map((invoice, i) =>
            i === index ? { ...invoice, ...updates } : invoice
        );
        const newUpdatedInvoices = calculateInvoicesStatus(updatedInvoices, jobData.jobStatus)
        updateJobData({ invoices: newUpdatedInvoices });
    }
    const handleCollectionChange = (invoiceIndex, collectionIndex, updatedCollection) => {
        setIsSaved(false);
        console.log("Updating collection at index ", collectionIndex, " of invoice ", invoiceIndex, " with updates: ", updatedCollection);
        const updatedInvoices = [...jobData.invoices];
        const updatedCollections = [...updatedInvoices[invoiceIndex].collections];

        updatedCollections[collectionIndex] = {
            ...updatedCollections[collectionIndex],
            ...updatedCollection,
        };

        updatedInvoices[invoiceIndex].collections = updatedCollections;
        const newUpdatedInvoices = calculateInvoicesStatus(updatedInvoices, jobData.jobStatus)
        updateJobData({ invoices: newUpdatedInvoices });
    };

    const handleAddEvent = (event) => {
        console.log("Nuevo evento: ", event);
        setShowEventsForm(false);
        const newEvent = {
            eventDate: new Date(),
            eventUserId: userId,
            eventUserName: userName,
            eventProductId: event.eventProductId || null,
            eventNote: event.eventNote || ''
        }
        const updatedEvents = [...jobData.jobEvents, newEvent];

        updateJobDataAndSave({ jobEvents: updatedEvents });
    };

    function parseDriveLink(driveUrl) {
        const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            const fileId = match[1];
            return {
                url: driveUrl,

            };
        }
        return { url: driveUrl, thumbnail: null };
    }

    const handleAddImage = (link, description) => {
        setIsSaved(false);
        console.log("Adding Link: ", link, " Description: ", description);
        const newImage = {
            url: link,
            description: description || "",
        }

        setJobData((prevData) => ({
            ...prevData,
            images: [...(prevData.images || []), newImage]
        }));
    };

    const handleDeleteImage = (index) => () => {
        setIsSaved(false);
        console.log("Deleting image at index: ", index, " from jobData: ", jobData.images);
        setJobData((prevData) => ({
            ...prevData,
            images: prevData.images.filter((_, i) => i !== index)
        }));
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return ""; // Si no hay fecha, retorna string vacío para evitar errores
        const newDate = new Date(dateString).toISOString().split("T")[0];
        return newDate;
    };

    const getDateClass = () => {
        if (jobData.isDateCritical) return "row-pending";
        if (!jobData.deliveryDate) return "row-wip";
        return "row-default";
    }
    const dateClass = getDateClass();

    const handleJobNotesChange = (e) => {
        setIsSaved(false)
        const { value } = e.target;
        console.log("Updating job notes with: ", value);
        setJobData((prevData) => ({
            ...prevData,
            jobNotes: value,
        }))
        setIsUpdated(false);
    };

    return (
        <>
            <tr key={jobData.jobId}>
                <DateField value={jobData.approvalDate} onChange={(e) => handleChange({ approvalDate: e.target.value })} />
                <td>
                    <input
                        className={dateClass}
                        type="date"
                        id="deliveryDate"
                        name="deliveryDate"
                        defaultValue={jobData.deliveryDate}
                        onChange={(e) => handleChange({ deliveryDate: e.target.value })}
                    />
                </td>
                <td>
                    <input
                        type="checkbox"
                        id="isDateCritical"
                        name="isDateCritical"
                        checked={jobData.isDateCritical}
                        onChange={(e) => handleChange({ isDateCritical: e.target.checked })}
                    />
                </td>
                <td>
                    <input
                        type="text"
                        placeholder="Cliente"
                        defaultValue={jobData.customerName}
                    />
                    <a
                        href={`/customers/edit/${jobData.customerId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img src="/images/link.png" alt="link" />
                    </a>
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
                    <span>{jobData.jobStatus}</span>
                </td>
                <IsKitCheckbox checked={jobData.isKit} onChange={(e) => handleChange({ isKit: e.target.checked })} />
                <td>
                    <IconButton
                        icon={showInvoices ? "/images/collapse.png" : "/images/expand.png"}
                        text={showInvoices ? "Colapsar Facturas" : "Expandir Facturas"}
                        onClick={() => setShowInvoices(!showInvoices)}
                    />
                </td>
            </tr>
            <tr className="images-row">
                {!showFiles && (
                    <td colSpan={3} >
                        <div className="files-button-container">
                            <TextButton text="Archivos" onClick={() => setShowFiles(true)} />
                        </div>

                    </td>
                )}
                {showFiles && (
                    <td colSpan={3} >
                        <div className="files-button-container">
                            <TextButton text="Archivos" onClick={() => setShowFiles(false)} />
                        </div>
                        <div className="images-section">
                            <ImageLinkUploader onAddImage={handleAddImage} />
                            {jobData.images && (
                                // { jobData.images.length > 0 && (
                                <div className="images-list">
                                    {jobData.images.map((image, index) => (
                                        <div className="image-item" key={index}>
                                            <IconButton
                                                icon="/images/delete.png"
                                                text="Eliminar Imagen"
                                                onClick={handleDeleteImage(index)}
                                            />

                                            <a key={index} href={image.url} target="_blank" rel="noopener noreferrer">
                                                <span>{image.description}</span>
                                            </a>
                                        </div>

                                    ))}
                                </div>
                            )}
                        </div>
                    </td>
                )}
                <td colSpan={5}>
                    <input
                        className="job-notes-input"
                        type="text"
                        name="jobNotes"
                        placeholder="Notas del Pedido"
                        defaultValue={jobData.jobNotes}
                        onClick={(e) => e.target.select()}
                        onBlur={handleJobNotesChange}
                    />
                </td>
            </tr>

            <tr>
                {!showEvents && (
                    <td colSpan={8} >
                        <div className="show-events-button-container">
                            <TextButton text="Mostrar Eventos" onClick={() => setShowEvents(true)} />
                        </div>
                    </td>
                )}
                {showEvents && (
                    <JobEventsTable
                        events={jobData.jobEvents
                            .filter((event) => event.eventProductId === null)
                            .reverse()
                        }
                        onClose={() => setShowEvents(false)}
                        onEdit={handleEditEvent}
                    />
                )}
            </tr>

            {showInvoices && (
                <tr>
                    <td colSpan={10} className="invoices-container">
                        <table className="invoices-subtable">
                            <tbody>
                                <tr className="invoice-head">
                                    <th>Facturas</th>
                                    <th>Cobranzas</th>
                                </tr>
                                {jobData.invoices.map((invoice, index) => (
                                    <tr key={index} className={`invoice-row ${getInvoiceRowClass(invoice)}`}>
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
                                                                    defaultValue={formatDateForInput(collection.collectionDate)}
                                                                    onChange={(e) => handleCollectionChange(index, cIndex, { collectionDate: e.target.value })}
                                                                />
                                                            </td>
                                                            <td>
                                                                <select
                                                                    value={collection.collectionType}
                                                                    onChange={(e) => handleCollectionChange(index, cIndex, { collectionType: e.target.value })}
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
