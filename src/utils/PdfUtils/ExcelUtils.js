import { utils, writeFile } from 'xlsx-js-style';

// Función para formatear fecha
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options).toUpperCase();
};

export const generateOrderExcel = (ordenId, detalleOrden = [], detalleConsumo = [], encabezadoOrden = {}) => {
  try {
    const workbook = utils.book_new();
    
    // ==================== CONFIGURACIÓN DE ESTILOS ====================
    const headerStyle = {
      fill: { fgColor: { rgb: "37474F" } },
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

    const tableCellLeftStyle = {
      ...tableCellStyle,
      alignment: { horizontal: "left", vertical: "center" }
    };

    const sectionTitleStyle = {
      fill: { fgColor: { rgb: "263238" } },
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
      alignment: { horizontal: "center", vertical: "center" }
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

    const footerStyle = {
      font: { color: { rgb: "9E9E9E" }, sz: 9 },
      alignment: { horizontal: "left", vertical: "center" }
    };

    // ==================== LÓGICA DE DATOS ====================
    // Filtrar productos con validación
    const prodBandejas = (detalleOrden || []).filter(item => 
      item && item.tipoProduccion === "bandejas"
    );
    const prodHarina = (detalleOrden || []).filter(item => 
      item && item.tipoProduccion === "harina"
    );

    // Función segura para parsear números
    const safeParseNumber = (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };

    // Calcular total de harina de manera robusta
    const calcularTotalHarina = () => {
      try {
        // Harina de consumo
        const harinasConsumo = (detalleConsumo || []).filter(item => 
          item && item.Ingrediente && item.Ingrediente.toLowerCase().includes('harina')
        );
        
        const totalConsumo = harinasConsumo.reduce((sum, item) => {
          return sum + safeParseNumber(item.CantidadUsada);
        }, 0);

        // Harina de productos directos
        const totalProdHarina = prodHarina.reduce((sum, item) => {
          return sum + safeParseNumber(item.cantidadHarina);
        }, 0);

        return Math.round(totalConsumo + totalProdHarina);
      } catch (error) {
        console.error("Error calculando harina:", error);
        return 0;
      }
    };

    const totalHarina = calcularTotalHarina();
    const unidadMedida = (detalleConsumo || []).find(item => 
      item && item.Ingrediente && item.Ingrediente.toLowerCase().includes('harina')
    )?.UnidadMedida || 'Lb';

    // Calcular harina para Frances con validación
    const harinaFrances = totalHarina - prodHarina.reduce((sum, item) => {
      return sum + safeParseNumber(item.cantidadHarina);
    }, 0);

    // ==================== CONSTRUCCIÓN DE LA HOJA ====================
    const worksheetData = [
      // Fecha
      [{ v: formatDate(encabezadoOrden.fechaAProducir || new Date()), s: headerStyle }],
      [],
      // Número de orden
      [{ v: `ORDEN #${ordenId}`, s: titleStyle }],
      [],
      // Detalles (sucursal, turno, etc.)
      [
        { v: `Sucursal: ${encabezadoOrden.nombreSucursal || ''}`, s: detailBoxStyle },
        { v: `Turno: ${encabezadoOrden.ordenTurno || ''}`, s: { 
          ...detailBoxStyle,
          font: { ...detailBoxStyle.font, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: encabezadoOrden.ordenTurno === 'AM' ? 'FF6F00' : '2E7D32' } }
        }},
        { v: `Solicitado por: ${encabezadoOrden.nombreUsuario || ''}`, s: detailBoxStyle },
        { v: `Panadero: ${encabezadoOrden.nombrePanadero || ''}`, s: detailBoxStyle }
      ],
      [],
      // Tabla de bandejas
      [{ v: 'BANDEJAS', s: sectionTitleStyle }],
      [],
      // Encabezados de tabla
      [
        { v: '#', s: tableHeaderStyle },
        { v: 'Producto', s: tableHeaderStyle },
        { v: 'Bandejas', s: tableHeaderStyle },
        { v: 'Unidades', s: tableHeaderStyle }
      ],
      // Datos de bandejas con validación
      ...prodBandejas.map((item, index) => [
        { v: index + 1, s: tableCellStyle },
        { v: item.nombreProducto || 'N/A', s: tableCellLeftStyle },
        { v: item.cantidadBandejas ? safeParseNumber(item.cantidadBandejas) : 'N/A', s: tableCellStyle },
        { v: item.cantidadUnidades ? safeParseNumber(item.cantidadUnidades) : 'N/A', s: tableCellStyle }
      ]),
      [],
      // Tabla de harina
      [{ v: 'HARINA', s: sectionTitleStyle }],
      [],
      // Encabezados de tabla harina
      [
        { v: '#', s: tableHeaderStyle },
        { v: 'Producto', s: tableHeaderStyle },
        { v: 'Harina', s: tableHeaderStyle }
      ],
      // Fila fija de Frances
      [
        { v: 1, s: tableCellStyle },
        { v: 'Frances', s: tableCellLeftStyle },
        { v: `${harinaFrances >= 0 ? harinaFrances : 0} ${unidadMedida}`, s: tableCellStyle }
      ],
      // Datos de harina con validación
      ...prodHarina.map((item, index) => [
        { v: index + 2, s: tableCellStyle },
        { v: item.nombreProducto || 'N/A', s: tableCellLeftStyle },
        { v: `${item.cantidadHarina ? safeParseNumber(item.cantidadHarina) : 'N/A'} ${unidadMedida}`, s: tableCellStyle }
      ]),
      [],
      // Total harina con validación
      [
        { v: 'TOTAL HARINA:', s: flourSummaryStyle },
        { v: `${totalHarina >= 0 ? totalHarina : 0} ${unidadMedida}`, s: { ...flourSummaryStyle, ...flourTotalStyle } }
      ],
      [],
      // Pie de página
      [{ v: `Archivo generado el ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`, s: footerStyle }]
    ];

    // ==================== CONFIGURACIÓN DE LA HOJA ====================
    const worksheet = utils.aoa_to_sheet(worksheetData);
    
    // Ajustar anchos de columnas
    worksheet['!cols'] = [
      { wch: 4 },   // Columna # - Más estrecha
      { wch: 25 },  // Columna Producto
      { wch: 8 },   // Columna Bandejas
      { wch: 8 }    // Columna Unidades
    ];

    // Aplicar merges
    worksheet['!merges'] = [
      // Títulos
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
      // Secciones
      { s: { r: 6, c: 0 }, e: { r: 6, c: 3 } },
      { s: { r: 8 + prodBandejas.length + 2, c: 0 }, e: { r: 8 + prodBandejas.length + 2, c: 3 } },
      // Total harina
      { s: { r: worksheetData.length - 4, c: 0 }, e: { r: worksheetData.length - 4, c: 1 } },
      { s: { r: worksheetData.length - 4, c: 2 }, e: { r: worksheetData.length - 4, c: 3 } }
    ];

    // ==================== GUARDAR ARCHIVO ====================
    utils.book_append_sheet(workbook, worksheet, `Orden ${ordenId}`);
    writeFile(workbook, `Orden_${ordenId}.xlsx`);
    return true;
  } catch (error) {
    console.error("Error al generar Excel:", error);
    return false;
  }
};