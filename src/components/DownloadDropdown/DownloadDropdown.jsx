// src/components/Orders/DownloadDropdown.jsx
import React from "react";
import { Dropdown, ButtonGroup } from "react-bootstrap";
import { FaDownload } from "react-icons/fa";

const DownloadDropdown = ({ onDownloadXLS, onDownloadPDF }) => {
  return (
    <Dropdown as={ButtonGroup} className="mb-3">
      <Dropdown.Toggle className="btnReports"  id="dropdown-download">
      <FaDownload className="me-2" />
        Descargar
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={onDownloadXLS}>Descargar XLS</Dropdown.Item>
        <Dropdown.Item onClick={onDownloadPDF}>Descargar PDF</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DownloadDropdown;
