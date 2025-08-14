const MonthlyRateInput = ({ value, onChange }) => {
    return (
        <input
            style={{ marginRight: "10px" }}
            className="input-number"
            type="number"
            id="monthlyRate"
            name="monthlyRate"
            value={value}
            onClick={(e) => e.target.select()}
            onChange={onChange}
            required
        />
    );
};

export default MonthlyRateInput;