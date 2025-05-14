import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;


const apiClient = axios.create({
    baseURL: apiUrl,
    // baseURL: 'http://localhost:8080/api',
    // baseURL: 'https://backend-cotizador-quattrum.onrender.com/api',
    withCredentials: true, // Si necesitas manejar cookies
});
const apiDolar = axios.create({
    baseURL: 'https://dolarapi.com/v1/dolares/oficial',
});

export { apiClient, apiDolar };
