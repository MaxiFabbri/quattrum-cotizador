const JobStatusFilterSelect = ({ value, onChange }) => {
    return (
        
            <select
                id="jobStatus"
                name="jobStatus"
                value={value}
                onChange={onChange}
                required
            >
                <option value="">Activos</option>
                <option value="ActivosProduccion">Activos Prod</option>
                <option value="Nuevo">Nuevos</option>
                <option value="En Preparación">En Preparación</option>
                <option value="En Producción">En Producción</option>
                <option value="Listo">Listos</option>
                <option value="Entregado">Entregados</option>
                <option value="Cerrado">Cerrados</option>
                <option value="Anulado">Anulados</option>
                <option value="Todos">Todos</option>
                <option value="Reclamo">Reclamos</option>
            </select>
        
    );
};

export default JobStatusFilterSelect;