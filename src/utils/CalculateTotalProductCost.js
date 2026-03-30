export function calculateTotalProductCost(productData, exchangeRate) {
    let newTotalProductCost = productData.otherCost + productData.shipmentCost;

    for (const jobProcess of productData.processes) {
        const subTotalProcessCost = calculateSubTotalProcessCost(jobProcess, productData.quantity, exchangeRate);
        newTotalProductCost += subTotalProcessCost;
    }
    return newTotalProductCost;
    }

export function calculateSubTotalProcessCost(jobProcess, quantity, exchangeRate) {
    const unitCost = +jobProcess.enteredUnitCost /
        (jobProcess.currency === "Peso" ? exchangeRate : 1);
    const fixedCost = +jobProcess.enteredFixedCost /
        (jobProcess.currency === "Peso" ? exchangeRate : 1);
    const adjust = 1 + ((Number(jobProcess.adjustPercentage) || 0) / 100);
    const newSubtotalProcessCost = ((unitCost * quantity) * adjust) + fixedCost;
    return newSubtotalProcessCost;
}