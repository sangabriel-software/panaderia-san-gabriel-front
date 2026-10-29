import { pdf } from "@react-pdf/renderer"; // Importar el método pdf

export const generateAndDownloadPDF = async (documento, fileName) => {
  try {
    const blob = await pdf(documento).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url); // Limpia la URL del Blob después de la descarga
  } catch (error) {
    console.error("Error al generar o descargar el PDF:", error);
  }
};

export const generateAndOpenPDF = async (documento, fileName) => {
  try {
    // Genera el Blob del PDF
    const blob = await pdf(documento).toBlob();

    // Crea una URL para el Blob
    const url = URL.createObjectURL(blob);

    // Abre el PDF en una nueva pestaña
    const newWindow = window.open(url, "_blank");

    // Si el navegador bloquea la apertura de ventanas emergentes, proporciona una alternativa
    if (
      !newWindow ||
      newWindow.closed ||
      typeof newWindow.closed === "undefined"
    ) {
      // Si no se pudo abrir la ventana, ofrecer una alternativa para descargar el archivo
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; // Asigna el nombre del archivo
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Limpia la URL del Blob después de abrir el PDF
    setTimeout(() => URL.revokeObjectURL(url), 2); // Limpia después de 1 segundo
  } catch (error) {
    console.error("Error al generar o abrir el PDF:", error);
  }
};

// NUEVA FUNCIÓN para retornar solo el Blob
export const generatePDFBlob = async (document) => {
  const blob = await pdf(document).toBlob();
  return blob;
};

export const descargarCatalogoProductos = async (productos) => {
  const productosInventario = productos.filter((producto) => producto.controlarInventario === 1);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const margen = 14;
  const espacio = 6;
  const anchoTarjeta = (anchoPagina - margen * 2 - espacio) / 2;
  const altoTarjeta = 43;
  const inicioTarjetas = 59;
  const altoDisponible = altoPagina - inicioTarjetas - 20;
  const filasPorPagina = Math.floor((altoDisponible + espacio) / (altoTarjeta + espacio));
  const productosPorPagina = filasPorPagina * 2;
  const totalPaginas = Math.max(1, Math.ceil(productosInventario.length / productosPorPagina));

  const precio = (valor) =>
    `Q ${Number(valor ?? 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  for (let pagina = 0; pagina < totalPaginas; pagina++) {
    if (pagina > 0) doc.addPage();

    doc.setFillColor(30, 58, 73);
    doc.rect(0, 0, anchoPagina, 42, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.text("Catalogo de productos", margen, 21);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(211, 228, 234);
    doc.text(`${productosInventario.length} productos  |  ${new Date().toLocaleDateString("es-GT")}`, margen, 31);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("PRODUCTOS CON CONTROL DE INVENTARIO", margen, 52);

    const productosPagina = productosInventario.slice(pagina * productosPorPagina, (pagina + 1) * productosPorPagina);
    productosPagina.forEach((producto, indice) => {
      const x = margen + (indice % 2) * (anchoTarjeta + espacio);
      const y = inicioTarjetas + Math.floor(indice / 2) * (altoTarjeta + espacio);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(221, 229, 234);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, anchoTarjeta, altoTarjeta, 3, 3, "FD");
      doc.setFillColor(37, 115, 124);
      doc.roundedRect(x, y, 2, altoTarjeta, 1, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(79, 105, 117);
      doc.text(`CODIGO PRODUCTO  ${producto.idProducto ?? "-"}`, x + 6, y + 8);

      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      const nombre = String(producto.nombreProducto ?? "Sin nombre");
      const lineasNombre = doc.splitTextToSize(nombre, anchoTarjeta - 12);
      if (lineasNombre.length > 2) {
        lineasNombre[1] = `${lineasNombre[1].slice(0, -3)}...`;
      }
      doc.text(lineasNombre.slice(0, 2), x + 6, y + 16);

      doc.setDrawColor(221, 229, 234);
      doc.line(x + 6, y + 29, x + anchoTarjeta - 6, y + 29);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`CANTIDAD  ${producto.cantidad ?? "-"}`, x + 6, y + 37);
      doc.text("PRECIO", x + anchoTarjeta - 6, y + 34, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(21, 105, 91);
      doc.text(precio(producto.precio), x + anchoTarjeta - 6, y + 40, { align: "right" });
    });

    if (productosInventario.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text("No hay productos con control de inventario.", margen, 70);
    }

    doc.setDrawColor(221, 229, 234);
    doc.line(margen, altoPagina - 13, anchoPagina - margen, altoPagina - 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Catalogo de productos", margen, altoPagina - 8);
    doc.text(`Pagina ${pagina + 1} de ${totalPaginas}`, anchoPagina - margen, altoPagina - 8, { align: "right" });
  }

  doc.save("catalogo_productos.pdf");
};
