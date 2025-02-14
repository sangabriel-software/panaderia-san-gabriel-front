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
  

  export const generateAndOpenPDF = async (documento, fileName) => {
    try {
      // Genera el Blob del PDF
      const blob = await pdf(documento).toBlob();
  
      // Crea una URL para el Blob
      const url = URL.createObjectURL(blob);
  
      // Abre el PDF en una nueva pestaña
      const newWindow = window.open(url, "_blank");
  
      // Si el navegador bloquea la apertura de ventanas emergentes, proporciona una alternativa
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        // Si no se pudo abrir la ventana, ofrecer una alternativa para descargar el archivo
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName; // Asigna el nombre del archivo
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
  
      // Limpia la URL del Blob después de abrir el PDF
      setTimeout(() => URL.revokeObjectURL(url), 500); // Limpia después de 1 segundo
    } catch (error) {
      console.error("Error al generar o abrir el PDF:", error);
    }
  };