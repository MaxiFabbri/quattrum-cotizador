import { createContext, useState, useEffect, useContext } from "react";
import { apiClient } from "../config/axiosConfig.js";
import { ParametersContext } from "./ParametersContext.jsx";
import { toast } from "react-toastify";
import validateJob from "../components/Jobs/JobsUtils/ValidateJob.jsx";
import useCalculateFunctions from "../components/Utils/CalculateFunctions.jsx";

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
    const [isUpdated, setIsUpdated] = useState(false);
    // const { calculateUnitSellingPrice, calculateKitUniteSellingPrice } = useContext(QuotationContext);
    const [isSaved, setIsSaved] = useState(true);
    const [jobFilter, setJobFilter] = useState("");
    const [jobStatusFilter, setJobStatusFilter] = useState("");
    const { utilitiesTable, tax } = useContext(ParametersContext);
    const { calculateUnitSellingPrice, calculateKitUniteSellingPrice, getSellingFinanceCost, getBuyingFinanceCost } = useCalculateFunctions();

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
    // Funcion para Cancelar un trabajo
    const cancelJobData = async () => {
        console.log("Cancelando Job en context: ", jobData);
        // try {
        //     const response = await apiClient.put(`/jobs/${jobId}/cancel`);
        //     toast.success("Trabajo cancelado correctamente", {
        //         position: "top-center",
        //         autoClose: 4000
        //     });
        // } catch (error) {
        //     console.error("Error al cancelar el trabajo: ", error);
        //     toast.error("Error al cancelar el trabajo", {
        //         position: "top-center",
        //         autoClose: 6000
        //     });
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
                if (product.savedToDb) {
                    // Si el producto ya está guardado, lo actualizo
                    const responseProduct = await apiClient.put(`/job-products/${product.jobProductId}`, productToSave);
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
                // preparo la informacion de Process para guardar en la DB con el ID del producto
                const processToSave = {
                    jobProductId: newJobProductId,
                    description: process.description,
                    supplierId: process.supplierId,
                    supplierPaymentMethodId: process.supplierPaymentMethodId,
                    supplierPaymentDetails: process.supplierPaymentDetails,
                    currency: process.currency,
                    unitCost: process.unitCost,
                    enteredUnitCost: process.enteredUnitCost,
                    fixedCost: process.fixedCost,
                    enteredFixedCost: process.enteredFixedCost,
                    adjustPercentage: process.adjustPercentage,
                    subTotalProcessCost: +process.subTotalProcessCost,
                    order: index,
                    jobProcessNote: process.jobProcessNote,
                    jobProcessStatus: process.jobProcessStatus,
                }
                // guardo en la DB la información de Process
                try {
                    if (process.savedToDb) {
                        // Si el proceso ya está guardado en la DB, lo actualizo
                        const responseProcess = await apiClient.put(`/job-processes/${process.jobProcId}`, processToSave);
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
    };

    const calculateJobData = (calculateAll) => {
        console.log("Calculando Job... Recalcular todo: ", calculateAll, jobData);

        const isJobValid = validateJob(jobData)
        console.log("isJobValid: ", isJobValid);
        if (!isJobValid.isValid) {
            isJobValid.errors.map((error) => {
                toast.error(error, {
                    position: "top-center",
                    autoClose: 6000
                });
            });
            return;
        }

        if (jobData.isKit) {
            handleCalculateSetJob(calculateAll);
        } else {
            handleCalculateJob(calculateAll);
        }
        setIsSaved(true)
    }

    const handleCalculateJob = async (recalculateAll) => {
        console.log("handleCalculateJob... ",jobData);
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
                const buyCost = await getBuyingFinanceCost(newSubtotalProcessCost, jobProcess.supplierPaymentDetails, jobProduct.productionDays);
                buyingFinanceCost += buyCost;
                // console.log("Proceso: ", process.description, +(sellCost - buyCost).toFixed(2), "Selling Finance cost: ", sellCost, " Buying Finance Cost: ", buyCost);

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
                    // console.log("Selling Finance Cost: ", sellingFinanceCost, " Buying Finance Cost: ", buyingFinanceCost, " New Financing Cost: ", newFinancingCost);
                }
            } else {
                newFinancingCost = 0;
            }
            // Actualizo los costos del producto en base a TC
            jobProduct.shipmentCost = +jobProduct.enteredShipmentCost / jobData.exchangeRate;
            jobProduct.otherCost = +jobProduct.enteredOtherCost / jobData.exchangeRate;

            const finalCost = totalProductCost + jobProduct.shipmentCost + jobProduct.otherCost;
            const calculatedSellingPrice = parseFloat(calculateUnitSellingPrice(finalCost, newFinancingCost, jobProduct.quantity ));
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
                console.log("Actualizando jobProduct automáticamente: ", jobProduct);
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

    const deleteJobProcessFromDb = async (jobProcId) => {
        // Realiza la operación de eliminación en la base de datos
        try {
            await apiClient.delete(`/job-processes/${jobProcId}`);
        } catch (error) {
            console.error("Error al eliminar el proceso:", error);
        }
    }
    const deleteJobProductFromDb = async (jobProdId) => {
        console.log("Eliminando jobProduct de la DB con ID: ", jobProdId);
        try {
            await apiClient.delete(`/job-products/${jobProdId}`)
        } catch (error) {
            console.error("Error al eliminar el producto: ", error)
        }
    }

    // Función para agregar un producto al array de productos
    const addJobProduct = (jobProdData) => {
        console.log("Agregando jobProduct: ", jobProdData);
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
        console.log("Agregando jobProcess: ", newJobProcess);
        setIsSaved(false);
        setJobData((prevData) => ({
            ...prevData,
            jobProducts: prevData.jobProducts.map((jobProduct) => {
                console.log("Map de los jobProducts: ", jobProduct);
                return jobProduct.jobProductId === newJobProcess.jobProductId
                    ? { ...jobProduct, processes: [...jobProduct.processes, newJobProcess] }
                    : jobProduct;
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
        console.log("Eliminando jobProcess con ID: ", procId, " del jobProduct con ID: ", productId);
        setIsUpdated(false)
        // Encuentra el producto y proceso específicos
        const updatedJobProducts = jobData.jobProducts.map((jobProduct) => {
            if (jobProduct.jobProductId === productId) {
                const targetProcess = jobProduct.processes.find(
                    (jobProcess) => jobProcess.jobProcId === procId
                );
                console.log("Proceso objetivo encontrado: ", targetProcess);
                // Verifica si esta en la DB y lo borra de la misma
                if (targetProcess.savedToDb) {
                    console.log("El proceso está en la DB, procediendo a eliminarlo: ", targetProcess);
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
                calculateJobData,
                clearJobData,
                cancelJobData,
                updateJobData,
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
                setIsSaved
            }}
        >
            {children}
        </JobContext.Provider>
    );
}