import { createContext, useState, useEffect, useContext } from "react";
import { apiClient } from "../config/axiosConfig.js";
import { ParametersContext } from "./ParametersContext.jsx";
import { toast } from "react-toastify";

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
    const [isUpdated, setIsUpdated] = useState(false);
    const [isSaved, setIsSaved] = useState(true);
    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const initialJobDataState = {
        jobId: "",
        quotationId: "",
        approvalDate: "",
        deliveryDate: "",
        customerId: "",
        paymentMethodId: "",
        customerPaymentDetails: [],
        monthlyRate: 0,
        currency: "Peso",
        exchangeRate: 0,
        jobStatus: "Aprobado",
        isKit: false,
        jobNotes: "",
        jobProducts: [],
    };

    const [jobData, setJobData] = useState(initialJobDataState);
    // Se ejecuta cuando isUpdated cambia a `true`
    useEffect(() => {
        if (isUpdated) {
            saveJobData();
            setIsUpdated(false); // Resetear el estado para futuras ejecuciones
        }
    }, [isUpdated]);

    useEffect(() => {
        console.log("jobData actualizado: ", jobData);
    }, [jobData]);

    // Función para actualizar la cotización completa
    const updateJobData = (updatedData) => {
        setJobData((prevData) => ({
            ...prevData,
            ...updatedData,
        }));
        setIsUpdated(false)
    };

    // Funcion para vaciar el objeto jobData
    const clearJobData = () => {
        setJobData(initialJobDataState);
    }
    const saveJobData = async () => {
        console.log("Guardando Job: ", jobData);
        // preparo la informacion de job para guardar en la DB
        const jobId = jobData.jobId;
        const jobToSave = {
            jobId: jobId,
            quotationId: jobData.quotationId,
            approvalDate: jobData.approvalDate,
            deliveryDate: jobData.deliveryDate,
            customerId: jobData.customerId,
            paymentMethodId: jobData.paymentMethodId,
            customerPaymentDetails: jobData.customerPaymentDetails,
            currency: jobData.currency,
            exchangeRate: jobData.exchangeRate,
            jobStatus: jobData.jobStatus,
            isKit: jobData.isKit,
            jobNotes: jobData.jobNotes,
        }
        // Actualizo en la DB la información de job en la BD
        try {
            const responseJob = await toast.promise(
                apiClient.put(`/jobs/${jobId}`, jobToSave),
                {
                    pending: "Guardando el trabajo...",
                    success: "Trabajo guardado correctamente",
                    error: "Error al guardar el trabajo",
                },
                {
                    autoClose: 800,
                }
            )
            setIsUpdated(false);
        } catch (error) {
            console.error("Error al guardar el trabajo: ", error);
        }

        // Paso por todos los productos
        jobData.jobProducts.map(async (product, index) => {
            let newJobProductId = product.jobProductId;
            // preparo la informacion de Product para guardar en la DB
            const productToSave = {
                jobId: jobId,
                quantity: product.quantity,
                productionDays: product.productionDays,
                financingCost: product.financingCost,
                shipmentCost: product.shipmentCost,
                enteredShipmentCost: product.enteredShipmentCost,
                otherCost: product.otherCost,
                enteredOtherCost: product.enteredOtherCost,
                jobProductDescription: product.productDescription,
                calculatedSellingPrice: product.calculatedSellingPrice,
                unitSellingPrice: product.unitSellingPrice,
                isManual: product.isManual,
                totalProductCost: product.totalProductCost,
                jobProductNote: product.jobProductNote,
                jobProductStatus: product.jobProductStatus,
                order: index,
            }

            // guardo en la DB la información de Product
            try {
                const responseProduct = await apiClient.put(`/job-products/${product.jobProductId}`, productToSave);
            } catch (error) {
                console.error("Error al guardar el producto: ", error);
            }
        //     product.processes.map(async (process, index) => {
        //         // console.log("Guardando proceso: ", process);
        //         // preparo la informacion de Process para guardar en la DB con el ID del producto
        //         const processToSave = {
        //             productId: newProductId,
        //             description: process.description,
        //             supplierId: process.supplierId,
        //             supplierPaymentMethodId: process.supplierPaymentMethodId,
        //             daysToPayment: process.daysToPayment,
        //             supplierPaymentDetails: process.supplierPaymentDetails,
        //             currency: process.currency,
        //             adjustPercentage: process.adjustPercentage,
        //             enteredUnitCost: process.enteredUnitCost,
        //             unitCost: process.unitCost,
        //             enteredFixedCost: process.enteredFixedCost,
        //             fixedCost: process.fixedCost,
        //             subTotalProcessCost: +process.subTotalProcessCost,
        //             order: index,
        //         }
        //         // guardo en la DB la información de Process
        //         try {
        //             if (process.savedToDb) {
        //                 // Si el proceso ya está guardado, lo actualizo
        //                 const responseProcess = await apiClient.put(`/processes/${process.processId}`, processToSave);
        //             } else {
        //                 // Si el proceso no está guardado, lo guardo
        //                 const responseProcess = await apiClient.post('/processes/', processToSave);
        //                 // Actualizo el ID del proceso y el ID de Producto en el context
        //                 updateProcessInProduct({
        //                     processId: responseProcess.data.response._id,
        //                     productId: newProductId,
        //                     savedToDb: true,
        //                 }, process.processId);
        //             }
        //         } catch (error) {
        //             console.error("Error al guardar el proceso: ", error);
        //         }
        //     });
        });
    };

    const deleteJobProcessFromDb = async (jobProceId) => {
        // Realiza la operación de eliminación en la base de datos
        try {
            await apiClient.delete(`/job-processes/${jobProceId}`);
        } catch (error) {
            console.error("Error al eliminar el proceso:", error);
        }
    }
    const deleteJobProductFromDb = async (jobProdId) => {
        try {
            await apiClient.delete(`/job-products/${jobProdId}`)
        } catch (error) {
            console.error("Error al eliminar el producto: ", error)
        }
    }

    // Función para agregar un producto al array de productos
    const addJobProduct = (jobProdData) => {
        console.log("Agregando jobProduct: ", jobProdData);
        console.log("jobData antes de agregar jobProduct: ", jobData);
        setIsUpdated(false)
        setJobData((prevData) => ({
            ...prevData,
            jobProducts: [...prevData.jobProducts, jobProdData],
        }));
    };
    const updateJobProduct = (updatedJobProduct, id) => {
        setJobData((prevData) => ({
            ...prevData,
            jobProducts: prevData.jobProducts.map((jobProd) => {
                if (jobProd.jobProductId === id) {
                    return { ...jobProd, ...updatedJobProduct };
                } else {
                    return jobProd;
                }
            }),
        }));
    };
    const removeJobProduct = (productId) => {
        setIsSaved(false);
        jobData.products.map((product) => {
            if (product.productId === productId && product.savedToDb) {
                deleteProductFromDb(productId)
            }
        })
        setjobData((prevData) => ({
            ...prevData,
            products: prevData.products.filter((product) => product.productId !== productId),
        }));
    };

    // Función para agregar un proceso a un producto específico
    const addJobProcessToProduct = (newJobProcess) => {
        setIsSaved(false);
        setJobData((prevData) => ({
            ...prevData,
            jobProducts: prevData.jobProducts.map((jobProduct) => {
                return jobProduct.jobProdId === newJobProcess.jobProductId
                    ? { ...jobProduct, jobProcesses: [...jobProduct.jobProcesses, newJobProcess] }
                    : jobProduct;
            }),
        }));
    };
    const updateJobProcessInProduct = (updatedJobProcess, jobProcId) => {
        setJobData((prevData) => {
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
    const removeJobProcessInProduct = (jobProductId, jobProcId) => {
        setIsUpdated(false)
        // Encuentra el producto y proceso específicos
        const updatedProducts = jobData.products.map((product) => {
            if (product.productId === productId) {
                const targetProcess = product.processes.find(
                    (process) => process.processId === processId
                );
                // Verifica si esta en la DB y lo borra de la misma
                if (targetProcess.savedToDb) {
                    deleteJobProcessFromDb(targetProcess.processId);
                }
                // Adevuelve los procesos no eliminados para ajustar jobData
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
        setJobData((prevData) => ({
            ...prevData,
            products: updatedProducts,
        }));
    };

    return (
        <JobContext.Provider
            value={{
                jobData,
                setJobData,
                saveJobData,
                clearJobData,
                updateJobData,
                addJobProduct,
                updateJobProduct,
                removeJobProduct,
                addJobProcessToProduct,
                updateJobProcessInProduct,
                removeJobProcessInProduct,
                setIsUpdated
            }}
        >
            {children}
        </JobContext.Provider>
    );
}