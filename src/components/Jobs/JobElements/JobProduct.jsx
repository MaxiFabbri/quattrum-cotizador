import { useState, useContext, useEffect } from "react";
import { JobContext } from "../../../context/JobContext";
import { AuthContext } from "../../../context/AuthContext";
import { ParametersContext } from "../../../context/ParametersContext";
import IconButton from "../../Utils/IconButton";
import TextButton from "../../Utils/TextButton";
import ButtonAddJobProcess from "../JobsUtils/ButtonAddJobProcess";
import ButtonDuplicateJobProduct from "../JobsUtils/ButtonDuplicateJobProduct";
import NewJobProcess from "./JobProcess";
import ProductCostDetails from "../../NewQuotation/QuotationElements/ProductCostDetails";
import JobEventForm from "../JobsUtils/JobEventForm";
import JobEventsTable from "../JobsUtils/JobEventsTable";

import { CSS } from "@dnd-kit/utilities";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { calculateProcessInvoicesStatus } from "../../../utils/AdminJobStatusManager";
import "./JobProduct.css";

const NewJobProduct = ({ productData }) => {
    const { userId, userName } = useContext(AuthContext);
    const { jobData, setIsSaved, updateJobData, updateJobProduct, removeJobProduct, updateJobDataAndSave, setStatusChange } = useContext(JobContext);
    const { tax } = useContext(ParametersContext);

    const [jobProdData, setJobProdData] = useState(productData);

    const [isJobProdUpdate, setIsJobProdUpdated] = useState(true);
    const [activeId, setActiveId] = useState(null)
    const [percentageUtilitie, setPercentageUtilitie] = useState(0);
    const [editPrice, setEditPrice] = useState(false);
    const [isManualPrice, setIsManualPrice] = useState(jobProdData.isManual || false);
    const [pesosPrice, setPesosPrice] = useState(+(jobProdData.unitSellingPrice * jobData.exchangeRate).toFixed(0));
    const [newEnteredShipmentCost, setNewEnteredShipmentCost] = useState(jobProdData.enteredShipmentCost) || 0;
    const [newEnteredOtherCost, setNewEnteredOtherCost] = useState(jobProdData.enteredOtherCost) || 0;
    const [showEventsForm, setShowEventsForm] = useState(false);
    const [showProdEvents, setShowProdEvents] = useState(false);

    if (jobProdData.calculatedSellingPrice == null || Number.isNaN(jobProdData.calculatedSellingPrice)) {
        setJobProdData((prevData) => ({
            ...prevData,
            calculatedSellingPrice: prevData.unitSellingPrice
        }));
    }

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({
        id: productData.jobProductId
    })

    const calculatePercentageUtilitie = () => {
        const totalSellingPrice = (jobProdData.unitSellingPrice * jobProdData.quantity)
        const netSellingPrice = totalSellingPrice - (jobProdData.financingCost * (1 + tax))
        const utilitie = totalSellingPrice - jobProdData.totalProductCost - jobProdData.financingCost - (totalSellingPrice * tax)
        setPercentageUtilitie(((utilitie / netSellingPrice) * 100).toFixed(2));
    }

    useEffect(() => {
        const exchange = jobData.exchangeRate;
        setJobProdData((prevData) => ({
            ...prevData,
            enteredShipmentCost: newEnteredShipmentCost,
            shipmentCost: newEnteredShipmentCost / exchange,
            tempshipmentCost: newEnteredShipmentCost,
            enteredOtherCost: newEnteredOtherCost,
            otherCost: newEnteredOtherCost / exchange,
            tempotherCost: newEnteredOtherCost,
        }))
        setIsJobProdUpdated(false);
    }, [newEnteredShipmentCost, newEnteredOtherCost]);

    useEffect(() => {
        calculatePercentageUtilitie();
    }, [jobProdData]);

    useEffect(() => {
        if (!jobProdData.isManual) {
            setIsManualPrice(false);
            setPesosPrice(+(jobProdData.calculatedSellingPrice * jobData.exchangeRate).toFixed(0) || 0);
        }
    }, [jobProdData.isManual]);

    useEffect(() => {
        setIsManualPrice(productData.isManual);
        setPesosPrice(+(productData.unitSellingPrice * jobData.exchangeRate).toFixed(0) || 0);
    }, [productData]);

    // Actualizar el estado local `jobProdData` cuando cambie `jobData`
    useEffect(() => {
        updateJobProdData();
    }, [jobData]);

    // Actualizar el estado global al cambiar algun dato
    useEffect(() => {
        if (!isJobProdUpdate) {
            updateJobProduct(jobProdData, jobProdData.jobProductId);
            setIsJobProdUpdated(true);
        }
    }, [isJobProdUpdate]);

    const updateJobProdData = () => {
        const newJobProductData = jobData.jobProducts.find((product) => product.jobProductId === jobProdData.jobProductId);
        if (JSON.stringify(newJobProductData) !== JSON.stringify(jobProdData)) {
            setJobProdData(newJobProductData);
        }
    }

    const handleDescriptionChange = (e) => {
        setIsSaved(false)
        const { value } = e.target;
        setJobProdData((prevData) => ({
            ...prevData,
            jobProductDescription: value,
        }))
        setIsJobProdUpdated(false);
    };
    // Manejo de cambios en los inputs
    const handleInputChange = (e) => {
        setIsSaved(false)
        const { name, value } = e.target;
        if (name.startsWith("temp")) {
            const convertedValue = +(value / jobData.exchangeRate);
            const newName = name.replace("temp", "");
            setJobProdData((prevData) => ({
                ...prevData,
                [newName]: convertedValue,
            }))
        }
        setJobProdData((prevData) => ({
            ...prevData,
            [name]: +value,
        }))
        setIsJobProdUpdated(false); // Cambiamos el estado a `false` para indicar que se ha actualizado
    };


    const handleStatusChange = (e) => {
        const { value } = e.target;
        setIsSaved(false)

        const updatedProcesses = jobProdData.processes.map(process => {
            const updatedInvoices = calculateProcessInvoicesStatus(process.invoices, value);
            return {
                ...process,
                invoices: updatedInvoices
            };
        })
        setJobProdData((prevData) => ({
            ...prevData,
            jobProductStatus: value,
            processes: updatedProcesses
        }))
        const newEvent = {
            eventDate: new Date(),
            eventUserId: userId,
            eventUserName: userName,
            eventProductId: jobProdData.jobProductId,
            eventNote: `Cambio de estado de Producto a: ${e.target.value}`
        }
        const updatedEvents = [...jobData.jobEvents, newEvent];
        const updatedJobData = {
            jobEvents: updatedEvents
        };
        updateJobData(updatedJobData);
        setIsJobProdUpdated(false);
        setStatusChange(true);
    };

    // Eliminar el producto del contexto
    const handleDeleteJobProduct = () => {
        removeJobProduct(jobProdData.jobProductId);
    };
    const handlePriceChange = (e) => {
        const newPrice = parseFloat(e.target.value);
        setPesosPrice(newPrice);
        setIsManualPrice(true);
        const newUnitPrice = +(newPrice / jobData.exchangeRate);
        setJobProdData((prevData) => ({
            ...prevData,
            pesosPrice: newPrice,
            unitSellingPrice: newUnitPrice,
            isManual: true,
        }))
        setIsJobProdUpdated(false);
    };

    const handleAddEvent = (event) => {
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

    const handleProcessDragEnd = (event) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        const [activeJobProductId, activeJobProcessId] = active.id.split("#");
        const [overJobProductId, overJobProcessId] = over.id.split("#");

        if (activeJobProductId !== overJobProductId) return;

        const jobProductIndex = jobData.jobProducts.findIndex(p => p.jobProductId === activeJobProductId);
        if (jobProductIndex === -1) return;

        const jobProcesses = jobData.jobProducts[jobProductIndex].processes;
        const oldIndex = jobProcesses.findIndex(p => p.jobProcId === activeJobProcessId);
        const newIndex = jobProcesses.findIndex(p => p.jobProcId === overJobProcessId);


        if (oldIndex === -1 || newIndex === -1) return;

        const newJobProcesses = arrayMove(jobProcesses, oldIndex, newIndex);

        const updatedJobProducts = [...jobData.jobProducts];
        updatedJobProducts[jobProductIndex] = {
            ...updatedJobProducts[jobProductIndex],
            processes: newJobProcesses
        };

        updateJobData({
            ...jobData,
            jobProducts: updatedJobProducts
        });
        setIsSaved(false);
        setActiveId(null);
    };
    const jobProdStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <>
            <table
                ref={setNodeRef}
                style={jobProdStyle}
                {...attributes}
                className="job-product-container"
            >
                <thead key={"job-product-header"}>
                    <tr {...listeners} style={{ cursor: "grab" }} key={"job-product-header"}>
                        <th >
                            {/* <img src="/drag-icon.png" style={{ width: "20px", height: "20px" }} alt="Mover" /> */}
                        </th>
                        <th>Cantidad</th>
                        <th>Descripción</th>
                        <th>Días</th>
                        <th>Financiero</th>
                        <th>Fletes</th>
                        <th>Otros</th>
                        <th>Utilidad</th>
                        <th>Precio Unitario</th>
                        <th>Estado</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody key={"body-" + jobProdData.jobProductId} id={"body-" + jobProdData.jobProductId}>
                    <tr>
                        <td className="job-product-action-buttons">
                            <ButtonDuplicateJobProduct
                                jobProductId={jobProdData.jobProductId}
                            />
                            <ButtonAddJobProcess
                                jobProductId={jobProdData.jobProductId}
                            />
                        </td>
                        <td>
                            <input
                                className="job-input-number"
                                type="number"
                                name="quantity"
                                defaultValue={jobProdData.quantity}
                                onClick={(e) => e.target.select()}
                                onInput={handleInputChange}
                                required
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                name="jobProductDescription"
                                placeholder="Descripción"
                                defaultValue={jobProdData.jobProductDescription}
                                onClick={(e) => e.target.select()}
                                onBlur={handleDescriptionChange}
                            />
                        </td>
                        <td>
                            <input
                                className="job-input-number-days"
                                type="number"
                                name="productionDays"
                                value={jobProdData.productionDays}
                                onClick={(e) => e.target.select()}
                                onInput={handleInputChange}
                            />
                        </td>
                        <td>
                            <input
                                className="job-input-number"
                                type="number"
                                name="tempfinancingCost"
                                value={(jobProdData.financingCost * jobData.exchangeRate).toFixed(0)}
                                disabled
                            />
                        </td>
                        <td>
                            <input
                                className="job-input-number"
                                type="number"
                                name="shipmentCost"
                                value={newEnteredShipmentCost}
                                onClick={(e) => e.target.select()}
                                onInput={e => {
                                    setNewEnteredShipmentCost(Number(e.target.value))
                                }}
                            />
                        </td>
                        <td>
                            <input
                                className="job-input-number"
                                type="number"
                                name="tempotherCost"
                                value={newEnteredOtherCost}
                                onClick={(e) => e.target.select()}
                                onInput={e => {
                                    setNewEnteredOtherCost(Number(e.target.value))
                                }}
                            />
                        </td>
                        <td>
                            <span className="job-percentage-utility">
                                {isNaN(percentageUtilitie) ? '%' : `${percentageUtilitie} %`}
                            </span>
                        </td>
                        <td>
                            <IconButton
                                icon={editPrice ? "/images/collapse.png" : "/images/expand.png"}
                                text="Editar Producto"
                                onClick={() => setEditPrice(prev => !prev)}
                            />
                            <input
                                type="number"
                                value={pesosPrice}
                                onChange={handlePriceChange}
                                className={`job-pesos-price ${isManualPrice ? 'manual' : 'auto'}`}
                                style={{ width: '100px', textAlign: 'right' }}
                            />
                        </td>
                        <td>
                            <select
                                id="jobProductStatus"
                                name="jobProductStatus"
                                value={jobProdData.jobProductStatus}
                                onChange={handleStatusChange}
                                required
                            >
                                <option value="En Preparación">En Preparación</option>
                                <option value="En Producción">En Producción</option>
                                <option value="Listo">Listo</option>
                                <option value="Entregado">Entregado</option>
                            </select>
                        </td>
                        <td>
                            <TextButton
                                text="Agregar evento"
                                onClick={() => setShowEventsForm(true)}
                            />
                            {showEventsForm && (
                                <div className="overlay-style">
                                    <div className="modal-style">
                                        <button
                                            style={{ float: 'right' }}
                                            onClick={() => setShowEventsForm(false)}
                                        >
                                            ✖
                                        </button>
                                        <JobEventForm onAddEvent={handleAddEvent} productId={jobProdData.jobProductId} />
                                    </div>
                                </div>
                            )}
                        </td>
                        <td>
                            <IconButton
                                icon="/images/delete.png"
                                text="Eliminar Producto"
                                onClick={handleDeleteJobProduct}
                            />
                        </td>
                    </tr>
                    {editPrice && <ProductCostDetails productData={jobProdData} exchangeRate={jobData.exchangeRate} />}
                    <tr>
                        {!showProdEvents && (
                            <td colSpan={10} >
                                <div className="show-events-button-container">
                                    <TextButton text="Mostrar Eventos" onClick={() => setShowProdEvents(true)} />
                                </div>
                            </td>
                        )}
                        {showProdEvents && (
                            <JobEventsTable
                                events={jobData.jobEvents
                                    .filter((event) => event.eventProductId === jobProdData.jobProductId)
                                    .reverse()
                                }
                                onClose={() => setShowProdEvents(false)}
                            />
                        )}
                    </tr>
                    <tr key={"processes-" + jobProdData.jobProductId} id={"processes-" + jobProdData.jobProductId}>
                        <td colSpan="11">
                            {jobProdData.processes && jobProdData.processes.length > 0 ? (
                                <div>
                                    <DndContext
                                        collisionDetection={closestCenter}
                                        onDragStart={(event) => setActiveId(event.active.id)}
                                        onDragEnd={handleProcessDragEnd}
                                    >
                                        <table className="job-table-processes">
                                            <SortableContext
                                                items={jobProdData.processes.map(p => `${p.jobProductId}#${p.jobProcId}`)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {jobProdData.processes.map((process) => (
                                                    <NewJobProcess key={process.jobProcId} initialProcessData={process} productStatus={jobProdData.jobProductStatus} />
                                                ))}
                                            </SortableContext>
                                        </table>
                                    </DndContext>
                                </div>
                            ) : (
                                <p>No hay procesos para este producto</p>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </>


    );
};

export default NewJobProduct;
