import { apiClient } from "../config/axiosConfig.js";

export const saveQuotation = async (quotationData) => {
    console.log("Guardando cotización: ", quotationData);
    const quotationId = quotationData.id;
    const quotationToSave = {
        date: quotationData.date,
        customerId: quotationData.customerId,
        customerNote: quotationData.customerNote,
        paymentMethodId: quotationData.paymentMethodId,
        customerPaymentDetails: quotationData.customerPaymentDetails,
        monthlyRate: quotationData.monthlyRate,
        currency: quotationData.currency,
        exchangeRate: quotationData.exchangeRate,
        quoteStatus: quotationData.quoteStatus,
        quoteProductsDescription: quotationData.quoteProductsDescription,
        isKit: quotationData.isKit,
        calculateFinancing: quotationData.calculateFinancing,
    }
    try {
        const responseQuote = await toast.promise(
            apiClient.put(`/quotations/${quotationId}`, quotationToSave),
            {
                pending: "Guardando cotización...",
                success: "Cotización guardada correctamente",
                error: "Error al guardar la cotización",
            },
            {
                autoClose: 800,
            }
        )
        setIsSaved(true);
    } catch (error) {
        console.error("Error al guardar la cotización: ", error);
    }

    quotationData.products.map(async (product, index) => saveProduct(product, quotationId, index));

}


export const saveProduct = async (product, quotationId, index) => {
    let newProductId = product.productId;
    console.log("Guardando producto: ", product);
    const productToSave = {
        quotationId: quotationId,
        quantity: product.quantity,
        productionDays: product.productionDays,
        financingCost: product.financingCost,
        shipmentCost: product.shipmentCost,
        enteredShipmentCost: product.enteredShipmentCost,
        otherCost: product.otherCost,
        enteredOtherCost: product.enteredOtherCost,
        productDescription: product.productDescription,
        calculatedSellingPrice: product.calculatedSellingPrice,
        unitSellingPrice: product.unitSellingPrice,
        isManual: product.isManual,
        totalProductCost: product.totalProductCost,
        savedToDb: product.savedToDb,
        order: index,
    }
    try {
        if (product.savedToDb) {
            // Si el producto ya está guardado, lo actualizo
            const responseProduct = await apiClient.put(`/products/${product.productId}`, productToSave);
        } else {
            // Si el producto no está guardado, lo guardo
            const responseProduct = await apiClient.post('/products/', productToSave);
            newProductId = responseProduct.data.response._id;
            // Actualizo el ID del producto en el context
            updateProduct({
                productId: newProductId,
                savedToDb: true,
            }, product.productId);
        }
    } catch (error) {
        console.error("Error al guardar el producto: ", error);
    }
    

};


export const saveProcess = async (process, newProductId, index) => {
    const processToSave = {
        productId: newProductId,
        description: process.description,
        supplierId: process.supplierId,
        supplierPaymentMethodId: process.supplierPaymentMethodId,
        daysToPayment: process.daysToPayment,
        supplierPaymentDetails: process.supplierPaymentDetails,
        currency: process.currency,
        adjustPercentage: process.adjustPercentage,
        enteredUnitCost: process.enteredUnitCost,
        unitCost: process.unitCost,
        enteredFixedCost: process.enteredFixedCost,
        fixedCost: process.fixedCost,
        subTotalProcessCost: +process.subTotalProcessCost,
        order: index,
    }

    // guardo en la DB la información de Process
    try {
        if (process.savedToDb) {
            // Si el proceso ya está guardado, lo actualizo
            const responseProcess = await apiClient.put(`/processes/${process.processId}`, processToSave);
        } else {
            // Si el proceso no está guardado, lo guardo
            const responseProcess = await apiClient.post('/processes/', processToSave);
            // Actualizo el ID del proceso y el ID de Producto en el context
            updateProcessInProduct({
                processId: responseProcess.data.response._id,
                productId: newProductId,
                savedToDb: true,
            }, process.processId);
        }
    } catch (error) {
        console.error("Error al guardar el proceso: ", error);
    }

}