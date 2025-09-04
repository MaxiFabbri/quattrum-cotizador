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

  return (
    <tr>
      <td colspan="9">
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