const ExchangeRateInput = ({ value, onChange }) => {
    return (
        <td>
            <input
                className="input-number"
                type="number"
                id="exchangeRate"
                name="exchangeRate"
                value={value}
                onChange={onChange}
                required
            />
        </td>
    );
};

export default ExchangeRateInput;