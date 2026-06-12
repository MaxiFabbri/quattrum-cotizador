import { useContext } from "react";
import { JobContext } from "../../../context/JobContext.jsx";
import { AuthContext } from "../../../context/AuthContext.jsx";
import TextButton from "../../Utils/TextButton.jsx";

const ButtonReopenJob = () => {
    const { updateJobDataAndSave, jobData } = useContext(JobContext);
    const { userId, userName } = useContext(AuthContext);

    const handleReopenJob = () => {
        const newEvent = {
            eventDate: new Date(),
            eventUserId: userId,
            eventUserName: userName,
            eventProductId: null,
            eventNote: "Se reabre el trabajo por un reclamo"
        }
        const updatedEvents = [...jobData.jobEvents, newEvent];
        const updatedJobData = {
            jobEvents: updatedEvents,
            jobStatus: "Reclamo"
        };
        updateJobDataAndSave(updatedJobData);
    }

    return (
        <TextButton
            text={"Abrir un Reclamo"}
            onClick={handleReopenJob}
        />
    );
}

export default ButtonReopenJob;
