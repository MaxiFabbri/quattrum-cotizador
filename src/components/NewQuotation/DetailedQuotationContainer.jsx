import { useContext, useEffect, useState } from "react";
import { closestCenter, DndContext } from '@dnd-kit/core';
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useParams } from "react-router-dom";
import "./OneQuotationContainer.css"

import { QuotationHeader } from "./QuotationUtils/NewQuotationHeaders.jsx";
import NewQuotation from "./NewQuotation.jsx";
import NewProduct from "./QuotationElements/NewProduct.jsx";
import { ParametersContext } from '../../context/ParametersContext.jsx';
import { QuotationContext } from "../../context/QuotationContext.jsx";

import ButtonCalculateQuotation from "./QuotationUtils/ButtonCalculateQuotation.jsx";
import ButtonAddProduct from "./QuotationUtils/ButtonAddProduct.jsx";
import ButtonDuplicateQuotation from "./QuotationUtils/ButtonDuplicateQuotation.jsx";
import { apiClient } from "../../config/axiosConfig.js";

const DetailedQuotationContainer = (quote) => {
    const { dolarPrice, paramMonthlyRate } = useContext(ParametersContext);
    const { quotationData, clearQuotationData, updateQuotationData, setIsSaved } = useContext(QuotationContext);
    const [activeId, setActiveId] = useState(null)



    const today = new Date().toISOString().split("T")[0];
    const { id } = useParams()

    // Formatear la fecha
    const formatDate = (utcDate) => {
        ;
        const date = new Date(utcDate);
        const year = date.getFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Asegura 2 dígitos
        const day = String(date.getUTCDate()).padStart(2, "0"); // Asegura 2 dígitos
        return `${year}-${month}-${day}`;
    };

    const adjustProcessesData = (dbProcesses, exchangeRate) => {
        const newProcessesData = dbProcesses.map((process, index) => {
            let newExchangeRate = process.currency === "Peso" ? exchangeRate : 1;
            return {
                adjustPercentage: process.adjustPercentage,
                processId: process._id,
                productId: process.productId,
                description: process.description,
                supplierId: process.supplierId._id,
                supplierName: process.supplierId.name,
                supplierPaymentMethodId: process.supplierPaymentMethodId._id,
                supplierPaymentMethodName: process.supplierPaymentMethodId.supplier_payment_description,
                daysToPayment: process.daysToPayment,
                currency: process.currency,
                unitCost: +(process.unitCost).toFixed(4),
                tempunitCost: +(process.unitCost * newExchangeRate).toFixed(2),
                fixedCost: +(process.fixedCost).toFixed(4),
                tempfixedCost: +(process.fixedCost * newExchangeRate).toFixed(2),
                subTotalProcessCost: +(process.subTotalProcessCost),
                savedToDb: true,
                order: index,
            }
        })
        return newProcessesData
    }

    const getProcessData = async (productId, exchangeRate) => {
        const responseProcesses = await apiClient(`/processes/${productId}`)
        // Ajusto los datos recibidos para el context
        const adjustedProcessesData = adjustProcessesData(responseProcesses.data.response, exchangeRate)
        return adjustedProcessesData
    }

    const adjustProductData = async (products, exchangeRate) => {
        const newProductsData = await Promise.all(products.map(async (product) => {
            const newProcesses = await getProcessData(product._id, exchangeRate);
            return {
                productId: product._id,
                quotationId: product.quotationId,
                productDescription: product.productDescription,
                quantity: product.quantity,
                productionDays: product.productionDays,
                financingCost: +(product.financingCost),
                tempfinancingCost: +(product.financingCost * exchangeRate).toFixed(2),
                shipmentCost: +(product.shipmentCost),
                tempshipmentCost: +(product.shipmentCost * exchangeRate).toFixed(2),
                otherCost: +(product.otherCost),
                order: product.order,
                tempotherCost: +(product.otherCost * exchangeRate).toFixed(2),
                unitSellingPrice: +(product.unitSellingPrice),
                pesosPrice: +(product.unitSellingPrice * exchangeRate).toFixed(0),
                processes: newProcesses, // Ahora los procesos se incluyen correctamente
                savedToDb: true,
            };
        }));
        return newProductsData;
    };

    const getQuotationDataFromDb = async (id) => {
        const responseQuotation = await apiClient.get(`/quotations/populated/${id}`)
        let newData = responseQuotation.data.response
        newData = {
            ...newData,
            id: newData._id,
            date: formatDate(newData.date),
            customerId: newData.customerId._id,
            customerName: newData.customerId.name,
            paymentMethodName: newData.paymentMethodId.customer_payment_description,
            paymentMethodId: newData.paymentMethodId._id,
        }

        // agrego los Productos
        const responseProducts = await apiClient.get(`/products/${id}`)
        const newProducts = await adjustProductData(responseProducts.data.response, newData.exchangeRate)
        newData = { ...newData, products: newProducts }
        console.log("New Data leyendo de la DB: ", newData)
        updateQuotationData(
            newData
        );
        return newData
    }

    const handleProductsDragEnd = (event) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        const products = quotationData.products;
        const oldIndex = quotationData.products.findIndex(p => p.productId === active.id);
        const newIndex = quotationData.products.findIndex(p => p.productId === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const updatedProducts = arrayMove(products, oldIndex, newIndex);
        console.log("After: ", updatedProducts)

        updateQuotationData({
            ...quotationData,
            products: updatedProducts
        });
        setIsSaved(false);
        setActiveId(null);
    };

    useEffect(() => {
        getQuotationDataFromDb(id)
    }, []);

    return (
        <div>
            <DndContext
                collisionDetection={closestCenter}
                onDragStart={(event) => setActiveId(event.active.id)}
                onDragEnd={handleProductsDragEnd}
            >
                <div className="quotation-container">
                    <table className="quotation-table-quotation">
                        <QuotationHeader />
                        <tbody>
                            <NewQuotation />
                        </tbody>
                    </table>
                </div>
                {quotationData.products && quotationData.products.length > 0 ? (
                    <>
                        <div className="quotation-table-products">
                            <SortableContext
                                items={quotationData.products.map(p => p.productId)}
                                strategy={verticalListSortingStrategy}
                            >
                                {quotationData.products.map((product) => (
                                    <NewProduct 
                                        key={product.productId}
                                        productData={product} />  
                                ))}
                            </SortableContext>
                        </div>
                        <div className="quotation-buttons-container">
                            <ButtonAddProduct />
                            <ButtonCalculateQuotation />
                            <ButtonDuplicateQuotation />
                        </div>
                    </>
                ) : (
                    <div>
                        {quotationData.id !== '' ? (
                            <ButtonAddProduct />
                        ) : (
                            <p>Complete la Cotización</p>
                        )}
                    </div>
                )}
            </DndContext>
        </div >
    );
}

export default DetailedQuotationContainer;