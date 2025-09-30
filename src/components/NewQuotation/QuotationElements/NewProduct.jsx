import { useState, useContext, useEffect } from "react";
import { QuotationContext } from "../../../context/QuotationContext";
import { ParametersContext } from "../../../context/ParametersContext";
import IconButton from "../../Utils/IconButton";
import ButtonAddProcess from "../QuotationUtils/ButtonAddProcess";
import ButtonDuplicateProduct from "../QuotationUtils/ButtonDuplicateProduct";
import NewProcess from "./NewProcess";
import ProductCostDetails from "./ProductCostDetails";

import { CSS } from "@dnd-kit/utilities";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { closestCenter, DndContext } from '@dnd-kit/core';


const NewProduct = ({ productData }) => {
    const { quotationData, updateQuotationData, updateProduct, removeProduct, setIsSaved } = useContext(QuotationContext);
    const { tax } = useContext(ParametersContext);
    const [prodData, setProdData] = useState(productData);
    const [isProdUpdated, setIsProdUpdated] = useState(true);
    const [activeId, setActiveId] = useState(null)
    const [percentageUtilitie, setPercentageUtilitie] = useState(0);
    const [editPrice, setEditPrice] = useState(false);
    const [isManualPrice, setIsManualPrice] = useState(prodData.isManual || false);
    const [pesosPrice, setPesosPrice] = useState(+(prodData.unitSellingPrice * quotationData.exchangeRate).toFixed(0) || 0);

    if (prodData.calculatedSellingPrice == null || Number.isNaN(prodData.calculatedSellingPrice)) {
        setProdData((prevData) => ({
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
        const totalSellingPrice = (prodData.unitSellingPrice * prodData.quantity)
        const netSellingPrice = totalSellingPrice - (prodData.financingCost * (1 + tax))
        const utilitie = totalSellingPrice - prodData.totalProductCost - prodData.financingCost - (totalSellingPrice * tax)
        setPercentageUtilitie(((utilitie / netSellingPrice) * 100).toFixed(2));
    }
    useEffect(() => {
        calculatePercentageUtilitie();
    }, [prodData.pesosPrice]);

    useEffect(() => {
        if (!prodData.isManual) {
            setIsManualPrice(false);
            setPesosPrice(+(prodData.calculatedSellingPrice * quotationData.exchangeRate).toFixed(0) || 0);
        }
    }, [prodData.isManual]);

    // Actualizar el estado local `prodData` cuando cambie `quotationData`
    useEffect(() => {
        setPesosPrice(+(prodData.unitSellingPrice * quotationData.exchangeRate).toFixed(0) || 0);
        updateProdData();
        setIsProdUpdated(true);
    }, [quotationData]);

    const updateProdData = () => {
        const newProductData = quotationData.products.find((product) => product.productId === prodData.productId);
        if (JSON.stringify(newProductData) !== JSON.stringify(prodData)) {
            setProdData(newProductData);
        }
    }

    // Actualizar el estado global al cambiar algun dato
    useEffect(() => {
        if (!isProdUpdated) {
            updateProduct(prodData, prodData.productId);
            setIsProdUpdated(true);
        }
    }, [isProdUpdated]);

    // Manejo de cambios en los inputs
    const handleInputChange = (e) => {
        setIsSaved(false)
        const { name, value } = e.target;
        if (name.startsWith("temp")) {
            const convertedValue = +(value / quotationData.exchangeRate);
            const newName = name.replace("temp", "");
            setProdData((prevData) => ({
                ...prevData,
                [newName]: convertedValue,
            }))
        }
        setProdData((prevData) => ({
            ...prevData,
            [name]: +value,
        }))
        setIsProdUpdated(false); // Cambiamos el estado a `false` para indicar que se ha actualizado
    };

    // Eliminar el producto del contexto
    const handleDeleteProduct = () => {
        removeProduct(prodData.productId); // Eliminamos el producto usando su ID único
    };
    const handlePriceChange = (e) => {
        const newPrice = parseFloat(e.target.value);
        setPesosPrice(newPrice);
        setIsManualPrice(true);
        const newUnitPrice = +(newPrice / quotationData.exchangeRate);
        setProdData((prevData) => ({
            ...prevData,
            pesosPrice: newPrice,
            unitSellingPrice: newUnitPrice,
            isManual: true,
        }))
        setIsProdUpdated(false);
    };

    const handleProcessDragEnd = (event) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        const [activeProductId, activeProcessId] = active.id.split("#");
        const [overProductId, overProcessId] = over.id.split("#");

        if (activeProductId !== overProductId) return;

        const productIndex = quotationData.products.findIndex(p => p.productId === activeProductId);
        if (productIndex === -1) return;

        const processes = quotationData.products[productIndex].processes;
        const oldIndex = processes.findIndex(p => p.processId === activeProcessId);
        const newIndex = processes.findIndex(p => p.processId === overProcessId);

        if (oldIndex === -1 || newIndex === -1) return;

        const newProcesses = arrayMove(processes, oldIndex, newIndex);

        const updatedProducts = [...quotationData.products];
        updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            processes: newProcesses
        };

        updateQuotationData({
            ...quotationData,
            products: updatedProducts
        });
        setIsSaved(false);
        setActiveId(null);
    };

    const prodStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <>
            <table
                ref={setNodeRef}
                style={prodStyle}
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
                <tbody key={"body-" + productData.productId} id={"body-" + productData.productId}>
                    <tr>
                        <td className="product-action-buttons">
                            <ButtonDuplicateProduct
                                productId={productData.productId}
                            />
                            <ButtonAddProcess
                                productId={productData.productId}
                            />
                        </td>
                        <td>
                            <input
                                className="input-number"
                                type="number"
                                name="quantity"
                                defaultValue={prodData.quantity}
                                onClick={(e) => e.target.select()}
                                onInput={handleInputChange}
                                required
                            />
                        </td>
                        <td>
                            <span>{prodData.productDescription}</span>
                        </td>
                        <td>
                            <input
                                className="input-number-days"
                                type="number"
                                name="productionDays"
                                value={prodData.productionDays}
                                onClick={(e) => e.target.select()}
                                onInput={handleInputChange}
                            />
                        </td>
                        <td>
                            <input
                                className="input-number"
                                type="number"
                                name="tempfinancingCost"
                                value={(prodData.financingCost * quotationData.exchangeRate).toFixed(0)}
                                disabled
                            />
                        </td>
                        <td>
                            <input
                                className="input-number"
                                type="number"
                                name="tempshipmentCost"
                                value={prodData.tempshipmentCost}
                                onClick={(e) => e.target.select()}
                                onInput={handleInputChange}
                            />
                        </td>
                        <td>
                            <input
                                className="input-number"
                                type="number"
                                name="tempotherCost"
                                value={prodData.tempotherCost}
                                onClick={(e) => e.target.select()}
                                onInput={handleInputChange}
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
                                value={pesosPrice || ''}
                                onChange={handlePriceChange}
                                className={`pesos-price ${isManualPrice ? 'manual' : 'auto'}`}
                                style={{ width: '100px', textAlign: 'right' }}
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
                    {editPrice && <ProductCostDetails productData={prodData} exchangeRate={quotationData.exchangeRate} />}
                    <tr key={"processes-" + productData.productId} id={"processes-" + productData.productId}>
                        <td colSpan="11">
                            {productData.processes && productData.processes.length > 0 ? (
                                <div>
                                    <DndContext
                                        collisionDetection={closestCenter}
                                        onDragStart={(event) => setActiveId(event.active.id)}
                                        onDragEnd={handleProcessDragEnd}
                                    >
                                        <table className="quotation-table-processes">
                                            <tbody>
                                                <SortableContext
                                                    items={productData.processes.map(p => `${p.productId}#${p.processId}`)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    {productData.processes.map((process) => (
                                                        <NewProcess key={process.processId} initialProcessData={process} />
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

export default NewProduct;
