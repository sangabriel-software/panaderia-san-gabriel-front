import { pdf } from "@react-pdf/renderer";  // Importar el método pdf

export const generateAndDownloadPDF = async (documento, fileName) => {
    try {
      const blob = await pdf(documento).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url); // Limpia la URL del Blob después de la descarga
    } catch (error) {
      console.error("Error al generar o descargar el PDF:", error);
    }
  };
  