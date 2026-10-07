import IconButton from "../Utils/IconButton.jsx";

const getRowId = (item) => item.id || item._id;

const UtilitieTableItem = ({ item, handleDelete, handleChange }) => {
    const rowId = getRowId(item);

    return (
        <tr id={rowId} key={rowId}>
            <td>
                <IconButton
                    icon="/images/delete.png"
                    title="Eliminar Item"
                    onClick={() => handleDelete(rowId)}
                />
            </td>

            <td>
                <span>U$S </span>
                <input
                    style={{ width: "60px", textAlign: "right" }}
                    type="number"
                    name="upTo"
                    value={item.upTo}
                    onChange={(el) => handleChange(el)} />
            </td>
            <td>
                <input
                    style={{ width: "40px", textAlign: "right" }}
                    type="number"
                    name="productUtilitie"
                    value={item.productUtility}
                    onChange={(el) => handleChange(el)} />
                <span>%</span>
            </td>
            <td>
                <span>U$S </span>
                <input
                    style={{ width: "40px", textAlign: "right" }}
                    type="number"
                    name="productMinimun"
                    value={item.productMinimum}
                    disabled={true} 
                    />
            </td>
            <td>
                <input
                    style={{ width: "40px", textAlign: "right" }}
                    type="number"
                    name="kitUtilitie"
                    value={item.kitUtility}
                    onChange={(el) => handleChange(el)} />
                <span>%</span>
            </td>
            <td>
                <span>U$S </span>
                <input
                    style={{ width: "40px", textAlign: "right" }}
                    type="number"
                    name="kitMinimun"
                    value={item.kitMinimum}
                    disabled={true} />
            </td>
        </tr>
    );
}

export default UtilitieTableItem;