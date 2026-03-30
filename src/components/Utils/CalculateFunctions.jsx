import { useContext } from "react";
import { ParametersContext } from "../../context/ParametersContext";

const useCalculateFunctions = () => {
    const { tax, utilitiesTable } = useContext(ParametersContext);

    const calculateItemFinanceCost = (totalProductCost, productionDays, paymentItem, jobMonthlyRate) => {
        const paymentDays = Number(paymentItem.days) || 0;
        const production = Number(productionDays) || 0;
        const totalDays = paymentDays + production;
        const monthsToFinance = paymentItem.downpayment ? (paymentDays / 30) : (totalDays / 30);
        const amountToFinance = totalProductCost * (paymentItem.percentage / 100);
        const monthlyRate = 1 + Number(jobMonthlyRate / 100)
        const itemFinanceCost = Number(
            (amountToFinance * Math.pow(monthlyRate, monthsToFinance))
            - amountToFinance
        );
        return itemFinanceCost;
    }

    const getSellingFinanceCost = async (subTotalCost, productionDays, customerPaymentDetails, jobMonthlyRate) => {
        let sellFinanceCost = 0;
        let paymentDetails = customerPaymentDetails;
        sellFinanceCost += paymentDetails.reduce((acc, element) => {
            return acc + calculateItemFinanceCost(subTotalCost, productionDays, element, jobMonthlyRate);
        }, 0);
        return sellFinanceCost;
    };

    const getBuyingFinanceCost = async (subTotalCost, supplierPaymentDetails, productionDays, jobMonthlyRate) => {
        let buyFinanceCost = 0;
        let paymentDetails = supplierPaymentDetails;
        buyFinanceCost += paymentDetails.reduce((acc, element) => {
            return acc + calculateItemFinanceCost(subTotalCost, productionDays, element, jobMonthlyRate);
        }, 0);
        return buyFinanceCost;
    };

    const calculateUnitSellingPrice = (totalProductCost, financingCost, quantity) => {
            const targetUtility = utilitiesTable.find((utility) => totalProductCost < utility.upTo);
            let minUtilitie = targetUtility.productMinimun;
            let percentageUtilitie = targetUtility.productUtilitie / 100;
            // calculo utilidad por porjentaje
            let newNetProductCost = parseFloat(totalProductCost / (1 - (percentageUtilitie + tax)))
            // Si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
            if (newNetProductCost * percentageUtilitie < minUtilitie) {
                // si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
                newNetProductCost = parseFloat((totalProductCost + minUtilitie) / (1 - tax))
            }

            // Calculo el costo financiero
            const totalFinancingCost = parseFloat(financingCost / (1 - tax));
            // paso el costo total a costo unitario
            const unitSellingPrice = parseFloat((newNetProductCost + totalFinancingCost) / quantity);
            return unitSellingPrice;
    };

    const calculateKitUniteSellingPrice = (totalProductCost, financingCost, quantity, targetUtilities, totalQuotationCost) => {
        // Calculo las utilidades deseadas de los parametros generales
        // calculo el minutilitie que le corresponde a este producto por regla de 3 simple
        let minUtilitie = (totalProductCost / totalQuotationCost) * targetUtilities.kitMinimun
        let percentageUtilitie = targetUtilities.kitUtilitie / 100;
        const totalFinancingCost = parseFloat(financingCost / (1 - tax))

        // calculo utilidad por porjentaje
        let newNetProductCost = parseFloat(totalProductCost / (1 - (percentageUtilitie + tax)))

        // Si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
        if (newNetProductCost * percentageUtilitie < minUtilitie) {
            // si el costo total por porcentaje es menor al minimo, lo cambio por el minimo
            newNetProductCost = parseFloat((totalProductCost + minUtilitie) / (1 - tax))
        }

        // paso el costo total a costo unitario
        const unitSellingPrice = parseFloat((newNetProductCost + totalFinancingCost) / quantity);
        return unitSellingPrice;
    };

    return { getSellingFinanceCost, getBuyingFinanceCost, calculateUnitSellingPrice, calculateKitUniteSellingPrice };

}

export default useCalculateFunctions;
