// src/api/xubio.js
import { getAccessToken } from "./auth";

/**
 * Consulta el recurso presupuestoBean de la API de Xubio
 * usando un token válido.
 */
export async function getPresupuestos() {
    const token = await getAccessToken();
    const url = `${process.env.XUBIO_BASE_URL}/presupuestoBean`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`Error obteniendo presupuestos: ${response.statusText}`);
    }
    console.log("Response from Xubio API:", await response.clone().json()); // Log the response for debugging
    return response.json();
}
