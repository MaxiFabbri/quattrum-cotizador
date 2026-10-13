import IconButton from "../Utils/IconButton.jsx";

const getRowId = (item) => item.id || item._id;

const UtilityTableItem = ({ item, handleDelete, handleChange }) => {
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
                    name="productUtility"
                    value={item.productUtility}
                    onChange={(el) => handleChange(el)} />
                <span>%</span>
            </td>
            <td>
                <span>U$S </span>
                <input
                    style={{ width: "40px", textAlign: "right" }}
                    type="number"
                    name="productMinimum"
                    value={item.productMinimum}
                    disabled={true} 
                    />
            </td>
            <td>
                <input
                    style={{ width: "40px", textAlign: "right" }}
                    type="number"
                    name="kitUtility"
                    value={item.kitUtility}
                    onChange={(el) => handleChange(el)} />
                <span>%</span>
            </td>
            <td>
                <span>U$S </span>
                <input
                    style={{ width: "40px", textAlign: "right" }}
                    type="number"
                    name="kitMinimum"
                    value={item.kitMinimum}
                    disabled={true} />
            </td>
        </tr>
    );
}

export default UtilityTableItem;