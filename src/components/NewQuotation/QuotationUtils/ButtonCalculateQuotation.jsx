import { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QuotationContext } from "../../../context/QuotationContext.jsx";
import { ParametersContext } from "../../../context/ParametersContext.jsx";
import { apiClient } from "../../../config/axiosConfig.js";
import TextButton from "../../Utils/TextButton";

const ButtonCalculateQuotation = () => {
    const { isSaved, calculateQuotation } = useContext(QuotationContext);
    
    // const { utilitiesTable, tax } = useContext(ParametersContext);
    // const [isUpdated, setIsUpdated] = useState(false);
    // // let calculateFinanceCost = false;
    // let productsTotalCost = []

    // // Se ejecuta cuando isUpdated cambia a `true`
    // useEffect(() => {
    //     if (isUpdated) {
    //         saveCalculatedQuotation();
    //         setIsUpdated(false); // Resetear el estado para futuras ejecuciones
    //     }
    // }, [isUpdated]);

    // const getQuotationTotalCost = () => {
    //     let totalQuotationCost = 0;
    //     // Paso por los productos y actualizo los Costos totales de los productos y el Costo total de la cotizacion
    //     // for (const product of quotationData.products) {
    //     quotationData.products.map((product) => {
    //         let totalProductCost = 0;
    //         let newProductDescription = ""
    //         // Paso por los procesos del producto y actualizo el subtotal y la descripción
    //         product.processes = product.processes.map((process) => {
    //             // Calculo el coeficiente de ajuste
    //             const adjust = +(1 + (Number(process.adjustPercentage) || 0) / 100)
    //             const newSubtotalProcessCost = +(((process.unitCost * product.quantity) * adjust) + process.fixedCost)
    //             totalProductCost += +newSubtotalProcessCost;
    //             if (newProductDescription === "") {
    //                 newProductDescription = process.description
    //             } else {
    //                 newProductDescription = newProductDescription + ", " + process.description
    //             }
    //             // Actualizo el subtotal del proceso en el context         
    //             updateProcessInProduct({ subTotalProcessCost: newSubtotalProcessCost }, process.processId);
    //             return {
    //                 ...process,
    //                 subTotalProcessCost: newSubtotalProcessCost,
    //             };
    //         });
    //         // Levanto los datos del producto del context
    //         totalProductCost =
    //             +(
    //                 +totalProductCost +
    //                 +product.shipmentCost +
    //                 +product.otherCost
    //             );
    //         // console.log("Costo total del Producto: ", totalProductCost, " y Financiero ", product.financingCost);
    //         // Sumo el costo del producto al costo de la cotización
    //         totalQuotationCost += totalProductCost;
    //         productsTotalCost.push({ id: product.productId, totalProductCost: totalProductCost, description: newProductDescription });
    //         // Actualizo el producto en el context
    //         updateProduct({
    //             // productId: product.productId,
    //             productDescription: newProductDescription,
    //         }, product.productId);
    //     // }
    //     });
    //     console.log("Products Total Cost: ", productsTotalCost);
    //     return totalQuotationCost;
    // };

    // const calculateItemFinanceCost = (totalProductCost, productionDays, paymentItem) => {
    //     const paymentDays = Number(paymentItem.days) || 0;
    //     const production = Number(productionDays) || 0;
    //     const totalDays = paymentDays + production;

    //     const monthsToFinance = paymentItem.downpayment ? (paymentDays / 30) : (totalDays / 30);
    //     const amountToFinance = totalProductCost * (paymentItem.percentage / 100);
    //     const monthlyRate = 1 + Number(quotationData.monthlyRate / 100)
    //     const itemFinanceCost = Number(
    //         (amountToFinance * Math.pow(monthlyRate, monthsToFinance))
    //         - amountToFinance
    //     );

    //     return itemFinanceCost;
    // }

    // const getSellingFinanceCost = async (subTotalCost, productionDays) => {;
    //     let sellFinanceCost = 0;
    //     let paymentDetails = quotationData.customerPaymentDetails;
    //     // try {
    //     //     const response = await apiClient.get(`/customer-payment-methods/${quotationData.paymentMethodId}`);
    //     //     paymentDetails = response.data.response.customer_payment_details;
    //     //     // console.log( "Sell Payment ID: ", quotationData.paymentMethodId ," Payment details: ", paymentDetails);
    //     // } catch (error) {
    //     //     console.log("Error: ", error);
    //     // }
    //     sellFinanceCost += paymentDetails.reduce((acc, element) => {
    //         return acc + calculateItemFinanceCost(subTotalCost, productionDays, element);
    //     }, 0);
    //     return sellFinanceCost;
    // };

    // const getBuyingFinanceCost = async (subTotalCost, supplierPaymentDetails, productionDays) => {
    //     console.log("Supplier Payment Details: ", supplierPaymentDetails);
    //     let buyFinanceCost = 0;
    //     let paymentDetails = supplierPaymentDetails;
        
    //     buyFinanceCost += paymentDetails.reduce((acc, element) => {
    //         return acc + calculateItemFinanceCost(subTotalCost, productionDays, element);
    //     }, 0);
    //     return buyFinanceCost;
    // };

    // const handleCalculateQuotation = async () => {
    //     for (const product of quotationData.products) {
    //         let totalProductCost = 0;
    //         let newProductDescription = "";
    //         let sellingFinanceCost = 0;
    //         let buyingFinanceCost = 0;
    //         let newFinancingCost = 0;
    
    //         const updatedProcesses = [];
    
    //         for (const process of product.processes) {
                
    //             const adjust = 1 + ((Number(process.adjustPercentage) || 0) / 100);
    //             const newSubtotalProcessCost = ((process.unitCost * product.quantity) * adjust) + process.fixedCost;
    //             totalProductCost += newSubtotalProcessCost;
    
    //             newProductDescription += newProductDescription ? `, ${process.description}` : process.description;
                
    //             // Calculo costo financiero de cada proceso
    //             const sellCost = await getSellingFinanceCost(newSubtotalProcessCost, product.productionDays);
    //             sellingFinanceCost += sellCost;
    //             console.log("process for finance cost: ", process)
    //             // const buyCost = await getBuyingFinanceCost(newSubtotalProcessCost, process.supplierPaymentMethodId, product.productionDays);
    //             const buyCost = await getBuyingFinanceCost(newSubtotalProcessCost, process.supplierPaymentDetails, product.productionDays);
    //             buyingFinanceCost += buyCost;
                
    //             // Actualizar el costo del proceso en el producto
    //             updateProcessInProduct({ subTotalProcessCost: newSubtotalProcessCost }, process.processId);
    
    //             updatedProcesses.push({
    //                 ...process,
    //                 subTotalProcessCost: newSubtotalProcessCost,
    //             });
    //         }
    //         toast.info(`Calculando el costo del producto: ${newProductDescription}`, {
    //             position: "top-center",
    //             autoClose: 1000
    //         })

    //         if (quotationData.calculateFinancing) {
    //             // Calculo el costo financiero del producto
    //             if(sellingFinanceCost > buyingFinanceCost) {
    //                 newFinancingCost = sellingFinanceCost - buyingFinanceCost;
    //                 console.log("Selling Finance Cost: ", sellingFinanceCost, " Buying Finance Cost: ", buyingFinanceCost, " New Financing Cost: ", newFinancingCost);
    //             } else {
    //                 // console.log("Buying Finance Cost: ", buyingFinanceCost, " Selling Finance Cost: ", sellingFinanceCost, " New Financing Cost: ", newFinancingCost);
    //             } 
    //         } else {
    //             newFinancingCost = 0;
    //         }

    //         const finalCost = totalProductCost + product.shipmentCost + product.otherCost;
    //         const unitSellingPrice = parseFloat(calculateUnitSellingPrice(finalCost, newFinancingCost, product.quantity));
    //         const pesosPrice = parseFloat((unitSellingPrice * quotationData.exchangeRate).toFixed(0));
    //         // console.log("Final Product Cost: ", finalCost, " - ", product.productId , " New Financing Cost: ", newFinancingCost);
    //         updateProduct({
    //             productId: product.productId,
    //             productDescription: newProductDescription,
    //             financingCost: newFinancingCost,
    //             unitSellingPrice,
    //             pesosPrice,
    //             totalProductCost: finalCost,
    //         }, product.productId);
    
    //         product.processes = updatedProcesses; // si necesitás actualizar el array localmente
    //     }
    
    //     setIsUpdated(true);
    // };

    // const handleCalculateSetQuotation = async () => {
    //     const quotationTotalCost = getQuotationTotalCost();
    //     // console.log("Calculated Quotation Total Cost: ", quotationTotalCost);
    //     // console.log("Products Total Cost: ", productsTotalCost);
    //     // Calculo las utilidades deseadas de los parametros generales
    //     const targetUtilities = utilitiesTable.find((utility) => quotationTotalCost < utility.upTo);

    //     for (const product of quotationData.products) {
    //         // Calculo las utilidades deseadas de los parametros generales
    //         const productCost = productsTotalCost.find((el) => el.id === product.productId);

    //         // Calculo el costo Financiero
    //         let totalProductCost = 0;
    //         let sellingFinanceCost = 0;
    //         let buyingFinanceCost = 0;
    //         let newFinancingCost = 0;
    //         let newProductDescription = "";
    //         const updatedProcesses = [];
        
    //         for (const process of product.processes) {
    //             // console.log("For de process: ",process)
    //             const adjust = 1 + ((Number(process.adjustPercentage) || 0) / 100);
    //             const newSubtotalProcessCost = ((process.unitCost * product.quantity) * adjust) + process.fixedCost;
    //             totalProductCost += newSubtotalProcessCost;
    //             newProductDescription += newProductDescription ? `, ${process.description}` : process.description;

    //             // Calculo costo financiero de cada proceso
    //             // console.log("Calculo el costo financiero del proceso: ", process.description, " con el costo: ", newSubtotalProcessCost);
    //             const sellCost = await getSellingFinanceCost(newSubtotalProcessCost, product.productionDays);
    //             sellingFinanceCost += sellCost;

    //             const buyCost = await getBuyingFinanceCost(newSubtotalProcessCost, process.supplierPaymentMethodId, product.productionDays);
    //             buyingFinanceCost += buyCost;
    //         }
    //         toast.info(`Calculando el costo del producto: ${newProductDescription}`, {
    //             position: "top-center",
    //             autoClose: 1000
    //         })

    //         if (quotationData.calculateFinancing) {
    //             // Calculo el costo financiero del producto
    //             if(sellingFinanceCost > buyingFinanceCost) {
    //                 newFinancingCost = sellingFinanceCost - buyingFinanceCost;
    //                 // console.log("Selling Finance Cost: ", sellingFinanceCost, " Buying Finance Cost: ", buyingFinanceCost, " New Financing Cost: ", newFinancingCost);
    //             } else {
    //                 // console.log("Buying Finance Cost: ", buyingFinanceCost, " Selling Finance Cost: ", sellingFinanceCost, " New Financing Cost: ", newFinancingCost);
    //             } 
    //         } else {
    //             newFinancingCost = 0;
    //         }

    //         console.log("Total Product Cost: ", totalProductCost, " - ", productCost.totalProductCost , " New Financing Cost: ", newFinancingCost);
    //         const unitSellingPrice = calculateKitUniteSellingPrice(productCost.totalProductCost, newFinancingCost, product.quantity, targetUtilities, quotationTotalCost);
    //         const pesosPrice = parseFloat((unitSellingPrice * quotationData.exchangeRate).toFixed(0));

    //         updateProduct({
    //             productId: product.productId,
    //             productDescription: newProductDescription,
    //             unitSellingPrice: unitSellingPrice,
    //             financingCost: newFinancingCost,
    //             totalProductCost: productCost.totalProductCost,
    //             pesosPrice: pesosPrice
    //         }, product.productId);

    //         // console.log("Precio unitario Calculado: ", unitSellingPrice, " Pesos Price: ", pesosPrice);
    //     // })
    //     }
    //     setIsUpdated(true);
    // };

    // const calculateUnitSellingPrice = (totalProductCost, financingCost, quantity) => {
    //     const targetUtility = utilitiesTable.find((utility) => totalProductCost < utility.upTo);
    //     let minUtilitie = targetUtility.productMinimun;
    //     let percentageUtilitie = targetUtility.productUtilitie / 100;
    //     // console.log("Target Utility: ", targetUtility, " Min Utilitie: ", minUtilitie, " Percentage Utilitie: ", percentageUtilitie);
    //     // console.log("Total Product Cost: ", totalProductCost);

    //     // calculo utilidad por porjentaje
    //     let newNetProductCost = parseFloat(totalProductCost / (1 - (percentageUtilitie + tax)))
    //     // Si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
    //     if (newNetProductCost * percentageUtilitie < minUtilitie) {
    //         // si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
    //         // console.log("Utilidad por porcentaje: ", newNetProductCost * percentageUtilitie, " - ", percentageUtilitie, " vs Costo total por minimo: ", minUtilitie);
    //         newNetProductCost = parseFloat((totalProductCost + minUtilitie) / (1 - tax))
    //     }

    //     // Calculo el costo financiero
    //     const totalFinancingCost = parseFloat(financingCost / (1 - tax));
    //     // paso el costo total a costo unitario
    //     const unitSellingPrice = parseFloat((newNetProductCost + totalFinancingCost) / quantity);
    //     return unitSellingPrice;
    // };

    // const calculateKitUniteSellingPrice = (totalProductCost, financingCost, quantity, targetUtilities, totalQuotationCost) => {
    //     // console.log("Calculando KIT: ", totalProductCost, financingCost);
    //     // Calculo las utilidades deseadas de los parametros generales
    //     // calculo el minutilitie que le corresponde a este producto por regla de 3 simple
    //     let minUtilitie = (totalProductCost / totalQuotationCost) * targetUtilities.kitMinimun
    //     let percentageUtilitie = targetUtilities.kitUtilitie / 100;
    //     // console.log("Utilidad por % Target: ", percentageUtilitie, " minima: ", minUtilitie);
    //     const totalFinancingCost = parseFloat(financingCost / (1 - tax))

    //     // calculo utilidad por porjentaje
    //     let newNetProductCost = parseFloat(totalProductCost / (1 - (percentageUtilitie + tax)))

    //     // Si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
    //     if (newNetProductCost * percentageUtilitie < minUtilitie) {
    //         // si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
    //         // console.log("El Precio total por porcentaje es menor al minimo, lo cambio por el minimo");
    //         // console.log("Utilidad por porcentaje: ", newNetProductCost * percentageUtilitie, " vs Costo total por minimo: ", minUtilitie);
    //         newNetProductCost = parseFloat((totalProductCost + minUtilitie) / (1 - tax))
    //     }

    //     // paso el costo total a costo unitario
    //     const unitSellingPrice = parseFloat((newNetProductCost + totalFinancingCost) / quantity);
    //     return unitSellingPrice;
    // };

    // const saveCalculatedQuotation = async () => {
    //     console.log("Quotation to save: ", quotationData);
    //     // preparo la informacion de Quotation para guardar en la DB
    //     const quotationId = quotationData.id;
    //     const quotationToSave = {
    //         date: quotationData.date,
    //         customerId: quotationData.customerId,
    //         paymentMethodId: quotationData.paymentMethodId,
    //         customerPaymentDetails: quotationData.customerPaymentDetails,
    //         monthlyRate: quotationData.monthlyRate,
    //         currency: quotationData.currency,
    //         exchangeRate: quotationData.exchangeRate,
    //         quoteStatus: quotationData.quoteStatus,
    //         quoteProductsDescription: quotationData.quoteProductsDescription,
    //         isKit: quotationData.isKit,
    //         calculateFinancing: quotationData.calculateFinancing,
    //     }
    //     // Actualizo en la DB la información de Quotation en la BD
    //     try {
    //         const responseQuote = await toast.promise(
    //             apiClient.put(`/quotations/${quotationId}`, quotationToSave),
    //             {
    //                 pending: "Guardando cotización...",
    //                 success: "Cotización guardada correctamente",
    //                 error: "Error al guardar la cotización",
    //             },
    //             {
    //                 autoClose: 800,
    //             }
    //         )
    //         console.log("Cotización guardada: ", responseQuote.data);
    //         setIsSaved(true);
    //     } catch (error) {
    //         console.error("Error al guardar la cotización: ", error);
    //     }

    //     // Paso por todos los productos
    //     quotationData.products.map(async (product, index) => {
    //         let newProductId = product.productId;
    //         // preparo la informacion de Product para guardar en la DB
    //         const productToSave = {
    //             quotationId: quotationId,
    //             quantity: product.quantity,
    //             productionDays: product.productionDays,
    //             financingCost: product.financingCost,
    //             shipmentCost: product.shipmentCost,
    //             otherCost: product.otherCost,
    //             productDescription: product.productDescription,
    //             unitSellingPrice: product.unitSellingPrice,
    //             totalProductCost: product.totalProductCost,
    //             savedToDb: product.savedToDb,
    //             order: index,
    //         }

    //         // guardo en la DB la información de Product
    //         try {
    //             if (product.savedToDb) {
    //                 // Si el producto ya está guardado, lo actualizo
    //                 const responseProduct = await apiClient.put(`/products/${product.productId}`, productToSave);
    //             } else {
    //                 // Si el producto no está guardado, lo guardo
    //                 const responseProduct = await apiClient.post('/products/', productToSave);
    //                 newProductId = responseProduct.data.response._id;
    //                 // Actualizo el ID del producto en el context
    //                 updateProduct({
    //                     productId: newProductId,
    //                     savedToDb: true,
    //                 }, product.productId);
    //             }
    //         } catch (error) {
    //             console.error("Error al guardar el producto: ", error);
    //         }
    //         product.processes.map(async (process, index) => {
    //             // preparo la informacion de Process para guardar en la DB con el ID del producto
    //             const processToSave = {
    //                 productId: newProductId,
    //                 description: process.description,
    //                 supplierId: process.supplierId,
    //                 supplierPaymentMethodId: process.supplierPaymentMethodId,
    //                 daysToPayment: process.daysToPayment,
    //                 supplierPaymentDetails: process.supplierPaymentDetails,
    //                 currency: process.currency,
    //                 adjustPercentage: process.adjustPercentage,
    //                 unitCost: process.unitCost,
    //                 fixedCost: process.fixedCost,
    //                 subTotalProcessCost: +process.subTotalProcessCost,
    //                 order: index,
    //             }
    //             // guardo en la DB la información de Process
    //             try {
    //                 if (process.savedToDb) {
    //                     // Si el proceso ya está guardado, lo actualizo
    //                     const responseProcess = await apiClient.put(`/processes/${process.processId}`, processToSave);
    //                 } else {
    //                     // Si el proceso no está guardado, lo guardo
    //                     const responseProcess = await apiClient.post('/processes/', processToSave);
    //                     // Actualizo el ID del proceso y el ID de Producto en el context
    //                     updateProcessInProduct({
    //                         processId: responseProcess.data.response._id,
    //                         productId: newProductId,
    //                         savedToDb: true,
    //                     }, process.processId);
    //                 }
    //             } catch (error) {
    //                 console.error("Error al guardar el proceso: ", error);
    //             }
    //         });
    //     });
    // };

    // const calculateQuotation = () => {
    //     if (quotationData.isKit) {
    //         handleCalculateSetQuotation();
    //     } else {
    //         handleCalculateQuotation();
    //     }
    //     setIsSaved(true)
    // }

    return (
        <TextButton
            text={isSaved ? "Guardado" : "Calcular y Guardar"}
            onClick={calculateQuotation}
        />
    );
}

export default ButtonCalculateQuotation;
