import { createContext, useState, useEffect, useContext, use } from "react";
import { apiClient } from "../config/axiosConfig.js";
import { ParametersContext } from "./ParametersContext.jsx";
import { toast } from "react-toastify";
import { validateQuotation } from "../utils/quotationValidations.js";
import { initialQuotationDataState } from "../state/quotationState.js";
import { getSellingFinanceCost, getBuyingFinanceCost } from "../utils/financeCostCalculations.js";
import { handleCalculateQuotation } from "../utils/quotationsCalculations.js";

export const QuotationContext = createContext();

export const QuotationProvider = ({ children }) => {
    const { utilitiesTable, tax } = useContext(ParametersContext);
    const [isUpdated, setIsUpdated] = useState(false);
    const [isSaved, setIsSaved] = useState(true);
    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    let productsTotalCost = []

    const [quotationData, setQuotationData] = useState(initialQuotationDataState);

    useEffect(() => {
        console.log("Quotation Data actualizado en context: ", quotationData);
        if (isUpdated) {
            console.log("Guardando cotización automáticamente después de la actualización...");
            saveQuotation();
            setIsUpdated(false); // Resetear el estado para futuras ejecuciones
        }
    }, [quotationData]);

    const calculateQuotation = async (calculateAll) => {
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
        let newData;
        newData = await handleCalculateQuotation(calculateAll, quotationData, utilitiesTable, tax)
        console.log("Nueva cotización calculada: ", newData);
        setQuotationData(newData)
        setIsUpdated(true);
        setIsSaved(true)
    }

    const changeQuotationStatus = async (newStatus, quotationId) => {
        try {
            const responseQuote = await toast.promise(
                apiClient.put(`/quotations/${quotationId}`, { quoteStatus: newStatus }),
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
                setIsSaved,
                filter,
                setFilter,
                statusFilter,
                setStatusFilter,
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
                // calculateItemFinanceCost,
                // calculateUnitSellingPrice,
                // calculateKitUniteSellingPrice,
            }}
        >
            {children}
        </QuotationContext.Provider>
    );
}