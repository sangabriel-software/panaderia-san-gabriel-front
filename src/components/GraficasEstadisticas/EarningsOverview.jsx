import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from "chart.js";

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const EarningsOverview = () => {
  const data = {
    labels: ["Ene", "Feb", "Mar", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    datasets: [
      {
        label: "Earnings",
        data: [0, 10000, 20000, 15000, 25000, 40000, 30000, 4500, 5000],
        borderColor: "#4e73df", // Línea principal
        backgroundColor: "rgba(78, 115, 223, 0.3)", // Relleno del área
        pointBackgroundColor: "#1cc88a", // Color de los puntos
        pointBorderColor: "#1cc88a",
        tension: 0.4, // Suaviza las líneas
        fill: true, // Rellena el área debajo de la línea
        hoverBorderWidth: 3, // Grosor de línea al pasar el mouse
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Oculta la leyenda
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0,0,0,0.7)", // Fondo del tooltip
        titleColor: "#fff", // Color del título
        bodyColor: "#fff", // Color del texto
        borderWidth: 1,
        borderColor: "#4e73df", // Borde del tooltip
        callbacks: {
          label: (context) => {
            const value = context.raw || 0;
            return `Q${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Oculta las líneas de cuadrícula verticales
        },
        ticks: {
          color: "#4e73df", // Color de las etiquetas en el eje X
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `Q${value.toLocaleString()}`, // Formatea los valores en quetzales
          color: "#4e73df", // Color de las etiquetas en el eje Y
        },
        grid: {
          color: "rgba(200, 200, 200, 0.3)", // Color de las líneas de cuadrícula horizontales
        },
      },
    },
    animation: {
      duration: 2000, // Duración de la animación
      easing: "easeOutBounce", // Efecto de rebote en la animación
    },
    hover: {
      animationDuration: 1000, // Duración de la animación al pasar el mouse
    },
  };

  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 fw-bold text-primary">Resumen de ganancias</h6>
      </div>
      <div className="card-body">
        <div className="chart-area">
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default EarningsOverview;
