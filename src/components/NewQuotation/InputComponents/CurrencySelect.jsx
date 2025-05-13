const CurrencySelect = ({ value, onChange }) => {
    return (
        <td>
            <select
                id="currency"
                name="currency"
                value={value}
                onChange={onChange}
                required
            >
                <option value="Dolar">Dolar</option>
                <option value="Peso">Peso</option>
            </select>
        </td>
    );
};

export default CurrencySelect;