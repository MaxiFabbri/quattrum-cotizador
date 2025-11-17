import { useContext } from "react";
import { JobContext } from "../../../context/JobContext.jsx";
import TextButton from "../../Utils/TextButton.jsx";

const ButtonSaveJob = () => {
    const { saveJobData } = useContext(JobContext);

    return (
        <TextButton
            text={"Guardar"}
            onClick={saveJobData}
        />
    );
}

export default ButtonSaveJob;
