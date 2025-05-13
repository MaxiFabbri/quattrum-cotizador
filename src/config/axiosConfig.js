import axios from 'axios';

const apiClient = axios.create({
    // baseURL: 'http://localhost:8080/api',
    baseURL: 'https://backend-cotizador-quattrum.onrender.com/api',
    withCredentials: true, // Si necesitas manejar cookies
});
const apiDolar = axios.create({
    baseURL: 'https://dolarapi.com/v1/dolares/oficial',
});

export { apiClient, apiDolar };
