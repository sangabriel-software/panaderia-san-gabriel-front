// CardResumenVenta.js
import React from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { FaEdit, FaStore, FaCalendarAlt, FaClock, FaUser } from "react-icons/fa";
import dayjs from "dayjs";

const CardResumenVenta = ({ sucursales, sucursalValue, turnoValue, usuario, handleModificarDatosWrapper, isLoading,
                            setShowSalesSummary, }) => {
  return (
    <Card className="ingresar-venta-order-header-card mt-1 shadow-lg">
      <Card.Body>
        {/* Botón para modificar datos en la esquina superior derecha */}
        <div className="d-flex justify-content-end">
          <Button
            variant="warning"
            className="modificar-btn"
            onClick={handleModificarDatosWrapper}
            style={{ fontSize: "1rem", padding: "0.3rem 0.5rem" }}
          >
            <FaEdit />
          </Button>
        </div>

        <Row className="text-center">
          <Col xs={12} md={3} className="mb-3 mb-md-0">
            <div className="ingresar-venta-order-header-item text-start">
              <span className="ingresar-venta-order-header-label text-secondary">
                <FaStore className="text-primary" /> Sucursal:
              </span>
              <span className="ingresar-venta-order-header-value">
                {sucursales.find((s) => s.idSucursal == sucursalValue)?.nombreSucursal}
              </span>
            </div>
          </Col>

          <Col xs={6} md={3} className="mb-3 mb-md-0">
            <div className="ingresar-venta-order-header-item">
              <span className="ingresar-venta-order-header-label text-secondary">
                <FaCalendarAlt className="text-primary" /> Fecha:
              </span>
              <span className="ingresar-venta-order-header-value">
                {dayjs().format("DD/MM/YYYY")}
              </span>
            </div>
          </Col>

          <Col xs={6} md={3} className="mb-3 mb-md-0">
            <div className="ingresar-venta-order-header-item">
              <span className="ingresar-venta-order-header-label text-secondary">
                <FaClock className="text-primary" /> Turno:
              </span>
              <span className="ingresar-venta-order-header-value">
                {turnoValue}
              </span>
            </div>
          </Col>

          <Col xs={12} md={3} className="mb-3 mb-md-0">
            <div className="ingresar-venta-order-header-item text-start">
              <span className="ingresar-venta-order-header-label text-secondary">
                <FaUser className="text-primary" /> Usuario:
              </span>
              <span className="ingresar-venta-order-header-value">
                {usuario.usuario}
              </span>
            </div>
          </Col>
        </Row>

        {/* Botón "Guardar Venta" */}
        <Row className="text-center justify-content-center mt-4">
          <Col xs={12} md={6} lg={4}>
            <div className="d-flex justify-content-center">
              <Button
                variant="primary"
                className="submit-btn w-100"
                type="submit"
                onClick={() => setShowSalesSummary(true)} // Solo abre el modal
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" />
                ) : (
                  <>
                    <span className="btn-icon">🚀</span>
                    Guardar Venta
                  </>
                )}
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default CardResumenVenta;