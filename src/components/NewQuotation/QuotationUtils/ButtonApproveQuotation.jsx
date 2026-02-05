import { useContext, useState, useEffect } from "react";
import { QuotationContext } from "../../../context/QuotationContext.jsx";
import { ParametersContext } from "../../../context/ParametersContext.jsx";
import { JobContext } from "../../../context/JobContext.jsx";
import { apiClient } from "../../../config/axiosConfig.js";
import TextButton from "../../Utils/TextButton.jsx";
import { useNavigate } from "react-router-dom";

const ButtonApproveQuotation = () => {
    const { quotationData, changeQuotationStatus } = useContext(QuotationContext);
    const { JobData, updateJobData, addJobProduct, addJobProcessToProduct } = useContext(JobContext);
    const { dolarPrice, paramMonthlyRate } = useContext(ParametersContext);
    const [shouldCalculate, setShouldCalculate] = useState(false);
    const today = new Date().toISOString().split("T")[0];
    const navigate = useNavigate();

    const saveNewJob = async () => {
        let newJobId = "";

        const jobToSave = {
            quotationId: quotationData.id,
            calculateFinancing: quotationData.calculateFinancing,
            approvalDate: today,
            deliveryDate: today,
            customerId: quotationData.customerId,
            paymentMethodId: quotationData.paymentMethodId,
            customerPaymentDetails: quotationData.customerPaymentDetails,
            monthlyRate: quotationData.monthlyRate,
            currency: quotationData.currency,
            exchangeRate: quotationData.exchangeRate,
            approvedExchangeRate: quotationData.exchangeRate,
            jobStatus: "Aprobado",
            isKit: quotationData.isKit,
            jobNotes: ""
        };

        try {
            console.log("jobToSave en approve Quotation: ", jobToSave);
            const responseQuote = await apiClient.post("/jobs", jobToSave);
            newJobId = responseQuote.data.response._id;
            updateJobData({
                jobId: newJobId,
                quotationId: quotationData.id,
                approvalDate: today,
                // deliveryDate: to be defined,
                customerId: quotationData.customerId,
                paymentMethodId: quotationData.paymentMethodId,
                customerPaymentDetails: quotationData.customerPaymentDetails,
                currency: quotationData.currency,
                exchangeRate: quotationData.exchangeRate,
                jobStatus: "Aprobado",
                isKit: quotationData.isKit,
                jobNotes: ""
            });
            changeQuotationStatus( "Aprobado" , quotationData.id)
        } catch (error) {
            console.error("Error al guardar la cotización: ", error);
            return;
        }

        await Promise.resolve();
        // Procesar todos los productos y procesos
        const jobProductPromises = quotationData.products.map(async (product) => {
            let newJobProductId = product.productId;

            const jobProductToSave = {
                jobId: newJobId,
                quantity: product.quantity,
                productionDays: product.productionDays,
                financingCost: product.financingCost,
                shipmentCost: product.shipmentCost,
                enteredShipmentCost: product.enteredShipmentCost,
                otherCost: product.otherCost,
                enteredOtherCost: product.enteredOtherCost,
                unitSellingPrice: product.unitSellingPrice,
                calculatedSellingPrice: product.calculatedSellingPrice,
                approvedSellingPrice: +(product.calculatedSellingPrice * quotationData.exchangeRate),
                isManual: product.isManual,
                jobProductDescription: product.productDescription,
                totalProductCost: product.totalProductCost,
                order: product.order,
                jobProductNote: "",
                jobProcesses: []
            };
            console.log("jobProductToSave en Approve Quotation: ", jobProductToSave);

            try {
                const responseProduct = await apiClient.post('/job-products/', jobProductToSave);
                newJobProductId = responseProduct.data.response._id;

                addJobProduct({
                    jobProdId: newJobProductId,
                    jobId: newJobId,
                    quantity: product.quantity,
                    productionDays: product.productionDays,
                    financingCost: product.financingCost,
                    shipmentCost: product.shipmentCost,
                    otherCost: product.otherCost,
                    unitSellingPrice: product.unitSellingPrice,
                    calculatedSellingPrice: product.calculatedSellingPrice,
                    approvedSellingPrice: +(product.calculatedSellingPrice * quotationData.exchangeRate),
                    isManual: product.isManual,
                    jobProductDescription: product.productDescription,
                    totalProductCost: product.totalProductCost,
                    order: product.order,
                    jobProductNote: "",
                    jobProcesses: []
                });
            } catch (error) {
                console.error("Error al guardar el producto: ", error);
            }

            // Procesar todos los procesos del producto
            const jobProcessPromises = product.processes.map(async (process) => {
                const jobProcessToSave = {
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
                    order: process.order,
                    jobProcessNotes: ""
                };
                console.log("jobProcessToSave", jobProcessToSave);

                try {
                    const responseJobProcess = await apiClient.post('/job-processes/', jobProcessToSave);
                    console.log("responseJobProcess", responseJobProcess);
                    
                    addJobProcessToProduct({
                        jobProcId: responseJobProcess.data.response._id,
                        ...jobProcessToSave
                    });
                
                } catch (error) {
                    console.error("Error al guardar el proceso: ", error);
                }
            });
            await Promise.all(jobProcessPromises);
        });

        await Promise.all(jobProductPromises);
        // setShouldCalculate(true)
    };

    const handleApproveQuotation = () => {
        saveNewJob()
    }

    useEffect(() => {
        if (shouldCalculate) {
            calculateQuotation(false);
            setShouldCalculate(false); // Resetear el flag
            // Navegar a la nueva cotización
            navigate(`/detailed-quotation/${quotationData.id}`);
        }
    }, [shouldCalculate]);

    return (
        <TextButton
            text="Aprobar Cotización"
            onClick={handleApproveQuotation}
        />
    );
}

export default ButtonApproveQuotation;