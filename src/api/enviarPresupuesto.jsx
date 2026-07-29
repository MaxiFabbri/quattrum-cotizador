import { apiClient } from "../config/axiosConfig.js";
import { toast } from "react-toastify";
import ConfirmToast from "../components/Utils/ConfirmToast.jsx";

// export async function sendPresupuesto(presupuestoData) {
//     console.log("Sending presupuesto data to Xubio API:", presupuestoData.customerId);
//     const customerData = await getCustomerData(presupuestoData.customerId);
//     const { cliente, status, source, message } = customerData;

//     if (status !== 200) {
//         if (status === 404 && source === "cotizador") {
//             toast(
//                 ({ closeToast }) => (
//                     <ConfirmToast
//                         message="El cliente no tiene CUIT en Cotizador. ¿Querés seguir sin CUIT o cancelar?"
//                         onConfirm={() => {
//                             console.log("Usuario decidió seguir sin CUIT");
//                             // acá podés continuar el flujo
//                         }}
//                         onCancel={() => {
//                             console.log("Usuario canceló el proceso");
//                             // acá podés cortar el flujo
//                         }}
//                         closeToast={closeToast}
//                     />
//                 ),
//                 { position: "top-center", autoClose: false }
//             );
//         } else if (status === 404 && source === "xubio") {
//             toast(
//                 ({ closeToast }) => (
//                     <ConfirmToast
//                         message={`El CUIT ${cliente.message} no se encontró en Xubio. Podés cargarlo en Xubio y luego reintentar.`}
//                         onConfirm={() => {
//                             window.open("https://xubio.com/NXV/ventas/nuevo-cliente", "_blank");
//                             console.log("Usuario fue a cargar cliente en Xubio");
//                         }}
//                         onCancel={() => {
//                             console.log("Usuario canceló el proceso");
//                         }}
//                         closeToast={closeToast}
//                     />
//                 ),
//                 { position: "top-center", autoClose: false }
//             );
//         } else {
//             toast.error(message || "Error al obtener datos del cliente", {
//                 position: "top-center",
//                 autoClose: 6000
//             });
//         }

//         throw new Error(message || "Error retrieving customer data");
//     }


//     const body = await prepareDataForXubio(presupuestoData, cliente);
//     console.log("Prepared body for Xubio API:", body);

//     try {
//         // const response = await apiClient.post("/xubio/", body);
//         const response = { data: { success: true, message: "Simulación de envío" } };
//         console.log("Response from Xubio API en enviar:", response);

//         toast.success("Pedido enviado a Xubio correctamente", {
//             position: "top-center",
//             autoClose: 6000
//         });

//         // devolvemos la respuesta al caller
//         return response.data;
//     } catch (error) {
//         console.error("Error al enviar el pedido a Xubio: ", error);

//         toast.error("Error al enviar el pedido a Xubio", {
//             position: "top-center",
//             autoClose: 6000
//         });

//         // propagamos el error al caller
//         throw error;
//     }
// }



// Función principal
export async function sendPresupuesto(presupuestoData) {
    console.log("Sending presupuesto data to Xubio API:", presupuestoData.customerId);

    const customerData = await getCustomerData(presupuestoData.customerId);
    const { cliente, status, source, message } = customerData;

    // Validación
    if (status !== 200) {
        handleCustomerValidation(status, source, message, cliente, presupuestoData);
        return; // cortamos acá, el usuario decidirá en el toast
    }

    // Preparación y envío
    const body = await prepareDataForXubio(presupuestoData, cliente);
    return await postToXubio(body);
}
async function sendToXubioTestClient(presupuestoData, cliente) {
    const body = await prepareDataForXubio(presupuestoData, cliente);
    return await postToXubio(body);
}

function handleCustomerValidation(status, source, message, cliente, presupuestoData) {
    if (status === 404 && source === "cotizador") {
        toast(
            ({ closeToast }) => (
                <ConfirmToast
                    message="El cliente no tiene CUIT en Cotizador. ¿Querés seguir con Cliente Test de Xubio?"
                    onConfirm={() => {
                        closeToast();
                        console.log("Usuario decidió seguir con Cliente Test");
                        sendToXubioTestClient(presupuestoData, cliente)
                    }}
                    onCancel={() => {
                        closeToast();
                        console.log("Usuario canceló el proceso");
                    }}
                    closeToast={closeToast}
                />
            ),
            { position: "top-center", autoClose: false }
        );
    } else if (status === 404 && source === "xubio") {
        toast(
            ({ closeToast }) => (
                <ConfirmToast
                    message={`El CUIT ${cliente.ID} no se encontró en Xubio. Podés cargarlo en Xubio y luego reintentar.`}
                    onConfirm={() => {
                        closeToast();
                        window.open("https://xubio.com/NXV/ventas/nuevo-cliente", "_blank");
                        console.log("Usuario fue a cargar cliente en Xubio");
                        // después de cargar, puede volver a llamar manualmente a sendPresupuesto
                    }}
                    onCancel={() => {
                        closeToast();
                        console.log("Usuario canceló el proceso");
                    }}
                    closeToast={closeToast}
                />
            ),
            { position: "top-center", autoClose: false }
        );
    } else {
        toast.error(message || "Error al obtener datos del cliente", {
            position: "top-center",
            autoClose: 6000
        });
    }
}

// Envío a Xubio
async function postToXubio(body) {
    console.log("Prepared body for Xubio API:", body);
    try {
        // const response = await apiClient.post("/xubio/", body);
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




const prepareDataForXubio = async (data, cliente) => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    const products = data.jobProducts || [];

    const transaccionProductoData = [];
    let importeGravado = 0;
    let importeImpuestos = 0;
    let importeTotal = 0;

    for (const product of products) {
        const price = parseFloat((product.unitSellingPrice * data.exchangeRate).toFixed(0))
        const quantity = parseInt(product.quantity || 1, 10);
        const importe = parseFloat((price * quantity).toFixed(2));
        const iva = parseFloat((importe * 0.21).toFixed(2));
        const totalProducto = parseFloat((importe + iva).toFixed(2));

        const transaccionProductoItem = prepareProductData(product, price, quantity, importe, iva, totalProducto);
        transaccionProductoData.push(transaccionProductoItem);

        importeGravado += importe;
        importeImpuestos += iva;
    }

    const body = {
        circuitoContable: {
            ID: -2,
            nombre: "default",
            codigo: "DEFAULT",
            id: -2
        },
        externalId: data.jobId,
        cliente,
        fecha: todayString,
        fechaVto: todayString,
        condicionDePago: 2,
        deposito: {
            ID: -2,
            nombre: "Depósito Universal",
            codigo: "DEPOSITO_UNIVERSAL",
            id: -2
        },
        importetotal: importeTotal,
        importeImpuestos: importeImpuestos,
        importeGravado: importeGravado,
        provincia: {
            provincia_id: 1,
            codigo: "BUENOS_AIRES",
            nombre: "Buenos Aires",
            pais: "Argentina"
        },
        probabilidad: 1,
        cotizacionListaDePrecio: 0,
        facturaNoExportacion: true,
        transaccionProductoItems: transaccionProductoData
    };
    return body;
}

const prepareProductData = (product, price, quantity, importe, iva, totalProducto) => {

    const transaccionProductoItem = {
        // transaccionCVItemId: 0, //Revisar
        // transaccionId: 0, //Revisar
        producto: {
            ID: 1193261,
            nombre: "Varios",
            codigo: "VARIOS",
            id: 1193261
        },
        // centro de costo
        deposito: {
            ID: -2,
            nombre: "Depósito Universal",
            codigo: "DEPOSITO_UNIVERSAL",
            id: -2
        },
        descripcion: product.jobProductDescription,
        cantidad: quantity,
        precio: parseFloat(price.toFixed(4)),
        precioconivaincluido: parseFloat((price * 1.21).toFixed(2)),
        iva: iva,
        importe: parseFloat(importe.toFixed(2)),
        total: totalProducto,
        montoExento: 0,
        porcentajeDescuento: 0,
    };
    return transaccionProductoItem
}

const getCustomerData = async (customerId) => {
    console.log("Fetching customer data for customerId:", customerId);

    const fallbackCliente = {
        ID: 10076745,
        nombre: "cliente_test",
        codigo: "test",
        id: 10076745
    };

    const buildResponse = (status, source, message, cliente = fallbackCliente) => ({
        status,
        source,
        message,
        cliente
    });

    try {
        const response = await apiClient.get(`/customers/${customerId}`);
        const cuit = response.data?.response?.cuit;

        if (!cuit) {
            return buildResponse(404, "cotizador", "CUIT no encontrado en Cotizador");
        }

        try {
            const xubioResponse = await apiClient.get(`/xubio/customer/${cuit}`);
            const data = xubioResponse.data.response;

            if (!data) {
                return buildResponse(404, "xubio", cuit);
            }

            const cliente = {
                ID: data.cliente_id,
                nombre: data.nombre,
                id: data.cliente_id
            };

            return {
                status: 200,
                source: "xubio",
                message: "Cliente encontrado",
                cliente
            };
        } catch (error) {
            return buildResponse(error.response?.status || 500, "xubio", "Error al consultar Xubio");
        }
    } catch (error) {
        return buildResponse(error.response?.status || 500, "cotizador", "Error al consultar Cotizador");
    }
};



