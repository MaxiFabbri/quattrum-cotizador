import { createContext, useState, useEffect, useContext } from 'react';
import { apiClient, apiDolar } from '../config/axiosConfig.js';
import { AuthContext } from './AuthContext.jsx';
import { toast } from 'react-toastify';

export const ParametersContext = createContext();

const getDefaultUtilityRows = (tables = []) => {
    const defaultTable = tables.find((table) => table.isDefault)
        || tables.find((table) => table.isActive)
        || tables[0];
    return defaultTable?.rows || [];
};

export const ParametersProvider = ({ children }) => {
    const [paramMonthlyRate, setParamMonthlyRate] = useState(0.1);
    const [tax, setTax] = useState(0.05);
    const [utilityTables, setUtilityTables] = useState([]);
    const [utilitiesTable, setUtilitiesTable] = useState([]);
    const [dolarPrice, setDolarPrice] = useState(1080);
    const [isParamsLoaded, setIsParamsLoaded] = useState(false);
    const { isAuthenticated } = useContext(AuthContext);
    const [usersList, setUsersList] = useState([]);

    const getUtilityTables = async () => {
        try {
            const response = await apiClient.get('utility-tables');
            const tables = response.data.response || [];
            console.log('Utility Tables Recuperados: ', tables);
            setUtilityTables(tables);
            setUtilitiesTable(getDefaultUtilityRows(tables));
        } catch (error) {
            console.error('Hubo un error al recuperar las tablas de utilidad:', error);
            alert('Error al conectar con el servidor');
        }
    };

    const getGeneralParameters = async () => {
        try {
            const response = await apiClient.get('general-parameters');
            const { monthlyRate, tax, dolar } = response.data.response[0];
            console.log('Parametros Generales Recuperados: ', { monthlyRate, tax, dolar });
            setParamMonthlyRate(monthlyRate);
            setTax(tax);
            setDolarPrice(dolar);
            setIsParamsLoaded(true);
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
        if (!isParamsLoaded) return;
        if (!isAuthenticated) return;
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

    const updateGeneralParameters = async (newParamMonthlyRate, newTax) => {
        console.log("Actualizando parametros generales: ", newParamMonthlyRate, newTax);
        setParamMonthlyRate(newParamMonthlyRate);
        setTax(newTax / 100);
        const newParameters = {
            monthlyRate: newParamMonthlyRate,
            tax: newTax / 100,
            dolar: dolarPrice
        };
        console.log("Parametros Generales Actualizados: ", newParameters);
        try {
            await toast.promise(
                apiClient.put('general-parameters/67ddd1f2ef05d862858798c3', newParameters),
                {
                    pending: "Guardando Parametros...",
                    success: "Parametros guardados correctamente",
                    error: "Error al guardar los parametros",
                },
                {
                    autoClose: 800,
                }
            );
            console.log("Parametros Guardados");
        } catch (error) {
            console.error("Error al guardar los parametros: ", error);
        }
    };

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
            getUtilityTables();
            getUsersList();
        }
        return;
    }, [isAuthenticated]);

    useEffect(() => {
        if (isParamsLoaded) {
            getDolarPrice();
        }
        return;
    }, [isParamsLoaded]);

    return (
        <ParametersContext.Provider
            value={{
                getGeneralParameters,
                getUtilityTables,
                paramMonthlyRate,
                tax,
                utilitiesTable,
                utilityTables,
                updateGeneralParameters,
                dolarPrice,
                getDolarPrice,
                usersList,
                isParamsLoaded,
            }}
        >
            {children}
        </ParametersContext.Provider>
    );
};
