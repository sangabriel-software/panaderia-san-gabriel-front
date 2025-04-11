import { utils, writeFile } from 'xlsx-js-style';

export const generateOrderExcel = (ordenId, detalleOrden = [], detalleConsumo = [], encabezadoOrden = {}) => {
  try {
    const workbook = utils.book_new();
    
    // Función para formatear fecha
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('es-ES', options).toUpperCase();
    };

    // Configuración de estilos
    const headerStyle = {
      fill: { fgColor: { rgb: "37474F" } }, // Color oscuro como en el PDF
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14 },
      alignment: { horizontal: "center", vertical: "center" }
    };

    const titleStyle = {
      font: { bold: true, color: { rgb: "62019F" }, sz: 16 },
      alignment: { horizontal: "left", vertical: "center" }
    };

    const detailBoxStyle = {
      fill: { fgColor: { rgb: "ECEFF1" } },
      font: { bold: true, color: { rgb: "37474F" }, sz: 9 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "90A4AE" } },
        bottom: { style: "thin", color: { rgb: "90A4AE" } },
        left: { style: "thin", color: { rgb: "90A4AE" } },
        right: { style: "thin", color: { rgb: "90A4AE" } }
      }
    };

    const tableHeaderStyle = {
      fill: { fgColor: { rgb: "455A64" } },
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 10 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "90A4AE" } },
        bottom: { style: "thin", color: { rgb: "90A4AE" } },
        left: { style: "thin", color: { rgb: "90A4AE" } },
        right: { style: "thin", color: { rgb: "90A4AE" } }
      }
    };

    const tableCellStyle = {
      font: { sz: 9 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "90A4AE" } },
        bottom: { style: "thin", color: { rgb: "90A4AE" } },
        left: { style: "thin", color: { rgb: "90A4AE" } },
        right: { style: "thin", color: { rgb: "90A4AE" } }
      }
    };

    const flourSummaryStyle = {
      fill: { fgColor: { rgb: "FFF3E0" } },
      font: { bold: true, color: { rgb: "5D4037" }, sz: 14 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: "FFA000" } },
        bottom: { style: "medium", color: { rgb: "FFA000" } },
        left: { style: "medium", color: { rgb: "FFA000" } },
        right: { style: "medium", color: { rgb: "FFA000" } }
      }
    };

    const flourTotalStyle = {
      font: { bold: true, color: { rgb: "BF360C" }, sz: 16 }
    };

    // Filtrar productos
    const prodBandejas = detalleOrden.filter(item => item.tipoProduccion === "bandejas");
    const prodHarina = detalleOrden.filter(item => item.tipoProduccion === "harina");

    // Calcular total de harina (similar a tu lógica en el PDF)
    const calcularTotalHarina = () => {
      const harinasConsumo = detalleConsumo?.filter(item => 
        item.Ingrediente.toLowerCase().includes('harina')
      ) || [];
      
      const totalConsumo = harinasConsumo.reduce((sum, item) => sum + (parseFloat(item.CantidadUsada) || 0), 0);
      const totalProdHarina = prodHarina.reduce((sum, item) => sum + (parseFloat(item.cantidadHarina) || 0), 0);
      
      return Math.round(totalConsumo + totalProdHarina);
    };

    const totalHarina = calcularTotalHarina();
    const unidadMedida = detalleConsumo?.find(item => 
      item.Ingrediente.toLowerCase().includes('harina')
    )?.UnidadMedida || 'Lb';

    // Crear hoja de cálculo
    const worksheetData = [
      // Fecha (como en el header del PDF)
      [{ v: formatDate(encabezadoOrden.fechaAProducir || new Date()), s: headerStyle }],
      [],
      // Número de orden (morado como en el PDF)
      [{ v: `ORDEN #${ordenId}`, s: titleStyle }],
      [],
      // Detalles (sucursal, turno, etc.)
      [
        { v: `Sucursal: ${encabezadoOrden.nombreSucursal || ''}`, s: detailBoxStyle },
        { v: `Turno: ${encabezadoOrden.ordenTurno || ''}`, s: { 
          ...detailBoxStyle,
          font: { 
            ...detailBoxStyle.font, 
            color: { rgb: encabezadoOrden.ordenTurno === 'AM' ? 'FFFFFF' : 'FFFFFF' },
          },
          fill: { fgColor: { rgb: encabezadoOrden.ordenTurno === 'AM' ? 'FF6F00' : '2E7D32' } }
        }},
        { v: `Solicitado por: ${encabezadoOrden.nombreUsuario || ''}`, s: detailBoxStyle },
        { v: `Panadero: ${encabezadoOrden.nombrePanadero || ''}`, s: detailBoxStyle }
      ],
      [],
      // Tabla de bandejas
      [{ v: 'BANDEJAS', s: { 
        fill: { fgColor: { rgb: "263238" } },
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
        alignment: { horizontal: "left", vertical: "center" }
      }}],
      [],
      // Encabezados de tabla
      [
        { v: '#', s: tableHeaderStyle },
        { v: 'Producto', s: tableHeaderStyle },
        { v: 'Bandejas', s: tableHeaderStyle },
        { v: 'Unidades', s: tableHeaderStyle }
      ],
      // Datos de bandejas
      ...prodBandejas.map((item, index) => [
        { v: index + 1, s: tableCellStyle },
        { v: item.nombreProducto || 'N/A', s: tableCellStyle },
        { v: item.cantidadBandejas || 'N/A', s: tableCellStyle },
        { v: item.cantidadUnidades || 'N/A', s: tableCellStyle }
      ]),
      [],
      // Tabla de harina
      [{ v: 'HARINA', s: { 
        fill: { fgColor: { rgb: "263238" } },
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
        alignment: { horizontal: "left", vertical: "center" }
      }}],
      [],
      // Encabezados de tabla harina
      [
        { v: '#', s: tableHeaderStyle },
        { v: 'Producto', s: tableHeaderStyle },
        { v: 'Harina', s: tableHeaderStyle }
      ],
      // Fila fija de Frances (como en tu PDF)
      [
        { v: 1, s: tableCellStyle },
        { v: 'Frances', s: tableCellStyle },
        { v: `${totalHarina - prodHarina.reduce((sum, item) => sum + (parseFloat(item.cantidadHarina) || 0), 0)} ${unidadMedida}`, s: tableCellStyle }
      ],
      // Datos de harina
      ...prodHarina.map((item, index) => [
        { v: index + 2, s: tableCellStyle },
        { v: item.nombreProducto || 'N/A', s: tableCellStyle },
        { v: `${item.cantidadHarina || 'N/A'} ${unidadMedida}`, s: tableCellStyle }
      ]),
      [],
      // Total harina
      [
        { v: 'TOTAL HARINA:', s: flourSummaryStyle },
        { v: `${totalHarina} ${unidadMedida}`, s: { ...flourSummaryStyle, ...flourTotalStyle } }
      ],
      [],
      // Pie de página
      [{ v: `Archivo generado el ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`, s: { 
        font: { color: { rgb: "9E9E9E" }, sz: 9 },
        alignment: { horizontal: "left", vertical: "center" }
      }}]
    ];

    // Crear hoja de cálculo
    const worksheet = utils.aoa_to_sheet(worksheetData);
    
    // Ajustar anchos de columnas
    worksheet['!cols'] = [
      { wch: 5 },  // Columna #
      { wch: 30 }, // Columna Producto
      { wch: 15 }, // Columna Bandejas/Harina
      { wch: 15 }  // Columna Unidades
    ];

    // Aplicar merges para celdas combinadas
    worksheet['!merges'] = [
      // Combinar celdas de título
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
      // Combinar celdas de sección
      { s: { r: 6, c: 0 }, e: { r: 6, c: 3 } },
      { s: { r: 8 + prodBandejas.length, c: 0 }, e: { r: 8 + prodBandejas.length, c: 3 } },
      // Combinar total harina
      { s: { r: worksheetData.length - 4, c: 0 }, e: { r: worksheetData.length - 4, c: 1 } },
      { s: { r: worksheetData.length - 4, c: 2 }, e: { r: worksheetData.length - 4, c: 3 } }
    ];

    utils.book_append_sheet(workbook, worksheet, `Orden ${ordenId}`);
    writeFile(workbook, `Orden_${ordenId}.xlsx`);
    return true;
  } catch (error) {
    console.error("Error al generar Excel:", error);
    return false;
  }
};