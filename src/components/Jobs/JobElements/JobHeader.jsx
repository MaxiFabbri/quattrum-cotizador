const JobHeader = () => {
    return (
        <thead key={"job-header"}>
            <tr key={"job-header"}>
                <th>Aprobado</th>
                <th>Entrega</th>
                <th>Cliente</th>
                <th>Forma de pago</th>
                <th>Moneda</th>
                <th>Cambio</th>
                <th>Estado</th>
                <th>Kit/Set</th>
                <th>Notas</th>
                <th style={{ paddingRight: "20px"}}></th>
                
            </tr>
        </thead>
    );
}

const JobProcessHeader = () => {
    return (
        <thead key={"process-header"}>
            <tr key={"process-header"}>
                <th></th>
                <th>Descripción</th>
                <th>Proveedor</th>
                <th>Forma de Pago</th>
                <th>Dias de pago</th>
                <th>Costo Unitario</th>
                <th>Costo Fijo</th>
                <th>Sub-Total</th>
                <th></th>
            </tr>
        </thead>
    )
}

export { JobHeader, JobProcessHeader };