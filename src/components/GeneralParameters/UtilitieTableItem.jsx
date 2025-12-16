import IconButton from "../Utils/IconButton.jsx";

const UtilitieTableItem = ({ item, handleDelete, handleChange }) => {

    return (
        <tr id={item.id} key={item.id}>
            <td>
                <IconButton
                    icon="/images/delete.png"
                    title="Eliminar Item"
                    onClick={() => handleDelete(item.id)}
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
                    value={item.productUtilitie}
                    onChange={(el) => handleChange(el)} />
                <span>%</span>
            </td>
            <td>
                <span>U$S </span>
                <input
                    style={{ width: "40px", textAlign: "right" }}
                    type="number"
                    name="productMinimun"
                    value={item.productMinimun}
                    disabled={true} 
                    />
            </td>
            <td>
                <input
                    style={{ width: "40px", textAlign: "right" }}
                    type="number"
                    name="kitUtilitie"
                    value={item.kitUtilitie}
                    onChange={(el) => handleChange(el)} />
                <span>%</span>
            </td>
            <td>
                <span>U$S </span>
                <input
                    style={{ width: "40px", textAlign: "right" }}
                    type="number"
                    name="kitMinimun"
                    value={item.kitMinimun}
                    disabled={true} />
            </td>

        </tr>
    );
}

export default UtilitieTableItem;