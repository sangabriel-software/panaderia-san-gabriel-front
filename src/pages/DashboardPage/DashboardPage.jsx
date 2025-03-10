import React from "react";
import CardDaschboard from "../../components/CardDashboard/CardDashboard";
import EarningsOverview from "../../components/GraficasEstadisticas/EarningsOverview";
import BestSellingProductChart from "../../components/GraficasEstadisticas/BestSellingProductChart";
import "./DashboardPage.css"
import { FaDownload } from "react-icons/fa";

function DashboardPage() {
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
          message="Ingreso Mensual"
          icon="fa-calendar-days"
          borderColor="var(--bs-primary)"
          amount="Q.15205.50"
        />
        <CardDaschboard
          message="Ingreso Anual"
          icon="fa-money-bill-wave"
          borderColor="var(--bs-success)"
          amount="Q.10205.50"
        />
        <CardDaschboard
          message="Sucursales"
          icon="fa-shop"
          borderColor="var(--bs-warning)"
          amount="2"
        />
        <CardDaschboard
          message="Empleados"
          icon="fa-users"
          borderColor="var(--bs-info)"
          amount="18"
        />
      </div>

      {/* Content Row chart */}
      <div className="row">
        <div className="col-xl-6 col-lg-6 mb-4">
          <EarningsOverview />
        </div>

        {/* Columna para la segunda gráfica */}
        <div className="col-xl-6 col-lg-6 mb-4">
          <BestSellingProductChart />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
