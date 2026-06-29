export const getSellingFinanceCost = async (subTotalCost, productionDays, customerPaymentDetails, monthlyRate) => {
    console.log("Calculando costo financiero de venta: ", subTotalCost, productionDays, customerPaymentDetails, monthlyRate);
    let sellFinanceCost = 0;
    let paymentDetails = customerPaymentDetails;
    sellFinanceCost += paymentDetails.reduce((acc, element) => {
        return acc + calculateItemFinanceCost(subTotalCost, productionDays, element, monthlyRate);
    }, 0);
    return sellFinanceCost;
};

export const getBuyingFinanceCost = async (subTotalCost, supplierPaymentDetails, productionDays, monthlyRate) => {
    let buyFinanceCost = 0;
    let paymentDetails = supplierPaymentDetails;
    buyFinanceCost += paymentDetails.reduce((acc, element) => {
        return acc + calculateItemFinanceCost(subTotalCost, productionDays, element, monthlyRate);
    }, 0);
    return buyFinanceCost;
};

const calculateItemFinanceCost = (totalProductCost, productionDays, paymentItem, monthlyRate) => {
    const paymentDays = Number(paymentItem.days) || 0;
    const production = Number(productionDays) || 0;
    const totalDays = paymentDays + production;
    const monthsToFinance = paymentItem.downpayment ? (paymentDays / 30) : (totalDays / 30);
    const amountToFinance = totalProductCost * (paymentItem.percentage / 100);
    const newMonthlyRate = 1 + Number(monthlyRate / 100)
    const itemFinanceCost = Number(
        (amountToFinance * Math.pow(newMonthlyRate, monthsToFinance))
        - amountToFinance
    );

    return itemFinanceCost;
}