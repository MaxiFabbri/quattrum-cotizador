const JobStatusSelect = ({ value, onChange }) => {
    return (
        <td>
            <select
                id="quoteStatus"
                name="quoteStatus"
                value={value}
                onChange={onChange}
                required
            >
                <option value="Nuevo">Nuevo</option>
                <option value="En Preparación">En Preparación</option>
                <option value="En Producción">En Producción</option>
                <option value="Listo">Listo</option>
                <option value="Entregado">Entregado</option>
                <option value="Cerrado">Cerrado</option>
                <option value="Anulado">Anulado</option>
            </select>
        </td>
    );
};

export default JobStatusSelect;