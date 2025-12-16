import { useContext, useState, useEffect } from "react";
import { QuotationContext } from "../../../context/QuotationContext.jsx";
import { v4 as uuidv4 } from 'uuid';
import IconButton from "../../Utils/IconButton.jsx";


const ButtonDuplicateProduct = ({ productId }) => {
    const { quotationData, addProduct } = useContext(QuotationContext);
    // const [isUpdated, setIsUpdated] = useState(false);

    const handleDuplicateProduct = async () => {
        const productToDuplicate = quotationData.products.find(product => product.productId === productId);
        console.log("Product to duplicate: ", productToDuplicate);
        // Check if the product exists before duplicating
        if (!productToDuplicate) {
            console.error("Product not found for duplication.");
            return;
        } else {
            const newProductId = uuidv4();
            const processesToDuplicate = productToDuplicate.processes.map(process => ({
                ...process,
                savedToDb: false,
                processId: uuidv4(),
                productId: newProductId,
            }));
            // Add the duplicated product to the quotation
            const newProductDuplicated = {
                ...productToDuplicate,
                savedToDb: false,
                productId: newProductId,
                processes: processesToDuplicate,
            };
            addProduct(newProductDuplicated); // agrega el nuevo producto al contexto de cotización
            console.log("New product duplicated: ", newProductDuplicated);
        }
    }

    return (
        <IconButton
        icon="/images/duplicate.png"
        text="Duplicar Producto"
        onClick={handleDuplicateProduct}
        />
    );
}

export default ButtonDuplicateProduct;