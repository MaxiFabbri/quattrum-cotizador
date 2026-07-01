import { toast } from "react-toastify";
import { getSellingFinanceCost, getBuyingFinanceCost } from "./financeCostCalculations.js";


export const handleCalculateQuotation = async (recalculateAll, quotationData, utilitiesTable, tax) => {
    let newQuotationData = structuredClone(quotationData);
    const quotationTotals = getQuotationTotalCost(newQuotationData);
    const { quotationTotalCost, productsTotalCost } = quotationTotals;
    const kitTargetUtilities = utilitiesTable.find((utility) => quotationTotalCost < utility.upTo);
    const updatedProducts = [];
    let totalSinglePrice = 0;
    let totalKitPrice = 0;

    for (const product of newQuotationData.products) {
        let newProduct = structuredClone(product);
        let newProductDescription = "";
        let sellingFinanceCost = 0;
        let buyingFinanceCost = 0;
        let totalProductCost = 0;
        let newFinancingCost = 0;
        const updatedProcesses = [];
        const productCost = productsTotalCost[newProduct.productId].totalFinalCost;
        const singleTargetUtility = utilitiesTable.find((utility) => productCost < utility.upTo);

        for (const process of newProduct.processes) {
            newProductDescription += newProductDescription ? `, ${process.description}` : process.description;

            const newSubtotalProcessCost = calculateProcessSubtotalCost(process, newProduct.quantity, newQuotationData.exchangeRate);
            totalProductCost += newSubtotalProcessCost;
            if (newQuotationData.calculateFinancing) {
                const sellCost = await getSellingFinanceCost(newSubtotalProcessCost, newProduct.productionDays, newQuotationData.customerPaymentDetails, newQuotationData.monthlyRate);
                const buyCost = await getBuyingFinanceCost(newSubtotalProcessCost, process.supplierPaymentDetails, newProduct.productionDays, newQuotationData.monthlyRate);
                sellingFinanceCost += sellCost;
                buyingFinanceCost += buyCost;
            }
            updatedProcesses.push({
                ...process,
                subTotalProcessCost: newSubtotalProcessCost,
            });
        }
        toast.info(`Calculando el costo del producto: ${newProductDescription}`, {
            position: "top-center",
            autoClose: 1000
        })

        if (quotationData.calculateFinancing) {
            if (sellingFinanceCost > buyingFinanceCost) {
                newFinancingCost = sellingFinanceCost - buyingFinanceCost;
            }
        } else {
            newFinancingCost = 0;
        }

        const finalCost = totalProductCost + newProduct.shipmentCost + newProduct.otherCost;

        const singleMinUtilitie = singleTargetUtility.productMinimun;
        const singlePercentageUtilitie = singleTargetUtility.productUtilitie / 100;
        const singleCalculatedSellingPrice = calculateUniteSellingPrice(finalCost, newFinancingCost, newProduct.quantity, singlePercentageUtilitie, singleMinUtilitie, tax);
        totalSinglePrice += singleCalculatedSellingPrice * newProduct.quantity;
        let calculatedSellingPrice = 0;
        if (newQuotationData.isKit) {
            const kitMinUtilitie = (totalProductCost / quotationTotalCost) * kitTargetUtilities.kitMinimun;
            const kitPercentageUtilitie = kitTargetUtilities.kitUtilitie / 100;
            calculatedSellingPrice = calculateUniteSellingPrice(finalCost, newFinancingCost, newProduct.quantity, kitPercentageUtilitie, kitMinUtilitie, tax);
            totalKitPrice += calculatedSellingPrice * newProduct.quantity;
            // calculatedSellingPrice = kitCalcuatedSellingPrice;
        } else {
            calculatedSellingPrice = singleCalculatedSellingPrice;
        }
        // const calculatedSellingPrice = quotationData.isKit ? kitCalcuatedSellingPrice : singleCalculatedSellingPrice;

        const pesosPrice = parseFloat((calculatedSellingPrice * newQuotationData.exchangeRate).toFixed(0));

        let newPrice;
        if (!recalculateAll && newProduct.isManual) {
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

        const updatedProduct =
        {
            ...newProduct,
            productDescription: newProductDescription,
            calculatedSellingPrice,
            financingCost: newFinancingCost,
            totalProductCost: finalCost,
            pesosPrice: pesosPrice,
            processes: updatedProcesses,
            ...newPrice
        };
        updatedProducts.push(updatedProduct);
    }
    if (newQuotationData.isKit && totalSinglePrice < totalKitPrice) {
        console.log("El precio unitario de venta del kit es menor que la suma de los precios unitarios de venta de los productos individuales. Se ajustará el precio unitario de venta del kit al precio unitario de venta de los productos individuales.");
        console.log("Total Kit Price: ", totalKitPrice);
        console.log("Total Single Price: ", totalSinglePrice);
        toast.error("El costo TOTAL CON KIT, es mayor al costo TOTAL SIN KIT", {
            autoClose: false,
            closeOnClick: true,
            position: "top-center"
        });
    }

    newQuotationData = {
        ...newQuotationData,
        products: updatedProducts
    };
    return newQuotationData;
};

const calculateUniteSellingPrice = (totalProductCost, financingCost, quantity, percentageUtilitie, minUtilitie, tax) => {
    console.log("Calculando precio unitario de venta: ", { totalProductCost, financingCost, quantity, percentageUtilitie, minUtilitie, tax });
    let newNetProductCost = parseFloat(totalProductCost / (1 - (percentageUtilitie + tax)))
    if (newNetProductCost * percentageUtilitie < minUtilitie) {
        newNetProductCost = parseFloat((totalProductCost + minUtilitie) / (1 - tax))
    }
    const totalFinancingCost = parseFloat(financingCost / (1 - tax))
    const unitSellingPrice = parseFloat((newNetProductCost + totalFinancingCost) / quantity);
    return unitSellingPrice;
};

const calculateProcessSubtotalCost = (process, quantity, exchangeRate) => {
    process.unitCost = +process.enteredUnitCost / (process.currency === "Peso" ? exchangeRate : 1);
    process.fixedCost = +process.enteredFixedCost / (process.currency === "Peso" ? exchangeRate : 1);
    const adjust = 1 + ((Number(process.adjustPercentage) || 0) / 100);
    const newSubtotalProcessCost = ((process.unitCost * quantity) * adjust) + process.fixedCost;
    return newSubtotalProcessCost;
}

const getQuotationTotalCost = (data) => {
    const exchangeRate = data.exchangeRate;
    let quotationTotalCost = 0;
    const productsTotalCost = {};
    data.products.forEach((product) => {
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
        quotationTotalCost += totalFinalCost;

        productsTotalCost[product.productId] = { totalFinalCost };
    });

    return { quotationTotalCost, productsTotalCost };
};

