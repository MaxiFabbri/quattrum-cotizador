import { useState, useContext, useEffect, use } from "react";
import { JobContext } from "../../../context/JobContext";
import { QuotationContext } from "../../../context/QuotationContext";
import { ParametersContext } from "../../../context/ParametersContext";
import IconButton from "../../Utils/IconButton";
import ButtonAddProcess from "../../NewQuotation/QuotationUtils/ButtonAddProcess";
import ButtonDuplicateProduct from "../../NewQuotation/QuotationUtils/ButtonDuplicateProduct";
import NewJobProcess from "./JobProcess";
import ProductCostDetails from "../../NewQuotation/QuotationElements/ProductCostDetails";

import { CSS } from "@dnd-kit/utilities";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { closestCenter, DndContext } from '@dnd-kit/core';

const NewJobProduct = ({ productData }) => {
    const { quotationData, updateQuotationData, updateProduct, removeProduct, setIsSaved } = useContext(QuotationContext);
    const { jobData, updateJobData, updateJobProduct, addJobProduct, addJobProcessToProduct } = useContext(JobContext);
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

    // useEffect(() => {
    //     console.log("jobProdData changed:", jobProdData);
    // }, [jobProdData]);

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
        id: productData.productId
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
    }, [jobProdData.pesosPrice]);

    useEffect(() => {
        if (!jobProdData.isManual) {
            setIsManualPrice(false);
            setPesosPrice(+(jobProdData.calculatedSellingPrice * jobData.exchangeRate).toFixed(0) || 0);
        }
    }, [jobProdData.isManual]);

    // Actualizar el estado local `jobProdData` cuando cambie `jobData`
    useEffect(() => {
        setIsManualPrice(productData.isManual);
        setPesosPrice(+(productData.unitSellingPrice * jobData.exchangeRate).toFixed(0) || 0);
    }, [productData]);

    useEffect(() => {
        updateProdData();
    }, [jobData]);

    // Actualizar el estado global al cambiar algun dato
    useEffect(() => {
        if (!isJobProdUpdate) {
            updateJobProduct(jobProdData, jobProdData.jobProductId);
            setIsJobProdUpdated(true);
        }
    }, [isJobProdUpdate]);

    const updateProdData = () => {
        const newProductData = jobData.jobProducts.find((product) => product.jobProductId === jobProdData.jobProductId);
        if (JSON.stringify(newProductData) !== JSON.stringify(jobProdData)) {
            setJobProdData(newProductData);
        }
    }

    const handleNoteChange = (e) => {
        setIsSaved(false)
        const { value } = e.target;
        setJobProdData((prevData) => ({
            ...prevData,
            jobProductNote: value,
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

    // Eliminar el producto del contexto
    const handleDeleteProduct = () => {
        removeProduct(jobProdData.productId); // Eliminamos el producto usando su ID único
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

    const handleProcessDragEnd = (event) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        const [activeJobProductId, activeJobProcessId] = active.id.split("#");
        const [overJobProductId, overJobProcessId] = over.id.split("#");

        if (activeJobProductId !== overJobProductId) return;

        const jobProductIndex = jobData.jobProducts.findIndex(p => p.jobProductId === activeJobProductId);
        if (jobProductIndex === -1) return;

        const jobProcesses = jobData.jobProducts[jobProductIndex].jobProcesses;
        const oldIndex = jobProcesses.findIndex(p => p.jobProcessId === activeJobProcessId);
        const newIndex = jobProcesses.findIndex(p => p.jobProcessId === overJobProcessId);

        if (oldIndex === -1 || newIndex === -1) return;

        const newJobProcesses = arrayMove(jobProcesses, oldIndex, newIndex);

        const updatedJobProducts = [...jobData.jobProducts];
        updatedJobProducts[jobProductIndex] = {
            ...updatedJobProducts[jobProductIndex],
            jobProcesses: newJobProcesses
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
                className="product-container"
            >
                <thead key={"product-header"}>
                    <tr {...listeners} style={{ cursor: "grab" }} key={"product-header"}>
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
                        <th></th>
                    </tr>
                </thead>
                <tbody key={"body-" + jobProdData.jobProductId} id={"body-" + jobProdData.jobProductId}>
                    <tr>
                        <td className="product-action-buttons">
                            <ButtonDuplicateProduct
                                jobProductId={jobProdData.jobProductId}
                            />
                            <ButtonAddProcess
                                jobProductId={jobProdData.jobProductId}
                            />
                        </td>
                        <td>
                            <input
                                className="input-number"
                                type="number"
                                name="quantity"
                                defaultValue={jobProdData.quantity}
                                onClick={(e) => e.target.select()}
                                onInput={handleInputChange}
                                required
                            />
                        </td>
                        <td>
                            <span>{jobProdData.jobProductDescription}</span>
                        </td>
                        <td>
                            <input
                                className="input-number-days"
                                type="number"
                                name="productionDays"
                                value={jobProdData.productionDays}
                                onClick={(e) => e.target.select()}
                                onInput={handleInputChange}
                            />
                        </td>
                        <td>
                            <input
                                className="input-number"
                                type="number"
                                name="tempfinancingCost"
                                value={(jobProdData.financingCost * jobData.exchangeRate).toFixed(0)}
                                disabled
                            />
                        </td>
                        <td>
                            <input
                                className="input-number"
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
                                className="input-number"
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
                            <span className="percentage-utility">
                                {isNaN(percentageUtilitie) ? '%' : `${percentageUtilitie} %`}
                            </span>
                        </td>
                        <td>
                            <IconButton
                                icon={editPrice ? "/collapse.png" : "/expand.png"}
                                text="Editar Producto"
                                onClick={() => setEditPrice(prev => !prev)}
                            />
                            <input
                                type="number"
                                value={pesosPrice}
                                onChange={handlePriceChange}
                                className={`pesos-price ${isManualPrice ? 'manual' : 'auto'}`}
                                style={{ width: '100px', textAlign: 'right' }}
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                name="jobProductNote"
                                placeholder="Notas del Producto"
                                defaultValue={jobProdData.jobProductNote}
                                onClick={(e) => e.target.select()}
                                onInput={handleNoteChange}
                            />
                        </td>
                        <td>
                            <IconButton
                                icon="/delete.png"
                                text="Eliminar Producto"
                                onClick={handleDeleteProduct}
                            />
                        </td>
                    </tr>
                    {editPrice && <ProductCostDetails productData={jobProdData} exchangeRate={jobData.exchangeRate} />}
                    <tr key={"processes-" + jobProdData.jobProductId} id={"processes-" + jobProdData.jobProductId}>
                        <td colSpan="11">
                            {jobProdData.processes && jobProdData.processes.length > 0 ? (
                                <div>
                                    <DndContext
                                        collisionDetection={closestCenter}
                                        onDragStart={(event) => setActiveId(event.active.id)}
                                        onDragEnd={handleProcessDragEnd}
                                    >
                                        <table className="quotation-table-processes">
                                            <tbody>
                                                <SortableContext
                                                    items={jobProdData.processes.map(p => `${p.jobProductId}#${p.jobProcId}`)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    {jobProdData.processes.map((process) => (
                                                        <NewJobProcess key={process.jobProcId} initialProcessData={process} />
                                                    ))}
                                                </SortableContext>
                                            </tbody>
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
