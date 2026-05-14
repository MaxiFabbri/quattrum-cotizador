import { createContext, useState, useEffect, useContext } from 'react';
import { apiClient, apiDolar } from '../config/axiosConfig.js';
import { AuthContext } from './AuthContext.jsx';
import { toast } from 'react-toastify';

// Creación del contexto
export const ParametersContext = createContext();

// Proveedor del contexto
export const ParametersProvider = ({ children }) => {
    const [paramMonthlyRate, setParamMonthlyRate] = useState(0.1);
    const [tax, setTax] = useState(0.5);
    const [utilitiesTable, setUtilitiesTable] = useState([]);
    const [dolarPrice, setDolarPrice] = useState(1080);
    const [isParamsLoaded, setIsParamsLoaded] = useState(false); // Nuevo estado
    const { isAuthenticated } = useContext(AuthContext);
    const [ usersList, setUsersList ] = useState([]);

    const getGeneralParameters = async () => {
        try {
            const response = await apiClient.get('general-parameters');
            const { monthlyRate, tax, utilitiesTable, dolar } = response.data.response[0];
            
            setParamMonthlyRate(monthlyRate);
            setTax(tax);
            setUtilitiesTable(utilitiesTable);
            setDolarPrice(dolar);

            setIsParamsLoaded(true); // Marcamos que la carga de parámetros ha terminado
        } catch (error) {
            console.error('Hubo un error al recuperar los datos Generales:', error);
            alert('Error al conectar con el servidor');
        }
    };
    const getUsersList = async () => {
        try {
            const response = await apiClient.get('users');
            setUsersList(response.data.response);
        } catch (error) {
            console.error('Error al recuperar la lista de usuarios:', error);
        }
    };

    const getDolarPrice = async () => {
        if (!isParamsLoaded) return; // Evita ejecutar si `getGeneralParameters` no ha finalizado
        if (!isAuthenticated) return; // Evita ejecutar si no está autenticado
        try {
            const response = await apiDolar.get();
            console.log('Respuesta de dolarHoy:', response.data.venta);
            const newDolar = response.data.venta;

            if (newDolar !== dolarPrice) {
                updateDolarPrice(newDolar);
            }
        } catch (error) {
            console.error('Error al recuperar datos de dolarHoy:', error);
        }
    };

    const updateGeneralParameters = async (newParamMonthlyRate, newTax, newUtilitiesTable) => {
        console.log("Actualizando parametros generales: ", newParamMonthlyRate, newTax, newUtilitiesTable);
        setParamMonthlyRate(newParamMonthlyRate);
        setTax(newTax / 100); // Convertir a decimal
        setUtilitiesTable(newUtilitiesTable);
        const newParameters = {
            monthlyRate: newParamMonthlyRate,
            tax: newTax / 100, // Convertir a decimal
            utilitiesTable: newUtilitiesTable,
            dolar: dolarPrice
        };
        console.log("Parametros Generales Actualizados: ", newParameters);
        try {
            const response = await toast.promise(
                apiClient.put('general-parameters/67ddd1f2ef05d862858798c3', newParameters),
                {
                    pending: "Guardando Parametros...",
                    success: "Parametros guardados correctamente",
                    error: "Error al guardar los parametros",
                },
                {
                    autoClose: 800,
                }
            )
            console.log("Parametros Guardados");
        } catch (error) {
            console.error("Error al guardar los parametros: ", error);
        }
    }

    const updateDolarPrice = async (newDolar) => {
        try {
            setDolarPrice(newDolar);
            await apiClient.put('general-parameters/67ddd1f2ef05d862858798c3', { dolar: newDolar });
        } catch (error) {
            console.error('Error al actualizar el dólar:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            getGeneralParameters();
            getUsersList();
        }
        return
    }, [isAuthenticated]);

    useEffect(() => {
        if(isParamsLoaded){
            getDolarPrice();
        }
        return
    }, [isParamsLoaded]); // Se ejecutará solo cuando isParamsLoaded sea `true`

    return (
        <ParametersContext.Provider
            value={{
                paramMonthlyRate,
                tax,
                utilitiesTable,
                updateGeneralParameters,
                dolarPrice,
                getDolarPrice,
                usersList
            }}
        >
            {children}
        </ParametersContext.Provider>
    );
};