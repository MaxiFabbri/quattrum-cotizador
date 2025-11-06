import { useContext, useState, useEffect } from "react";
import { QuotationContext } from "../../../context/QuotationContext.jsx";
import { ParametersContext } from "../../../context/ParametersContext.jsx";
import { JobContext } from "../../../context/JobContext.jsx";
import { apiClient } from "../../../config/axiosConfig.js";
import TextButton from "../../Utils/TextButton.jsx";
import { useNavigate } from "react-router-dom";

const ButtonApproveQuotation = () => {
    const { quotationData, changeQuotationStatus } = useContext(QuotationContext);
    const { JobData, updateJobData, addJobProduct } = useContext(JobContext);
    const { dolarPrice, paramMonthlyRate } = useContext(ParametersContext);
    const [shouldCalculate, setShouldCalculate] = useState(false);
    const today = new Date().toISOString().split("T")[0];
    const navigate = useNavigate();

    const saveNewJob = async () => {
        let newJobId = "";

        const jobToSave = {
            quotationId: quotationData.id,
            approvalDate: today,
            customerId: quotationData.customerId,
            paymentMethodId: quotationData.paymentMethodId,
            customerPaymentDetails: quotationData.customerPaymentDetails,
            currency: quotationData.currency,
            exchangeRate: quotationData.exchangeRate,
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
            changeQuotationStatus({ quoteStatus: "Aprobado" }, quotationData.id)
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
                otherCost: product.otherCost,
                unitSellingPrice: product.unitSellingPrice,
                calculatedSellingPrice: product.calculatedSellingPrice,
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
                    isManual: product.isManual,
                    jobProductDescription: product.productDescription,
                    totalProductCost: product.totalProductCost,
                    order: product.order,
                    jobProductNote: "",
                    jobProcesses: []
                }, product.productId);
            } catch (error) {
                console.error("Error al guardar el producto: ", error);
            }

            // Procesar todos los procesos del producto
            // const processPromises = product.processes.map(async (process) => {
            //     const processToSave = {
            //         productId: newProductId,
            //         description: process.description,
            //         supplierId: process.supplierId,
            //         supplierPaymentMethodId: process.supplierPaymentMethodId,
            //         daysToPayment: process.daysToPayment,
            //         currency: process.currency,
            //         adjustPercentage: process.adjustPercentage,
            //         enteredUnitCost: process.enteredUnitCost,
            //         unitCost: +(process.enteredUnitCost / (process.currency === "Peso" ? quotationToSave.exchangeRate : 1)),
            //         enteredFixedCost: process.enteredFixedCost,
            //         fixedCost: +(process.enteredFixedCost / (process.currency === "Peso" ? quotationToSave.exchangeRate : 1)),
            //         order: process.order,
            //         subTotalProcessCost: +process.subTotalProcessCost,
            //     };
            //     console.log("processToSave", processToSave);

            //     try {
            //         const responseProcess = await apiClient.post('/processes/', processToSave);
            //         console.log("responseProcess", responseProcess);
            //         updateProcessInProduct({
            //             processId: responseProcess.data.response._id,
            //             productId: newProductId,
            //             unitCost: processToSave.unitCost,
            //             fixedCost: processToSave.fixedCost,
            //             savedToDb: true,
            //         }, process.processId);
            //     } catch (error) {
            //         console.error("Error al guardar el proceso: ", error);
            //     }
            // });
            // await Promise.all(processPromises);
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