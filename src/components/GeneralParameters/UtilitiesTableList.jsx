import { useState } from "react";

import UtilitieTable from "./UtilitieTable";

const UtilitiesTable = ({ tables }) => {
    console.log("Tables received in UtilitiesTable: ", tables);
    // Transformamos los datos para quedarnos con lo necesario
    const [selectedTable, setSelectedTable] = useState(null);

    const formattedTables = tables.map((table) => {
        const latestDate =
            new Date(table.updatedAt) > new Date(table.createdAt)
                ? table.updatedAt
                : table.createdAt;

        return {
            ...table, // conservo todo para el detalle
            latestDate,
        };
    });
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Activo</th>
                        <th>Default</th>
                        <th>Última fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {formattedTables.map((t) => (
                        <tr key={t._id} onClick={() => setSelectedTable(t)}>
                            <td>{t.tableName}</td>
                            <td>{t.isActive ? "Sí" : "No"}</td>
                            <td>{t.isDefault ? "Sí" : "No"}</td>
                            <td>{new Date(t.latestDate).toLocaleString("es-AR")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedTable && (
                <div style={{ marginTop: "20px" }}>
                    <UtilitieTable
                        table={selectedTable}
                        rows={selectedTable.rows}
                        minimum={selectedTable.minimum}
                        name={selectedTable.tableName}
                        onTableChange={(updated) => {
                            // acá podés actualizar el estado global o enviar cambios al backend
                            setSelectedTable(updated);
                        }}
                    />
                </div>
            )}
        </div>
    )
};

export default UtilitiesTable