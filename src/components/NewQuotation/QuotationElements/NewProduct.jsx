import { useState, useContext, useEffect } from "react";
import { QuotationContext } from "../../../context/QuotationContext";
import IconButton from "../../Utils/IconButton";
import ButtonAddProcess from "../QuotationUtils/ButtonAddProcess";


const NewProduct = ({productData}) => {
    const { quotationData, updateProduct, removeProduct } = useContext(QuotationContext);
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
            updateProduct(prodData, prodData.productId);
            setIsUpdated(true); // Cambiamos el estado a `true` para indicar que se ha actualizado
        }
    }, [isUpdated]);


    // Manejo de cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("temp")) {
            const convertedValue = +((value / quotationData.exchangeRate).toFixed(2));
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
            <td>
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
                    defaultValue={prodData.productionDays}
                    onInput={handleInputChange}
                />
            </td>
            <td>
                <input
                    className="input-number"
                    type="number"
                    name="tempfinancingCost"
                    defaultValue={prodData.tempfinancingCost}
                    onInput={handleInputChange}
                />
            </td>
            <td>
                <input
                    className="input-number"
                    type="number"
                    name="tempshipmentCost"
                    defaultValue={prodData.tempshipmentCost}
                    onInput={handleInputChange}
                />
            </td>
            <td>
                <input
                    className="input-number"
                    type="number"
                    name="tempotherCost"
                    defaultValue={prodData.tempotherCost}
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
