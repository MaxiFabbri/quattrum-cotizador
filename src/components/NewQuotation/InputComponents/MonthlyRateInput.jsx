const MonthlyRateInput = ({ value, onChange }) => {
    return (
        <td>
            <input
                type="number"
                id="monthlyRate"
                name="monthlyRate"
                value={value}
                onChange={onChange}
                required
            />
        </td>
    );
};

export default MonthlyRateInput;