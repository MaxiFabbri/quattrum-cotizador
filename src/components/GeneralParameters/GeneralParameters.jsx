import { useContext, useEffect, useState } from "react";
import { ParametersContext } from "../../context/ParametersContext.jsx";
import TextButton from "../Utils/TextButton";
import UtilitiesTableList from "./UtilitiesTableList.jsx";
import "./GeneralParameters.css";

const GeneralParameters = () => {
    const {
        paramMonthlyRate,
        utilityTables,
        tax,
        updateGeneralParameters,
        isParamsLoaded,
        getUtilityTables,
    } = useContext(ParametersContext);
    const [newMonthlyRate, setNewMonthlyRate] = useState(paramMonthlyRate);
    const [newTax, setNewTax] = useState(tax * 100);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setNewMonthlyRate(paramMonthlyRate);
        setNewTax(tax * 100);
    }, [paramMonthlyRate, tax]);

    const hasParameterChanges =
        Number(newMonthlyRate) !== Number(paramMonthlyRate)
        || Number(newTax) !== Number(tax * 100);

    const handleCancel = () => {
        setNewMonthlyRate(paramMonthlyRate);
        setNewTax(tax * 100);
    };

    const handleSaveParameters = async () => {
        if (newMonthlyRate < 0 || newTax < 0) {
            alert("La tasa mensual y el impuesto deben ser mayores o iguales a 0.");
            return;
        }

        setIsSaving(true);
        try {
            await updateGeneralParameters(Number(newMonthlyRate), Number(newTax));
        } finally {
            setIsSaving(false);
        }
    };

    if (!isParamsLoaded) return <p className="parameters-loading">Cargando parámetros...</p>;

    return (
        <div className="general-parameters-page">
            <h2>Parametros Generales</h2>
            <h4>
                <span>Tasa de Interes mensual: </span>
                <input
                    style={{ width: "60px", fontWeight: "bold", fontSize: "16px", textAlign: "right" }}
                    type="number"
                    name="monthlyRate"
                    min="0"
                    step="any"
                    value={newMonthlyRate}
                    onChange={(event) => setNewMonthlyRate(Number(event.target.value))}
                />
                <span> %</span>
            </h4>
            <h4>
                <span>Tasa de Impuesto: </span>
                <input
                    style={{ width: "60px", fontWeight: "bold", fontSize: "16px", textAlign: "right" }}
                    name="tax"
                    type="number"
                    min="0"
                    step="any"
                    value={newTax}
                    onChange={(event) => setNewTax(Number(event.target.value))}
                />
                <span> %</span>
            </h4>
            {hasParameterChanges && (
                <div className="button-container">
                    <TextButton text="Cancelar" onClick={handleCancel} />
                    <TextButton
                        text={isSaving ? "Guardando..." : "Guardar"}
                        onClick={handleSaveParameters}
                        disabled={isSaving}
                    />
                </div>
            )}
            <div className="utility-tables-section">
                <UtilitiesTableList tables={utilityTables} onTablesRefresh={getUtilityTables} />
            </div>
        </div>
    );
};

export default GeneralParameters;
