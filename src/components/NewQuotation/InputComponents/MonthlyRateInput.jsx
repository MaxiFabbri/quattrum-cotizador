const MonthlyRateInput = ({ value, onChange }) => {
    return (
        <td>
            <input
                className="input-number"
                type="number"
                id="monthlyRate"
                name="monthlyRate"
                value={value}
                onClick={(e) => e.target.select()}
                onChange={onChange}
                required
            />
        </td>
    );
};

export default MonthlyRateInput;