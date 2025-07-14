// utils/pdfGenerator.js
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";

export const generateDashboardPDF = async (elementId, data) => {
  const { 
    ingresosMensuales, 
    ingresosAnuales, 
    resumenMensual, 
    topVentas 
  } = data;

  return new Promise((resolve, reject) => {
    const input = document.getElementById(elementId);
    const pdf = new jsPDF('landscape', 'pt', 'a4');

    // Obtener la fecha actual
    const today = new Date();
    const date = today.toLocaleDateString('es-GT');
    const time = today.toLocaleTimeString('es-GT');
    
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
          halign: 'center'
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
          fillColor: [41, 128, 185]
        },
        tableWidth: pdf.internal.pageSize.getWidth() - 40
      });
      
      // TABLAS PARALELAS
      const startYParallel = pdf.lastAutoTable.finalY + 20;
      const tableWidth = (pdf.internal.pageSize.getWidth() - 60) / 2;
      
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
          fillColor: [39, 174, 96]
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
          fillColor: [142, 68, 173]
        },
        tableWidth: tableWidth,
        margin: { left: pdf.internal.pageSize.getWidth() / 2 - 10 }
      });
      
      // Guardar el PDF
      pdf.save(`reporte-dashboard-${date.replace(/\//g, '-')}.pdf`);
      resolve();
    }).catch((error) => {
      console.error('Error al generar el PDF:', error);
      reject(error);
    });
  });
};