import { apiClient } from "../../config/axiosConfig";
import { useState, useEffect, useContext, use } from "react";
import UtilitieTableItem from "./UtilitieTableItem";
import { ParametersContext } from "../../context/ParametersContext.jsx";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import TextButton from "../Utils/TextButton";
import "./GeneralParameters.css";

const GeneralParameters = () => {
    const { paramMonthlyRate, tax, utilitiesTable, updateGeneralParameters, getGeneralParameters } = useContext(ParametersContext);
    const [newMonthlyRate, setNewMonthlyRate] = useState(paramMonthlyRate);
    const [newTax, setNewTax] = useState(tax * 100);
    const [newUtilitiesTable, setNewUtilitiesTable] = useState(utilitiesTable);
    const [newMinimum, setNewMinimum] = useState(0);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    
    useEffect(() => {
        if (utilitiesTable.length > 0) {
            setNewMonthlyRate(paramMonthlyRate);
            setNewTax(tax * 100);
            setNewUtilitiesTable(utilitiesTable);
            setNewMinimum(utilitiesTable[0].productMinimun);
            setLoading(false);
            return
        };
        getGeneralParameters();
    }, [utilitiesTable]);

    useEffect(() => {
        if (newUtilitiesTable.length > 0 && newMinimum > 0 && newMinimum !== utilitiesTable[0].productMinimun ) {
            orderUtilitiesTable(newUtilitiesTable);
        }
    }, [newMinimum]);    

    const orderUtilitiesTable = (table) => {
        console.log("Updating Table: ", table)
        let updatedTable = [...table];

        // 🔀 Paso 2: Ordenar por upTo
        updatedTable.sort((a, b) => a.upTo - b.upTo);
    
        // 🧮 Paso 3: Calcular productMinimun y KitMinimun
        for (let i = 1; i < updatedTable.length; i++) {
            const anterior = updatedTable[i - 1];
            updatedTable[i].productMinimun = Math.floor((anterior.upTo/(1-(anterior.productUtilitie/100))) - anterior.upTo );
            updatedTable[i].kitMinimun = Math.floor((anterior.upTo/(1-(anterior.kitUtilitie/100))) - anterior.upTo );
        }
    
        // El primero siempre arranca en newMinimum
        if (updatedTable.length > 0) {
            updatedTable[0].productMinimun = newMinimum;
            updatedTable[0].kitMinimun = newMinimum;
        }
    
        console.log("Updated Table: ",updatedTable);
        // 🚀 Actualizar estado final
        setNewUtilitiesTable(updatedTable);
    }

    const handleChange = (el, id) => {
        const { name, value } = el.target;
        // 🔄 Paso 1: Clonar y actualizar el item correspondiente
        let updatedTable = [...newUtilitiesTable].map(item =>
            item.id === id ? { ...item, [name]: Number(value) } : item
        );
        orderUtilitiesTable(updatedTable);
    };

    const handleAddItem = () => {
        console.log("Agregar Item");
        setNewUtilitiesTable(prevItems => [
            ...prevItems,
            {
                id: uuidv4(),
                upTo: 99999999,
                productUtilitie: 18,
                productMinimun: 0,
                kitUtilitie: 18,
                kitMinimun: 0
            }
        ]);
    };

    const handleDelete = (id) => {
        console.log("Eliminar Item ", id);
        const updatedTable = [...newUtilitiesTable].filter(item => item.id !== id);
        orderUtilitiesTable(updatedTable);
    }

    const handleCancel = () => {
        navigate("/"); // Redirige a la lista de clientes después de guardar
    }

    const validateParametersData = () => {
        if (newMonthlyRate < 0) {
            alert("debe ser mayor o igual a 0");
            return false;
        }
        if (newTax < 0) {
            alert("El impuesto debe ser mayor o igual a 0");
            return false;
        }
        return true;
    }

    const handleSaveParameters = async () => {
        if (!validateParametersData()) {
            return; // Si la validación falla, no continuar
        } else {
            console.log("newMonthlyRate: ", newMonthlyRate);
            console.log("newTax: ", newTax);
            console.log("newUtilitiesTable: ", newUtilitiesTable);
            updateGeneralParameters(newMonthlyRate, newTax, newUtilitiesTable)
        }
        navigate("/"); // Redirige a la lista de clientes después de guardar
    }

    if (loading) return <p>Cargando...</p>;
    return (
        <div>
            <h2>Parametros Generales</h2>
            <h4>
                <span>Tasa de Interes mensual: </span>
                <input
                    style={{ width: "40px", fontWeight: "bold", fontSize: "16px", textAlign: "right" }}
                    type="number"
                    name="monthlyRate"
                    value={newMonthlyRate}
                    onChange={(e) => setNewMonthlyRate(Number(e.target.value))}
                />
                <span> %</span>
            </h4>
            <h4>
                <span>Tasa de Impuesto: </span>
                <input
                    style={{ width: "40px", fontWeight: "bold", fontSize: "16px", textAlign: "right" }}
                    name="tax"
                    type="number"
                    value={newTax}
                    onChange={(e) => setNewTax(Number(e.target.value))}
                />
                <span> %</span>
            </h4>
            <h4>
                <span>Utilidad Minima: U$S </span>
                <input
                    style={{ width: "40px", fontWeight: "bold", fontSize: "16px", textAlign: "right" }}
                    name="minimum"
                    type="number"
                    value={newMinimum}
                    onChange={(e) => setNewMinimum(Number(e.target.value))}
                />
            </h4>
            <div>
                <h3>Tabla de Utilidades:</h3>
                <table className="utilities-table">
                    <thead>
                        <tr>
                            <th style={{ width: "40px" }}> </th>
                            <th style={{ width: "160px" }}>Hasta U$S</th>
                            <th style={{ width: "160px" }}>Utilidad Deseada</th>
                            <th style={{ width: "160px" }}>Utilidad Minima</th>
                            <th style={{ width: "160px" }}>Utilidad KIT Deseada</th>
                            <th style={{ width: "160px" }}>Utilidad KIT Minima</th>
                        </tr>
                    </thead>
                    <tbody>
                        {newUtilitiesTable.map((item) => (
                            <UtilitieTableItem
                                key={item.id}
                                item={item}
                                handleDelete={handleDelete}
                                handleChange={(e) => handleChange(e, item.id)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="button-container">
                <TextButton text="Agregar Item" onClick={handleAddItem} />
                <TextButton text="Guardar" onClick={handleSaveParameters} />
                <TextButton text="Cancelar" onClick={handleCancel} />
            </div>
        </div>
    )
}

export default GeneralParameters;

