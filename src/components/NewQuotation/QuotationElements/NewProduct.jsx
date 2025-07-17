import { useState, useContext, useEffect } from "react";
import { QuotationContext } from "../../../context/QuotationContext";
import IconButton from "../../Utils/IconButton";
import ButtonAddProcess from "../QuotationUtils/ButtonAddProcess";
import ButtonDuplicateProduct from "../QuotationUtils/ButtonDuplicateProduct";


const NewProduct = ({productData}) => {
    const { quotationData, updateProduct, removeProduct, setIsSaved } = useContext(QuotationContext);
    const [prodData, setProdData] = useState(productData);
    const [isUpdated, setIsUpdated] = useState(true);

    // Actualizar el estado local `prodData` cuando cambie `quotationData`
    useEffect(() => {
        updateProdData();
    }, [quotationData]);

    const updateProdData = () => {
        const newProductData = quotationData.products.find((product) => product.productId === prodData.productId);
        if (JSON.stringify(newProductData) !== JSON.stringify(prodData)) {
            setProdData(newProductData);
        }
    }

    // Actualizar el estado global al cambiar algun dato
    useEffect(() => {
        if(!isUpdated) {
            console.log("Change in prodData: ", prodData);
            updateProduct(prodData, prodData.productId);
            setIsUpdated(true);
        }
    }, [isUpdated]);

    // Actualizar los valores cuando cambie quotationData.exchangeRate
    useEffect(() => {
        const updatedProduct = {
            ...prodData,
            processes: prodData.processes.map((process) => {
                if (process.currency === "Peso") {
                    return {
                        ...process,
                        fixedCost: process.tempfixedCost / quotationData.exchangeRate,
                        unitCost: process.tempunitCost / quotationData.exchangeRate
                    };
                }
                return process;
            })
        }

        setProdData((prevData) => ({
            ...prevData,
            financingCost: prevData.tempfinancingCost / quotationData.exchangeRate,
            shipmentCost: prevData.tempshipmentCost / quotationData.exchangeRate,
            otherCost: prevData.tempotherCost / quotationData.exchangeRate,
            processes: prodData.processes.map((process) => {
                if (process.currency === "Peso") {
                    return {
                        ...process,
                        fixedCost: process.tempfixedCost / quotationData.exchangeRate,
                        unitCost: process.tempunitCost / quotationData.exchangeRate
                    };
                }
                return process;
            })
        }))
        setIsUpdated(false);
    }, [quotationData.exchangeRate]);

    // Manejo de cambios en los inputs
    const handleInputChange = (e) => {
        setIsSaved(false)
        const { name, value } = e.target;
        if (name.startsWith("temp")) {
            const convertedValue = +(value / quotationData.exchangeRate);
            const newName = name.replace("temp", "");
            setProdData((prevData) => ({
                ...prevData,
                [newName]: convertedValue,
            }))
        }
        
        setProdData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
        setIsUpdated(false); // Cambiamos el estado a `false` para indicar que se ha actualizado
    };

    // Eliminar el producto del contexto
    const handleDeleteProduct = () => {
        removeProduct(prodData.productId); // Eliminamos el producto usando su ID único
    };

    return (
        <>
            <td className="product-action-buttons">
                <ButtonDuplicateProduct
                    productId={prodData.productId}
                />
                <ButtonAddProcess
                    productId={prodData.productId}
                />
            </td>
            <td>
                <input
                    className="input-number"
                    type="number"
                    name="quantity"
                    defaultValue={prodData.quantity}
                    onClick={(e) => e.target.select()}
                    onInput={handleInputChange}
                    required
                />
            </td>
            <td>
                <span>{prodData.productDescription}</span>
            </td>
            <td>
                <input
                    className="input-number-days"
                    type="number"
                    name="productionDays"
                    value={prodData.productionDays}
                    onClick={(e) => e.target.select()}
                    onInput={handleInputChange}
                />
            </td>
            <td>
                <input
                    className="input-number"
                    type="number"
                    name="tempfinancingCost"
                    value={prodData.tempfinancingCost}
                    onClick={(e) => e.target.select()}
                    onInput={handleInputChange}
                />
            </td>
            <td>
                <input
                    className="input-number"
                    type="number"
                    name="tempshipmentCost"
                    value={prodData.tempshipmentCost}
                    onClick={(e) => e.target.select()}
                    onInput={handleInputChange}
                />
            </td>
            <td>
                <input
                    className="input-number"
                    type="number"
                    name="tempotherCost"
                    value={prodData.tempotherCost}
                    onClick={(e) => e.target.select()}
                    onInput={handleInputChange}
                />
            </td>
            <td>
                <span className="pesos-price">$ {prodData.pesosPrice}</span>
            </td>
            <td>
                <IconButton
                    icon="/delete.png"
                    text="Eliminar Producto"
                    onClick={handleDeleteProduct}
                />
            </td>
        </>
    );
};

export default NewProduct;
