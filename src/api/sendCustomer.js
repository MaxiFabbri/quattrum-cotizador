import { apiClient } from "../config/axiosConfig.js";
import { toast } from "react-toastify";

function sendCustomer (data) {

}

async function postToXubio(body) {
    console.log("Prepared body for Xubio API:", body);
    try {
        // const response = await apiClient.post("/xubio/customer", body);
        const response = { data: { success: true, message: "Simulación de envío" } };
        toast.success("Pedido enviado a Xubio correctamente", {
            position: "top-center",
            autoClose: 6000
        });

        return response.data;
    } catch (error) {
        console.error("Error al enviar el pedido a Xubio: ", error);

        toast.error("Error al enviar el pedido a Xubio", {
            position: "top-center",
            autoClose: 6000
        });

        throw error;
    }
}

async function checkCustomerInXubio(cuit){
    console.log("Checking customer in Xubio with CUIT:", cuit);
    try {
        const xubioResponse = await apiClient.get(`/xubio/customer/${cuit}`);
        const data = xubioResponse.data.response;
        console.log("Xubio response for customer check:", data);
        return {
            exists: true,
            message: "Cliente encontrado en Xubio"
        }
    } catch (error) {
        return {
            exists: false,
            error: error.message,
            message: error.response?.data.message || " ultima opcion",
        }
    }
}

export { sendCustomer, checkCustomerInXubio };