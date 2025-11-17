const JobHeader = () => {
    return (
        <thead key={"job-header"}>
            <tr key={"job-header"}>
                <th>Aprobado</th>
                <th>Entrega</th>
                <th>Cliente</th>
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

const JobProductHeader = () => {
    return (
        <thead key={"product-header"}>
            <tr key={"product-header"}>
                <th></th>
                <th>Cantidad</th>
                <th>Descripción</th>
                <th>Días</th>
                <th>Financiero</th>
                <th>Fletes</th>
                <th>Otros</th>
                <th>Precio Unitario</th>
                <th></th>
            </tr>
        </thead>
    )
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

export { JobHeader, JobProductHeader, JobProcessHeader };