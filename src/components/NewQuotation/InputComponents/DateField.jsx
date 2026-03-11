const DateField = ({ value, onChange }) => {
    return (
        <td>
            <input
                type="date"
                id="date"
                name="date"
                defaultValue={value}
                onChange={onChange}
                required
            />
        </td>
    );
};

export default DateField;