const JobStatusFilterSelect = ({ value, onChange }) => {
    return (
        
            <select
                id="jobStatus"
                name="jobStatus"
                value={value}
                onChange={onChange}
                required
            >
                <option value="">Todos</option>
                <option value="Aprobado">Aprobado</option>
                <option value="En Producción">En Producción</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
            </select>
        
    );
};

export default JobStatusFilterSelect;