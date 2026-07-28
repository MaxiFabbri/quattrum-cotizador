import { apiClient } from "../config/axiosConfig.js";
import { toast } from "react-toastify";

export async function sendPresupuesto(presupuestoData) {
    console.log("Sending presupuesto data to Xubio API:", presupuestoData.customerId);
    const customerData = await getCustomerData(presupuestoData.customerId);
    const { cliente, categoriaFiscal } = customerData;
    console.log("Customer data retrieved:", cliente, categoriaFiscal);


    const body = await prepareDataForXubio(presupuestoData, cliente, categoriaFiscal);
    console.log("Prepared body for Xubio API:", body);

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

const prepareDataForXubio = async (data, cliente, categoriaFiscal) => {
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

    const fallbackObject = {
        cliente: {
            ID: 10076745,
            nombre: "cliente_test",
            codigo: "test",
            id: 10076745
        },
        categoriaFiscal: 1
    };

    try {
        const response = await apiClient.get(`/customers/${customerId}`);
        console.log("Customer data fetched:", response.data);

        const cuit = response.data?.response?.cuit;
        console.log("Customer CUIT:", cuit);

        if (!cuit) {
            console.warn("No se encontró CUIT, devolviendo fallback");
            return fallbackObject;
        }

        try {
            const xubioResponse = await apiClient.get(`/xubio/customer/${cuit}`);
            console.log("Xubio customer data fetched:", xubioResponse.data.response);

            const data = xubioResponse.data.response;

            if (!data) {
                console.warn("No se encontró cliente en Xubio, devolviendo fallback");
                return fallbackObject;
            }

            const cliente = {
                ID: data.cliente_id,
                nombre: data.nombre,
                id: data.cliente_id
            };

            const categoriaFiscal = data.categoriaFiscal?.id;

            console.log("Cliente data prepared:", cliente, "Categoria Fiscal:", categoriaFiscal);

            return {
                cliente,
                categoriaFiscal
            };
        } catch (error) {
            console.error("Error fetching customer data from Xubio:", error);
            return fallbackObject;
        }
    } catch (error) {
        console.error("Error fetching customer data:", error);
        return fallbackObject;
    }
};


