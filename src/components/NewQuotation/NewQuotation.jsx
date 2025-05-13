import { useContext, useEffect, useState } from "react";
import { apiClient } from "../../config/axiosConfig.js";
import "./OneQuotationContainer.css"

import { QuotationContext } from "../../context/QuotationContext";

import DateField from "./InputComponents/DateField.jsx";
import CurrencySelect from "./InputComponents/CurrencySelect.jsx";
import ExchangeRateInput from "./InputComponents/ExchangeRateInput.jsx";
import QuoteStatusSelect from "./InputComponents/QuoteStatusSelect.jsx";
import IsKitCheckbox from "./InputComponents/IsKitCheckbox.jsx";
import MonthlyRateInput from "./InputComponents/MonthlyRateInput.jsx";

import SelectCustomer from "./Selectors/SelectCustomer.jsx";
import SelectCustomerPayMethod from "./Selectors/SelectCustomerPaymentMethod.jsx";

import IconButton from "../Utils/IconButton.jsx";


const NewQuotation = () => {

    const { quotationData, updateQuotationData } = useContext(QuotationContext);

    const getPaymentMethodData = async (paymentId) => {
        try {
            const response = await apiClient.get(`/customer-payment-methods/${paymentId}`);
            const paymentMethod = response.data.response;
            return paymentMethod;
        } catch (error) {
            console.error("Error fetching customer payment method:", error);
        }
    };

    const handleCustomerUpdate = async (customer) => {
        const paymentMethodData = await getPaymentMethodData(customer.customerPaymentMethodId);
        updateQuotationData({
            customerId: customer._id || "",
            customerName: customer.name || "",
            paymentMethodId: customer.customerPaymentMethodId || "",
            paymentMethodName: paymentMethodData.customer_payment_description || "",
            paymentDaysToCollect: paymentMethodData.days_to_collect || 0,
        })
    };

    const handleCustomerPaymentMethodUpdate = (newCustomerPaymentMethod) => {
        updateQuotationData({
            paymentMethodId: newCustomerPaymentMethod._id || "",
            paymentMethodName: newCustomerPaymentMethod.customer_payment_description || "",
            paymentDaysToCollect: newCustomerPaymentMethod.days_to_collect || 0,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post("/quotations", quotationData);
            const dbId = response.data.response._id;
            if (dbId) {
                updateQuotationData({id: dbId});
            }
        } catch (error) {
            console.error("Error submitting quotation:", error);
        }
    };

    return (
        <tr key={quotationData.id + "-Test"}>
            <DateField value={quotationData.date} onChange={(e) => updateQuotationData({ date: e.target.value })} />
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
            <MonthlyRateInput value={quotationData.monthlyRate} onChange={(e) => updateQuotationData({ monthlyRate: e.target.value })} />
            <CurrencySelect value={quotationData.currency} onChange={(e) => updateQuotationData({ currency: e.target.value })} />
            <ExchangeRateInput value={quotationData.exchangeRate} onChange={(e) => updateQuotationData({ exchangeRate: e.target.value })} />
            <QuoteStatusSelect value={quotationData.quoteStatus} onChange={(e) => updateQuotationData({ ...quotationData, quoteStatus: e.target.value })} />
            <IsKitCheckbox checked={quotationData.isKit} onChange={(e) => updateQuotationData({ isKit: e.target.checked })} />
            
            <td>
                {quotationData.id === '' ? (
                        <IconButton icon="/create.png" text="Crear Cotización" onClick={handleSubmit} />
                    ) : null}
            </td>
        </tr>
    );
};

export default NewQuotation;
