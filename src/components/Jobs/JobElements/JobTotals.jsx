import "./JobTotals.css"

const JobTotals = ({ totalRevenue, totalCost, totalProfit }) => {

    const formatNumber = (value) => {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="job-totals">
            <div className="job-totals-item">
                <h3>Venta Total:</h3>
                <p>{formatNumber(totalRevenue)}</p>
            </div>
            <div className="job-totals-item">
                <h3>Costo Total:</h3>
                <p>{formatNumber(totalCost)}</p>
            </div>
            <div className="job-totals-item">
                <h3>Utilidad Total:</h3>
                <p>{formatNumber(totalProfit)}</p>
            </div>

        </div>
    )
}

export default JobTotals