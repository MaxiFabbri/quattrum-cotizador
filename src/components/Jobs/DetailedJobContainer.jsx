import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { closestCenter, DndContext } from '@dnd-kit/core';
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import "./JobContainer.css"

import { JobHeader } from "./JobElements/JobHeader.jsx";
import { QuotationHeader } from "../NewQuotation/QuotationUtils/NewQuotationHeaders.jsx";
import NewJob from "./NewJob.jsx";
import JobProduct from "./JobElements/JobProduct.jsx";

import { QuotationContext } from "../../context/QuotationContext.jsx";
import { JobContext } from "../../context/JobContext.jsx";
import TextButton from "../Utils/TextButton.jsx";
import ButtonSaveJob from "./JobsUtils/ButtonSaveJob.jsx";



import { apiClient } from "../../config/axiosConfig.js";

const DetailedJobContainer = () => {
    const { quotationData, clearQuotationData, updateQuotationData, setIsSaved } = useContext(QuotationContext);
    const { jobData, updateJobData, clearJobData } = useContext(JobContext);
    const [activeId, setActiveId] = useState(null)
    const { id } = useParams()
    const navigate = useNavigate();

    useEffect(() => {
        clearQuotationData();
        clearJobData();
        getJobDataFromDb(id);
    }, [id]);
    
    // Formatear la fecha
    const formatDate = (utcDate) => {
        ;
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
                description: process.description,
                supplierId: process.supplierId._id,
                supplierPaymentMethodId: process.supplierPaymentMethodId._id,
                supplierPaymentDetails: process.supplierPaymentDetails,
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
                // daysToPayment: process.daysToPayment,
                // tempunitCost: +(process.enteredUnitCost).toFixed(2),
                // tempfixedCost: +(process.enteredFixedCost).toFixed(2),
                // savedToDb: true,
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
            console.log("New Job Processes for Job Product: ", newJobProcesses)
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
            quotationId: recievedData.quotationId,
            approvalDate: formatDate(recievedData.approvalDate),
            deliveryDate: formatDate(recievedData.deliveryDate) || "",
            customerId: recievedData.customerId._id,
            customerName: recievedData.customerId.name,
            paymentMethodId: recievedData.paymentMethodId._id,
            paymentMethodName: recievedData.paymentMethodId.customer_payment_description,
            customerPaymentDetails: recievedData.paymentMethodId.customer_payment_details,
            monthlyRate: recievedData.monthlyRate,
            currency: recievedData.currency,
            exchangeRate: recievedData.exchangeRate,
            jobStatus: recievedData.jobStatus,
            isKit: recievedData.isKit || false,
            jobNotes: recievedData.jobNotes || "",
        }	
        // agrego los Productos
        const responseJobProducts = await apiClient.get(`/job-products/job/${id}`)
        const exchangeRate = responseJobProducts.data.response.exchangeRate
        const newJobProducts = await adjustJobProductData(responseJobProducts.data.response, exchangeRate)
        newData = { ...newData, jobProducts: newJobProducts }
        updateJobData(
            newData
        );
        return newData
    }

    const handleProductsDragEnd = (event) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        const products = jobData.products;
        const oldIndex = jobData.products.findIndex(p => p.productId === active.id);
        const newIndex = jobData.products.findIndex(p => p.productId === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const updatedProducts = arrayMove(products, oldIndex, newIndex);
        console.log("After: ", updatedProducts)

        updateQuotationData({
            ...jobData,
            products: updatedProducts
        });
        setIsSaved(false);
        setActiveId(null);
    };

    return (
        <div>
            <DndContext
                collisionDetection={closestCenter}
                onDragStart={(event) => setActiveId(event.active.id)}
                onDragEnd={handleProductsDragEnd}
            >
                <div className="quotation-container">
                    <table className="quotation-table-quotation">
                        <JobHeader />
                        <tbody>
                            <NewJob />
                        </tbody>
                    </table>
                </div>
                <>
                    <div className="quotation-table-products">
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
                    <div className="quotation-buttons-container">
                        <ButtonSaveJob />
                        {/* <ButtonAddProduct />
                        <ButtonCalculateQuotation />
                        <ButtonSaveQuotation />
                        <ButtonDuplicateQuotation />
                        <ButtonApproveQuotation />
                        <TextButton
                            text="Cancelar"
                            onClick={() => navigate("/")}
                        /> */}
                    </div>
                </>
            </DndContext>
        </div >
    );
}

export default DetailedJobContainer;