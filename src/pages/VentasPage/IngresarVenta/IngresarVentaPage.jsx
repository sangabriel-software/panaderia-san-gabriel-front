import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { consultarDetallenOrdenPorCriterio } from "../../../services/ordenesproduccion/ordenesProduccion.service";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { Modal, Button, Form, Spinner, Col } from "react-bootstrap"; // Componentes de Bootstrap
import { FaBuilding, FaSun, FaMoon } from "react-icons/fa"; // Iconos modernos
import "./IngresarVentaPage.css"; // Estilos CSS

const IngresarVentaPage = () => {
  const [turno, setTurno] = useState(""); // Estado para el turno
  const [idSucursal, setIdSucursal] = useState(""); // Estado para la sucursal
  const [fechaAproducir, setFechaAproducir] = useState(dayjs().format("YYYY-MM-DD")); // Fecha actual con dayjs
  const [detalleOrden, setDetalleOrden] = useState([]); // Estado para almacenar los detalles de la orden
  const [isLoading, setIsLoading] = useState(false); // Estado para el loading
  const [showModal, setShowModal] = useState(true); // Estado para mostrar/ocultar el modal
  const { sucursales, loadingSucursales } = useGetSucursales(); // Custom hook para obtener sucursales

  // Efecto para ejecutar la consulta automáticamente cuando se seleccionen ambos valores
  useEffect(() => {
    if (turno && idSucursal) {
      handleBuscarVentas();
    }
  }, [turno, idSucursal]);

  // Función para manejar la búsqueda de ventas
  const handleBuscarVentas = async () => {
    setIsLoading(true);
    try {
      const resultado = await consultarDetallenOrdenPorCriterio(turno, fechaAproducir, idSucursal);
      setDetalleOrden(resultado);
      setShowModal(false); // Cerrar el modal después de la búsqueda
    } catch (error) {
      console.error("Error al buscar ventas:", error);
      alert("Hubo un error al buscar las ventas. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ingresar-venta-container">
      <h1 className="titulo">Ingresar Ventas por Turno</h1>

      {/* Modal para seleccionar turno y sucursal */}
      <Modal
        show={showModal}
        onHide={() => {}} // No se puede cerrar manualmente
        centered
        fullscreen // Ocupa toda la pantalla
        backdrop="static" // No se cierra al hacer clic fuera
        keyboard={false} // No se cierra con la tecla ESC
        className="custom-modal"
      >
        <Modal.Header className="modal-header-custom">
          <Modal.Title className="modal-title-custom">
            <FaBuilding className="me-2" />
            Selecciona el Turno y la Sucursal
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom d-flex justify-content-center align-items-center">
          <Form className="w-100 max-w-md">
            {/* Sección de Turno */}
            <Col xs={12} className="mb-4 text-center">
              <Form.Group>
                <label className="form-label small text-uppercase text-light fw-bold mb-3">
                  <FaSun className="me-2" />
                  Turno
                  <FaMoon className="ms-2" />
                </label>
                <div className="d-flex gap-3 justify-content-center shift-selector">
                  <Button
                    variant={turno === "AM" ? "primary" : "outline-light"}
                    className="shift-btn"
                    onClick={() => setTurno("AM")}
                  >
                    🌅 AM
                  </Button>
                  <Button
                    variant={turno === "PM" ? "primary" : "outline-light"}
                    className="shift-btn"
                    onClick={() => setTurno("PM")}
                  >
                    🌇 PM
                  </Button>
                </div>
              </Form.Group>
            </Col>

            {/* Sección de Sucursal */}
            <Col xs={12} className="mb-4 text-center">
              <Form.Group>
                <label className="form-label small text-uppercase text-light fw-bold mb-3">
                  <FaBuilding className="me-2" />
                  Sucursal
                </label>
                <Form.Select
                  value={idSucursal}
                  onChange={(e) => setIdSucursal(e.target.value)}
                  disabled={loadingSucursales}
                  className="custom-select"
                >
                  <option value="">Selecciona una sucursal</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          {/* Spinner mientras se carga */}
          {isLoading && (
            <Spinner animation="border" role="status" className="text-light">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default IngresarVentaPage;