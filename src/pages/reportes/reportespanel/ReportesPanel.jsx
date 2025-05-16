import React from 'react';
import { FiBox, FiShoppingCart, FiUsers, FiTrendingUp, FiCalendar, FiPieChart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import "./ReportesPanel.styles.css";

const ModernReportPanel = () => {
  const navigate = useNavigate();

  const reports = [
    {
      id: 1,
      title: "Ingreso de stock",
      description: "Registro completo de productos ingresados",
      icon: <FiBox className="mr-icon" />,
      accentColor: "#6366F1",
      route: "/reportes/ingreso-stock"
    },
    {
      id: 2,
      title: "Análisis de Ventas",
      description: "Desempeño de ventas por período",
      icon: <FiShoppingCart className="mr-icon" />,
      accentColor: "#10B981",
      route: "/reportes/ventas"
    },
    {
      id: 3,
      title: "Clientes",
      description: "Comportamiento y segmentación",
      icon: <FiUsers className="mr-icon" />,
      accentColor: "#3B82F6",
      route: "/reportes/clientes"
    },
    {
      id: 4,
      title: "Tendencias",
      description: "Productos más populares",
      icon: <FiTrendingUp className="mr-icon" />,
      accentColor: "#F59E0B",
      route: "/reportes/tendencias"
    },
    {
      id: 5,
      title: "Reporte Diario",
      description: "Resumen ejecutivo del día",
      icon: <FiCalendar className="mr-icon" />,
      accentColor: "#EC4899",
      route: "/reportes/diario"
    },
    {
      id: 6,
      title: "Dashboard Completo",
      description: "Todas las métricas importantes",
      icon: <FiPieChart className="mr-icon" />,
      accentColor: "#8B5CF6",
      route: "/reportes/dashboard"
    }
  ];

  const handleViewReport = (route) => {
    navigate(route);
  };

  return (
    <div className="mr-container">
      <header className="mr-header">
        <h1 className="mr-title">Reportes Analíticos</h1>
        <p className="mr-subtitle">Visualiza y genera informes de tus procesos</p>
      </header>

      <div className="mr-grid">
        {reports.map(report => (
          <div 
            key={report.id} 
            className="mr-card"
            style={{ '--mr-accent-color': report.accentColor }}
          >
            <div className="mr-card-icon">{report.icon}</div>
            <h3 className="mr-card-title">{report.title}</h3>
            <p className="mr-card-description">{report.description}</p>
            <button 
              className="mr-generate-btn"
              onClick={() => handleViewReport(report.route)}
              style={{
                backgroundColor: report.accentColor,
                color: 'white'
              }}
            >
              Ver
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModernReportPanel;