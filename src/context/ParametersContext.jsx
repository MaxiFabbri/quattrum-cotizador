import { createContext, useState, useEffect } from 'react';
import { apiClient, apiDolar } from '../config/axiosConfig.js';

// Creación del contexto
export const ParametersContext = createContext();

// Proveedor del contexto
export const ParametersProvider = ({ children }) => {
    const [paramMonthlyRate, setParamMonthlyRate] = useState(0.1);
    const [tax, setTax] = useState(0.5);
    const [utilitiesTable, setUtilitiesTable] = useState([]);
    const [dolarPrice, setDolarPrice] = useState(1080);
    const [isParamsLoaded, setIsParamsLoaded] = useState(false); // Nuevo estado

    const getGeneralParameters = async () => {
        try {
            const response = await apiClient.get('general-parameters');
            const { monthlyRate, tax, utilitiesTable, dolar } = response.data.response[0];

            setParamMonthlyRate(monthlyRate);
            setTax(tax);
            setUtilitiesTable(utilitiesTable);
            setDolarPrice(dolar);
            console.log("Dolar Price de la DB ", dolar);

            setIsParamsLoaded(true); // Marcamos que la carga de parámetros ha terminado
        } catch (error) {
            console.error('Hubo un error al recuperar los datos Generales:', error);
            alert('Error al conectar con el servidor');
        }
    };

    const getDolarPrice = async () => {
        if (!isParamsLoaded) return; // Evita ejecutar si `getGeneralParameters` no ha finalizado

        try {
            const response = await apiDolar.get();
            const newDolar = response.data.venta;

            if (newDolar !== dolarPrice) {
                console.log("NewDolar: ", newDolar, " vs ", dolarPrice);
                updateDolarPrice(newDolar);
            }
        } catch (error) {
            console.error('Error al recuperar datos de dolarHoy:', error);
        }
    };

    const updateDolarPrice = async (newDolar) => {
        try {
            console.log('Actualizando dolar en Context:', newDolar);
            setDolarPrice(newDolar);
            await apiClient.put('general-parameters/67ddd1f2ef05d862858798c3', { dolar: newDolar });
        } catch (error) {
            console.error('Error al actualizar el dólar:', error);
        }
    };

    useEffect(() => {
        getGeneralParameters();
    }, []); // Ejecutar al montar el componente

    useEffect(() => {
        getDolarPrice();
    }, [isParamsLoaded]); // Se ejecutará solo cuando isParamsLoaded sea `true`

    return (
        <ParametersContext.Provider
            value={{
                paramMonthlyRate,
                tax,
                utilitiesTable,
                dolarPrice
            }}
        >
            {children}
        </ParametersContext.Provider>
    );
};