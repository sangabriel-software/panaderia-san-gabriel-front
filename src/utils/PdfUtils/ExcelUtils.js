import * as XLSX from 'xlsx';

export const generateOrderExcel = (ordenId, detalleOrden = [], detalleConsumo = [], encabezadoOrden = {}) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Función para formatear fecha
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('es-ES', options).toUpperCase();
    };

    // Configuración de estilos
    const headerStyle = {
      fill: { fgColor: { rgb: "FFD3D3D3" } }, // Color gris claro
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" }
    };

    const tableHeaderStyle = {
      fill: { fgColor: { rgb: "FFE6E6E6" } }, // Color gris más claro
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" }
    };

    const centerAlignment = {
      alignment: { horizontal: "center", vertical: "center" }
    };

    // Datos comunes para el encabezado
    const commonHeader = [
      [formatDate(encabezadoOrden.fechaAProducir || new Date())],
      [`ORDEN #${ordenId}`],
      [], // línea vacía
      [`Sucursal: ${encabezadoOrden.nombreSucursal || ''}`],
      [`Turno: ${encabezadoOrden.ordenTurno || ''}`],
      [`Panadero: ${encabezadoOrden.nombrePanadero || ''}`],
      [] // línea vacía
    ];

    // Datos comunes para el pie de página
    const commonFooter = [
      [], // línea vacía
      [`Archivo generado el ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`]
    ];

    // Hoja "Orden Productos" (primera hoja)
    const productosData = [
      ...commonHeader,
      ['#', 'Producto', 'Bandejas', 'Unidades'], // Encabezados de tabla
      ...detalleOrden
        .filter(item => item.tipoProduccion === "bandejas")
        .map((item, index) => [
          index + 1,
          item.nombreProducto,
          item.cantidadBandejas,
          item.cantidadUnidades || ''
        ]),
      [], // línea vacía
      ['Harina'], // Subtítulo
      ['#', 'Producto', 'Harina'], // Encabezados de tabla harina
      ...detalleOrden
        .filter(item => item.tipoProduccion === "harina")
        .map((item, index) => [
          index + 1,
          item.nombreProducto,
          `${item.cantidadHarina} Lb`
        ]),
      [], // línea vacía
      [`TOTAL HARINA: ${detalleOrden
        .filter(item => item.tipoProduccion === "harina")
        .reduce((sum, item) => sum + parseFloat(item.cantidadHarina), 0)
        .toFixed(2)} LB`],
      ...commonFooter
    ];

    // Crear hoja "Orden Productos"
    const productosSheet = XLSX.utils.aoa_to_sheet(productosData);
    
    // Aplicar estilos y merges
    if (!productosSheet['!merges']) productosSheet['!merges'] = [];
    productosSheet['!merges'].push(
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 3 } }
    );

    // Aplicar estilos al encabezado (filas 0 a 5)
    for (let i = 0; i <= 5; i++) {
      if (productosSheet[XLSX.utils.encode_cell({r: i, c: 0})]) {
        productosSheet[XLSX.utils.encode_cell({r: i, c: 0})].s = headerStyle;
      }
    }

    // Aplicar estilos a los encabezados de tabla
    const tableHeaderRows = [7, 10]; // Filas con encabezados de tabla
    tableHeaderRows.forEach(row => {
      for (let c = 0; c < 4; c++) {
        const cell = productosSheet[XLSX.utils.encode_cell({r: row, c})];
        if (cell) cell.s = tableHeaderStyle;
      }
    });

    // Centrar datos de la tabla
    const tableDataRows = [
      ...Array.from({length: detalleOrden.filter(item => item.tipoProduccion === "bandejas").length}, (_, i) => 8 + i),
      ...Array.from({length: detalleOrden.filter(item => item.tipoProduccion === "harina").length}, (_, i) => 11 + i)
    ];
    
    tableDataRows.forEach(row => {
      for (let c = 0; c < 4; c++) {
        const cell = productosSheet[XLSX.utils.encode_cell({r: row, c})];
        if (cell) cell.s = centerAlignment;
      }
    });

    // Agregar hoja de productos al workbook
    XLSX.utils.book_append_sheet(workbook, productosSheet, "Orden Productos");

    // Hoja "Materia Prima" (segunda hoja, solo si hay datos)
    if (detalleConsumo && detalleConsumo.length > 0) {
      const materiaPrimaData = [
        ...commonHeader,
        ['#', 'Ingrediente', 'Cantidad', 'Unidad', 'Producto'],
        ...detalleConsumo.map((item, index) => [
          index + 1,
          item.Ingrediente,
          item.CantidadUsada,
          item.UnidadMedida,
          item.Producto
        ]),
        ...commonFooter
      ];

      const materiaPrimaSheet = XLSX.utils.aoa_to_sheet(materiaPrimaData);
      
      // Aplicar merges
      if (!materiaPrimaSheet['!merges']) materiaPrimaSheet['!merges'] = [];
      materiaPrimaSheet['!merges'].push(
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } },
        { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: 4 } }
      );

      // Aplicar estilos al encabezado
      for (let i = 0; i <= 5; i++) {
        if (materiaPrimaSheet[XLSX.utils.encode_cell({r: i, c: 0})]) {
          materiaPrimaSheet[XLSX.utils.encode_cell({r: i, c: 0})].s = headerStyle;
        }
      }

      // Aplicar estilos a encabezados de tabla (fila 7)
      for (let c = 0; c < 5; c++) {
        const cell = materiaPrimaSheet[XLSX.utils.encode_cell({r: 7, c})];
        if (cell) cell.s = tableHeaderStyle;
      }

      // Centrar datos de la tabla
      for (let r = 8; r < 8 + detalleConsumo.length; r++) {
        for (let c = 0; c < 5; c++) {
          const cell = materiaPrimaSheet[XLSX.utils.encode_cell({r, c})];
          if (cell) cell.s = centerAlignment;
        }
      }

      // Agregar hoja de materia prima al workbook
      XLSX.utils.book_append_sheet(workbook, materiaPrimaSheet, "Materia Prima");
    }
    
    // Generar y descargar archivo
    XLSX.writeFile(workbook, `Orden_${ordenId}.xlsx`);
    return true;
  } catch (error) {
    console.error("Error al generar Excel:", error);
    return false;
  }
};