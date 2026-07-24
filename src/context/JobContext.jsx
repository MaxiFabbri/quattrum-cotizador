import { createContext, useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../config/axiosConfig.js";
import { ParametersContext } from "./ParametersContext.jsx";
import { QuotationContext } from "./QuotationContext.jsx";
import { SocketContext } from "./SocketContext.jsx";
import { toast } from "react-toastify";
import validateJob from "../components/Jobs/JobsUtils/ValidateJob.jsx";
import useCalculateFunctions from "../components/Utils/CalculateFunctions.jsx";
import { calculateJobStatus } from "../utils/AdminJobStatusManager.js";
import { calculateTotalProductCost, calculateSubTotalProcessCost } from "../utils/CalculateTotalProductCost.js";
import { newhandleCalculateJob } from "../utils/jobsCalculations.js";
import { sendPresupuesto } from "../api/enviarPresupuesto.js";
import ConfirmToast from "../components/Utils/ConfirmToast.jsx";

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
    const [isUpdated, setIsUpdated] = useState(false);
    const [statusChange, setStatusChange] = useState(false);
    const { changeQuotationStatus } = useContext(QuotationContext);
    const [isSaved, setIsSaved] = useState(true);
    const [jobFilter, setJobFilter] = useState("");
    const [jobStatusFilter, setJobStatusFilter] = useState("");
    const { utilitiesTable, tax } = useContext(ParametersContext);
    const { socket } = useContext(SocketContext);
    const { calculateUnitSellingPrice, calculateKitUniteSellingPrice, getSellingFinanceCost, getBuyingFinanceCost } = useCalculateFunctions();
    const navigate = useNavigate();
    let jobProductsTotalCost = []

    const initialJobDataState = {
        jobId: "",
        quotationId: "",
        approvalDate: "",
        deliveryDate: "",
        isDateCritical: false,
        customerId: "",
        paymentMethodId: "",
        customerPaymentDetails: [],
        invoices: [
            {
                invoiceNumber: "",
                invoiceType: "Otro",
                invoiceNote: "",
                collections: [
                    {
                        collectionDate: "",
                        collectionType: "Otro",
                        collectionNote: "",
                    }
                ],
            }
        ],
        monthlyRate: 0,
        currency: "Peso",
        exchangeRate: 0,
        jobStatus: "Nuevo",
        hasInvoicesPendingIssuance: true,
        hasCollectionsPending: true,
        hasPurchaseInvocesToRecieve: true,
        hasPaymentsToMake: true,
        isKit: false,
        jobNotes: "",
        jobProducts: [],
        createdInXubio: false,
    };
    const [jobData, setJobData] = useState(initialJobDataState);

    // Se ejecuta y GUARDA en la persistencia cuando isUpdated cambia a `true`
    useEffect(() => {
        if (isUpdated) {
            saveJobData(jobData);
            setIsUpdated(false); // Resetear el estado para futuras ejecuciones
        }
    }, [isUpdated]);

    useEffect(() => {
        console.log("jobData actualizado: ", isSaved, " con: ", jobData);
        if (statusChange) {
            setStatusChange(false);
            setIsUpdated(true);
        }
    }, [jobData]);

    const getJobTotalCost = () => {
        let totalCost = 0;
        jobData.jobProducts.map((product) => {
            // Actualizo los costos del producto en base a TC
            product.shipmentCost = +product.enteredShipmentCost / jobData.exchangeRate;
            product.otherCost = +product.enteredOtherCost / jobData.exchangeRate;

            let totalProductCost = 0;
            let newProductDescription = ""
            // Paso por los procesos del producto y actualizo el subtotal y la descripción
            product.processes = product.processes.map((process) => {
                // Actualizo los costos del proceso en la moneda de la cotización
                process.unitCost = +process.enteredUnitCost / (process.currency === "Peso" ? jobData.exchangeRate : 1);
                process.fixedCost = +process.enteredFixedCost / (process.currency === "Peso" ? jobData.exchangeRate : 1);
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
                updateJobProcessInProduct({
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
            totalCost += totalProductCost;
            jobProductsTotalCost.push({ id: product.jobProductId, totalProductCost: totalProductCost, jobProductDescription: newProductDescription });
            // Actualizo el producto en el context
            updateJobProduct({
                jobProductDescription: newProductDescription,
                shipmentCost: product.shipmentCost,
                otherCost: product.otherCost
            }, product.jobProductId);
            // }
        });
        return totalCost;
    };


    // Función para actualizar la cotización completa
    const updateJobData = (updatedData) => {
        setJobData((prevData) => ({
            ...prevData,
            ...updatedData,
        }));
        setIsUpdated(false)
    };

    const updateJobDataAndSave = async (updatedData) => {
        setJobData((prevData) => ({
            ...prevData,
            ...updatedData,
        }));
        setIsUpdated(true);
    }

    const changeJobStatus = async (newStatus) => {
        const newData = {
            ...jobData,
            jobStatus: newStatus,
        };
        setJobData(newData);
        setIsUpdated(true)
    };

    // Funcion para vaciar el objeto jobData
    const clearJobData = () => {
        setJobData(initialJobDataState);
    }
    // Funcion para Cancelar un trabajo
    const cancelJobData = async () => {
        console.log("Cancelando Job en context: ", jobData);

        if (window.confirm("¿Estás seguro de que deseas ANULAR este pedido?")) {
            changeQuotationStatus("Cotizado", jobData.quotationId);
            const jobId = jobData.jobId;
            const jobToSave = {
                ...jobData,
                jobStatus: "Anulado",
            }
            console.log("Eliminando job con ID: ", jobId);
            try {
                const responseJob = await toast.promise(
                    apiClient.put(`/jobs/${jobId}`, jobToSave),
                    {
                        pending: "Guardando el pedido...",
                        success: "Pedido guardado correctamente",
                        error: "Error al guardar el pedido",
                    },
                    {
                        autoClose: 800,
                    }
                )
                console.log("Job anulado correctamente: ", responseJob);
            } catch (error) {
                console.error("Error al guardar el pedido: ", error);
            }
        }
        navigate("/production");
    };

    const saveJobData = async () => {
        console.log("Guardando Job: ", jobData);
        const updatedStatusData = calculateJobStatus(jobData)
        updateJobData(updatedStatusData);

        const jobId = jobData.jobId;
        const jobToSave = {
            jobId: jobId,
            quotationId: jobData.quotationId,
            approvalDate: jobData.approvalDate,
            deliveryDate: jobData.deliveryDate,
            isDateCritical: jobData.isDateCritical,
            customerId: jobData.customerId,
            paymentMethodId: jobData.paymentMethodId,
            customerPaymentDetails: jobData.customerPaymentDetails,
            invoices: updatedStatusData.invoices,
            currency: jobData.currency,
            exchangeRate: jobData.exchangeRate,
            jobStatus: updatedStatusData.jobStatus,
            hasInvoicesPendingIssuance: updatedStatusData.hasInvoicesPendingIssuance,
            hasCollectionsPending: updatedStatusData.hasCollectionsPending,
            hasPurchaseInvocesToRecieve: updatedStatusData.hasPurchaseInvocesToRecieve,
            hasPaymentsToMake: updatedStatusData.hasPaymentsToMake,
            isKit: jobData.isKit,
            jobNotes: jobData.jobNotes,
            jobEvents: jobData.jobEvents,
            images: jobData.images,
            updatedAt: jobData.updatedAt,
            createdInXubio: jobData.createdInXubio,
        }
        console.log("Job a guardar en la DB: ", jobToSave);
        // Actualizo en la DB la información de job en la BD
        try {
            const responseJob = await toast.promise(
                apiClient.put(`/jobs/${jobId}`, jobToSave),
                {
                    pending: "Guardando el pedido...",
                    success: "Pedido guardado correctamente",
                },
                {
                    autoClose: 1500,
                }
            )
            console.log("Job guardado correctamente: ", responseJob);
            setJobData((prevData) => ({
                ...prevData,
                updatedAt: responseJob.data.response.updatedAt,
            }));
            setIsUpdated(false);
        } catch (error) {
            console.error("Error al guardar el pedido: ", error);
            toast.error(
                "No se pudo guardar el pedido. haga clic para continuar.",
                {
                    autoClose: false, // el usuario debe cerrarlo manualmente
                    closeOnClick: true,
                    draggable: true,
                }
            );
        }

        // Paso por todos los productos
        jobData.jobProducts.map(async (product, index) => {
            const newTotalProductCost = calculateTotalProductCost(product, jobData.exchangeRate);

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
                jobProductDescription: product.jobProductDescription,
                calculatedSellingPrice: product.calculatedSellingPrice,
                unitSellingPrice: product.unitSellingPrice,
                isManual: product.isManual,
                totalProductCost: newTotalProductCost,
                jobProductNote: product.jobProductNote,
                jobProductStatus: product.jobProductStatus,
                order: index,
            }

            // guardo en la DB la información de Product
            try {
                if (product.savedToDb) {
                    // Si el producto ya está guardado, lo actualizo
                    const responseProduct = await apiClient.put(`/job-products/${product.jobProductId}`, productToSave);
                    updateJobProduct({ totalProductCost: newTotalProductCost }, product.jobProductId);
                } else {
                    // Si el producto no está guardado, lo creo
                    const responseProduct = await apiClient.post(`/job-products`, productToSave);
                    newJobProductId = responseProduct.data.response._id;
                    // Actualizo el jobProductId temporal con el ID real de la DB
                    updateJobProduct({
                        jobProductId: newJobProductId,
                        savedToDb: true,
                    }, product.jobProductId);
                }
            } catch (error) {
                console.error("Error al guardar el producto: ", error);
            }
            product.processes.map(async (process, index) => {
                const newSubtotalProcessCost = calculateSubTotalProcessCost(process, product.quantity, jobData.exchangeRate);
                // preparo la informacion de Process para guardar en la DB con el ID del producto
                const processToSave = {
                    jobProductId: newJobProductId,
                    jobId: process.jobId,
                    description: process.description,
                    supplierId: process.supplierId,
                    supplierPaymentMethodId: process.supplierPaymentMethodId,
                    supplierPaymentDetails: process.supplierPaymentDetails,
                    invoices: process.invoices,
                    currency: process.currency,
                    unitCost: process.unitCost,
                    enteredUnitCost: process.enteredUnitCost,
                    fixedCost: process.fixedCost,
                    enteredFixedCost: process.enteredFixedCost,
                    adjustPercentage: process.adjustPercentage,
                    subTotalProcessCost: +newSubtotalProcessCost,
                    order: index,
                    jobProcessNote: process.jobProcessNote,
                    jobProcessStatus: process.jobProcessStatus,
                }
                // guardo en la DB la información de Process
                try {
                    if (process.savedToDb) {
                        // Si el proceso ya está guardado en la DB, lo actualizo
                        const responseProcess = await apiClient.put(`/job-processes/${process.jobProcId}`, processToSave);
                        updateJobProcessInProduct({ subTotalProcessCost: newSubtotalProcessCost }, process.jobProcId);
                    } else {
                        // Si el proceso no está guardado en la DB, lo creo
                        const responseProcess = await apiClient.post(`/job-processes`, processToSave);
                        // Actualizo el jobProcId temporal con el ID real de la DB
                        updateJobProcessInProduct({
                            jobProcId: responseProcess.data.response._id,
                            jobProductId: newJobProductId,
                            savedToDb: true
                        }, process.jobProcId);
                    }
                } catch (error) {
                    console.error("Error al guardar el proceso: ", error);
                }
            });
        });
        setIsSaved(true);
    };

    const updateXubioStatus = async (createdInXubio) => {
        console.log("Actualizando estado de Xubio a: ", createdInXubio);
        const newData = {
            ...jobData,
            createdInXubio,
        };
        setJobData(newData);
        setIsUpdated(true)
    }

    const sendJobToXubio = async () => {
        console.log("Enviando Job a Xubio: ", jobData);

        if (jobData.createdInXubio) {
            return new Promise((resolve) => {
                toast(
                    <ConfirmToast
                        message="Este pedido ya lo crearon en Xubio, ¿está seguro de continuar?"
                        onConfirm={() => resolve(true)}
                        onCancel={() => resolve(false)}
                    />,
                    { position: "top-center", autoClose: false }
                );
            }).then(async (continuar) => {
                if (!continuar) return;

                try {
                    const response = await sendPresupuesto(jobData);
                    console.log("Response from Xubio API en context:", response);
                    updateXubioStatus(true);
                } catch (error) {
                    console.error("Error al enviar el pedido a Xubio: ", error);
                }
            });
        }
    }

    const calculateJobData = async (calculateAll) => {
        const isJobValid = validateJob(jobData)

        if (!isJobValid.isValid) {
            isJobValid.errors.map((error) => {
                toast.error(error, {
                    position: "top-center",
                    autoClose: 6000
                });
            });
            return;
        }
        const calculatedJob = await newhandleCalculateJob(calculateAll, jobData, utilitiesTable, tax);
        console.log("New calculatedJob: ", calculatedJob);

        setJobData(calculatedJob);
        setIsUpdated(true);
        setIsSaved(true)
    }

    const handleCalculateJob = async (recalculateAll) => {
        console.log("handleCalculateJob... ", jobData);
        for (const jobProduct of jobData.jobProducts) {
            let totalProductCost = 0;
            let newProductDescription = "";
            let sellingFinanceCost = 0;
            let buyingFinanceCost = 0;
            let newFinancingCost = 0;

            const updatedJobProcesses = [];

            for (const jobProcess of jobProduct.processes) {
                // Actualizo los costos del proceso en la moneda de la cotización
                jobProcess.unitCost = +jobProcess.enteredUnitCost / (jobProcess.currency === "Peso" ? jobData.exchangeRate : 1);
                jobProcess.fixedCost = +jobProcess.enteredFixedCost / (jobProcess.currency === "Peso" ? jobData.exchangeRate : 1);

                const adjust = 1 + ((Number(jobProcess.adjustPercentage) || 0) / 100);
                const newSubtotalProcessCost = ((jobProcess.unitCost * jobProduct.quantity) * adjust) + jobProcess.fixedCost;
                totalProductCost += newSubtotalProcessCost;

                newProductDescription += newProductDescription ? `, ${jobProcess.description}` : jobProcess.description;

                // Calculo costo financiero de cada proceso
                const sellCost = await getSellingFinanceCost(newSubtotalProcessCost, jobProduct.productionDays, jobData.customerPaymentDetails, jobData.monthlyRate);
                sellingFinanceCost += sellCost;
                const buyCost = await getBuyingFinanceCost(newSubtotalProcessCost, jobProcess.supplierPaymentDetails, jobProduct.productionDays, jobData.monthlyRate);
                buyingFinanceCost += buyCost;

                // Actualizar el costo del proceso en el producto
                updateJobProcessInProduct({ subTotalProcessCost: newSubtotalProcessCost }, jobProcess.jobProcId);

                updatedJobProcesses.push({
                    ...jobProcess,
                    subTotalProcessCost: newSubtotalProcessCost,
                });
            }
            toast.info(`Calculando el costo del producto: ${newProductDescription}`, {
                position: "top-center",
                autoClose: 1000
            })

            if (jobData.calculateFinancing) {
                // Calculo el costo financiero del producto
                if (sellingFinanceCost > buyingFinanceCost) {
                    newFinancingCost = sellingFinanceCost - buyingFinanceCost;
                }
            } else {
                newFinancingCost = 0;
            }
            // Actualizo los costos del producto en base a TC
            jobProduct.shipmentCost = +jobProduct.enteredShipmentCost / jobData.exchangeRate;
            jobProduct.otherCost = +jobProduct.enteredOtherCost / jobData.exchangeRate;

            const finalCost = totalProductCost + jobProduct.shipmentCost + jobProduct.otherCost;
            const calculatedSellingPrice = parseFloat(calculateUnitSellingPrice(finalCost, newFinancingCost, jobProduct.quantity));
            const pesosPrice = parseFloat((calculatedSellingPrice * jobData.exchangeRate).toFixed(0));

            if (!recalculateAll && jobProduct.isManual) {
                updateJobProduct({
                    jobProductId: jobProduct.productId,
                    jobProductDescription: newProductDescription,
                    calculatedSellingPrice,
                    unitSellingPrice: jobProduct.unitSellingPrice,
                    isManual: jobProduct.isManual,
                    financingCost: newFinancingCost,
                    totalProductCost: finalCost,
                    pesosPrice: pesosPrice
                }, jobProduct.jobProductId);
            } else {
                updateJobProduct({
                    jobProductId: jobProduct.jobProductId,
                    productDescription: newProductDescription,
                    calculatedSellingPrice,
                    unitSellingPrice: calculatedSellingPrice,
                    isManual: false,
                    financingCost: newFinancingCost,
                    totalProductCost: finalCost,
                    pesosPrice: pesosPrice
                }, jobProduct.jobProductId);
            }

            jobProduct.processes = updatedJobProcesses;
        }
        setIsUpdated(true);
    };
    const handleCalculateSetJob = async (recalculateAll) => {
        const jobTotalCost = getJobTotalCost();
        // Calculo las utilidades deseadas de los parametros generales
        const targetUtilities = utilitiesTable.find((utility) => jobTotalCost < utility.upTo);
        for (const product of jobData.jobProducts) {
            // Calculo las utilidades deseadas de los parametros generales
            const productCost = jobProductsTotalCost.find((el) => el.id === product.jobProductId);

            // Calculo el costo Financiero
            let totalProductCost = 0;
            let sellingFinanceCost = 0;
            let buyingFinanceCost = 0;
            let newFinancingCost = 0;
            let newProductDescription = "";
            const updatedJobProcesses = [];

            for (const process of product.processes) {
                const adjust = 1 + ((Number(process.adjustPercentage) || 0) / 100);
                const newSubtotalProcessCost = ((process.unitCost * product.quantity) * adjust) + process.fixedCost;
                totalProductCost += newSubtotalProcessCost;
                newProductDescription += newProductDescription ? `, ${process.description}` : process.description;

                // Calculo costo financiero de cada proceso
                const sellCost = await getSellingFinanceCost(newSubtotalProcessCost, product.productionDays, jobData.customerPaymentDetails, jobData.monthlyRate);
                sellingFinanceCost += sellCost;
                const buyCost = await getBuyingFinanceCost(newSubtotalProcessCost, process.supplierPaymentDetails, product.productionDays);
                buyingFinanceCost += buyCost;
            }
            toast.info(`Calculando el costo del producto: ${newProductDescription}`, {
                position: "top-center",
                autoClose: 1000
            })

            if (jobData.calculateFinancing) {
                // Calculo el costo financiero del producto
                if (sellingFinanceCost > buyingFinanceCost) {
                    newFinancingCost = sellingFinanceCost - buyingFinanceCost;
                }
            } else {
                newFinancingCost = 0;
            }
            const calculatedSellingPrice = calculateKitUniteSellingPrice(productCost.totalProductCost, newFinancingCost, product.quantity, targetUtilities, jobTotalCost);
            const pesosPrice = parseFloat((calculatedSellingPrice * jobData.exchangeRate).toFixed(0));
            if (!recalculateAll) {
                updateJobProduct({
                    jobProductId: product.productId,
                    jobProductDescription: newProductDescription,
                    calculatedSellingPrice,
                    unitSellingPrice: product.unitSellingPrice,
                    isManual: product.isManual,
                    financingCost: newFinancingCost,
                    totalProductCost: productCost.totalProductCost,
                    pesosPrice: pesosPrice
                }, product.jobProductId);
            } else {
                updateJobProduct({
                    jobProductId: product.jobProductId,
                    jobProductDescription: newProductDescription,
                    calculatedSellingPrice,
                    unitSellingPrice: calculatedSellingPrice,
                    isManual: false,
                    financingCost: newFinancingCost,
                    totalProductCost: productCost.totalProductCost,
                    pesosPrice: pesosPrice
                }, product.jobProductId);
            }
        }
        setIsUpdated(true);
    };

    const deleteJobProcessFromDb = async (jobProcId) => {
        // Realiza la operación de eliminación en la base de datos
        try {
            await apiClient.delete(`/job-processes/${jobProcId}`);
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
        console.log("Agregando producto al jobData: ", jobProdData);
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
    const removeJobProduct = (id) => {
        setIsSaved(false);
        jobData.jobProducts.map((jobProduct) => {
            if (jobProduct.jobProductId === id && jobProduct.savedToDb) {
                deleteJobProductFromDb(id)
            }
        })
        setJobData((prevData) => ({
            ...prevData,
            jobProducts: prevData.jobProducts.filter((product) => product.jobProductId !== id),
        }));
    };

    // Función para agregar un proceso a un producto específico
    const addJobProcessToProduct = (newJobProcess) => {
        console.log("jobData: ", jobData);
        console.log("Agregando proceso: ", newJobProcess);
        setIsSaved(false);
        setJobData((prevData) => ({
            ...prevData,
            jobProducts: prevData.jobProducts.map((jobProduct) => {
                console.log("Dentro del map: ", jobProduct)
                const newJobProduct = jobProduct.jobProductId === newJobProcess.jobProductId
                    ? { ...jobProduct, processes: [...jobProduct.processes, newJobProcess] }
                    : jobProduct;
                console.log("jobProduct actualizado: ", newJobProduct);
                return newJobProduct
            }),
        }));
    };
    const updateJobProcessInProduct = (updatedJobProcess, jobProcId) => {
        setJobData((prevData) => {
            const updatedJobProducts = prevData.jobProducts.map((jobProduct) => {
                if (jobProduct.jobProductId === updatedJobProcess.jobProductId) {
                    const updatedJobProcesses = jobProduct.processes.map((process) => {
                        if (process.jobProcId === jobProcId) {
                            return { ...process, ...updatedJobProcess };
                        } else {
                            return process;
                        }
                    });
                    return { ...jobProduct, processes: updatedJobProcesses };
                } else {
                    return jobProduct;
                }
            });

            return {
                ...prevData,
                jobProducts: updatedJobProducts,
            };
        });
    };
    const removeJobProcessInProduct = (productId, procId) => {
        setIsUpdated(false)
        // Encuentra el producto y proceso específicos
        const updatedJobProducts = jobData.jobProducts.map((jobProduct) => {
            if (jobProduct.jobProductId === productId) {
                const targetProcess = jobProduct.processes.find(
                    (jobProcess) => jobProcess.jobProcId === procId
                );
                // Verifica si esta en la DB y lo borra de la misma
                if (targetProcess.savedToDb) {
                    deleteJobProcessFromDb(targetProcess.jobProcId);
                }

                // Adevuelve los procesos no eliminados para ajustar jobData
                return {
                    ...jobProduct,
                    processes: jobProduct.processes.filter(
                        (jobProcess) => jobProcess.jobProcId !== procId
                    ),
                };
            } else {
                return jobProduct;
            }
        });

        // Actualiza el estado después de la operación asincrónica
        setJobData((prevData) => ({
            ...prevData,
            jobProducts: updatedJobProducts,
        }));
    };

    return (
        <JobContext.Provider
            value={{
                jobData,
                setJobData,
                saveJobData,
                sendJobToXubio,
                calculateJobData,
                clearJobData,
                cancelJobData,
                updateJobData,
                updateJobDataAndSave,
                changeJobStatus,
                addJobProduct,
                updateJobProduct,
                removeJobProduct,
                addJobProcessToProduct,
                updateJobProcessInProduct,
                removeJobProcessInProduct,
                jobFilter,
                setJobFilter,
                jobStatusFilter,
                setJobStatusFilter,
                setIsUpdated,
                isSaved,
                setIsSaved,
                statusChange,
                setStatusChange,
            }}
        >
            {children}
        </JobContext.Provider>
    );
}