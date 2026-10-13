import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import UtilityTableItem from "./UtilityTableItem";
import TextButton from "../Utils/TextButton";

const getRowId = (item) => item.id || item._id;

const orderUtilityRows = (rows, minimum) => {
    const sortedRows = [...rows].sort((a, b) => Number(a.upTo) - Number(b.upTo));

    return sortedRows.map((row, index) => {
        if (index === 0) {
            return {
                ...row,
                productMinimum: Math.floor(minimum),
                kitMinimum: Math.floor(minimum),
            };
        }

        const previousRow = sortedRows[index - 1];
        return {
            ...row,
            productMinimum: Math.floor(Number(previousRow.upTo) * Number(previousRow.productUtility) / 100),
            kitMinimum: Math.floor(Number(previousRow.upTo) * Number(previousRow.kitUtility) / 100),
        };
    });
};

const UtilityTable = ({ table, name, isNew = false, onSave, onCancelNew, isSaving = false, onDirtyChange }) => {
    const [draft, setDraft] = useState(() => structuredClone(table));
    const [isDirty, setIsDirty] = useState(isNew);

    useEffect(() => {
        setDraft(structuredClone(table));
        setIsDirty(isNew);
        onDirtyChange?.(isNew);
    }, [table, isNew, onDirtyChange]);

    const sourceRows = draft.rows || [];
    const minimum = Number(draft.minimum ?? sourceRows[0]?.productMinimum ?? 0);
    const rows = orderUtilityRows(sourceRows, minimum);

    const updateDraft = (updatedTable) => {
        setDraft(updatedTable);
        setIsDirty(true);
        onDirtyChange?.(true);
    };

    const updateRows = (updatedRows, updatedMinimum = minimum) => {
        updateDraft({
            ...draft,
            minimum: updatedMinimum,
            rows: orderUtilityRows(updatedRows, updatedMinimum),
        });
    };

    const handleChange = (event, id) => {
        const { name: field, value } = event.target;
        const updatedRows = rows.map((item) =>
            getRowId(item) === id ? { ...item, [field]: Number(value) } : item
        );
        updateRows(updatedRows);
    };

    const handleAddItem = () => {
        updateRows([
            ...rows,
            {
                id: uuidv4(),
                upTo: 99999999,
                productUtility: 18,
                productMinimum: 0,
                kitUtility: 18,
                kitMinimum: 0,
            },
        ]);
    };

    const handleDeleteRow = (id) => {
        updateRows(rows.filter((item) => getRowId(item) !== id));
    };

    const handleMinimumChange = (event) => {
        updateRows(rows, Number(event.target.value));
    };

    const handleSave = async () => {
        console.log("Saving table:", draft);
        console.log("is new: ", isNew);
        const saved = await onSave(draft);
        if (saved) {
            setIsDirty(false);
            onDirtyChange?.(false);
        }
    };

    const handleCancel = () => {
        if (isNew) {
            onCancelNew();
            return;
        }
        setDraft(structuredClone(table));
        setIsDirty(false);
        onDirtyChange?.(false);
    };

    return (
        <div>
            <h4>
                Nombre:{" "}
                <input
                    type="text"
                    value={draft.tableName ?? name ?? ""}
                    onChange={(event) => updateDraft({ ...draft, tableName: event.target.value })}
                    style={{ fontWeight: "bold", fontSize: "16px", border: "1px solid #ccc", padding: "4px" }}
                />
            </h4>
            <h4>
                <label>
                    <span>Utilidad Mínima: U$S </span>
                    <input
                        style={{ width: "80px", fontWeight: "bold", fontSize: "16px", textAlign: "right" }}
                        name="minimum"
                        type="number"
                        min="0"
                        value={minimum}
                        onChange={handleMinimumChange}
                    />
                </label>
            </h4>
            <table className="utilities-table">
                <thead>
                    <tr>
                        <th style={{ width: "40px" }}></th>
                        <th style={{ width: "160px" }}>Hasta U$S</th>
                        <th style={{ width: "160px" }}>Utilidad Deseada</th>
                        <th style={{ width: "160px" }}>Utilidad Mínima</th>
                        <th style={{ width: "160px" }}>Utilidad KIT Deseada</th>
                        <th style={{ width: "160px" }}>Utilidad KIT Mínima</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((item, index) => (
                        <UtilityTableItem
                            key={getRowId(item) || `utility-row-${index}`}
                            item={item}
                            handleDelete={handleDeleteRow}
                            handleChange={(event) => handleChange(event, getRowId(item))}
                        />
                    ))}
                </tbody>
            </table>
            <div className="utilities-table-actions">
                <TextButton text="Agregar Item" onClick={handleAddItem} />
            </div>
            {(isDirty || isNew) && (
                <div className="utility-table-edit-actions">
                    <TextButton text="Cancelar" onClick={handleCancel} />
                    <TextButton
                        text={isSaving ? "Guardando..." : "Guardar"}
                        onClick={handleSave}
                        disabled={isSaving}
                    />
                </div>
            )}
        </div>
    );
};

export default UtilityTable;
