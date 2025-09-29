import { useContext, useEffect, useState } from "react";
import { closestCenter, DndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { QuotationHeader, ProductHeader, ProcessHeader } from "./QuotationUtils/NewQuotationHeaders.jsx";
import "./OneQuotationContainer.css"

import NewQuotation from "./NewQuotation"; // Asegúrate de importar tu componente NewQuotation
import NewProduct from "./QuotationElements/NewProduct";
import NewProcess from "./QuotationElements/NewProcess";
import { ParametersContext } from '../../context/ParametersContext.jsx';
import { QuotationContext } from "../../context/QuotationContext";

import ButtonCalculateQuotation from "./QuotationUtils/ButtonCalculateQuotation.jsx";
import ButtonAddProduct from "./QuotationUtils/ButtonAddProduct";
import ButtonSaveQuotation from "./QuotationUtils/ButtonSaveQuotation.jsx";

const NewQuotationContainer = () => {
    const { dolarPrice, paramMonthlyRate } = useContext(ParametersContext);
    const { quotationData, clearQuotationData, updateQuotationData, setIsSaved } = useContext(QuotationContext);
    const [activeId, setActiveId] = useState(null)
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        clearQuotationData()
        updateQuotationData({
            id: '',
            date: today,
            monthlyRate: paramMonthlyRate,
            exchangeRate: dolarPrice,
        });
    }, [dolarPrice, paramMonthlyRate, today]);

    const handleProductsDragEnd = (event) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        const products = quotationData.products;
        const oldIndex = quotationData.products.findIndex(p => p.productId === active.id);
        const newIndex = quotationData.products.findIndex(p => p.productId === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const updatedProducts = arrayMove(products, oldIndex, newIndex);

        updateQuotationData({
            ...quotationData,
            products: updatedProducts
        });
        setIsSaved(false);
        setActiveId(null);
    };

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
                            <ButtonSaveQuotation />
                        </div>
                    </>
                ) : (
                    <div className="complete-quotation-message">
                        {quotationData.id !== '' ? (
                            <ButtonAddProduct />
                        ) : (
                            <p>Complete la Cotización</p>
                        )}
                    </div>
                )}
            </DndContext >
        </div >
    );
}

export default NewQuotationContainer;
