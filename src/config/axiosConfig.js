import axios from 'axios';

// const apiUrl = process.env.REACT_APP_API_URL;
const apiUrl = import.meta.env.VITE_API_URL;
console.log('API URL:', apiUrl);

const apiClient = axios.create({
    // baseURL: "https://backend-cotizador-quattrum.onrender.com/api",
    // baseURL: "http://localhost:8000/api",
    baseURL: apiUrl,
    withCredentials: true, // Para manejar cookies
});
const apiDolar = axios.create({
    baseURL: 'https://dolarapi.com/v1/dolares/oficial',
});

export { apiClient, apiDolar };
