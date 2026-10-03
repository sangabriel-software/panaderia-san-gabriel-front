import { useEffect, useState } from "react";
import { FiX, FiDownload, FiPrinter, FiExternalLink, FiFileText } from "react-icons/fi";

function PDFViewerModal({ pdfUrl, filename = "documento.pdf", onClose }) {
  const [zoom] = useState(100);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [onClose]);

  if (!pdfUrl) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, "_blank");
    if (printWindow) {
      printWindow.addEventListener("load", () => printWindow.print());
    }
  };

  const handleOpenNewTab = () => window.open(pdfUrl, "_blank");

  const ActionButton = ({ onClick, title, icon, hideOnMobile }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white/10 text-white transition-colors hover:bg-white/20 ${
        hideOnMobile ? "hidden sm:flex" : ""
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface shadow-modal sm:h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center gap-3 bg-brand-600 px-4 py-3 text-white">
          <FiFileText size={18} className="shrink-0" />
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">{filename}</h3>
          <div className="flex shrink-0 items-center gap-1.5">
            <ActionButton onClick={handlePrint} title="Imprimir" icon={<FiPrinter size={16} />} />
            <ActionButton onClick={handleDownload} title="Descargar" icon={<FiDownload size={16} />} />
            <ActionButton onClick={handleOpenNewTab} title="Abrir en nueva pestaña" icon={<FiExternalLink size={16} />} hideOnMobile />
            <button
              type="button"
              onClick={onClose}
              title="Cerrar (ESC)"
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-danger-600 text-white transition-colors hover:bg-danger-500"
            >
              <FiX size={16} />
            </button>
          </div>
        </header>

        {/* Visor */}
        <div className="flex-1 overflow-hidden bg-surface-2">
          <iframe
            src={`${pdfUrl}#toolbar=0&view=FitH&zoom=${zoom}`}
            className="h-full w-full border-0"
            title={`Visor PDF: ${filename}`}
          />
        </div>

        {/* Footer */}
        <footer className="border-t border-line px-4 py-2.5 text-center text-xs text-muted">
          Haz clic afuera, presiona ESC o en la X para cerrar.
        </footer>
      </div>
    </div>
  );
}

export default PDFViewerModal;