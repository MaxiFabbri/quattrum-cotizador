const DateField = ({ value, onChange }) => {
    return (
        <td>
            <input
                type="date"
                id="date"
                name="date"
                value={value}
                onChange={onChange}
                required
            />
        </td>
    );
};

export default DateField;