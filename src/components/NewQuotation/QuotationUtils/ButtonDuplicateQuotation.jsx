import { useContext, useState, useEffect } from "react";
import { QuotationContext } from "../../../context/QuotationContext.jsx";
import { ParametersContext } from "../../../context/ParametersContext.jsx";
import { apiClient } from "../../../config/axiosConfig.js";
import TextButton from "../../Utils/TextButton";
import { useNavigate } from "react-router-dom";

const ButtonDuplicateQuotation = () => {
    const { quotationData, updateProduct, updateProcessInProduct, updateQuotationData, calculateQuotation } = useContext(QuotationContext);
    const { dolarPrice, paramMonthlyRate } = useContext(ParametersContext);
    const [shouldCalculate, setShouldCalculate] = useState(false);
    const today = new Date().toISOString().split("T")[0];
    const navigate = useNavigate();

    const saveDuplicatedQuotation = async () => {
        let newQuotationId = "";

        const quotationToSave = {
            date: today,
            customerId: quotationData.customerId,
            paymentMethodId: quotationData.paymentMethodId,
            monthlyRate: paramMonthlyRate,
            currency: quotationData.currency,
            exchangeRate: dolarPrice,
            quoteStatus: quotationData.quoteStatus,
            quoteProductsDescription: quotationData.quoteProductsDescription,
            isKit: quotationData.isKit,
        };

        try {
            const responseQuote = await apiClient.post("/quotations", quotationToSave);
            newQuotationId = responseQuote.data.response._id;

            updateQuotationData({
                id: newQuotationId,
                date: today,
                monthlyRate: paramMonthlyRate,
                exchangeRate: dolarPrice,
            });
        } catch (error) {
            console.error("Error al guardar la cotización: ", error);
            return;
        }

        await Promise.resolve();
        // Procesar todos los productos y procesos
        const productPromises = quotationData.products.map(async (product) => {
            let newProductId = product.productId;

            const productToSave = {
                quotationId: newQuotationId,
                quantity: product.quantity,
                productionDays: product.productionDays,
                financingCost: product.financingCost,
                shipmentCost: product.shipmentCost,
                otherCost: product.otherCost,
                productDescription: product.productDescription,
                calculatedSellingPrice: product.calculatedSellingPrice,
                unitSellingPrice: product.unitSellingPrice,
                isManual: product.isManual,
                totalProductCost: product.totalProductCost,
                savedToDb: product.savedToDb,
                order: product.order,
            };

            try {
                const responseProduct = await apiClient.post('/products/', productToSave);
                newProductId = responseProduct.data.response._id;

                updateProduct({
                    productId: newProductId,
                    quotationId: newQuotationId,
                    savedToDb: true,
                }, product.productId);
            } catch (error) {
                console.error("Error al guardar el producto: ", error);
            }

            // Procesar todos los procesos del producto
            const processPromises = product.processes.map(async (process) => {
                const processToSave = {
                    productId: newProductId,
                    description: process.description,
                    supplierId: process.supplierId,
                    supplierPaymentMethodId: process.supplierPaymentMethodId,
                    daysToPayment: process.daysToPayment,
                    currency: process.currency,
                    adjustPercentage: process.adjustPercentage,
                    unitCost: process.unitCost,
                    fixedCost: process.fixedCost,
                    order: process.order,
                    subTotalProcessCost: +process.subTotalProcessCost,
                };

                try {
                    const responseProcess = await apiClient.post('/processes/', processToSave);
                    updateProcessInProduct({
                        processId: responseProcess.data.response._id,
                        productId: newProductId,
                        // tempunitCost: process.unitCost * quotationToSave.exchangeRate,
                        savedToDb: true,
                    }, process.processId);
                } catch (error) {
                    console.error("Error al guardar el proceso: ", error);
                }
            });
            await Promise.all(processPromises);
        });

        await Promise.all(productPromises);
        setShouldCalculate(true)
    };

    const handleDuplicateQuotation = () => {
        saveDuplicatedQuotation()
    }

    useEffect(() => {
        if (shouldCalculate) {
            calculateQuotation(false);
            setShouldCalculate(false); // Resetear el flag
            // Navegar a la nueva cotización
            navigate(`/detailed-quotation/${quotationData.id}`);
        }
    }, [shouldCalculate]);

    return (
        <TextButton
            text="Duplicar Cotización"
            onClick={handleDuplicateQuotation}
        />
    );
}

export default ButtonDuplicateQuotation;