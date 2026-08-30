import React, { useRef, useState } from "react";
import { BsCloudUpload, BsFileEarmarkSpreadsheet, BsXCircle } from "react-icons/bs";
import "./CargaArchivoVenta.css";

const CargaArchivoVenta = ({ csvFile, setCsvFile }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const esValido =
      file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
    if (!esValido) {
      alert("Solo se permiten archivos CSV");
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
          <p className="carga-csv-texto-principal">Arrastra tu archivo CSV aquí</p>
          <p className="carga-csv-texto-secundario">o haz clic para seleccionar un archivo</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
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
          <button type="button" className="carga-csv-remove-btn" onClick={handleRemove} title="Quitar archivo">
            <BsXCircle size={22} />
          </button>
        </div>
      )}
    </div>
  </div>
);
};

export default CargaArchivoVenta;