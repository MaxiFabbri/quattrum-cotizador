import { use, useContext, useEffect, useState } from "react";
import { apiClient } from "../../config/axiosConfig.js";
import "./OneQuotationContainer.css"

import { QuotationContext } from "../../context/QuotationContext";
import { ParametersContext } from "../../context/ParametersContext.jsx";

import DateField from "./InputComponents/DateField.jsx";
import CurrencySelect from "./InputComponents/CurrencySelect.jsx";
import ExchangeRateInput from "./InputComponents/ExchangeRateInput.jsx";
import QuoteStatusSelect from "./InputComponents/QuoteStatusSelect.jsx";
import IsKitCheckbox from "./InputComponents/IsKitCheckbox.jsx";
import MonthlyRateInput from "./InputComponents/MonthlyRateInput.jsx";
import CalculateFinancingCheckbox from "./InputComponents/CalculateFinancingCheckBox.jsx";

import SelectCustomer from "../Utils/Selectors/SelectCustomer.jsx";
import SelectCustomerPayMethod from "../Utils/Selectors/SelectCustomerPaymentMethod.jsx";
import { useAddProductWithQuotation } from "./QuotationUtils/useAddProductWithQuotation.jsx";
import { validateNewQuotation } from "./QuotationUtils/validateQuotation.jsx";
import IconButton from "../Utils/IconButton.jsx";
import { toast } from "react-toastify";


const NewQuotation = () => {
    const { getDolarPrice } = useContext(ParametersContext);
    const { quotationData, updateQuotationData, setIsSaved } = useContext(QuotationContext);
    const [quotationId, setQuotationId] = useState(null);

    useAddProductWithQuotation(quotationId);
    getDolarPrice();

    const getPaymentMethodData = async (paymentId) => {
        try {
            const response = await apiClient.get(`/customer-payment-methods/${paymentId}`);
            const paymentMethod = response.data.response;
            return paymentMethod;
        } catch (error) {
            console.error("Error fetching customer payment method:", error);
            const paymentMethod = { customer_payment_description: "Elija forma de pago" };
            return paymentMethod;
        }
    };

    const handleCustomerUpdate = async (customer) => {
        setIsSaved(false);
        console.log("Customer selected:", customer);
        const paymentMethodData = await getPaymentMethodData(customer.customerPaymentMethodId);
        console.log("Fetched payment method data:", paymentMethodData);
        updateQuotationData({
            customerId: customer._id || "",
            customerName: customer.name || "",
            paymentMethodId: customer.customerPaymentMethodId || "",
            paymentMethodName: paymentMethodData.customer_payment_description || "",
            customerPaymentDetails: paymentMethodData.customer_payment_details || [],
            // paymentDaysToCollect: paymentMethodData.days_to_collect || 0,
        })
    };

    const handleCustomerPaymentMethodUpdate = (newCustomerPaymentMethod) => {
        setIsSaved(false);
        updateQuotationData({
            paymentMethodId: newCustomerPaymentMethod._id || "",
            paymentMethodName: newCustomerPaymentMethod.customer_payment_description || "",
            customerPaymentDetails: newCustomerPaymentMethod.customer_payment_details || [],
            // paymentDaysToCollect: newCustomerPaymentMethod.days_to_collect || 0,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { isValid, errors } = validateNewQuotation(quotationData);
        if (!isValid) {
            errors.map((error) => {
                toast.error(error, {
                    position: "top-center",
                    autoClose: 6000
                });
            });
            return;
        }
        try {
            console.log("Submitting quotation:", quotationData)
            const response = await apiClient.post("/quotations", quotationData);
            const dbId = response.data.response._id;
            if (dbId) {
                updateQuotationData({id: dbId});
                setQuotationId(dbId);
            }
        } catch (error) {
            console.error("Error submitting quotation:", error);
        }
    };

    const handleChange = (updates) => {
        updateQuotationData(updates);
        setIsSaved(false);
    };

    return (
        <tr key={quotationData.id + "-Test"}>
            <DateField value={quotationData.date} onChange={(e) => handleChange({ date: e.target.value })} />
            <td>
                <SelectCustomer
                    defaultCustomer={quotationData.customerName || ""}
                    onSelectCustomer={handleCustomerUpdate} />
            </td>
            <td>
                <SelectCustomerPayMethod
                    defaultPayment={quotationData.paymentMethodName || ""}
                    onSelectCustomerPayMethod={handleCustomerPaymentMethodUpdate}
                />
            </td>
            <td>
                <MonthlyRateInput value={quotationData.monthlyRate} onChange={(e) => handleChange({ monthlyRate: e.target.value })} />
                <CalculateFinancingCheckbox checked={quotationData.calculateFinancing} onChange={(e) => handleChange({ calculateFinancing: e.target.checked })} />
            </td>
            <CurrencySelect value={quotationData.currency} onChange={(e) => handleChange({ currency: e.target.value })} />
            <ExchangeRateInput value={quotationData.exchangeRate} onChange={(e) => handleChange({ exchangeRate: +(e.target.value) })} />
            <QuoteStatusSelect value={quotationData.quoteStatus} onChange={(e) => handleChange({ ...quotationData, quoteStatus: e.target.value })} />
            <IsKitCheckbox checked={quotationData.isKit} onChange={(e) => handleChange({ isKit: e.target.checked })} />
            
            <td>
                {quotationData.id === '' ? (
                        <IconButton icon="/images/create.png" text="Crear Cotización" onClick={handleSubmit} />
                    ) : null}
            </td>
        </tr>
    );
};

export default NewQuotation;
