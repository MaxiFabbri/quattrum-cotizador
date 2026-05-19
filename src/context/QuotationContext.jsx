import { createContext, useState, useEffect, useContext, use } from "react";
import { apiClient } from "../config/axiosConfig.js";
import { ParametersContext } from "./ParametersContext.jsx";
import { toast } from "react-toastify";
import { validateQuotation } from "../components/NewQuotation/QuotationUtils/validateQuotation.jsx";


export const QuotationContext = createContext();

export const QuotationProvider = ({ children }) => {
    const { utilitiesTable, tax } = useContext(ParametersContext);
    const [isUpdated, setIsUpdated] = useState(false);
    const [isSaved, setIsSaved] = useState(true);
    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    let productsTotalCost = []

    const initialQuotationDataState = {
        id: "",
        date: "",
        customerId: "",
        customerName: "",
        customerNote: "",
        paymentMethodId: "",
        paymentMethodName: "",
        customerPaymentDetails: [],
        paymentDaysToCollect: 0,
        monthlyRate: 0,
        currency: "Peso",
        exchangeRate: 0,
        quoteStatus: "Cotizado",
        quoteUnitSellingPrice: 0,
        quoteProductsDescription: "",
        isKit: false,
        calculateFinancing: true,
        products: [],
    };

    const [quotationData, setQuotationData] = useState(initialQuotationDataState);
    // Se ejecuta cuando isUpdated cambia a `true`
    useEffect(() => {
        if (isUpdated) {
            saveQuotation();
            setIsUpdated(false); // Resetear el estado para futuras ejecuciones
        }
    }, [isUpdated]);

    useEffect(() => {
        console.log("Quotation Data actualizado: ", quotationData);
    }, [quotationData]);

    const getQuotationTotalCost = () => {
        let totalQuotationCost = 0;
        // Paso por los productos y actualizo los Costos totales de los productos y el Costo total de la cotizacion
        // for (const product of quotationData.products) {
        quotationData.products.map((product) => {
            // Actualizo los costos del producto en base a TC
            product.shipmentCost = +product.enteredShipmentCost / quotationData.exchangeRate;
            product.otherCost = +product.enteredOtherCost / quotationData.exchangeRate;

            let totalProductCost = 0;
            let newProductDescription = ""
            // Paso por los procesos del producto y actualizo el subtotal y la descripción
            product.processes = product.processes.map((process) => {
                // Actualizo los costos del proceso en la moneda de la cotización
                process.unitCost = +process.enteredUnitCost / (process.currency === "Peso" ? quotationData.exchangeRate : 1);
                process.fixedCost = +process.enteredFixedCost / (process.currency === "Peso" ? quotationData.exchangeRate : 1);
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
                updateProcessInProduct({ 
                    subTotalProcessCost: newSubtotalProcessCost,
                    unitCost: process.unitCost,
                    fixedCost: process.fixedCost 
                }, process.processId);
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
            // Sumo el costo del producto al costo de la cotización
            totalQuotationCost += totalProductCost;
            productsTotalCost.push({ id: product.productId, totalProductCost: totalProductCost, description: newProductDescription });
            // Actualizo el producto en el context
            updateProduct({
                productDescription: newProductDescription,
                shipmentCost: product.shipmentCost,
                otherCost: product.otherCost
            }, product.productId);
            // }
        });
        return totalQuotationCost;
    };

    const calculateItemFinanceCost = (totalProductCost, productionDays, paymentItem) => {
        const paymentDays = Number(paymentItem.days) || 0;
        const production = Number(productionDays) || 0;
        const totalDays = paymentDays + production;
        const monthsToFinance = paymentItem.downpayment ? (paymentDays / 30) : (totalDays / 30);
        const amountToFinance = totalProductCost * (paymentItem.percentage / 100);
        const monthlyRate = 1 + Number(quotationData.monthlyRate / 100)
        const itemFinanceCost = Number(
            (amountToFinance * Math.pow(monthlyRate, monthsToFinance))
            - amountToFinance
        );

        return itemFinanceCost;
    }

    const getSellingFinanceCost = async (subTotalCost, productionDays) => {
        let sellFinanceCost = 0;
        let paymentDetails = quotationData.customerPaymentDetails;
        sellFinanceCost += paymentDetails.reduce((acc, element) => {
            return acc + calculateItemFinanceCost(subTotalCost, productionDays, element);
        }, 0);
        return sellFinanceCost;
    };
    const getBuyingFinanceCost = async (subTotalCost, supplierPaymentDetails, productionDays) => {
        let buyFinanceCost = 0;
        let paymentDetails = supplierPaymentDetails;
        buyFinanceCost += paymentDetails.reduce((acc, element) => {
            return acc + calculateItemFinanceCost(subTotalCost, productionDays, element);
        }, 0);
        return buyFinanceCost;
    };

    const handleCalculateQuotation = async (recalculateAll) => {
        for (const product of quotationData.products) {
            let totalProductCost = 0;
            let newProductDescription = "";
            let sellingFinanceCost = 0;
            let buyingFinanceCost = 0;
            let newFinancingCost = 0;

            const updatedProcesses = [];

            for (const process of product.processes) {
                // Actualizo los costos del proceso en la moneda de la cotización
                process.unitCost = +process.enteredUnitCost / (process.currency === "Peso" ? quotationData.exchangeRate : 1);
                process.fixedCost = +process.enteredFixedCost / (process.currency === "Peso" ? quotationData.exchangeRate : 1);

                const adjust = 1 + ((Number(process.adjustPercentage) || 0) / 100);
                const newSubtotalProcessCost = ((process.unitCost * product.quantity) * adjust) + process.fixedCost;
                totalProductCost += newSubtotalProcessCost;

                newProductDescription += newProductDescription ? `, ${process.description}` : process.description;
                // Calculo costo financiero de cada proceso
                const sellCost = await getSellingFinanceCost(newSubtotalProcessCost, product.productionDays);
                sellingFinanceCost += sellCost;
                const buyCost = await getBuyingFinanceCost(newSubtotalProcessCost, process.supplierPaymentDetails, product.productionDays);
                buyingFinanceCost += buyCost;
                // console.log("Proceso: ", process.description, +(sellCost - buyCost).toFixed(2), "Selling Finance cost: ", sellCost, " Buying Finance Cost: ", buyCost);

                // Actualizar el costo del proceso en el producto
                updateProcessInProduct({ subTotalProcessCost: newSubtotalProcessCost }, process.processId);

                updatedProcesses.push({
                    ...process,
                    subTotalProcessCost: newSubtotalProcessCost,
                });
            }
            toast.info(`Calculando el costo del producto: ${newProductDescription}`, {
                position: "top-center",
                autoClose: 1000
            })

            if (quotationData.calculateFinancing) {
                // Calculo el costo financiero del producto
                if (sellingFinanceCost > buyingFinanceCost) {
                    newFinancingCost = sellingFinanceCost - buyingFinanceCost;
                    // console.log("Selling Finance Cost: ", sellingFinanceCost, " Buying Finance Cost: ", buyingFinanceCost, " New Financing Cost: ", newFinancingCost);
                }
            } else {
                newFinancingCost = 0;
            }
            // Actualizo los costos del producto en base a TC
            product.shipmentCost = +product.enteredShipmentCost / quotationData.exchangeRate;
            product.otherCost = +product.enteredOtherCost / quotationData.exchangeRate;

            const finalCost = totalProductCost + product.shipmentCost + product.otherCost;
            const calculatedSellingPrice = parseFloat(calculateUnitSellingPrice(finalCost, newFinancingCost, product.quantity));
            const pesosPrice = parseFloat((calculatedSellingPrice * quotationData.exchangeRate).toFixed(0));

            if (!recalculateAll && product.isManual) {
                updateProduct({
                    productId: product.productId,
                    productDescription: newProductDescription,
                    calculatedSellingPrice,
                    unitSellingPrice: product.unitSellingPrice,
                    isManual: product.isManual,
                    financingCost: newFinancingCost,
                    totalProductCost: finalCost,
                    pesosPrice: pesosPrice
                }, product.productId);
            } else {
                updateProduct({
                    productId: product.productId,
                    productDescription: newProductDescription,
                    calculatedSellingPrice,
                    unitSellingPrice: calculatedSellingPrice,
                    isManual: false,
                    financingCost: newFinancingCost,
                    totalProductCost: finalCost,
                    pesosPrice: pesosPrice
                }, product.productId);
            }

            product.processes = updatedProcesses;
        }

        setIsUpdated(true);
    };

    const handleCalculateSetQuotation = async (recalculateAll) => {
        const quotationTotalCost = getQuotationTotalCost();
        // Calculo las utilidades deseadas de los parametros generales
        const targetUtilities = utilitiesTable.find((utility) => quotationTotalCost < utility.upTo);

        for (const product of quotationData.products) {
            // Calculo las utilidades deseadas de los parametros generales
            const productCost = productsTotalCost.find((el) => el.id === product.productId);

            // Calculo el costo Financiero
            let totalProductCost = 0;
            let sellingFinanceCost = 0;
            let buyingFinanceCost = 0;
            let newFinancingCost = 0;
            let newProductDescription = "";
            const updatedProcesses = [];

            for (const process of product.processes) {

                const adjust = 1 + ((Number(process.adjustPercentage) || 0) / 100);
                const newSubtotalProcessCost = ((process.unitCost * product.quantity) * adjust) + process.fixedCost;
                totalProductCost += newSubtotalProcessCost;
                newProductDescription += newProductDescription ? `, ${process.description}` : process.description;

                // Calculo costo financiero de cada proceso
                const sellCost = await getSellingFinanceCost(newSubtotalProcessCost, product.productionDays);
                sellingFinanceCost += sellCost;
                const buyCost = await getBuyingFinanceCost(newSubtotalProcessCost, process.supplierPaymentDetails, product.productionDays);
                buyingFinanceCost += buyCost;

                // console.log("Proceso: ", process.description, +(sellCost - buyCost).toFixed(2), "Selling Finance cost: ", sellCost, " Buying Finance Cost: ", buyCost);
            }
            toast.info(`Calculando el costo del producto: ${newProductDescription}`, {
                position: "top-center",
                autoClose: 1000
            })

            if (quotationData.calculateFinancing) {
                // Calculo el costo financiero del producto
                if (sellingFinanceCost > buyingFinanceCost) {
                    newFinancingCost = sellingFinanceCost - buyingFinanceCost;
                }
            } else {
                newFinancingCost = 0;
            }

            const calculatedSellingPrice = calculateKitUniteSellingPrice(productCost.totalProductCost, newFinancingCost, product.quantity, targetUtilities, quotationTotalCost);
            const pesosPrice = parseFloat((calculatedSellingPrice * quotationData.exchangeRate).toFixed(0));

            if (!recalculateAll) {
                updateProduct({
                    productId: product.productId,
                    productDescription: newProductDescription,
                    calculatedSellingPrice,
                    unitSellingPrice: product.unitSellingPrice,
                    isManual: product.isManual,
                    financingCost: newFinancingCost,
                    totalProductCost: productCost.totalProductCost,
                    pesosPrice: pesosPrice
                }, product.productId);
            } else {
                updateProduct({
                    productId: product.productId,
                    productDescription: newProductDescription,
                    calculatedSellingPrice,
                    unitSellingPrice: calculatedSellingPrice,
                    isManual: false,
                    financingCost: newFinancingCost,
                    totalProductCost: productCost.totalProductCost,
                    pesosPrice: pesosPrice
                }, product.productId);
            }

        }
        setIsUpdated(true);
    };

    const calculateUnitSellingPrice = (totalProductCost, financingCost, quantity) => {
        const targetUtility = utilitiesTable.find((utility) => totalProductCost < utility.upTo);
        let minUtilitie = targetUtility.productMinimun;
        let percentageUtilitie = targetUtility.productUtilitie / 100;

        // calculo utilidad por porjentaje
        let newNetProductCost = parseFloat(totalProductCost / (1 - (percentageUtilitie + tax)))
        // Si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
        if (newNetProductCost * percentageUtilitie < minUtilitie) {
            // si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
            newNetProductCost = parseFloat((totalProductCost + minUtilitie) / (1 - tax))
        }

        // Calculo el costo financiero
        const totalFinancingCost = parseFloat(financingCost / (1 - tax));
        // paso el costo total a costo unitario
        const unitSellingPrice = parseFloat((newNetProductCost + totalFinancingCost) / quantity);
        return unitSellingPrice;
    };

    const calculateKitUniteSellingPrice = (totalProductCost, financingCost, quantity, targetUtilities, totalQuotationCost) => {

        // Calculo las utilidades deseadas de los parametros generales
        // calculo el minutilitie que le corresponde a este producto por regla de 3 simple
        let minUtilitie = (totalProductCost / totalQuotationCost) * targetUtilities.kitMinimun
        let percentageUtilitie = targetUtilities.kitUtilitie / 100;
        const totalFinancingCost = parseFloat(financingCost / (1 - tax))

        // calculo utilidad por porjentaje
        let newNetProductCost = parseFloat(totalProductCost / (1 - (percentageUtilitie + tax)))

        // Si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
        if (newNetProductCost * percentageUtilitie < minUtilitie) {
            // si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
            newNetProductCost = parseFloat((totalProductCost + minUtilitie) / (1 - tax))
        }

        // paso el costo total a costo unitario
        const unitSellingPrice = parseFloat((newNetProductCost + totalFinancingCost) / quantity);
        return unitSellingPrice;
    };

    const changeQuotationStatus = async (newStatus, quotationId) => {
        try {
            const responseQuote = await toast.promise(
                apiClient.put(`/quotations/${quotationId}`, {quoteStatus: newStatus}),
                {
                    pending: "Actualizando cotización...",
                    success: "Cotización actualizada correctamente",
                    error: "Error al actualizar la cotización",
                },
                {
                    autoClose: 800,
                }
            )
        } catch (error) {
            console.error("Error al actualizar la cotización: ", error);
        }
        
    };

    const saveQuotation = async () => {
        console.log("Guardando cotización: ", quotationData);
        // preparo la informacion de Quotation para guardar en la DB
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
        // Actualizo en la DB la información de Quotation en la BD
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

        // Paso por todos los productos
        quotationData.products.map(async (product, index) => {
            let newProductId = product.productId;
            console.log("Guardando producto: ", product);
            // preparo la informacion de Product para guardar en la DB
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
            product.processes.map(async (process, index) => {
                // console.log("Guardando proceso: ", process);
                // preparo la informacion de Process para guardar en la DB con el ID del producto
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
            });
        });
    };

    const calculateQuotation = (calculateAll) => {
        // console.log("Calculando cotización... Recalcular todo: ", calculateAll, quotationData);

        const isQuotationValid = validateQuotation(quotationData)
        console.log("isQuotationValid: ", isQuotationValid);
        if (!isQuotationValid.isValid) {
            isQuotationValid.errors.map((error) => {
                toast.error(error, {
                    position: "top-center",
                    autoClose: 6000
                });
            });
            return;
        }

        if (quotationData.isKit) {
            handleCalculateSetQuotation(calculateAll);
        } else {
            handleCalculateQuotation(calculateAll);
        }
        setIsSaved(true)
    }

    const deleteProcessFromDb = async (processId) => {
        // Realiza la operación de eliminación en la base de datos
        try {
            await apiClient.delete(`/processes/${processId}`);
        } catch (error) {
            console.error("Error al eliminar el proceso:", error);
        }
    }
    const deleteProductFromDb = async (productId) => {
        try {
            await apiClient.delete(`/products/${productId}`)
        } catch (error) {
            console.error("Error al eliminar el producto: ", error)
        }
    }

    // Función para actualizar la cotización completa
    const updateQuotationData = (updatedData) => {
        setQuotationData((prevData) => ({
            ...prevData,
            ...updatedData,
        }));
    };
    // Funcion para vaciar el objeto quotationData
    const clearQuotationData = () => {
        setQuotationData(initialQuotationDataState);
    }

    // Función para agregar un producto al array de productos
    const addProduct = (prodData) => {
        setIsSaved(false);
        setQuotationData((prevData) => ({
            ...prevData,
            products: [...prevData.products, prodData],
        }));
    };
    const updateProduct = (updatedProduct, id) => {
        setQuotationData((prevData) => ({
            ...prevData,
            products: prevData.products.map((product) => {
                if (product.productId === id) {
                    return { ...product, ...updatedProduct };
                } else {
                    return product;
                }
            }),
        }));
    };
    const removeProduct = (productId) => {
        setIsSaved(false);
        quotationData.products.map((product) => {
            if (product.productId === productId && product.savedToDb) {
                deleteProductFromDb(productId)
            }
        })
        setQuotationData((prevData) => ({
            ...prevData,
            products: prevData.products.filter((product) => product.productId !== productId),
        }));
    };

    // Función para agregar un proceso a un producto específico
    const addProcessToProduct = (newProcess) => {
        setIsSaved(false);
        setQuotationData((prevData) => ({
            ...prevData,
            products: prevData.products.map((product) => {
                return product.productId === newProcess.productId
                    ? { ...product, processes: [...product.processes, newProcess] }
                    : product;
            }),
        }));
    };
    const updateProcessInProduct = (updatedProcess, procId) => {
        setQuotationData((prevData) => {
            const updatedProducts = prevData.products.map((product) => {
                if (product.productId === updatedProcess.productId) {
                    const updatedProcesses = product.processes.map((process) => {
                        if (process.processId === procId) {
                            return { ...process, ...updatedProcess };
                        } else {
                            return process;
                        }
                    });
                    return { ...product, processes: updatedProcesses };
                } else {
                    return product;
                }
            });

            return {
                ...prevData,
                products: updatedProducts,
            };
        });
    };
    const removeProcessInProduct = (productId, processId) => {
        setIsSaved(false);
        // Encuentra el producto y proceso específicos
        const updatedProducts = quotationData.products.map((product) => {
            if (product.productId === productId) {
                const targetProcess = product.processes.find(
                    (process) => process.processId === processId
                );
                // Verifica se esta en la DB y lo borra de la misma
                if (targetProcess.savedToDb) {
                    deleteProcessFromDb(targetProcess.processId);
                }
                // Adevuelve los procesos no eliminados para ajustar quotationData
                return {
                    ...product,
                    processes: product.processes.filter(
                        (process) => process.processId !== processId
                    ),
                };
            } else {
                return product;
            }
        });

        // Actualiza el estado después de la operación asincrónica
        setQuotationData((prevData) => ({
            ...prevData,
            products: updatedProducts,
        }));
    };

    return (
        <QuotationContext.Provider
            value={{
                quotationData,
                saveQuotation,
                isSaved,
                filter,
                setFilter,
                statusFilter,
                setStatusFilter,
                setIsSaved,
                clearQuotationData,
                updateQuotationData,
                changeQuotationStatus,
                addProduct,
                updateProduct,
                removeProduct,
                addProcessToProduct,
                updateProcessInProduct,
                removeProcessInProduct,
                calculateQuotation,
                calculateItemFinanceCost,
                calculateUnitSellingPrice,
                calculateKitUniteSellingPrice,
            }}
        >
            {children}
        </QuotationContext.Provider>
    );
}