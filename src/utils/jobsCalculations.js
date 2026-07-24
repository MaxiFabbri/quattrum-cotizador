import { toast } from "react-toastify";
import { getSellingFinanceCost, getBuyingFinanceCost } from "./financeCostCalculations.js";


export const newhandleCalculateJob = async (recalculateAll, jobData, utilitiesTable, tax) => {
    console.log("Iniciando jobsCalculations: ", jobData)
    let newJobData = structuredClone(jobData);
    const jobTotals = getJobTotalCost(newJobData);
    const { jobTotalCost, productsTotalCost } = jobTotals;
    const kitTargetUtilities = utilitiesTable.find((utility) => jobTotalCost < utility.upTo);
    const updatedJobProducts = [];
    let totalSinglePrice = 0;
    let totalKitPrice = 0;

    for (const jobProduct of newJobData.jobProducts) {
        let newJobProduct = structuredClone(jobProduct);
        let newJobProductDescription = "";
        let sellingFinanceCost = 0;
        let buyingFinanceCost = 0;
        let totalProductCost = 0;
        let newFinancingCost = 0;
        const updatedJobProcesses = [];
        const productCost = productsTotalCost[newJobProduct.jobProductId].totalFinalCost;
        const singleTargetUtility = utilitiesTable.find((utility) => productCost < utility.upTo);

        for (const process of newJobProduct.processes) {
            newJobProductDescription += newJobProductDescription ? `, ${process.description}` : process.description;

            const newSubtotalProcessCost = calculateProcessSubtotalCost(process, newJobProduct.quantity, newJobData.exchangeRate);
            totalProductCost += newSubtotalProcessCost;
            if (jobData.calculateFinancing) {
                const sellCost = await getSellingFinanceCost(newSubtotalProcessCost, newJobProduct.productionDays, newJobData.customerPaymentDetails, newJobData.monthlyRate);
                const buyCost = await getBuyingFinanceCost(newSubtotalProcessCost, process.supplierPaymentDetails, newJobProduct.productionDays, newJobData.monthlyRate);
                sellingFinanceCost += sellCost;
                buyingFinanceCost += buyCost;
            }
            updatedJobProcesses.push({
                ...process,
                subTotalProcessCost: newSubtotalProcessCost,
            });
        }
        toast.info(`Calculando el costo del producto: ${newJobProductDescription}`, {
            position: "top-center",
            autoClose: 1000
        })
        if (jobData.calculateFinancing) {
            if (sellingFinanceCost > buyingFinanceCost) {
                newFinancingCost = sellingFinanceCost - buyingFinanceCost;
            }
        } else {
            newFinancingCost = 0;
        }

        const finalCost = totalProductCost + newJobProduct.shipmentCost + newJobProduct.otherCost;

        const singleMinUtilitie = singleTargetUtility.productMinimun;
        const singlePercentageUtilitie = singleTargetUtility.productUtilitie / 100;
        const singleCalculatedSellingPrice = calculateUniteSellingPrice(finalCost, newFinancingCost, newJobProduct.quantity, singlePercentageUtilitie, singleMinUtilitie, tax);
        totalSinglePrice += singleCalculatedSellingPrice * newJobProduct.quantity;
        let calculatedSellingPrice = 0;
        if (newJobData.isKit) {
            const kitMinUtilitie = (totalProductCost / jobTotalCost) * kitTargetUtilities.kitMinimun;
            const kitPercentageUtilitie = kitTargetUtilities.kitUtilitie / 100;
            calculatedSellingPrice = calculateUniteSellingPrice(finalCost, newFinancingCost, newJobProduct.quantity, kitPercentageUtilitie, kitMinUtilitie, tax);
            totalKitPrice += calculatedSellingPrice * newJobProduct.quantity;
        } else {
            calculatedSellingPrice = singleCalculatedSellingPrice;
        }

        const pesosPrice = parseFloat((calculatedSellingPrice * newJobData.exchangeRate).toFixed(0));

        let newPrice;
        if (!recalculateAll && newJobProduct.isManual) {
            newPrice = {
                unitSellingPrice: product.unitSellingPrice,
                isManual: product.isManual,
            };
        } else {
            newPrice = {
                unitSellingPrice: calculatedSellingPrice,
                isManual: false,
            };
        }

        const updatedJobProduct =
        {
            ...newJobProduct,
            jobProductDescription: newJobProductDescription,
            calculatedSellingPrice,
            financingCost: newFinancingCost,
            totalProductCost: finalCost,
            pesosPrice: pesosPrice,
            processes: updatedJobProcesses,
            ...newPrice
        };
        updatedJobProducts.push(updatedJobProduct);
    }
    if (newJobData.isKit && totalSinglePrice < totalKitPrice) {
        console.log("El precio unitario de venta del kit es menor que la suma de los precios unitarios de venta de los productos individuales. Se ajustará el precio unitario de venta del kit al precio unitario de venta de los productos individuales.");
        console.log("Total Kit Price: ", totalKitPrice);
        console.log("Total Single Price: ", totalSinglePrice);
        toast.error("El costo TOTAL CON KIT, es mayor al costo TOTAL SIN KIT", {
            autoClose: false,
            closeOnClick: true,
            position: "top-center"
        });
    }

    newJobData = {
        ...newJobData,
        jobProducts: updatedJobProducts
    };
    
    return newJobData;
};

const calculateUniteSellingPrice = (totalProductCost, financingCost, quantity, percentageUtilitie, minUtilitie, tax) => {
    console.log("Calculando precio unitario de venta: ", { totalProductCost, financingCost, quantity, percentageUtilitie, minUtilitie, tax });
    let newNetProductCost = parseFloat(totalProductCost / (1 - (percentageUtilitie + tax)))
    if (newNetProductCost * percentageUtilitie < minUtilitie) {
        newNetProductCost = parseFloat((totalProductCost + minUtilitie) / (1 - tax))
    }
    const totalFinancingCost = parseFloat(financingCost / (1 - tax))
    const unitSellingPrice = parseFloat((newNetProductCost + totalFinancingCost) / quantity);
    console.log("Precio unitario de venta calculado: ", unitSellingPrice);
    return unitSellingPrice;
};

const calculateProcessSubtotalCost = (process, quantity, exchangeRate) => {
    process.unitCost = +process.enteredUnitCost / (process.currency === "Peso" ? exchangeRate : 1);
    process.fixedCost = +process.enteredFixedCost / (process.currency === "Peso" ? exchangeRate : 1);
    const adjust = 1 + ((Number(process.adjustPercentage) || 0) / 100);
    const newSubtotalProcessCost = ((process.unitCost * quantity) * adjust) + process.fixedCost;
    return newSubtotalProcessCost;
}

const getJobTotalCost = (data) => {
    const exchangeRate = data.exchangeRate;
    let jobTotalCost = 0;
    const productsTotalCost = {};
    data.jobProducts.forEach((product) => {
        const shipmentCost = +product.enteredShipmentCost / exchangeRate;
        const otherCost = +product.enteredOtherCost / exchangeRate;
        let totalProductCost = 0;
        product.processes.forEach((process) => {
            const unitCost = +process.enteredUnitCost / (process.currency === "Peso" ? exchangeRate : 1);
            const fixedCost = +process.enteredFixedCost / (process.currency === "Peso" ? exchangeRate : 1);
            const adjust = 1 + ((Number(process.adjustPercentage) || 0) / 100);
            const newSubtotalProcessCost = ((unitCost * product.quantity) * adjust) + fixedCost;
            totalProductCost += newSubtotalProcessCost;
        });

        const totalFinalCost = totalProductCost + shipmentCost + otherCost;
        jobTotalCost += totalFinalCost;

        productsTotalCost[product.jobProductId] = { totalFinalCost };
    });
    return { jobTotalCost, productsTotalCost };
};

