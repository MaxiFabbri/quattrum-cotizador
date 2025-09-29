import { useContext } from "react";
import { QuotationContext } from "../../../context/QuotationContext.jsx";
import TextButton from "../../Utils/TextButton.jsx";

const ButtonSaveQuotation = () => {
    const { saveQuotation } = useContext(QuotationContext);

    return (
        <TextButton
            text={"Guardar"}
            onClick={saveQuotation}
        />
    );
}

export default ButtonSaveQuotation;
