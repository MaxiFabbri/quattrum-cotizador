const ExchangeRateInput = ({ value, onChange }) => {
    return (
        <td>
            <input
                className="input-number"
                type="number"
                id="exchangeRate"
                name="exchangeRate"
                value={value}
                onClick={(e) => e.target.select()}
                onChange={onChange}
                required
            />
        </td>
    );
};

export default ExchangeRateInput;