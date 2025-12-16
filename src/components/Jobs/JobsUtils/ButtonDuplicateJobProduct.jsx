import { useContext, useState, useEffect } from "react";
import { JobContext } from "../../../context/JobContext.jsx";
import { v4 as uuidv4 } from 'uuid';
import IconButton from "../../Utils/IconButton.jsx";

const ButtonDuplicateJobProduct = ({ jobProductId }) => {
    const { jobData, addJobProduct } = useContext(JobContext);
    // const [isUpdated, setIsUpdated] = useState(false);

    const handleDuplicateProduct = async () => {
        const jobProductToDuplicate = jobData.jobProducts.find(product => product.jobProductId === jobProductId);
        // Check if the product exists before duplicating
        if (!jobProductToDuplicate) {
            console.error("Product not found for duplication.");
            return;
        } else {
            console.log("Product to duplicate: ", jobProductToDuplicate);
            const newJobProductId = uuidv4();
            const jobProcessesToDuplicate = jobProductToDuplicate.processes.map(process => ({
                ...process,
                savedToDb: false,
                jobProcId: uuidv4(),
                jobProductId: newJobProductId,
            }));
            // Add the duplicated product to the quotation
            const newJobProductDuplicated = {
                ...jobProductToDuplicate,
                savedToDb: false,
                jobProductId: newJobProductId,
                processes: jobProcessesToDuplicate,
            };
            addJobProduct(newJobProductDuplicated); // agrega el nuevo producto al contexto de cotización
            console.log("New product duplicated: ", newJobProductDuplicated);
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

export default ButtonDuplicateJobProduct;