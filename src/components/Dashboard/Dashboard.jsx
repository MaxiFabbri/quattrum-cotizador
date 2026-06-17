import { useState, useEffect } from "react";
import { apiClient } from "../../config/axiosConfig.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
    const [jobsData, setJobsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchData() {
        try {
            const response = await apiClient.get(`/jobs/products/`);
            console.log("Response from API: ", response.data.response);
            setJobsData(response.data.response);
        } catch (error) {
            setError("Error al cargar los trabajos");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        document.title = "Dashboard";
        fetchData();
    }, []);

    // Transformar datos para el gráfico
    let monthlyData = {};

    if (jobsData) {
        monthlyData = jobsData.reduce((acc, job) => {
            const date = new Date(job.approvalDate);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // ej: "2026-3"

            if (!acc[monthKey]) {
                acc[monthKey] = { amount: 0, jobs: 0 };
            }

            // cada job aprobado cuenta como 1
            acc[monthKey].jobs += 1;

            job.jobProducts.forEach((prod) => {
                acc[monthKey].amount += Math.round(
                    prod.quantity * prod.unitSellingPrice * job.exchangeRate / 1000
                );
            });

            return acc;
        }, {});
        console.log("Monthly Data: ", monthlyData);
    } else {
        monthlyData = {};
    }

    const chartData = Object.entries(monthlyData).map(([month, values]) => ({
        month,
        amount: values.amount,
        jobs: values.jobs,
    }));
    console.log("Chart Data: ", chartData);

    const CustomLegend = () => (
        <div className="custom-legend">
            <div style={{ marginRight: 20 }}>
                <span className="amount-color">■</span> Importe total en $ miles
            </div>
            <div>
                <span className="jobs-color">■</span> Cantidad de Trabajos
            </div>
        </div>
    );

    return (
        <div>
            <h2>Dashboard</h2>
            {loading && <p>Cargando datos...</p>}
            {error && <p>{error}</p>}
            {jobsData && (
                <div className="dashboard-barchart">
                    <h3>Trabajos aprobados por mes</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="month" />
                            {/* Eje Y para importe (izquierda, escala grande) */}
                            <YAxis
                                yAxisId="amount"
                                orientation="left"
                                width={100}
                                tickFormatter={(value) =>
                                    new Intl.NumberFormat("es-AR", {
                                        style: "currency",
                                        currency: "ARS",
                                        maximumFractionDigits: 0,
                                    }).format(value)
                                }
                            />
                            {/* Eje Y para cantidad de trabajos (derecha, escala pequeña) */}
                            <YAxis
                                yAxisId="jobs"
                                orientation="right"
                                width={60}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip />

                            {/* Barra de trabajos usando eje derecho */}
                            <Bar
                                yAxisId="jobs"
                                dataKey="jobs"
                                fill="#82ca9d"
                                name="Cantidad de Trabajos"
                            />

                            {/* Barra de importe usando eje izquierdo */}
                            <Bar
                                yAxisId="amount"
                                dataKey="amount"
                                fill="#8884d8"
                                name="Importe total en $ miles"
                            />
                            <Legend content={<CustomLegend />} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default Dashboard;