import IconButton from "../Utils/IconButton.jsx";

const ContactTableItem = ({ item, handleDelete, handleChange }) => {

    return (
        <tr id={item.id} key={item.id}>
            <td>
                <IconButton
                    icon="/delete.png"
                    title="Eliminar Item"
                    onClick={() => handleDelete(item.id)}
                />
            </td>
            <td>
                <input
                    style={{ width: "200px", textAlign: "right" }}
                    type="string"
                    name="name"
                    value={item.name}
                    onChange={(el) => handleChange(el)} />
            </td>
            <td>
                <input
                    style={{ width: "160px", textAlign: "right" }}
                    type="string"
                    name="position"
                    value={item.position}
                    onChange={(el) => handleChange(el)} />
            </td>
            <td>
                <input
                    style={{ width: "250px", textAlign: "right" }}
                    type="string"
                    name="email"
                    value={item.email}
                    onChange={(el) => handleChange(el)} />
            </td>
            <td>
                <input
                    style={{ width: "160px", textAlign: "right" }}
                    type="string"
                    name="phone"
                    value={item.phone}
                    onChange={(el) => handleChange(el)} />
            </td>
        </tr>
    );
}

export default ContactTableItem;