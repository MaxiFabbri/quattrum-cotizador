import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./OneQuotationContainer.css"

import { QuotationHeader, ProductHeader, ProcessHeader } from "./QuotationUtils/NewQuotationHeaders.jsx";
import NewQuotation from "./NewQuotation.jsx";
import NewProduct from "./QuotationElements/NewProduct.jsx";
import NewProcess from "./QuotationElements/NewProcess.jsx";
import { ParametersContext } from '../../context/ParametersContext.jsx';
import { QuotationContext } from "../../context/QuotationContext.jsx";

import ButtonCalculateQuotation from "./QuotationUtils/ButtonCalculateQuotation.jsx";
import ButtonAddProduct from "./QuotationUtils/ButtonAddProduct.jsx";
import ButtonDuplicateQuotatio from "./QuotationUtils/ButtonDuplicateQuotation.jsx";
import { apiClient } from "../../config/axiosConfig.js";

const DetailedQuotationContainer = (quote) => {
    // const { dolarPrice, paramMonthlyRate } = useContext(ParametersContext);
    const { quotationData, clearQuotationData, updateQuotationData } = useContext(QuotationContext);
    // const [newQuotationData, setNewQuotationData] = useState(null)
    const today = new Date().toISOString().split("T")[0];
    const { id } = useParams()
    console.log("Detailed Quotation Container ",id);

    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Asegura 2 dígitos
        const day = String(date.getDate()).padStart(2, "0"); // Asegura 2 dígitos
        return `${year}-${month}-${day}`;
    };

    const adjustProcessesData = (dbProcesses, exchangeRate) => {
        const newProcessesData = dbProcesses.map((process) => {
            return {
                processId: process._id,
                productId: process.productId,
                description: process.description,
                supplierId: process.supplierId._id,
                supplierName: process.supplierId.name,
                supplierPaymentMethodId: process.supplierPaymentMethodId,
                supplierPaymentMethodName: process.supplierId.supplierPaymentMethodId.supplier_payment_description,
                daysToPayment: process.daysToPayment,
                unitCost: process.unitCost,
                tempunitCost: (process.unitCost * exchangeRate).toFixed(2),
                fixedCost: process.fixedCost,
                tempfixedCost: (process.fixedCost * exchangeRate).toFixed(2),
                subTotalProcessCost: process.subTotalProcessCost,
                savedToDb: true,
            }
        })
        return newProcessesData
    }

    const getProcessData = async (productId, exchangeRate) => {
        const responseProcesses = await apiClient(`/processes/${productId}`)
        // Ajusto los datos recibidos para el context
        const adjustedProcessesData = adjustProcessesData(responseProcesses.data.response, exchangeRate)
        return adjustedProcessesData
    }

    const adjustProductData = async (products, exchangeRate) => {
        const newProductsData = await Promise.all(products.map(async (product) => {
            const newProcesses = await getProcessData(product._id, exchangeRate);
            return {
                productId: product._id,
                quotationId: product.quotationId,
                productDescription: product.productDescription,
                quantity: product.quantity,
                productionDays: product.productionDays,
                financingCost: product.financingCost,
                tempfinancingCost: (product.financingCost * exchangeRate).toFixed(2),
                shipmentCost: product.shipmentCost,
                tempshipmentCost: (product.shipmentCost * exchangeRate).toFixed(2),
                otherCost: product.otherCost,
                tempotherCost: (product.otherCost * exchangeRate).toFixed(2),
                unitSellingPrice: product.unitSellingPrice,
                pesosPrice: (product.unitSellingPrice * exchangeRate).toFixed(0),
                processes: newProcesses, // Ahora los procesos se incluyen correctamente
                savedToDb: true,
            };
        }));

        return newProductsData;
    };

    const getQuotationDataFromDb = async (id) => {
        const responseQuotation = await apiClient.get(`/quotations/populated/${id}`)
        console.log("Response Quotation: ", responseQuotation.data.response);
        let newData = responseQuotation.data.response
        newData = {
            ...newData,
            id: newData._id,
            date: formatDate(newData.date),
            customerId: newData.customerId._id,
            customerName: newData.customerId.name,
            paymentMethodName: newData.customerId.customerPaymentMethodId.customer_payment_description,
            paymentDaysToCollect: newData.customerId.customerPaymentMethodId.days_to_collect
        }

        // agrego los Productos
        const responseProducts = await apiClient.get(`/products/${id}`)
        const newProducts = await adjustProductData(responseProducts.data.response, newData.exchangeRate)
        newData = { ...newData, products: newProducts }
        updateQuotationData(
            newData
        );
        return newData
    }

    useEffect(() => {
        getQuotationDataFromDb(id)
    }, []);

    return (
        <>
            <table className="quotation-table-quotation">
                <QuotationHeader />
                <tbody>
                    <NewQuotation />
                </tbody>
            </table>
            {quotationData.products && quotationData.products.length > 0 ? (
                <>
                    <table key={`table-${quotationData.id}`} className="quotation-table-products">
                        {quotationData.products.map((product) => (
                            <table className="product-container" key={product.productId} id={product.productId}>
                                <ProductHeader />
                                <tbody key={"body-" + product.productId} id={"body-" + product.productId}>
                                    <tr key={product.productId} id={product.productId}>
                                        <NewProduct productData={product} />
                                    </tr>
                                    <tr key={"processes-" + product.productId} id={"processes-" + product.productId}>
                                        <td colSpan="9">
                                            {product.processes && product.processes.length > 0 ? (
                                                <table className="quotation-table-processes">
                                                    <ProcessHeader />
                                                    <tbody>
                                                        {product.processes.map((process) => (
                                                            <tr key={process.processId} id={process.processId}>
                                                                <NewProcess initialProcessData={process} />
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p>No hay procesos para este producto</p>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        ))}

                    </table>
                    <div className="quotation-buttons-container">
                        <ButtonAddProduct />
                        <ButtonCalculateQuotation />
                        <ButtonDuplicateQuotatio />
                    </div>
                </>
            ) : (
                <div>
                    {quotationData.id !== '' ? (
                        <ButtonAddProduct />
                    ) : (
                        <p>Complete la Cotización</p>
                    )}
                </div>
            )}
        </>
    );
}

export default DetailedQuotationContainer;