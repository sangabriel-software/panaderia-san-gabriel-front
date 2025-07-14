import React from "react";
import CardDaschboard from "../../components/CardDashboard/CardDashboard";
import EarningsOverview from "../../components/GraficasEstadisticas/EarningsOverview";
import BestSellingProductChart from "../../components/GraficasEstadisticas/BestSellingProductChart";
import "./DashboardPage.css"
import { FaDownload } from "react-icons/fa";
import useGetDashboardData from "../../hooks/DashboardData/useGetDashboardData";
import { formatoQuetzalesSimple } from "../../utils/utils";

function DashboardPage() {
    const { dashboardData, loadingDashboardData, showErrorDashboardData, setDashboardData,
        cantidadEmpleados, cantidadSucursales, ingresosMensuales, ingresosAnuales, resumenMensual, topVentas } = useGetDashboardData();

    // Función para sumar los ingresos mensuales de todas las sucursales
    const calcularTotalIngresosMensuales = () => {
        if (!ingresosMensuales || ingresosMensuales.length === 0) return "0.00";
        
        const total = ingresosMensuales.reduce((sum, sucursal) => {
            return sum + (parseFloat(sucursal.ingresoMensual) || 0);
        }, 0);
        
        return total.toFixed(2);
    };

    // Función para sumar los ingresos anuales de todas las sucursales
    const calcularTotalIngresosAnuales = () => {
        if (!ingresosAnuales || ingresosAnuales.length === 0) return "0.00";
        
        const total = ingresosAnuales.reduce((sum, sucursal) => {
            return sum + (parseFloat(sucursal.ingresoAnual) || 0);
        }, 0);
        
        return total.toFixed(2);
    };

    return (
        <div className="container-fluid">
            {/* Page Heading */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-dark">Dashboard</h1>
                <a className="btnReports btn btn-primary btn-sm shadow">
                    <FaDownload className="me-2" />
                    Generate Report
                </a>
            </div>

            <div className="row">
                <CardDaschboard
                    message="Ingreso Mes En Curso"
                    icon="fa-calendar-days"
                    borderColor="var(--bs-primary)"
                    amount={formatoQuetzalesSimple(calcularTotalIngresosMensuales())}
                />
                <CardDaschboard
                    message="Ingreso Año en curso"
                    icon="fa-money-bill-wave"
                    borderColor="var(--bs-success)"
                    amount={formatoQuetzalesSimple(calcularTotalIngresosAnuales())}
                />
                <CardDaschboard
                    message="Sucursales"
                    icon="fa-shop"
                    borderColor="var(--bs-warning)"
                    amount={cantidadSucursales}
                />
                <CardDaschboard
                    message="Empleados"
                    icon="fa-users"
                    borderColor="var(--bs-info)"
                    amount={cantidadEmpleados}
                />
            </div>

            {/* Content Row chart */}
            <div className="row">
                <div className="col-xl-6 col-lg-6 mb-4">
                    <EarningsOverview 
                    resumenMensual={resumenMensual}
                    />
                </div>

                {/* Columna para la segunda gráfica */}
                <div className="col-xl-6 col-lg-6 mb-4">
                    <BestSellingProductChart 
                    topVentas={topVentas}
                    />
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;