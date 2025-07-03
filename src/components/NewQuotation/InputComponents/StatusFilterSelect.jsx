const StatusFilterSelect = ({ value, onChange }) => {
    return (
        
            <select
                id="quoteStatus"
                name="quoteStatus"
                value={value}
                onChange={onChange}
                required
            >
                <option value="">Todos</option>
                <option value="Cotizado">Cotizado</option>
                <option value="Aprobado">Aprobado</option>
                <option value="En Producción">En Producción</option>
                <option value="Entregado">Entregado</option>
            </select>
        
    );
};

export default StatusFilterSelect;