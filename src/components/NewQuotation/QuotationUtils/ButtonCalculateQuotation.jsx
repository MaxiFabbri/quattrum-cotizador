import { useContext } from "react";
import { QuotationContext } from "../../../context/QuotationContext.jsx";
import TextButton from "../../Utils/TextButton";

const ButtonCalculateQuotation = () => {
    const { calculateQuotation } = useContext(QuotationContext);

    const calculateQuotationHandler = async () => {
        calculateQuotation(true);
    }

    return (
        <TextButton
            text={"Calcular y Guardar"}
            onClick={calculateQuotationHandler}
        />
    );
}

export default ButtonCalculateQuotation;
