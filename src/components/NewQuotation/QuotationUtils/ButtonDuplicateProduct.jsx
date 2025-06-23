import { useContext, useState, useEffect } from "react";
import { QuotationContext } from "../../../context/QuotationContext.jsx";
import { v4 as uuidv4 } from 'uuid';
import IconButton from "../../Utils/IconButton.jsx";


const ButtonDuplicateProduct = ({ productId }) => {
    const { quotationData, addProduct } = useContext(QuotationContext);
    const [isUpdated, setIsUpdated] = useState(false);

    const handleDuplicateProduct = async () => {
        console.log("Duplicating product with ID: ", productId);
        console.log("Quotation Data: ", quotationData);
        const productToDuplicate = quotationData.products.find(product => product.productId === productId);
        console.log("Product to duplicate: ", productToDuplicate);
        // Check if the product exists before duplicating
        if (!productToDuplicate) {
            console.error("Product not found for duplication.");
            return;
        } else {
            const newProductId = uuidv4();
            const processesToDuplicate = productToDuplicate.processes.map(process => ({
                ...process,                  // copia el resto de las propiedades originales
                savedToDb: false,      // pone saved to db en false para indicar que es un producto nuevo
                processId: uuidv4(),        // genera un nuevo ID único para cada proceso
                productId: newProductId,    // asigna el nuevo ID del producto
            }));
            // Add the duplicated product to the quotation
            const newProductDuplicated = {
                ...productToDuplicate,  // copia las propiedades originales
                savedToDb: false,      // pone saved to db en false para indicar que es un producto nuevo
                productId: newProductId,    // asigna el nuevo ID del producto
                processes: processesToDuplicate, // asigna los procesos duplicados
            };
            addProduct(newProductDuplicated); // agrega el nuevo producto al contexto de cotización
            console.log("New product duplicated: ", newProductDuplicated);
            console.log("Product duplicated successfully.");
        }
    }

    return (
        <IconButton
        icon="/duplicate.png"
        text="Duplicar Producto"
        onClick={handleDuplicateProduct}
        />
    );
}

export default ButtonDuplicateProduct;