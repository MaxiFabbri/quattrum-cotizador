import { useContext, useState, useEffect } from "react";
import { QuotationContext } from "../../../context/QuotationContext.jsx";
import { ParametersContext } from "../../../context/ParametersContext.jsx";
import { apiClient } from "../../../config/axiosConfig.js";
import TextButton from "../../Utils/TextButton";

const ButtonCalculateQuotation = () => {
    const { quotationData, updateProduct, updateProcessInProduct, updateQuotationData } = useContext(QuotationContext);
    const { utilitiesTable, tax } = useContext(ParametersContext);
    const [isUpdated, setIsUpdated] = useState(false);

    const saveDuplicatedtedQuotation = async () => {
        console.log("Quotation to Duplicate: ", quotationData);
        let newQuotationId = ""
        // preparo la informacion de Quotation para guardar en la DB
        const quotationToSave = {
            date: quotationData.date,
            customerId: quotationData.customerId,
            paymentMethodId: quotationData.paymentMethodId,
            monthlyRate: quotationData.monthlyRate,
            currency: quotationData.currency,
            exchangeRate: quotationData.exchangeRate,
            quoteStatus: quotationData.quoteStatus,
            quoteProductsDescription: quotationData.quoteProductsDescription,
            isKit: quotationData.isKit,
        }
        // grabo en la DB la información de Quotation y rescato el Id
        try {
            const responseQuote = await apiClient.post("/quotations", quotationToSave);
            console.log("Cotización guardada: ", responseQuote.data);
            newQuotationId = responseQuote.data.response._id;
            // Actualizo el ID de la cotización en el context
            updateQuotationData({
                id: newQuotationId,
            });

        } catch (error) {
            console.error("Error al guardar la cotización: ", error);
        }

        // Paso por todos los productos
        quotationData.products.map(async (product) => {
            let newProductId = product.productId;
            // preparo la informacion de Product para guardar en la DB
            const productToSave = {
                quotationId: newQuotationId,
                quantity: product.quantity,
                productionDays: product.productionDays,
                financingCost: product.financingCost,
                shipmentCost: product.shipmentCost,
                otherCost: product.otherCost,
                productDescription: product.productDescription,
                unitSellingPrice: product.unitSellingPrice,
                savedToDb: product.savedToDb,
            }

            // guardo en la DB la información de Product
            try {
                // Si el producto no está guardado, lo guardo
                const responseProduct = await apiClient.post('/products/', productToSave);
                newProductId = responseProduct.data.response._id;
                // Actualizo el ID del producto en el context
                updateProduct({
                    productId: newProductId,
                    quotationId: newQuotationId,
                    savedToDb: true,
                }, product.productId);
            } catch (error) {
                console.error("Error al guardar el producto: ", error);
            }
            product.processes.map(async (process) => {
                // preparo la informacion de Process para guardar en la DB con el ID del producto
                const processToSave = {
                    productId: newProductId,
                    description: process.description,
                    supplierId: process.supplierId,
                    supplierPaymentMethodId: process.supplierPaymentMethodId,
                    daysToPayment: process.daysToPayment,
                    unitCost: process.unitCost,
                    fixedCost: process.fixedCost,
                    subTotalProcessCost: +process.subTotalProcessCost,
                }
                // guardo en la DB la información de Process
                try {

                    const responseProcess = await apiClient.post('/processes/', processToSave);
                    // Actualizo el ID del proceso y el ID de Producto en el context
                    updateProcessInProduct({
                        processId: responseProcess.data.response._id,
                        productId: newProductId,
                        savedToDb: true,
                    }, process.processId);

                } catch (error) {
                    console.error("Error al guardar el proceso: ", error);
                }
            });
        });
    }

    const handleDuplicateQuotation = async () => {
        saveDuplicatedtedQuotation()
    }


    return (
        <TextButton
            text="Duplicar Cotización"
            onClick={handleDuplicateQuotation}
        />
    );
}

export default ButtonCalculateQuotation;