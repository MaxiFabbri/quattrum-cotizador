import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import UtilityTable from "./UtilityTable";
import TextButton from "../Utils/TextButton";
import { apiClient } from "../../config/axiosConfig";
import { toast } from "react-toastify";

const UtilitiesTableList = ({ tables, onTablesRefresh }) => {
    const [localTables, setLocalTables] = useState(tables);
    const [selectedTableId, setSelectedTableId] = useState(null);
    const [newTable, setNewTable] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [updatingDefaultId, setUpdatingDefaultId] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        setLocalTables(tables);
    }, [tables]);

    const selectedTable = newTable || localTables.find((table) => table._id === selectedTableId) || null;
    const visibleTables = localTables;

    const handleCreateTable = () => {
        setSelectedTableId(null);
        setNewTable({
            _id: uuidv4(),
            tableName: "Nueva tabla",
            isDefault: false,
            minimum: 80,
            rows: [{
                id: uuidv4(),
                upTo: 99999999,
                productUtility: 18,
                productMinimum: 0,
                kitUtility: 18,
                kitMinimum: 0,
            }],
        });
    };

    const handleSaveTable = async (updatedTable) => {
        const tableToSave = {
            tableName: updatedTable.tableName,
            isDefault: updatedTable.isDefault,
            rows: (updatedTable.rows || []).map((row) => ({
                id: row.id || row._id,
                upTo: Number(row.upTo),
                productUtility: Number(row.productUtility),
                productMinimum: Number(row.productMinimum),
                kitUtility: Number(row.kitUtility),
                kitMinimum: Number(row.kitMinimum),
            })),
        };

        setIsSaving(true);
        try {
            const response = await toast.promise(
                newTable
                    ? apiClient.post("/utility-tables", tableToSave)
                    : apiClient.put(`/utility-tables/${updatedTable._id}`, tableToSave),
                {
                    pending: newTable ? "Creando tabla..." : "Actualizando tabla...",
                    success: newTable ? "Tabla creada correctamente" : "Tabla actualizada correctamente",
                    error: newTable ? "Error al crear la tabla" : "Error al actualizar la tabla",
                },
                { autoClose: 1200 }
            );

            const responsePayload = response.data?.response;
            const responseTable = responsePayload?.utilityTable
                || responsePayload?.table
                || responsePayload;
            const refreshedTables = await onTablesRefresh?.();
            const createdTable = newTable
                ? (responseTable?._id ? responseTable : refreshedTables?.find((table) =>
                    table.tableName === tableToSave.tableName
                    && JSON.stringify(table.rows) === JSON.stringify(tableToSave.rows)
                ))
                : null;

            if (newTable && !createdTable?._id) {
                throw new Error("El backend no devolvió la tabla creada ni se encontró al actualizar el listado.");
            }

            const updatedTables = refreshedTables || (newTable
                ? [...localTables, createdTable]
                : localTables.map((table) => table._id === updatedTable._id
                    ? responseTable?.tableName
                        ? responseTable
                        : { ...table, ...tableToSave }
                    : table));

            setLocalTables(updatedTables);
            if (newTable) {
                setNewTable(null);
                setSelectedTableId(createdTable._id);
            }
            return true;
        } catch (error) {
            console.error("Error al guardar la tabla de utilidades:", error);
            if (!error?.response) {
                toast.error(error.message || "No se pudo actualizar el listado de tablas.");
            }
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelNewTable = () => {
        setNewTable(null);
        setHasUnsavedChanges(false);
    };

    const handleSetDefault = async (table) => {
        if (updatingDefaultId || isSaving || hasUnsavedChanges || newTable) return;

        setUpdatingDefaultId(table._id);
        try {
            const response = await toast.promise(
                apiClient.put(`/utility-tables/${table._id}/default`, {}),
                {
                    pending: "Cambiando tabla default...",
                    success: "Tabla default actualizada correctamente",
                    error: "Error al cambiar la tabla default",
                },
                { autoClose: 1200 }
            );

            const refreshedTables = await onTablesRefresh?.();
            if (refreshedTables) {
                setLocalTables(refreshedTables);
            } else {
                const defaultId = response.data?.response?._id || table._id;
                setLocalTables((current) => current.map((item) => ({
                    ...item,
                    isDefault: item._id === defaultId,
                })));
            }
        } catch (error) {
            console.error("Error al cambiar la tabla default:", error);
        } finally {
            setUpdatingDefaultId(null);
        }
    };

    return (
        <div className="utility-tables-editor">
            <div className="utility-tables-list-heading">
                <h3>Tablas de Utilidades</h3>
            </div>
            <div className="utility-tables-list-scroll">
                <table className="utilities-table utility-tables-index">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Default</th>
                            <th>Última Modificación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleTables.map((table) => {
                            const latestDate = new Date(table.updatedAt) > new Date(table.createdAt)
                                ? table.updatedAt
                                : table.createdAt;
                            const isSelected = selectedTableId === table._id && !newTable;

                            return (
                                <tr
                                    key={table._id}
                                    className={isSelected ? "utility-table-selected" : ""}
                                    onClick={() => {
                                        setNewTable(null);
                                        setSelectedTableId(table._id);
                                    }}
                                >
                                    <td>{table.tableName}</td>
                                    <td>{table.isDefault ? "Sí" : "No"}</td>
                                    <td>{latestDate ? new Date(latestDate).toLocaleString("es-AR") : "—"}</td>
                                    <td className="utility-table-row-actions" onClick={(event) => event.stopPropagation()}>
                                        {!table.isDefault && (
                                            <button
                                                type="button"
                                                onClick={() => handleSetDefault(table)}
                                                disabled={Boolean(updatingDefaultId) || isSaving || hasUnsavedChanges || Boolean(newTable)}
                                                title={hasUnsavedChanges || newTable
                                                    ? "Guardá o cancelá los cambios antes de cambiar la tabla default."
                                                    : undefined}
                                            >
                                                {updatingDefaultId === table._id ? "Actualizando..." : "Hacer default"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {visibleTables.length === 0 && (
                            <tr>
                                <td colSpan="4">No hay tablas para mostrar.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="utility-tables-list-actions">
                <TextButton text="Nueva tabla" onClick={handleCreateTable} />
            </div>

            {selectedTable && (
                <section className="utility-table-editor-panel">
                    <UtilityTable
                        key={selectedTable._id}
                        table={selectedTable}
                        name={selectedTable.tableName}
                        isNew={Boolean(newTable)}
                        onSave={handleSaveTable}
                        onCancelNew={handleCancelNewTable}
                        isSaving={isSaving}
                        onDirtyChange={setHasUnsavedChanges}
                    />
                </section>
            )}
        </div>
    );
};

export default UtilitiesTableList;
