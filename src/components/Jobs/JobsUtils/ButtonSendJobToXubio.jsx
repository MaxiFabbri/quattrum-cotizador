import TextButton from "../../Utils/TextButton.jsx";
import { getPresupuestos } from "../../../api/xubio.js";


const ButtonSendJobToXubio = () => {

    const handleClick = () => {

        getPresupuestos()
            .then(data => {
                console.log("Presupuestos recibidos:", data);
                // acá podrías enviar JobData junto con el resultado
            })
            .catch(err => console.error(err));
    };

    return (
        <TextButton
            text={"Enviar a Xubio"}
            onClick={handleClick}
        />
    );
}

export default ButtonSendJobToXubio;