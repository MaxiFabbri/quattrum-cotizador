import { useState, useContext, useEffect } from "react";
import { QuotationContext } from "../../../context/QuotationContext";
import { ParametersContext } from "../../../context/ParametersContext";
import "./ProductCostDetails.css"

const ProductCostDetails = ({ productData, exchangeRate }) => {
  const { quotation, setQuotation } = useContext(QuotationContext);
  const { tax } = useContext(ParametersContext);
  const totalSellingPrice = productData.unitSellingPrice * productData.quantity;
  const totalTax = (totalSellingPrice * tax);
  const netUtitlitie = (totalSellingPrice - productData.totalProductCost - totalTax - productData.financingCost);

  // console.log("Product Cost Details: ", productData)
  // console.log("Parameters tax: ", tax, " Total Tax: ", totalTax)
  console.log("Total Selling Price: ", totalSellingPrice * exchangeRate)
  console.log("Total Product Cost: ", productData.totalProductCost * exchangeRate)
  console.log("Total Tax: ", totalTax * exchangeRate)
  console.log("Financing Cost: ", productData.financingCost * exchangeRate)
  console.log("Net Utility: ", netUtitlitie * exchangeRate)

  return (
    <tr>
      <td colSpan="9">
        {/* <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', flexDirection: 'column' }}> */}
        <div className="cost-details">
          <span>Venta total: $ {(totalSellingPrice * exchangeRate).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
          <span>Costo total: $ {(productData.totalProductCost * exchangeRate).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
          <span>Utilidad: $ {(netUtitlitie * exchangeRate).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>

        </div>
      </td>
    </tr>

  );
}

export default ProductCostDetails;