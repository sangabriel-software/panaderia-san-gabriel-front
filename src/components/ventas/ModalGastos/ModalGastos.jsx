import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import "./ModalGastos.styles.css";

const ModalGastos = ({ show, handleClose, onContinue }) => {
  const [gastos, setGastos] = useState([]);
  const [nuevoGasto, setNuevoGasto] = useState({ detalle: "", subtotal: "" });
  const [showAlert, setShowAlert] = useState(false);

  const hasPendingGasto =
    nuevoGasto.detalle.trim() !== "" || nuevoGasto.subtotal !== "";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoGasto((prev) => ({ ...prev, [name]: value }));
  };

  const agregarGasto = () => {
    if (nuevoGasto.detalle.trim() && nuevoGasto.subtotal) {
      setGastos((prev) => [
        ...prev,
        {
          detalleGasto: nuevoGasto.detalle.trim(),
          subtotal: parseFloat(nuevoGasto.subtotal),
        },
      ]);
      setNuevoGasto({ detalle: "", subtotal: "" });
      setShowAlert(false);
    }
  };

  const eliminarGasto = (index) => {
    setGastos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinuar = () => {
    if (hasPendingGasto) {
      setShowAlert(true);
      return;
    }
    onContinue(gastos);
    handleClose();
  };

  const total = gastos.reduce((a, g) => a + g.subtotal, 0);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="gastos-modal"
    >
      {/* HEADER */}
      <Modal.Header>
        <div className="gm-header-content">
          <div className="gm-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#BA7517" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <div>
            <p className="gm-title">Gastos del turno</p>
            <p className="gm-subtitle">
              {gastos.length === 0
                ? "Sin gastos aún"
                : `${gastos.length} gasto${gastos.length > 1 ? "s" : ""} registrado${gastos.length > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <button className="gm-close-btn" onClick={handleClose} aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </Modal.Header>

      {/* BODY */}
      <Modal.Body>

        {/* Alerta */}
        {showAlert && (
          <div className="gm-alert">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="gm-alert-text">
              Tienes un gasto sin agregar. Agrégalo o limpia los campos antes de continuar.
            </p>
          </div>
        )}

        {/* Formulario nuevo gasto */}
        <div className="gm-card">
          <p className="gm-card-label">Nuevo gasto</p>
          <div className="gm-input-row">
            <input
              type="text"
              name="detalle"
              className="gm-input"
              value={nuevoGasto.detalle}
              onChange={handleInputChange}
              placeholder="Ej. Bici taxi"
            />
            <input
              type="number"
              name="subtotal"
              className="gm-input gm-input-right"
              value={nuevoGasto.subtotal}
              onChange={handleInputChange}
              placeholder="Q 0.00"
              step="0.01"
            />
            <button
              className="gm-add-btn"
              onClick={agregarGasto}
              disabled={!nuevoGasto.detalle || !nuevoGasto.subtotal}
              aria-label="Agregar gasto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#BA7517" strokeWidth="2.2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Lista de gastos */}
        <div className="gm-card">
          <p className="gm-card-label">Gastos registrados</p>
          {gastos.length === 0 ? (
            <div className="gm-empty">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                style={{ display: "block", margin: "0 auto 6px" }}>
                <polyline points="21 8 21 21 3 21 3 8"/>
                <rect x="1" y="3" width="22" height="5"/>
                <line x1="10" y1="12" x2="14" y2="12"/>
              </svg>
              Sin gastos registrados
            </div>
          ) : (
            gastos.map((gasto, index) => (
              <div className="gm-list-item" key={index}>
                <p className="gm-list-item-name">{gasto.detalleGasto}</p>
                <div className="gm-list-item-right">
                  <span className="gm-list-item-amount">
                    Q {gasto.subtotal.toFixed(2)}
                  </span>
                  <button
                    className="gm-del-btn"
                    onClick={() => eliminarGasto(index)}
                    aria-label="Eliminar gasto"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        <div className="gm-total-bar">
          <p className="gm-total-label">Total gastos</p>
          <span className="gm-total-amount">Q {total.toFixed(2)}</span>
        </div>

      </Modal.Body>

      {/* FOOTER */}
      <Modal.Footer>
        <button className="gm-btn-cancel" onClick={handleClose}>
          Cancelar
        </button>
        <button className="gm-btn-primary" onClick={handleContinuar}>
          Guardar y continuar
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalGastos;