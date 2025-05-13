import { createContext, useState, useEffect } from "react";
import { apiClient } from "../config/axiosConfig.js";


export const QuotationContext = createContext();

export const QuotationProvider = ({ children }) => {

    const initialQuotationDataState = {
        id: "",
        date: "",
        customerId: "",
        customerName: "",
        paymentMethodId: "",
        paymentMethodName: "",
        paymentDaysToCollect: 0,
        monthlyRate: 0,
        currency: "Peso",
        exchangeRate: 0,
        quoteStatus: "Cotizado",
        quoteUnitSellingPrice: 0,
        quoteProductsDescription: "",
        isKit: false,
        products: [],
    };

    const [quotationData, setQuotationData] = useState(initialQuotationDataState);

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
        setQuotationData((prevData) => ({
            ...prevData,
            products: [...prevData.products, prodData],
        }));
    };

    // Función para actualizar un producto específico
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
        console.log("Producto actualizado en quotationData: ", updatedProduct);
    };

    const removeProduct = (productId) => {
        quotationData.products.map((product) => {
            console.log("checking Product for removal: ", product)
            if (product.productId === productId && product.savedToDb) {
                console.log("removing Product: ", product)
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
        // console.log("Actualizando Proceso: ", updatedProcess);
        setQuotationData((prevData) => {
            const updatedProducts = prevData.products.map((product) => {
                if (product.productId === updatedProcess.productId) {
                    const updatedProcesses = product.processes.map((process) => {
                        if (process.processId === procId) {
                        // if (process.processId === updatedProcess.processId) {
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
                clearQuotationData,
                updateQuotationData,
                addProduct,
                updateProduct,
                removeProduct,
                addProcessToProduct,
                updateProcessInProduct,
                removeProcessInProduct,
            }}
        >
            {children}
        </QuotationContext.Provider>
    );
}