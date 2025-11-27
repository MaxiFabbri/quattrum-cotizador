import { useContext } from "react";
import { JobContext } from "../../../context/JobContext.jsx";
import TextButton from "../../Utils/TextButton.jsx";

const ButtonCalculateJob = () => {
    const { calculateJobData } = useContext(JobContext);

    const calculateJobHandler = async () => {
        calculateJobData(true);
    }

    return (
        <TextButton
            text={"Calcular Trabajo y Guardar"}
            onClick={calculateJobHandler}
        />
    );
}

export default ButtonCalculateJob;
