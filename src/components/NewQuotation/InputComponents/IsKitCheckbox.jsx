const IsKitCheckbox = ({ checked, onChange }) => {
    return (
        <td>
            <input
                type="checkbox"
                id="isKit"
                name="isKit"
                checked={checked}
                onChange={onChange}
            />
        </td>
    );
};

export default IsKitCheckbox;