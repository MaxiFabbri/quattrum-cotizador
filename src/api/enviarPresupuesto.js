import { apiClient } from "../config/axiosConfig.js";
import { toast } from "react-toastify";

export async function sendPresupuesto(presupuestoData) {
    const body = await prepareDataForXubio(presupuestoData);

    try {
        const response = await apiClient.post("/xubio/", body);
        console.log("Response from Xubio API en enviar:", response);

        toast.success("Pedido enviado a Xubio correctamente", {
            position: "top-center",
            autoClose: 6000
        });

        // devolvemos la respuesta al caller
        return response.data;
    } catch (error) {
        console.error("Error al enviar el pedido a Xubio: ", error);

        toast.error("Error al enviar el pedido a Xubio", {
            position: "top-center",
            autoClose: 6000
        });

        // propagamos el error al caller
        throw error;
    }
}

const prepareDataForXubio = async (data) => {
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
        importeTotal += totalProducto;
    }

    const body = {
        circuitoContable: {
            ID: -2,
            nombre: "default",
            codigo: "DEFAULT",
            id: -2
        },
        externalId: data.jobId,
        cliente: {
            ID: 10076745,
            nombre: "cliente_test",
            codigo: "test",
            id: 10076745
        },
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
        transaccionCVItemId: 0, //Revisar
        precioconivaincluido: parseFloat(totalProducto.toFixed(2)),
        transaccionId: 0, //Revisar
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
        iva: iva,
        importe: parseFloat(importe.toFixed(2)),
        total: totalProducto,
        montoExento: 0,
        porcentajeDescuento: 0,
    };
    return transaccionProductoItem
}

