import { useState } from 'react';
import { X, Download, Printer, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';
import './PDFViewerModal.css'; 

// Componente auxiliar para botones limpios
const ActionPillButton = ({ onClick, title, icon, className = '' }) => (
  <button
    onClick={onClick}
    title={title}
    className={`action-button ${className}`}
  >
    {icon}
  </button>
);

export default function PDFViewerModal({ pdfUrl, filename = 'documento.pdf', onClose }) {
  const [zoom, setZoom] = useState(100);

  if (!pdfUrl) return null;

  // --- Manejadores de Funcionalidad (sin cambios, solo se mantienen para que el código sea válido) ---
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  };

  const handleOpenNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200)); 
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50)); 
  };
  // ------------------------------------------

  return (
    <div className="pdf-modal-backdrop" onClick={onClose}> 
      
      <div className="pdf-modal-dialog" onClick={(e) => e.stopPropagation()}> 
      
        <header className="modal-header">
          
          <div className="header-filename-area">
            <h3 className="header-filename">{filename}</h3>
          </div>

          <div className="header-controls">
            
            {/* Controles de zoom (COMENTADOS SEGÚN SOLICITUD) */}
            {/* <div className="zoom-controls">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="zoom-button"
                title="Alejar"
              >
                <ZoomOut size={18} />
              </button>
              <span className="zoom-level">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="zoom-button"
                title="Acercar"
              >
                <ZoomIn size={18} />
              </button>
            </div>
            */}
            
            {/* Botones de acción principales */}
            <ActionPillButton 
              onClick={handlePrint} 
              title="Imprimir" 
              icon={<Printer size={20} />} 
            />
            <ActionPillButton 
              onClick={handleDownload} 
              title="Descargar" 
              icon={<Download size={20} />} 
            />
            {/* Botón Abrir en nueva pestaña */}
            <ActionPillButton 
              onClick={handleOpenNewTab} 
              title="Abrir en nueva pestaña" 
              icon={<ExternalLink size={20} />} 
              className="desktop-only" 
            />

            {/* BOTÓN CERRAR - Ahora destacado en rojo y junto al botón de abrir */}
            <button
              onClick={onClose} 
              className="close-button"
              title="Cerrar visor"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Visor PDF */}
        <div className="pdf-viewer-area">
          <div className="pdf-viewer-content">
            <iframe
              src={`${pdfUrl}#toolbar=0&view=FitH&zoom=${zoom}`}
              className="pdf-iframe"
              title={`Visor PDF: ${filename}`}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="modal-footer">
          <span className="footer-tip">
            El archivo se abre en esta ventana. Haz clic afuera o en la 'X' para cerrar.
          </span>
        </footer>
      </div>
    </div>
  );
}