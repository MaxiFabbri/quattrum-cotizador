import { useContext } from "react";
import { JobContext } from "../../../context/JobContext.jsx";
import TextButton from "../../Utils/TextButton.jsx";

const ButtonSendJobToXubio = () => {
    const { sendJobToXubio } = useContext(JobContext);

    return (
        <TextButton
            text={"Enviar a Xubio"}
            onClick={sendJobToXubio}
        />
    );
}

export default ButtonSendJobToXubio;