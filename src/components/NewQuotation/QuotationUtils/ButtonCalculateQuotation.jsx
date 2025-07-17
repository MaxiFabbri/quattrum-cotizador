import { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QuotationContext } from "../../../context/QuotationContext.jsx";
import { ParametersContext } from "../../../context/ParametersContext.jsx";
import { apiClient } from "../../../config/axiosConfig.js";
import TextButton from "../../Utils/TextButton";

// cambio de prueba

const ButtonCalculateQuotation = () => {
    const { quotationData, updateProduct, updateProcessInProduct, isSaved, setIsSaved } = useContext(QuotationContext);
    const { utilitiesTable, tax } = useContext(ParametersContext);
    const [isUpdated, setIsUpdated] = useState(false);
    let productsTotalCost = []

    // Se ejecuta cuando isUpdated cambia a `true`
    useEffect(() => {
        if (isUpdated) {
            saveCalculatedQuotation();
            setIsUpdated(false); // Resetear el estado para futuras ejecuciones
        }
    }, [isUpdated]);

    const getQuotationTotalCost = () => {
        var totalQuotationCost = 0;
        // Paso por los productos y actualizo los Costos totales de los productos y el Costo total de la cotizacion
        quotationData.products.map((product) => {
            var totalProductCost = 0;
            var newProductDescription = ""
            // Paso por los procesos del producto y actualizo el subtotal y la descripción
            product.processes = product.processes.map((process) => {
                // Calculo el coeficiente de ajuste
                const adjust = +(1 + (Number(process.adjustPercentage) || 0) / 100)
                const newSubtotalProcessCost = +(((process.unitCost * product.quantity) * adjust) + process.fixedCost)
                totalProductCost += +newSubtotalProcessCost;
                if (newProductDescription === "") {
                    newProductDescription = process.description
                } else {
                    newProductDescription = newProductDescription + ", " + process.description
                }
                // Actualizo el subtotal del proceso en el context         
                updateProcessInProduct({ subTotalProcessCost: newSubtotalProcessCost }, process.processId);
                return {
                    ...process,
                    subTotalProcessCost: newSubtotalProcessCost,
                };
            });
            // Levanto los datos del producto del context
            totalProductCost =
                +(
                    +totalProductCost +
                    +product.shipmentCost +
                    +product.otherCost
                );
            
            // console.log("Costo total del Producto: ", totalProductCost, " y Financiero ", product.financingCost);
            // Sumo el costo del producto al costo de la cotización
            totalQuotationCost += totalProductCost;
            console.log("Total Quotation Cost: ", totalQuotationCost);
            console.log("Total Product Cost: ", totalProductCost);
            console.log("Product ID: ", product.productId);
            productsTotalCost.push({id:product.productId, totalProductCost: totalProductCost, description: newProductDescription});
            // Actualizo el producto en el context
            updateProduct({
                productId: product.productId,
                productDescription: newProductDescription,
            }, product.productId);

        });
        return totalQuotationCost;
    };

    const handleCalculateQuotation = () => {
        quotationData.products.map((product) => {
            var totalProductCost = 0;
            var newProductDescription = ""
            product.processes = product.processes.map((process) => {
                // Calculo el coeficiente de ajuste
                const adjust = +(1 + (Number(process.adjustPercentage) || 0) / 100)
                const newSubtotalProcessCost = +(((process.unitCost * product.quantity) * adjust) + process.fixedCost)
                totalProductCost += +newSubtotalProcessCost;
                if (newProductDescription === "") {
                    newProductDescription = process.description
                } else {
                    newProductDescription = newProductDescription + ", " + process.description
                }
                // Actualizo el subtotal del proceso en el context         
                updateProcessInProduct({ subTotalProcessCost: newSubtotalProcessCost }, process.processId);
                return {
                    ...process,
                    subTotalProcessCost: newSubtotalProcessCost,
                };
            });
            // Levanto los datos del producto del context
            totalProductCost =
                +(
                    +totalProductCost +
                    +product.shipmentCost +
                    +product.otherCost
                );

            const unitSellingPrice = parseFloat(calculateUnitSellingPrice(totalProductCost, product.financingCost, product.quantity));
            const pesosPrice = parseFloat((unitSellingPrice * quotationData.exchangeRate).toFixed(0));
            updateProduct({
                productId: product.productId,
                productDescription: newProductDescription,
                unitSellingPrice: unitSellingPrice,
                pesosPrice: pesosPrice
            }, product.productId);
        });
        setIsUpdated(true);
    };

    const handleCalculateSetQuotation = () => {
        const  quotationTotalCost = getQuotationTotalCost();
        
        // Calculo las utilidades deseadas de los parametros generales
        const targetUtilities = utilitiesTable.find((utility) => quotationTotalCost < utility.upTo);
        
        quotationData.products.map((product) => {
            // Calculo las utilidades deseadas de los parametros generales
            const productCost = productsTotalCost.find((el) => el.id === product.productId);
            const unitSellingPrice = calculateKitUniteSellingPrice(productCost.totalProductCost, product.financingCost, product.quantity, targetUtilities, quotationTotalCost);
            const pesosPrice = parseFloat((unitSellingPrice * quotationData.exchangeRate).toFixed(0));
            const newProductDescription = productCost.description;
            updateProduct({
                productId: product.productId,
                productDescription: newProductDescription,
                unitSellingPrice: unitSellingPrice,
                pesosPrice: pesosPrice
            }, product.productId);

            console.log("Precio unitario Calculado: ", unitSellingPrice, " Pesos Price: ", pesosPrice);
        })
        setIsUpdated(true);
    };

    const calculateKitUniteSellingPrice = (totalProductCost, financingCost, quantity, targetUtilities, totalQuotationCost) => {
        // Calculo las utilidades deseadas de los parametros generales
        // calculo el minutilitie que le corresponde a este producto por regla de 3 simple
        let minUtilitie = (totalProductCost / totalQuotationCost) * targetUtilities.kitMinimun
        let percentageUtilitie = targetUtilities.kitUtilitie / 100;
        console.log("Utilidad por % Target: ", percentageUtilitie , " minima: ", minUtilitie);
        const totalFinancingCost = parseFloat(financingCost /(1 - tax))
        
        // calculo utilidad por porjentaje
        let newNetProductCost = parseFloat(totalProductCost / (1 - (percentageUtilitie + tax)))

        // Si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
        if (newNetProductCost * percentageUtilitie < minUtilitie) {
            // si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
            console.log("El Precio total por porcentaje es menor al minimo, lo cambio por el minimo");
            console.log("Utilidad por porcentaje: ", newNetProductCost * percentageUtilitie, " vs Costo total por minimo: ", minUtilitie);
            newNetProductCost = parseFloat((totalProductCost + minUtilitie) / (1 - tax))
        }

        // paso el costo total a costo unitario
        const unitSellingPrice = parseFloat((newNetProductCost + totalFinancingCost) / quantity);
        return unitSellingPrice;
    }

    const calculateUnitSellingPrice = (totalProductCost, financingCost, quantity) => {
        const targetUtility = utilitiesTable.find((utility) => totalProductCost < utility.upTo);
        let minUtilitie = targetUtility.productMinimun;
        let percentageUtilitie = targetUtility.productUtilitie / 100;
        const totalFinancingCost = parseFloat(financingCost /(1 - tax))
        // calculo utilidad por porjentaje
        let newNetProductCost = parseFloat(totalProductCost / (1 - (percentageUtilitie + tax)))
        // Si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
        if (newNetProductCost * percentageUtilitie < minUtilitie) {
            // si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
            console.log("Utilidad por porcentaje: ", newNetProductCost * percentageUtilitie," - ", percentageUtilitie, " vs Costo total por minimo: ", minUtilitie);
            newNetProductCost = parseFloat((totalProductCost + minUtilitie) / (1 - tax))
        }

        // paso el costo total a costo unitario
        const unitSellingPrice = parseFloat((newNetProductCost + totalFinancingCost) / quantity);
        return unitSellingPrice;
    };

    const saveCalculatedQuotation = async () => {
        console.log("Quotation to save: ", quotationData);
        // preparo la informacion de Quotation para guardar en la DB
        const quotationId = quotationData.id;
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
        // Actualizo en la DB la información de Quotation en la BD
        try {
            const responseQuote = await toast.promise(
                apiClient.put(`/quotations/${quotationId}`, quotationToSave),
                {
                pending: "Guardando cotización...",
                success: "Cotización guardada correctamente",
                error: "Error al guardar la cotización",
                }
                )
            console.log("Cotización guardada: ", responseQuote.data);

            setIsSaved(true);
        } catch (error) {
            console.error("Error al guardar la cotización: ", error);
        }

        // Paso por todos los productos
        quotationData.products.map(async (product) => {
            let newProductId = product.productId;
            // preparo la informacion de Product para guardar en la DB
            const productToSave = {
                quotationId: quotationId,
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
            product.processes.map(async (process) => {
                // preparo la informacion de Process para guardar en la DB con el ID del producto
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
                    subTotalProcessCost: +process.subTotalProcessCost,
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
            });
        });
    }

    const testCalculateQuotation = () => {
        if (isSaved) return;
        if (quotationData.isKit) {
            console.log("Calculando cotización KIT");
            handleCalculateSetQuotation();
        } else {
            console.log("Calculando cotización NORMAL");
            handleCalculateQuotation();
        }
        setIsSaved(true)
        console.log("Cotizacion Guardada, isSaved: ", isSaved);
    }
    

    return (
        <TextButton
            text={isSaved ? "Guardado" : "Guardar"}
            hide={isSaved}
            onClick={testCalculateQuotation}
        />
    );
}

export default ButtonCalculateQuotation;
