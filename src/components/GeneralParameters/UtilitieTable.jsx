import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import UtilitieTableItem from "./UtilitieTableItem";
import TextButton from "../Utils/TextButton";


const UtilitieTable = ({ table, onTableChange, name }) => {
    console.log('Table en utility table: ', table);
    console.log('Name de Table: ', name);

    const rows = table.rows || [];
    console.log('Rows en utility table: ', rows);
    const [newName, setNewName] = useState(name);
    const [minimum, setMinimum] = useState(rows[0]?.productMinimum ?? 0);
    console.log('Minimum en utility table: ', minimum);


    // useEffect(() => {
    //     if (rows.length > 0 && minimum > 0 && minimum !== rows[0].productMinimun) {
    //         onTableChange({
    //             ...table,
    //             rows: orderUtilityRows(rows, minimum),
    //         });
    //     }
    // }, [minimum]);

    const handleChange = (el, id) => {
        const { name, value } = el.target;
        const updatedRows = rows.map((item) =>
            getRowId(item) === id ? { ...item, [name]: Number(value) } : item
        );

        onTableChange({
            ...table,
            rows: orderUtilityRows(updatedRows, minimum),
        });
    };

    const getRowId = (item) => item.id || item._id;

    const handleAddItem = () => {
        onTableChange({
            ...table,
            rows: [
                ...rows,
                {
                    id: uuidv4(),
                    upTo: 99999999,
                    productUtilitie: 18,
                    productMinimun: 0,
                    kitUtilitie: 18,
                    kitMinimun: 0,
                },
            ],
        });
    };

    const handleDelete = (id) => {
        const updatedRows = rows.filter((item) => getRowId(item) !== id);
        onTableChange({
            ...table,
            rows: orderUtilityRows(updatedRows, minimum),
        });
    };

    return (
        <div>
            <h3>Tabla de Utilidades:</h3>
            <h4>
                Nombre:{" "}
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        border: "1px solid #ccc",
                        padding: "4px",
                    }}
                />
            </h4>
            <h4>
                <span>Utilidad Minima: U$S </span>
                <input
                    style={{ width: "40px", fontWeight: "bold", fontSize: "16px", textAlign: "right" }}
                    name="minimum"
                    type="number"
                    value={minimum}
                    onChange={(e) =>
                        onTableChange({
                            ...table,
                            minimum: Number(e.target.value),
                        })
                    }
                />
            </h4>
            <div>

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
                        {rows.map((item) => (
                            <UtilitieTableItem
                                key={getRowId(item)}
                                item={item}
                                handleDelete={handleDelete}
                                handleChange={(e) => handleChange(e, getRowId(item))}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="utilities-table-actions">
                <TextButton text="Agregar Item" onClick={handleAddItem} />
            </div>
        </div>
    );
};

export default UtilitieTable;
