import { useContext } from "react";
import { JobContext } from "../../../context/JobContext.jsx";
import TextButton from "../../Utils/TextButton.jsx";

const ButtonCloseJob = () => {
    const { changeJobStatus, jobData } = useContext(JobContext);

    const confirmJobHandler = async () => {
        console.log("Cerrando pedido: ", jobData);
        if (window.confirm("¿Estás seguro de que deseas CERRAR este pedido?")) {
            await changeJobStatus("Cerrado");
        }
    }

    return (
        <TextButton
            text={"Cerrar Pedido"}
            onClick={confirmJobHandler}
        />
    );
}

export default ButtonCloseJob;
