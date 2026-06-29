// src/state/quotationState.js

// Estado inicial de una cotización
export const initialQuotationDataState = {
    id: "",
    date: "",
    customerId: "",
    customerName: "",
    customerNote: "",
    paymentMethodId: "",
    paymentMethodName: "",
    customerPaymentDetails: [],
    paymentDaysToCollect: 0,
    monthlyRate: 0,
    currency: "Peso",
    exchangeRate: 0,
    quoteStatus: "Cotizado",
    quoteUnitSellingPrice: 0,
    quoteProductsDescription: "",
    isKit: false,
    calculateFinancing: true,
    products: [],
};


