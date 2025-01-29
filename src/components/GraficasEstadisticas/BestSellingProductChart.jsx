import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BestSellingProductChart = () => {
  // Datos del gráfico
  const data = {
    labels: ["Pan Francés", "Croissant", "Conchas", "Donas", "Empanadas"],
    datasets: [
      {
        label: "Ventas",
        data: [500, 300, 400, 250, 150], // Ejemplo de ventas por producto
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Opciones del gráfico
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Oculta la leyenda
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Oculta líneas de cuadrícula verticales
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value} unidades`, // Etiquetas personalizadas
        },
      },
    },
  };

  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 fw-bold text-primary">Producto Más Vendido</h6>
      </div>
      <div className="card-body">
        <div className="chart-bar">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default BestSellingProductChart;
