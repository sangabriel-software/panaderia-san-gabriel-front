import React from "react";
import CardDaschboard from "../../components/CardDashboard/CardDashboard";
import EarningsOverview from "../../components/GraficasEstadisticas/EarningsOverview";
import BestSellingProductChart from "../../components/GraficasEstadisticas/BestSellingProductChart";
import "./DashboardPage.css"
import { FaDownload } from "react-icons/fa";
import useGetDashboardData from "../../hooks/DashboardData/useGetDashboardData";
import { formatoQuetzalesSimple } from "../../utils/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";

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

    // Función para generar el reporte en PDF con imagen y tablas
    const generatePDF = () => {
        const input = document.getElementById('dashboard-content');
        const pdf = new jsPDF('landscape', 'pt', 'a4');

        // Obtener la fecha actual para el nombre del archivo
        const today = new Date();
        const date = today.toLocaleDateString('es-GT');
        const time = today.toLocaleTimeString('es-GT');
        
        // Mostrar mensaje de carga
        const loadingMessage = document.createElement('div');
        loadingMessage.style.position = 'fixed';
        loadingMessage.style.top = '50%';
        loadingMessage.style.left = '50%';
        loadingMessage.style.transform = 'translate(-50%, -50%)';
        loadingMessage.style.backgroundColor = 'rgba(0,0,0,0.7)';
        loadingMessage.style.color = 'white';
        loadingMessage.style.padding = '20px';
        loadingMessage.style.borderRadius = '5px';
        loadingMessage.style.zIndex = '9999';
        loadingMessage.textContent = 'Generando reporte...';
        document.body.appendChild(loadingMessage);

        // Primero capturamos la imagen del dashboard
        html2canvas(input, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pdf.internal.pageSize.getWidth() - 40;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Agregar título y fecha
            pdf.setFontSize(18);
            pdf.setTextColor(40);
            pdf.setFont('helvetica', 'bold');
            pdf.text('REPORTE DE DASHBOARD', pdf.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Generado el: ${date} a las ${time}`, pdf.internal.pageSize.getWidth() / 2, 45, { align: 'center' });
            
            // Agregar imagen del dashboard
            pdf.addImage(imgData, 'PNG', 20, 60, imgWidth, imgHeight);
            
            // Agregar nueva página con los datos detallados
            pdf.addPage('landscape');
            
            // Encabezado de la página de datos
            pdf.setFontSize(18);
            pdf.setTextColor(40);
            pdf.setFont('helvetica', 'bold');
            pdf.text('DETALLE DE DATOS', pdf.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
            
            // Configuración común para todas las tablas
            const tableConfig = {
                theme: 'grid',
                tableWidth: 'wrap',
                margin: { horizontal: 10 },
                styles: {
                    cellPadding: 5,
                    fontSize: 10,
                    valign: 'middle',
                    halign: 'center' // Centrado horizontal
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 'auto' }
                }
            };
            
            // TABLA DE INGRESOS POR SUCURSAL (ocupa todo el ancho)
            pdf.setFontSize(12);
            pdf.setTextColor(40);
            pdf.text('Ingresos Mensuales por Sucursal', pdf.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
            
            const ingresosMensualesData = ingresosMensuales?.map(item => [
                item.nombreSucursal || 'N/A',
                `Q ${parseFloat(item.ingresoMensual || 0).toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
            ]) || [];
            
            autoTable(pdf, {
                ...tableConfig,
                startY: 70,
                head: [['Sucursal', 'Ingreso Mensual']],
                body: ingresosMensualesData,
                headStyles: {
                    ...tableConfig.headStyles,
                    fillColor: [41, 128, 185] // Azul
                },
                tableWidth: pdf.internal.pageSize.getWidth() - 40 // Ancho completo
            });
            
            // TABLAS PARALELAS (Productos más vendidos y Resumen mensual)
            const startYParallel = pdf.lastAutoTable.finalY + 20;
            const tableWidth = (pdf.internal.pageSize.getWidth() - 60) / 2; // Mitad del ancho
            
            // TABLA DE PRODUCTOS MÁS VENDIDOS (izquierda)
            pdf.text('Productos Más Vendidos', pdf.internal.pageSize.getWidth() / 4, startYParallel, { align: 'center' });
            
            const topProductosData = topVentas?.map(item => [
                item.nombreProducto || 'N/A',
                item.cantidad_total_vendida ? item.cantidad_total_vendida.toLocaleString('es-GT') : '0'
            ]) || [];
            
            autoTable(pdf, {
                ...tableConfig,
                startY: startYParallel + 10,
                head: [['Producto', 'Unidades Vendidas']],
                body: topProductosData,
                headStyles: {
                    ...tableConfig.headStyles,
                    fillColor: [39, 174, 96] // Verde
                },
                tableWidth: tableWidth,
                margin: { left: 20 }
            });
            
            // TABLA DE RESUMEN MENSUAL (derecha)
            pdf.text('Resumen Mensual de Ingresos', (pdf.internal.pageSize.getWidth() / 4) * 3, startYParallel, { align: 'center' });
            
            const resumenMensualData = resumenMensual?.map(item => [
                item.mes.toUpperCase() || 'N/A',
                `Q ${parseFloat(item.total_ingresos || 0).toLocaleString('es-GT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
            ]) || [];
            
            autoTable(pdf, {
                ...tableConfig,
                startY: startYParallel + 10,
                head: [['Mes', 'Total Ingresos']],
                body: resumenMensualData,
                headStyles: {
                    ...tableConfig.headStyles,
                    fillColor: [142, 68, 173] // Morado
                },
                tableWidth: tableWidth,
                margin: { left: pdf.internal.pageSize.getWidth() / 2 - 10 }
            });
            
            // Eliminar mensaje de carga
            document.body.removeChild(loadingMessage);
            
            // Guardar el PDF
            pdf.save(`reporte-dashboard-${date.replace(/\//g, '-')}.pdf`);
        }).catch((error) => {
            console.error('Error al generar el PDF:', error);
            document.body.removeChild(loadingMessage);
            alert('Error al generar el reporte. Por favor intente nuevamente.');
        });
    };

    return (
        <div className="container-fluid" id="dashboard-content">
            {/* Page Heading */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-dark">Dashboard</h1>
                <button 
                    className="btnReports btn btn-primary btn-sm shadow"
                    onClick={generatePDF}
                    disabled={loadingDashboardData}
                >
                    <FaDownload className="me-2" />
                    {loadingDashboardData ? 'Generando...' : 'Generate Report'}
                </button>
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