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
                <option value="Nuevo">Nuevo</option>
                <option value="En Preparación">En Preparación</option>
                <option value="En Producción">En Producción</option>
                <option value="Listo">Listo</option>
                <option value="Entregado">Entregado</option>
                <option value="Cerrado">Cerrado</option>
                <option value="Anulado">Anulado</option>
            </select>
        
    );
};

export default JobStatusFilterSelect;