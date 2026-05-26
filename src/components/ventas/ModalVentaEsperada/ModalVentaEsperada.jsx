import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import "./ModalVentaEsperada.styles.css";

const ModalVentaEsperada = ({ show, handleClose, onContinue }) => {
  const [ventaReal, setVentaReal] = useState("");

  const handleVentaRealChange = (e) => {
    setVentaReal(e.target.value);
  };

  const handleContinuar = () => {
    const ventaRealNumber = parseFloat(ventaReal);
    onContinue(!isNaN(ventaRealNumber) ? ventaRealNumber : 0);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setVentaReal("");
    handleClose();
  };

  const displayAmount = ventaReal && !isNaN(parseFloat(ventaReal))
    ? `Q ${parseFloat(ventaReal).toFixed(2)}`
    : "Q 0.00";

  return (
    <Modal
      show={show}
      onHide={handleCloseModal}
      centered
      className="venta-esperada-modal"
    >
      {/* HEADER */}
      <Modal.Header>
        <div className="ve-header-content">
          <div className="ve-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"/>
              <line x1="12" y1="6" x2="12" y2="8"/>
              <line x1="12" y1="16" x2="12" y2="18"/>
            </svg>
          </div>
          <div>
            <p className="ve-title">Ingresos del turno</p>
            <p className="ve-subtitle">Ingresa el monto recaudado</p>
          </div>
        </div>
        <button className="ve-close-btn" onClick={handleCloseModal} aria-label="Cerrar">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </Modal.Header>

      {/* BODY */}
      <Modal.Body>
        {/* Display monto */}
        <div className="ve-display-card">
          <p className="ve-amount-label">Venta real</p>
          <p className="ve-amount">{displayAmount}</p>
        </div>

        {/* Input */}
        <div className="ve-input-card">
          <p className="ve-card-label">Monto (Q)</p>
          <input
            type="number"
            className="ve-input"
            placeholder="0.00"
            value={ventaReal}
            onChange={handleVentaRealChange}
            step="0.01"
          />
        </div>
      </Modal.Body>

      {/* FOOTER */}
      <Modal.Footer>
        <button className="ve-btn-cancel" onClick={handleCloseModal}>
          Cancelar
        </button>
        <button
          className="ve-btn-primary"
          onClick={handleContinuar}
          disabled={!ventaReal}
        >
          Continuar
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalVentaEsperada;