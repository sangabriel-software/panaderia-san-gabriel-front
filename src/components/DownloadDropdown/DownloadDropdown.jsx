// src/components/Orders/DownloadDropdown.jsx
import React from "react";
import { Dropdown, ButtonGroup } from "react-bootstrap";
import { BsFileEarmarkExcel, BsFileEarmarkPdf } from "react-icons/bs";
import { FaDownload, FaFileExcel, FaFilePdf } from "react-icons/fa";

const DownloadDropdown = ({ onDownloadXLS, onDownloadPDF }) => {
  return (
    <Dropdown as={ButtonGroup} className="mb-3">
      <Dropdown.Toggle
        style={{
          border: "none", // Elimina el borde por defecto
          borderRadius: "8px", // Bordes redondeados
          padding: "8px 16px", // Espaciado interno
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Sombra suave
        }}
        id="dropdown-download"
      >
        <FaDownload className="me-2" />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={onDownloadPDF}>
          <div className="d-flex align-items-center gap-2">
            <BsFileEarmarkPdf size={16} className="text-danger" />
            <span>Descargar PDF</span>
          </div>
        </Dropdown.Item>
        <Dropdown.Item onClick={onDownloadXLS}>
          <div className="d-flex align-items-center gap-2">
            <BsFileEarmarkExcel size={16} className="text-success" style={{ color: "#4ECDC4" }} />
            <span>Descargar Excel</span>
          </div>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DownloadDropdown;
