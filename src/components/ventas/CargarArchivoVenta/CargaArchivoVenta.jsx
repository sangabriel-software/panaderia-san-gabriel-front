import React, { useRef, useState } from "react";
import { BsCloudUpload, BsFileEarmarkSpreadsheet, BsXCircle } from "react-icons/bs";
import { descargarPlantillaVentas } from "../../../utils/PdfUtils/ExcelUtils";
import "./CargaArchivoVenta.css";

const CargaArchivoVenta = ({ csvFile, setCsvFile, productos, idSucursal, turno }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const esValido =
      file.type === "text/xlsx" || file.name.toLowerCase().endsWith(".xlsx");
    if (!esValido) {
      alert("Solo se permiten archivos XLSX");
      return;
    }
    setCsvFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setCsvFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="carga-csv-card">

      {/* ── Botón descargar plantilla ── */}
      <div className="carga-csv-plantilla-wrap">
        <p className="carga-csv-plantilla-hint">
          ¿No tienes el archivo? Descarga la plantilla con los productos actuales.
        </p>
        <button
          type="button"
          className="carga-csv-plantilla-btn"
          onClick={() => descargarPlantillaVentas(productos, turno, idSucursal)}
          disabled={!productos || productos.length === 0}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar plantilla
        </button>
      </div>

      <div className="carga-csv-container">
        {!csvFile ? (
          <div
            className={`carga-csv-dropzone ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <BsCloudUpload size={42} className="carga-csv-icon" />
            <p className="carga-csv-texto-principal">Arrastra tu archivo XLSX aquí</p>
            <p className="carga-csv-texto-secundario">o haz clic para seleccionar un archivo</p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,text/xlsx"
              className="d-none"
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <div className="carga-csv-archivo-seleccionado">
            <BsFileEarmarkSpreadsheet size={30} className="carga-csv-file-icon" />
            <div className="carga-csv-file-info">
              <span className="carga-csv-file-name">{csvFile.name}</span>
              <span className="carga-csv-file-size">{(csvFile.size / 1024).toFixed(1)} KB</span>
            </div>
            <button
              type="button"
              className="carga-csv-remove-btn"
              onClick={handleRemove}
              title="Quitar archivo"
            >
              <BsXCircle size={22} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CargaArchivoVenta;