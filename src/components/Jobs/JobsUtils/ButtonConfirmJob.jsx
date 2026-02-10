import { useContext } from "react";
import { JobContext } from "../../../context/JobContext.jsx";
import TextButton from "../../Utils/TextButton.jsx";

const ButtonConfirmJob = () => {
    const { changeJobStatus, jobData } = useContext(JobContext);

    const validateJobData = () => {
        // Validation logic here
        return true;
    }

    const confirmJobHandler = async () => {
        console.log("Confirming job with data: ", jobData);
        if (!validateJobData()) {
            console.log("Job data is NOT valid. Cannot proceed.");
            return;
        } else {
            console.log("Job data is valid. Proceeding to calculate and save.");
            // await changeJobStatus("En Producción", jobId);
        }
    }

    return (
        <TextButton
            text={"Pasar a Preparación"}
            onClick={confirmJobHandler}
        />
    );
}

export default ButtonConfirmJob;
