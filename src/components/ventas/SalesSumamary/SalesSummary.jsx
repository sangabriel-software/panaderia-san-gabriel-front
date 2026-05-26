import React from "react";
import { Modal, Spinner } from "react-bootstrap";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import "./SalesSummary.styles.css";

const SalesSummary = ({
  show, handleClose, orderData, trayQuantities,
  productos, sucursales, isLoading, onConfirm, ventaReal, gastos,
}) => {

  const getProductName = (idProducto) => {
    const product = productos.find((p) => p.idProducto === idProducto);
    return product ? product.nombreProducto : "Desconocido";
  };

  const getSucursalName = (idSucursal) => {
    const sucursal = sucursales.find((s) => s.idSucursal == idSucursal);
    return sucursal ? sucursal.nombreSucursal : "Desconocida";
  };

  const productosPanaderia = productos.filter((p) => p.nombreCategoria === "Panaderia");
  const productosOtros = productos.filter((p) => p.nombreCategoria !== "Panaderia");

  const productosPanaderiaConCantidad = productosPanaderia.map((p) => ({
    ...p,
    cantidadNoVendida: trayQuantities[p.idProducto]?.cantidad || 0,
  }));

  const productosOtrosConCantidad = productosOtros.map((p) => ({
    ...p,
    cantidadVendida: trayQuantities[p.idProducto]?.cantidad || 0,
  }));

  const todosVendidos = productosPanaderiaConCantidad.every(
    (p) => p.cantidadNoVendida === 0
  );

  const totalGastos = gastos.reduce((sum, g) => sum + g.subtotal, 0);
  const ventaNeta = ventaReal ? ventaReal - totalGastos : 0;

  return (
    <Modal show={show} onHide={handleClose} centered className="ss-modal">
      {/* HEADER */}
      <Modal.Header>
        <div className="ss-header-content">
          <div className="ss-icon-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="#534AB7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div>
            <p className="ss-title">Resumen de venta</p>
            <p className="ss-subtitle">Revisa antes de confirmar</p>
          </div>
        </div>
        <button className="ss-close-btn" onClick={handleClose} aria-label="Cerrar">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </Modal.Header>

      {/* BODY */}
      <Modal.Body>

        {/* Detalles generales */}
        <div className="ss-card">
          <p className="ss-section-label">Detalles generales</p>

          <div className="ss-detail-row">
            <div className="ss-detail-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <p className="ss-detail-label">Sucursal</p>
              <p className="ss-detail-value">{getSucursalName(orderData.sucursal)}</p>
            </div>
          </div>

          <div className="ss-detail-row">
            <div className="ss-detail-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <p className="ss-detail-label">Turno</p>
              <p className="ss-detail-value">{orderData.turno}</p>
            </div>
          </div>

          <div className="ss-detail-row">
            <div className="ss-detail-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <p className="ss-detail-label">Fecha</p>
              <p className="ss-detail-value">{formatDateToDisplay(orderData.fechaAProducir)}</p>
            </div>
          </div>

          <div className="ss-detail-row">
            <div className="ss-detail-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="1.8" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p className="ss-detail-label">Vendedor/a</p>
              <p className="ss-detail-value">{orderData.nombrePanadero}</p>
            </div>
          </div>
        </div>

        {/* Ingreso */}
        <div className="ss-card">
          <p className="ss-section-label">Ingreso de la venta</p>
          <div className="ss-amount-row">
            <span className="ss-amount-label-text">Monto total</span>
            <span className="ss-amount-value">
              Q {ventaReal ? ventaReal.toFixed(2) : "0.00"}
            </span>
          </div>
        </div>

        {/* Gastos */}
        <div className="ss-card">
          <p className="ss-section-label">Gastos del turno</p>
          {gastos.length === 0 ? (
            <p className="ss-empty">Sin gastos registrados</p>
          ) : (
            <>
              {gastos.map((gasto, i) => (
                <div className="ss-table-row" key={i}>
                  <span className="ss-row-label">{gasto.detalleGasto}</span>
                  <span className="ss-row-value-amber">Q {gasto.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div className="ss-subtotal-bar">
                <span className="ss-subtotal-label">Total gastos</span>
                <span className="ss-subtotal-value">Q {totalGastos.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Resumen financiero */}
        <div className="ss-card">
          <p className="ss-section-label">Resumen financiero</p>
          <div className="ss-fin-row">
            <span className="ss-fin-label">Venta total</span>
            <span className="ss-fin-value">Q {ventaReal ? ventaReal.toFixed(2) : "0.00"}</span>
          </div>
          <div className="ss-fin-row">
            <span className="ss-fin-label">Total gastos</span>
            <span className="ss-fin-value-amber">− Q {totalGastos.toFixed(2)}</span>
          </div>
          <div className="ss-fin-total">
            <span className="ss-fin-total-label">Venta neta</span>
            <span className="ss-fin-total-value">Q {ventaNeta.toFixed(2)}</span>
          </div>
        </div>

        {/* Panadería */}
        <div className="ss-card">
          <p className="ss-section-label">Panadería</p>
          {todosVendidos ? (
            <div className="ss-badge-ok">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#0F6E56" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Todo vendido
            </div>
          ) : (
            productosPanaderiaConCantidad
              .filter((p) => p.cantidadNoVendida > 0)
              .map((p) => (
                <div className="ss-table-row" key={p.idProducto}>
                  <span className="ss-row-label">{p.nombreProducto}</span>
                  <span className="ss-row-value">{p.cantidadNoVendida} uds.</span>
                </div>
              ))
          )}
        </div>

        {/* Otros productos */}
        <div className="ss-card">
          <p className="ss-section-label">Otros productos</p>
          {productosOtrosConCantidad.filter((p) => p.cantidadVendida > 0).length === 0 ? (
            <p className="ss-empty">Sin unidades registradas</p>
          ) : (
            productosOtrosConCantidad
              .filter((p) => p.cantidadVendida > 0)
              .map((p) => (
                <div className="ss-table-row" key={p.idProducto}>
                  <span className="ss-row-label">{p.nombreProducto}</span>
                  <span className="ss-row-value">{p.cantidadVendida} uds.</span>
                </div>
              ))
          )}
        </div>

      </Modal.Body>

      {/* FOOTER */}
      <Modal.Footer>
        <button className="ss-btn-cancel" onClick={handleClose}>
          Cancelar
        </button>
        <button
          className="ss-btn-primary"
          onClick={() => { onConfirm(); handleClose(); }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Procesando...
            </>
          ) : (
            "Confirmar y guardar"
          )}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default SalesSummary;