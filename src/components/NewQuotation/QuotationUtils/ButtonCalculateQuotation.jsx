import { useContext } from "react";
import { QuotationContext } from "../../../context/QuotationContext.jsx";
import TextButton from "../../Utils/TextButton";

const ButtonCalculateQuotation = () => {
    const { isSaved, calculateQuotation } = useContext(QuotationContext);

    return (
        <TextButton
            text={isSaved ? "Guardado" : "Calcular y Guardar"}
            onClick={calculateQuotation}
        />
    );
}

export default ButtonCalculateQuotation;
