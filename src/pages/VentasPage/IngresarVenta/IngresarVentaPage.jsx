import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { consultarDetallenOrdenPorCriterio } from "../../../services/ordenesproduccion/ordenesProduccion.service";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import {
  Modal,
  Button,
  Form,
  Spinner,
  Container,
  Row,
  Col,
  Card,
} from "react-bootstrap"; // Componentes de Bootstrap
import {
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaStore,
  FaUser,
} from "react-icons/fa"; // Iconos modernos
import { useNavigate } from "react-router-dom"; // Para redirigir
import "./IngresarVentaPage.css"; // Estilos CSS
import { useForm } from "react-hook-form";

const IngresarVentaPage = () => {
  const [detalleOrden, setDetalleOrden] = useState([]); // Estado para almacenar los detalles de la orden
  const [isLoading, setIsLoading] = useState(false); // Estado para el loading
  const [showModal, setShowModal] = useState(true); // Estado para mostrar/ocultar el modal
  const { sucursales, loadingSucursales } = useGetSucursales(); // Custom hook para obtener sucursales
  const navigate = useNavigate(); // Hook para redirigir

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      turno: "AM", // Valor inicial del turno
      sucursal: "", // Valor inicial de la sucursal
    },
  });

  const turnoValue = watch("turno");
  const sucursalValue = watch("sucursal");

  // Efecto para ejecutar la consulta automáticamente cuando se seleccionen ambos valores
  useEffect(() => {
    if (turnoValue && sucursalValue) {
      handleBuscarVentas();
    }
  }, [turnoValue, sucursalValue]);

  // Función para manejar la búsqueda de ventas
  const handleBuscarVentas = async () => {
    setIsLoading(true);
    try {
      const resultado = await consultarDetallenOrdenPorCriterio(
        turnoValue,
        dayjs().format("YYYY-MM-DD"),
        sucursalValue
      );
      setDetalleOrden(resultado);
      setShowModal(false); // Cerrar el modal después de la búsqueda
    } catch (error) {
      console.error("Error al buscar ventas:", error);
      alert(
        "Hubo un error al buscar las ventas. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar el modal y redirigir a /ventas
  const handleCloseModal = () => {
    navigate("/ventas");
  };

  return (
    <Container>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        fullscreen // Hace que el modal ocupe toda la pantalla
        className="custom-modal" // Clase CSS personalizada para el modal
      >
        <Modal.Header className="bg-purple text-white">
          <Modal.Title className="w-100 text-center">
            Selecciona turno y sucursal
          </Modal.Title>
          <Button
            variant="link"
            onClick={handleCloseModal}
            className="text-white"
          >
            <FaTimes />
          </Button>
        </Modal.Header>
        <Modal.Body className="bg-light d-flex justify-content-center align-items-center">
          <Container>
            <Row className="justify-content-center">
              <Col xs={12} md={6} className="text-center">
                <Form>
                  {/* Grupo de botones para seleccionar el turno */}
                  <Form.Group className="mb-4">
                    <label className="form-label small text-uppercase text-muted fw-bold mb-2">
                      Turno
                    </label>
                    <div className="d-flex justify-content-center gap-3 shift-selector">
                      <Button
                        variant={
                          turnoValue === "AM" ? "primary" : "outline-primary"
                        }
                        className="shift-btn shadow"
                        onClick={() => setValue("turno", "AM")}
                      >
                        🌅 AM
                      </Button>
                      <Button
                        variant={
                          turnoValue === "PM" ? "primary" : "outline-primary"
                        }
                        className="shift-btn shadow"
                        onClick={() => setValue("turno", "PM")}
                      >
                        🌇 PM
                      </Button>
                    </div>
                    {errors.turno && (
                      <span className="text-danger small">
                        Selecciona un turno
                      </span>
                    )}
                  </Form.Group>

                  {/* Selección de sucursal */}
                  <Form.Group controlId="formSucursal" className="mb-4">
                    <label className="form-label small text-uppercase text-muted fw-bold mb-2">
                      Sucursal
                    </label>
                    {loadingSucursales ? (
                      <div className="loading-spinner">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        />
                      </div>
                    ) : (
                      <Form.Select
                        {...register("sucursal", { required: true })}
                        className={`custom-select shadow ${
                          errors.sucursal ? "is-invalid" : ""
                        }`}
                      >
                        <option value="">Selecciona una sucursal</option>
                        {sucursales.map((sucursal) => (
                          <option
                            key={sucursal.idSucursal}
                            value={sucursal.idSucursal}
                          >
                            {sucursal.nombreSucursal}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                    {errors.sucursal && (
                      <span className="text-danger small">
                        No se pudieron cargar las sucursales. Intente más tarde.
                      </span>
                    )}
                  </Form.Group>
                </Form>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer className="bg-purple">
          <Button
            variant="light"
            onClick={handleCloseModal}
            className="bt-cancelar shadow"
          >
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {isLoading && (
        <div className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      )}

      {/* Encabezado de la orden */}
      {!showModal && (
        <Card className="order-header-card mt-4 shadow-lg">
          <Card.Body>
            <Row className="text-center">
              <Col xs={12} md={3}>
                <div className="order-header-item">
                  <span className="order-header-label">
                    <FaCalendarAlt /> Fecha:
                  </span>
                  <span className="order-header-value">
                    {dayjs().format("DD/MM/YYYY")}
                  </span>
                </div>
              </Col>
              <Col xs={12} md={3}>
                <div className="order-header-item">
                  <span className="order-header-label">
                    <FaClock /> Turno:
                  </span>
                  <span className="order-header-value">{turnoValue}</span>
                </div>
              </Col>
              <Col xs={12} md={3}>
                <div className="order-header-item">
                  <span className="order-header-label">
                    <FaStore /> Sucursal:
                  </span>
                  <span className="order-header-value">
                    {
                      sucursales.find((s) => s.idSucursal === sucursalValue)
                        ?.nombreSucursal
                    }
                  </span>
                </div>
              </Col>
              <Col xs={12} md={3}>
                <div className="order-header-item">
                  <span className="order-header-label">
                    <FaUser /> Usuario:
                  </span>
                  <span className="order-header-value">Usuario Ficticio</span>
                </div>
              </Col>
            </Row>
            <Row className="text-center justify-content-center mt-4">
              <Col xs={12} md={4}>
                <div className="d-flex justify-content-center">
                  <Button className="save-venta-btn shadow-lg">
                    <i className="fas fa-save"></i> Guardar Venta
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default IngresarVentaPage;