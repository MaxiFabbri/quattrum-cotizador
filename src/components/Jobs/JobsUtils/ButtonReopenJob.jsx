import { useContext } from "react";
import { JobContext } from "../../../context/JobContext.jsx";
import { AuthContext } from "../../../context/AuthContext.jsx";
import TextButton from "../../Utils/TextButton.jsx";

const ButtonReopenJob = () => {
    const { changeJobStatus, updateJobData, jobData } = useContext(JobContext);
    const { userId, userName } = useContext(AuthContext);

    const handleReopenJob = async () => {
        changeJobStatus("Reclamo");
    }

    return (
        <TextButton
            text={"Abrir un Reclamo"}
            onClick={handleReopenJob}
        />
    );
}

export default ButtonReopenJob;
