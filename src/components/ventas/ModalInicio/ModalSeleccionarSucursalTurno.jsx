import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Controller } from "react-hook-form";
import DotsMove from "../../../components/Spinners/DotsMove";
import "./ModalSeleccionarSucursalTurno.styles.css";
import CustomSelect from "../../CustomSelect/CustomSelect ";

const ModalSeleccionarSucursalTurno = ({
  showModal, handleCloseModal, turnoValue, setValue, errors,
  loadingSucursales, sucursales, register, control, isLoading,
  navigate, hasOrdenes, isAdmin, usuarioSucursal,
}) => {

  const sucursalOptions = isAdmin
    ? sucursales.map((s) => ({ value: s.idSucursal, label: s.nombreSucursal }))
    : [{ value: usuarioSucursal.idSucursal, label: usuarioSucursal.sucursal || "Tu sucursal" }];

  useEffect(() => {
    const root = document.getElementById("root");
    if (showModal) {
      root.classList.add("st-modal-blur");
    } else {
      root.classList.remove("st-modal-blur");
    }
    return () => root.classList.remove("st-modal-blur");
  }, [showModal]);

  return (
    <Modal
      show={showModal}
      onHide={() => handleCloseModal(navigate)}
      centered
      backdrop="static"
      keyboard={false}
      className="st-modal"
    >
      <Modal.Header>
        <div className="st-header-inner">
          <div className="st-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#534AB7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <p className="st-title">¿Dónde estás hoy?</p>
          <p className="st-subtitle">Selecciona tu sucursal y turno para continuar</p>
        </div>
      </Modal.Header>

      <Modal.Body>

        <div className="st-section">
          <p className="st-label">Turno</p>
          <div className="st-shift-row">
            <button
              type="button"
              className={`st-shift-btn ${turnoValue === "AM" ? "active" : ""}`}
              onClick={() => setValue("turno", "AM")}
            >
              <span className="st-shift-emoji">🌅</span>
              <span className="st-shift-name">AM</span>
              <span className="st-shift-time">6:00 – 14:00</span>
            </button>
            <button
              type="button"
              className={`st-shift-btn ${turnoValue === "PM" ? "active" : ""}`}
              onClick={() => setValue("turno", "PM")}
            >
              <span className="st-shift-emoji">🌇</span>
              <span className="st-shift-name">PM</span>
              <span className="st-shift-time">14:00 – 22:00</span>
            </button>
          </div>
          {errors.turno && <p className="st-error-text">Selecciona un turno</p>}
        </div>

        <div className="st-section">
          <p className="st-label">Sucursal</p>
          {loadingSucursales ? (
            <div className="st-loading">
              <div className="spinner-border spinner-border-sm text-primary" role="status" />
              <span className="st-loading-text">Cargando sucursales...</span>
            </div>
          ) : (
            <Controller
              name="sucursal"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomSelect
                  options={sucursalOptions}
                  placeholder="Selecciona una sucursal"
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.sucursal}
                />
              )}
            />
          )}
          {errors.sucursal && (
            <p className="st-error-text">
              {isAdmin
                ? "No se pudieron cargar las sucursales. Intente más tarde."
                : "Error al cargar tu sucursal"}
            </p>
          )}
        </div>

        {isLoading && (
          <div className="st-spinner-wrap">
            <DotsMove />
          </div>
        )}

        {!isLoading && showModal && hasOrdenes === false && (
          <div className="st-alert">
            <div className="st-alert-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="#A32D2D" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <p className="st-alert-title">Sin órdenes disponibles</p>
              <p className="st-alert-msg">
                No se encontraron órdenes para este turno y sucursal.
                Verifica los datos e intenta de nuevo.
              </p>
            </div>
          </div>
        )}

      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          className="st-btn-primary"
          onClick={() => handleCloseModal(navigate)}
        >
          Cancelar
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalSeleccionarSucursalTurno;