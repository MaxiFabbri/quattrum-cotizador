import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { closestCenter, DndContext } from '@dnd-kit/core';
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import "./DetailedJobContainer.css"

import { JobHeader } from "./JobElements/JobHeader.jsx";
import NewJob from "./NewJob.jsx";
import JobProduct from "./JobElements/JobProduct.jsx";

import { JobContext } from "../../context/JobContext.jsx";
import { SocketContext } from "../../context/SocketContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";

import TextButton from "../Utils/TextButton.jsx";
import ButtonSaveJob from "./JobsUtils/ButtonSaveJob.jsx";
import ButtonAddJobProduct from "./JobsUtils/ButtonAddJobProduct.jsx";
import ButtonCalculateJob from "./JobsUtils/ButtonCalculateJob.jsx";
import ButtonCancelJob from "./JobsUtils/ButtonCancelJob.jsx";
import ButtonConfirmJob from "./JobsUtils/ButtonConfirmJob.jsx";
import ButtonCloseJob from "./JobsUtils/ButtonCloseJob.jsx";
import ButtonReopenJob from "./JobsUtils/ButtonReopenJob.jsx";
import JobTotals from "./JobElements/JobTotals.jsx";

import { apiClient } from "../../config/axiosConfig.js";
import { calculateJobStatus } from "../../utils/AdminJobStatusManager.js";
import { toast } from "react-toastify";


const DetailedJobContainer = () => {
    const { jobData, updateJobData, clearJobData, isSaved, setIsSaved, setIsUpdated } = useContext(JobContext);
    const { socket, isSocketConnected, message, setMessage } = useContext(SocketContext);
    const { userId } = useContext(AuthContext);

    const [activeId, setActiveId] = useState(null)
    const [loading, setLoading] = useState(true);
    const [totals, setTotals] = useState({
        revenue: 0,
        cost: 0,
        profit: 0,
    });
    const { id } = useParams()
    const navigate = useNavigate();

    useEffect(() => {
        clearJobData();
        getJobDataFromDb(id);
    }, [id]);

    useEffect(() => {
        const jobId = id;
        if (isSocketConnected && socket) {
            console.log("Emitiendo job:open jobId: ", jobId, " y userId: ", userId);
            // Aviso al servidor que abrí este job
            socket.emit("job:open", { jobId, userId });

            // Cleanup: cuando cierro la vista, aviso que lo cerré
            return () => {
                socket.emit("job:close", { jobId, userId });
            };
        }
    }, [isSocketConnected, socket, id, userId]);

    useEffect(() => {
        console.log("Mensaje en SocketContext: ", message);
        if (message !== null) {
            if (message.type === "alert") {
                console.log("mostrar alerta ", message.text)
                toast.error(message.text, {
                    autoClose: false,   // 🔑 no se cierra automáticamente
                    closeOnClick: true, // se cierra al hacer click
                });
            } else if (message.type === "info") {
                console.log("mostrar info ", message.text)
                toast.info(message.text, {
                    autoClose: 3000,
                    closeOnClick: true,
                })
            }
        }
        setMessage(null)
    }, [message])

    useEffect(() => {
        const jobProducts = jobData.jobProducts || [];
        const dolarPrice = jobData.approvedExchangeRate;
        const revenue = calculateRevenue(jobProducts) * dolarPrice;
        const cost = calculateCost(jobProducts) * dolarPrice;
        const profit = revenue - cost;
        setTotals({ revenue, cost, profit });
    }, [jobData])

    const calculateRevenue = (products) => {
        console.log("Calcular revenue: ", products);
        return products.reduce((acc, product) => {
            return acc + product.quantity * product.unitSellingPrice;
        }, 0);
    }
    const calculateCost = (products) => {
        console.log("Calcular cost: ", products);
        return products.reduce((acc, product) => {
            return acc + product.totalProductCost;
        }, 0);
    }

    // Formatear la fecha
    const formatDate = (utcDate) => {
        if (!utcDate) return null; // Maneja el caso de fecha nula o indefinida
        const date = new Date(utcDate);
        const year = date.getFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Asegura 2 dígitos
        const day = String(date.getUTCDate()).padStart(2, "0"); // Asegura 2 dígitos
        return `${year}-${month}-${day}`;
    };

    const adjustJobProcessesData = (dbProcesses, exchangeRate) => {
        const newProcessesData = dbProcesses.map((process, index) => {
            let newExchangeRate = process.currency === "Peso" ? exchangeRate : 1;
            return {
                jobProcId: process._id,
                jobProductId: process.jobProductId,
                jobId: process.jobId,
                description: process.description,
                supplierId: process.supplierId._id,
                supplierPaymentMethodId: process.supplierPaymentMethodId._id,
                supplierPaymentDetails: process.supplierPaymentDetails,
                invoices: process.invoices,
                currency: process.currency,
                unitCost: +(process.unitCost),
                enteredUnitCost: +(process.enteredUnitCost).toFixed(2),
                fixedCost: +(process.fixedCost),
                enteredFixedCost: +(process.enteredFixedCost).toFixed(2),
                adjustPercentage: process.adjustPercentage,
                subTotalProcessCost: +(process.subTotalProcessCost),
                order: index,
                jobProcessNote: process.jobProcessNote || "",
                jobProcessStatus: process.jobProcessStatus || "Pendiente",

                supplierName: process.supplierId.name,
                supplierPaymentMethodName: process.supplierPaymentMethodId.supplier_payment_description,
                // tempunitCost: +(process.enteredUnitCost).toFixed(2),
                // tempfixedCost: +(process.enteredFixedCost).toFixed(2),
                savedToDb: true,
            }
        })
        return newProcessesData
    }

    const getJobProcessData = async (jobProductId, exchangeRate) => {
        const responseJobProcesses = await apiClient(`/job-processes/${jobProductId}`)
        // Ajusto los datos recibidos para el context
        const adjustedJobProcessesData = adjustJobProcessesData(responseJobProcesses.data.response, exchangeRate)
        return adjustedJobProcessesData
    }

    const adjustJobProductData = async (jobProducts, exchangeRate) => {
        const newJobProductsData = await Promise.all(jobProducts.map(async (jobProduct) => {
            const newJobProcesses = await getJobProcessData(jobProduct._id, exchangeRate);
            return {
                jobProductId: jobProduct._id,
                jobId: jobProduct.jobId,
                quantity: jobProduct.quantity,
                productionDays: jobProduct.productionDays,
                financingCost: +(jobProduct.financingCost),
                shipmentCost: +(jobProduct.shipmentCost),
                enteredShipmentCost: +(jobProduct.enteredShipmentCost),
                otherCost: +(jobProduct.otherCost),
                enteredOtherCost: +(jobProduct.enteredOtherCost),
                unitSellingPrice: +(jobProduct.unitSellingPrice),
                calculatedSellingPrice: +(jobProduct.calculatedSellingPrice),
                jobProductStatus: jobProduct.jobProductStatus,
                approvedSellingPrice: +(jobProduct.approvedSellingPrice),
                isManual: jobProduct.isManual,
                jobProductDescription: jobProduct.jobProductDescription,
                totalProductCost: +(jobProduct.totalProductCost),
                order: jobProduct.order,
                jobProductNote: jobProduct.jobProductNote || "",
                processes: newJobProcesses, // Ahora los procesos se incluyen correctamente
                savedToDb: true,
            };
        }));
        return newJobProductsData;
    };

    const getJobDataFromDb = async (id) => {
        const responseJob = await apiClient.get(`/jobs/populated/${id}`)
        const recievedData = responseJob.data.response
        let newData = {
            jobId: recievedData._id,
            calculateFinancing: recievedData.calculateFinancing,
            quotationId: recievedData.quotationId,
            approvalDate: formatDate(recievedData.approvalDate),
            deliveryDate: formatDate(recievedData.deliveryDate) || null,
            isDateCritical: recievedData.isDateCritical,
            customerId: recievedData.customerId._id,
            customerName: recievedData.customerId.name,
            paymentMethodId: recievedData.paymentMethodId._id,
            paymentMethodName: recievedData.paymentMethodId.customer_payment_description,
            customerPaymentDetails: recievedData.paymentMethodId.customer_payment_details,
            invoices: recievedData.invoices,
            monthlyRate: recievedData.monthlyRate,
            currency: recievedData.currency,
            exchangeRate: recievedData.exchangeRate,
            approvedExchangeRate: recievedData.approvedExchangeRate,
            jobStatus: recievedData.jobStatus,
            hasInvoicesPendingIssuance: recievedData.hasInvoicesPendingIssuance,
            hasCollectionsPending: recievedData.hasCollectionsPending,
            hasPurchaseInvocesToRecieve: recievedData.hasPurchaseInvocesToRecieve,
            hasPaymentsToMake: recievedData.hasPaymentsToMake,
            isKit: recievedData.isKit || false,
            jobNotes: recievedData.jobNotes || "",
            jobEvents: recievedData.jobEvents || [],
            images: recievedData.images || [],
            updatedAt: recievedData.updatedAt,
        }
        // agrego los Productos
        const responseJobProducts = await apiClient.get(`/job-products/job/${id}`)
        const exchangeRate = responseJobProducts.data.response.exchangeRate
        const newJobProducts = await adjustJobProductData(responseJobProducts.data.response, exchangeRate)
        newData = { ...newData, jobProducts: newJobProducts }
        updateJobData(
            newData
        );
        setLoading(false);
        if (newData.jobStatus === "Aprobado") {
            const adminStatus = calculateJobStatus(newData)
            const finalData = { ...newData, ...adminStatus, jobStatus: "Nuevo" }
            updateJobData(
                finalData
            );
            setIsUpdated(true);
        } else {
            updateJobData(
                newData
            );
        }
    }

    const handleJobProductsDragEnd = (event) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        const jobProducts = jobData.jobProducts;
        const oldIndex = jobData.jobProducts.findIndex(p => p.jobProductId === active.id);
        const newIndex = jobData.jobProducts.findIndex(p => p.jobProductId === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const updatedJobProducts = arrayMove(jobProducts, oldIndex, newIndex);

        updateJobData({
            ...jobData,
            jobProducts: updatedJobProducts
        });
        setIsSaved(false);
        setActiveId(null);
    };
    const dragStart = (event) => {
        setActiveId(event.active.id);
    }

    return (
        <div>
            {loading ?
                (<p>Cargando...</p>)
                : (
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragStart={dragStart}
                        onDragEnd={handleJobProductsDragEnd}
                    >
                        <div className="job-container">
                            <table className="job-table-job">
                                <JobHeader />
                                <tbody>
                                    <NewJob />
                                </tbody>
                            </table>
                        </div>
                        <>
                            <div className="job-table-products">
                                <SortableContext
                                    items={jobData.jobProducts.map(p => p.jobProductId)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {jobData.jobProducts.map((jobProduct) => (
                                        <JobProduct
                                            key={jobProduct.jobProductId}
                                            productData={jobProduct} />
                                    ))}
                                </SortableContext>
                            </div>

                            <JobTotals
                                totalRevenue={totals.revenue}
                                totalCost={totals.cost}
                                totalProfit={totals.profit}
                            />

                            <div className="job-buttons-container">
                                {isSaved ? null : <ButtonSaveJob />}
                                {(jobData.jobStatus === "Cerrado" || jobData.jobStatus === "Entregado") && <ButtonReopenJob />}
                                {jobData.jobStatus === "Nuevo" && <ButtonConfirmJob />}
                                {jobData.jobStatus === "Nuevo" && <ButtonCalculateJob />}
                                {(jobData.jobStatus === "Entregado" || jobData.jobStatus === "Reclamo") && <ButtonCloseJob />}

                                <ButtonAddJobProduct />
                                <TextButton
                                    text="Cancelar"
                                    onClick={() => navigate("/production")}
                                />
                                <ButtonCancelJob />
                            </div>
                        </>
                    </DndContext>
                )
            }
        </div >
    );
}

export default DetailedJobContainer;