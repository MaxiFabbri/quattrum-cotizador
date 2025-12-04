import { useContext } from "react";
import { JobContext } from "../../../context/JobContext.jsx";
import TextButton from "../../Utils/TextButton.jsx";

const ButtonCancelJob = () => {
    const { cancelJobData, jobData } = useContext(JobContext);

    const handleCancelJob = () => {
        cancelJobData();
    }

    return (
        <TextButton
            text={"ANULAR Trabajo"}
            onClick={handleCancelJob}
        />
    );
}

export default ButtonCancelJob;
