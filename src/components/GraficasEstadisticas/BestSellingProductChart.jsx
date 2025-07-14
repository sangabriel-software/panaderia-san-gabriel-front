import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BestSellingProductChart = ({ topVentas }) => {
  // Procesar los datos para el gráfico
  const procesarDatos = () => {
    if (!topVentas || !Array.isArray(topVentas)) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: []
        }]
      };
    }

    // Ordenar por cantidad vendida (por si acaso no vienen ordenados)
    const datosOrdenados = [...topVentas].sort((a, b) => b.cantidad_total_vendida - a.cantidad_total_vendida);

    // Colores para las barras
    const colores = [
      "rgba(75, 192, 192, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(255, 99, 132, 0.6)",
      "rgba(153, 102, 255, 0.6)",
    ];
    const bordes = [
      "rgba(75, 192, 192, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(255, 99, 132, 1)",
      "rgba(153, 102, 255, 1)",
    ];

    return {
      labels: datosOrdenados.map(item => item.nombreProducto),
      datasets: [{
        label: "Ventas",
        data: datosOrdenados.map(item => item.cantidad_total_vendida),
        backgroundColor: colores.slice(0, datosOrdenados.length),
        borderColor: bordes.slice(0, datosOrdenados.length),
        borderWidth: 1,
      }]
    };
  };

  const data = procesarDatos();

  // Opciones del gráfico
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Oculta la leyenda
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            return `${context.raw} unidades vendidas`;
          }
        }
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
          // Ajustar paso según los datos
          stepSize: calcularStepSize(topVentas)
        },
      },
    },
  };

  // Función para calcular el stepSize adecuado según los datos
  function calcularStepSize(datos) {
    if (!datos || !Array.isArray(datos)) return 10000;
    
    const maxValue = Math.max(...datos.map(item => item.cantidad_total_vendida));
    if (maxValue <= 10000) return 1000;
    if (maxValue <= 50000) return 5000;
    if (maxValue <= 100000) return 10000;
    return Math.ceil(maxValue / 10 / 10000) * 10000;
  }

  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 fw-bold text-primary">Productos Más Vendidos</h6>
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