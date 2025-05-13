const QuoteStatusSelect = ({ value, onChange }) => {
    return (
        <td>
            <select
                id="quoteStatus"
                name="quoteStatus"
                value={value}
                onChange={onChange}
                required
            >
                <option value="Cotizado">Cotizado</option>
                <option value="Enviada">Enviada</option>
                <option value="Aceptada">Aceptada</option>
                <option value="Rechazada">Rechazada</option>
            </select>
        </td>
    );
};

export default QuoteStatusSelect;