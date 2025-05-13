const QuotationHeader = () => {
    return (
        <thead key={"quotation-header"}>
            <tr key={"quotation-header"}>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Forma de pago</th>
                <th>Tasa de Interes</th>
                <th>Moneda</th>
                <th>Cambio</th>
                <th>Estado</th>
                <th>Kit</th>
                <th style={{ paddingRight: "20px"}}></th>
                
            </tr>
        </thead>
    );
}

const ProductHeader = () => {
    return (
        <thead key={"product-header"}>
            <tr key={"product-header"}>
                <th></th>
                <th>Cantidad</th>
                <th>Descripción</th>
                <th>Días Producción</th>
                <th>Costo Financiero</th>
                <th>Costo de Fletes</th>
                <th>Otros Costos</th>
                <th>Precio Unitario</th>
                <th></th>
            </tr>
        </thead>
    )
}

const ProcessHeader = () => {
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

export { QuotationHeader, ProductHeader, ProcessHeader };