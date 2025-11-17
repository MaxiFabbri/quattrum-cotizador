import { use, useContext, useEffect, useState } from "react";
import { apiClient } from "../../config/axiosConfig.js";
import "./JobContainer.css"

import { QuotationContext } from "../../context/QuotationContext.jsx";
import { ParametersContext } from "../../context/ParametersContext.jsx";
import { JobContext } from "../../context/JobContext.jsx";

import DateField from "../NewQuotation/InputComponents/DateField.jsx";
import CurrencySelect from "../NewQuotation/InputComponents/CurrencySelect.jsx";
import ExchangeRateInput from "../NewQuotation/InputComponents/ExchangeRateInput.jsx";
import QuoteStatusSelect from "../NewQuotation/InputComponents/QuoteStatusSelect.jsx";
import IsKitCheckbox from "../NewQuotation/InputComponents/IsKitCheckbox.jsx";
import MonthlyRateInput from "../NewQuotation/InputComponents/MonthlyRateInput.jsx";
import CalculateFinancingCheckbox from "../NewQuotation/InputComponents/CalculateFinancingCheckBox.jsx";

import SelectCustomer from "../Utils/Selectors/SelectCustomer.jsx";
import SelectCustomerPayMethod from "../Utils/Selectors/SelectCustomerPaymentMethod.jsx";
import { useAddProductWithQuotation } from "../NewQuotation/QuotationUtils/useAddProductWithQuotation.jsx";
import { validateNewQuotation } from "../NewQuotation/QuotationUtils/validateQuotation.jsx";
import IconButton from "../Utils/IconButton.jsx";
import { toast } from "react-toastify";


const NewJob = () => {
    const { getDolarPrice } = useContext(ParametersContext);
    const { quotationData } = useContext(QuotationContext);
    const { jobData, setJobData, updateJobData, setIsUpdated } = useContext(JobContext);
    const [quotationId, setQuotationId] = useState(null);

    // useAddProductWithQuotation(quotationId);
    // getDolarPrice();

    // const getPaymentMethodData = async (paymentId) => {
    //     try {
    //         const response = await apiClient.get(`/customer-payment-methods/${paymentId}`);
    //         const paymentMethod = response.data.response;
    //         return paymentMethod;
    //     } catch (error) {
    //         console.error("Error fetching customer payment method:", error);
    //         const paymentMethod = { customer_payment_description: "Elija forma de pago" };
    //         return paymentMethod;
    //     }
    // };

    // const handleCustomerUpdate = async (customer) => {
    //     setIsSaved(false);
    //     console.log("Customer selected:", customer);
    //     const paymentMethodData = await getPaymentMethodData(customer.customerPaymentMethodId);
    //     console.log("Fetched payment method data:", paymentMethodData);
    //     updateQuotationData({
    //         customerId: customer._id || "",
    //         customerName: customer.name || "",
    //         paymentMethodId: customer.customerPaymentMethodId || "",
    //         paymentMethodName: paymentMethodData.customer_payment_description || "",
    //         customerPaymentDetails: paymentMethodData.customer_payment_details || [],
    //         // paymentDaysToCollect: paymentMethodData.days_to_collect || 0,
    //     })
    // };

    // const handleCustomerPaymentMethodUpdate = (newCustomerPaymentMethod) => {
    //     setIsSaved(false);
    //     updateQuotationData({
    //         paymentMethodId: newCustomerPaymentMethod._id || "",
    //         paymentMethodName: newCustomerPaymentMethod.customer_payment_description || "",
    //         customerPaymentDetails: newCustomerPaymentMethod.customer_payment_details || [],
    //         // paymentDaysToCollect: newCustomerPaymentMethod.days_to_collect || 0,
    //     });
    // };

    // Manejo de cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log("Input changed:", name, value);
        setJobData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
        // setIsUpdated(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Handling submit for Job:", jobData);
    };

    const handleChange = (updates) => {
        updateJobData(updates);
        // setIsUpdated(true);
    };

    return (
        <tr key={jobData.jobId}>
            <DateField value={jobData.approvalDate} onChange={(e) => handleChange({ approvalDate: e.target.value })} />
            <DateField value={jobData.deliveryDate} onChange={(e) => handleChange({ deliveryDate: e.target.value })} />
            <td>
                <input
                    type="text"
                    placeholder="Cliente"
                    defaultValue={jobData.customerName}
                />
            </td>
            <CurrencySelect value={jobData.currency} onChange={(e) => handleChange({ currency: e.target.value })} />
            <ExchangeRateInput value={jobData.exchangeRate} onChange={(e) => handleChange({ exchangeRate: +(e.target.value) })} />
            <QuoteStatusSelect value={jobData.quoteStatus} onChange={(e) => handleChange({ ...jobData, quoteStatus: e.target.value })} />
            <IsKitCheckbox checked={jobData.isKit} onChange={(e) => handleChange({ isKit: e.target.checked })} />
            <td>
                <input
                    type="text"
                    name="jobNotes"
                    placeholder="Notas del trabajo"
                    defaultValue={jobData.jobNotes}
                    onClick={(e) => e.target.select()}
                    onInput={handleInputChange}
                    // value={jobData.jobNotes}
                    // onChange={(e) => handleChange({ jobNotes: e.target.value })}
                />
            </td>
            <td>
                {quotationData.id === '' ? (
                    <IconButton icon="/create.png" text="Crear Cotización" onClick={handleSubmit} />
                ) : null}
            </td>
        </tr>
    );
};

export default NewJob;
