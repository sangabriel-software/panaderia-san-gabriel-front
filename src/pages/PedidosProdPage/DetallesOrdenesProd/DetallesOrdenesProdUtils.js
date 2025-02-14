import React from "react";
import { encryptId } from "../../../utils/CryptoParams";
import { generateAndDownloadPDF } from "../../../utils/PdfUtils/PdfUtils";
import OrderDetailsPdf from "../../../components/PDFs/OrdenDetails/OrderDetailsPdf";

export const handleViewDetalle = (idOrdenProduccion, navigate) => {
  const encryptedId = encryptId(idOrdenProduccion.toString());
  navigate(`detalle-orden/${encodeURIComponent(encryptedId)}`);
};

export const handleDownloadPDF = (decryptedIdRol, detalleOrden, detalleConsumo) => {
  // Crear el componente usando React.createElement
  const documento = React.createElement(OrderDetailsPdf, {
    detalleOrden: detalleOrden.detalleOrden,
    encabezadoOrden: detalleOrden.encabezadoOrden || {},
    detalleConsumo: detalleConsumo,
  });

  // Generar y descargar el PDF
  const fileName = `orden_produccion_${decryptedIdRol}.pdf`;
  generateAndDownloadPDF(documento, fileName);
};
