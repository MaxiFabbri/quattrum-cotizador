import { toast } from "react-toastify";
import { getSellingFinanceCost, getBuyingFinanceCost } from "./financeCostCalculations.js";


export const handleCalculateQuotation = async (recalculateAll, quotationData, utilitiesTable, tax) => {
    let newQuotationData = structuredClone(quotationData);
    console.log("1--- Quotation Data: ", newQuotationData)

    const quotationTotals = getQuotationTotalCost(newQuotationData);
    const { quotationTotalCost, productsTotalCost } = quotationTotals;


    // Calculo las utilidades deseadas de los parametros generales
    const kitTargetUtilities = utilitiesTable.find((utility) => quotationTotalCost < utility.upTo);

    const updatedProducts = [];
    for (const product of newQuotationData.products) {
        let newProduct = structuredClone(product);
        console.log("2--- Calculando el costo del producto: ", newProduct);
        let newProductDescription = "";
        let sellingFinanceCost = 0;
        let buyingFinanceCost = 0;

        let totalProductCost = 0;
        let newFinancingCost = 0;

        const updatedProcesses = [];

        // Calculo las utilidades deseadas de los parametros generales
        // const productCost = productsTotalCost.find((el) => el.id === newProduct.productId);
        const productCost = productsTotalCost[newProduct.productId].totalFinalCost;
        const singleTargetUtility = utilitiesTable.find((utility) => productCost < utility.upTo);

        for (const process of newProduct.processes) {
            // console.log("Calculando el process: ", process);
            newProductDescription += newProductDescription ? `, ${process.description}` : process.description;

            const newSubtotalProcessCost = calculateProcessSubtotalCost(process, newProduct.quantity, newQuotationData.exchangeRate);
            totalProductCost += newSubtotalProcessCost;
            if (newQuotationData.calculateFinancing) {
                // Calculo costo financiero de cada proceso
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
        console.log("Calculando el costo del producto: ", newProductDescription);
        toast.info(`Calculando el costo del producto: ${newProductDescription}`, {
            position: "top-center",
            autoClose: 1000
        })

        if (quotationData.calculateFinancing) {
            // Calculo el costo financiero del producto
            if (sellingFinanceCost > buyingFinanceCost) {
                newFinancingCost = sellingFinanceCost - buyingFinanceCost;
            }
        } else {
            newFinancingCost = 0;
        }

        console.log("Product Cost: ", productCost)
        const finalCost = totalProductCost + newProduct.shipmentCost + newProduct.otherCost;
        console.log("Final Cost: ", finalCost)
        let minUtilitie = 0;
        let percentageUtilitie = 0;
        if (quotationData.isKit) {
            minUtilitie = (totalProductCost / quotationTotalCost) * kitTargetUtilities.kitMinimun;
            percentageUtilitie = kitTargetUtilities.kitUtilitie / 100;

        } else {
            minUtilitie = singleTargetUtility.productMinimun;
            percentageUtilitie = singleTargetUtility.productUtilitie / 100;
        }

        const calculatedSellingPrice = calculateAllUniteSellingPrice(finalCost, newFinancingCost, product.quantity, percentageUtilitie, minUtilitie, tax);
        console.log("Precio Calculado: ", calculatedSellingPrice);

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

        // return newQuotationData
    }
    console.log("3--- Updated Products: ", updatedProducts);
    // newQuotationData = updateQuotationData(newQuotationData, updatedProducts);
    newQuotationData = {
        ...newQuotationData,
        products: updatedProducts
    };
    return newQuotationData;
};

const calculateAllUniteSellingPrice = (totalProductCost, financingCost, quantity, percentageUtilitie, minUtilitie, tax) => {
    console.log("Calculando precio de venta unitario: ", { totalProductCost, financingCost, quantity, minUtilitie, percentageUtilitie, tax });
    // calculo utilidad por porjentaje
    let newNetProductCost = parseFloat(totalProductCost / (1 - (percentageUtilitie + tax)))
    // Si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
    if (newNetProductCost * percentageUtilitie < minUtilitie) {
        // si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
        newNetProductCost = parseFloat((totalProductCost + minUtilitie) / (1 - tax))
    }
    // Calculo el costo financiero
    const totalFinancingCost = parseFloat(financingCost / (1 - tax))
    // paso el costo total a costo unitario
    const unitSellingPrice = parseFloat((newNetProductCost + totalFinancingCost) / quantity);
    console.log("Calculando precio de venta unitario: ", { totalProductCost, financingCost, quantity, minUtilitie, percentageUtilitie, tax, newNetProductCost, totalFinancingCost, unitSellingPrice });
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

    // Diccionario: productId → { totalFinalCost }
    const productsTotalCost = {};

    data.products.forEach((product) => {
        // const newProducts = data.products.map((product) => {
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

        // 👇 Guardamos en el diccionario con el id como key
        productsTotalCost[product.productId] = { totalFinalCost };

        // return { ...product, shipmentCost, otherCost, processes: newProcesses };
    });

    return { quotationTotalCost, productsTotalCost };
};

