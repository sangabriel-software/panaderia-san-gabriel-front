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
import { getUserData } from "../../../utils/Auth/decodedata";
import { handleCloseModal } from "./IngresarVenta.Utils";
import DotsMove from "../../../components/Spinners/DotsMove";

const IngresarVentaPage = () => {
  const usuario = getUserData(); //Informacion del usuario conectado
  const [orden, setOrden] = useState([]); // Estado para almacenar los detalles de la orden
  const [isLoading, setIsLoading] = useState(false); // Estado para el loading
  const [showModal, setShowModal] = useState(true); // Estado para mostrar/ocultar el modal
  const { sucursales, loadingSucursales } = useGetSucursales(); // Custom hook para obtener sucursales
  const navigate = useNavigate(); // Hook para redirigir

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { turno: "AM", sucursal: "" } });
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
      setOrden(resultado);
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

  return (
    <Container>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        fullscreen // Hace que el modal ocupe toda la pantalla
        className="ingresar-venta-modal" // Clase CSS personalizada para el modal
      >
        <Modal.Header className="bg-purple text-white">
          <Modal.Title className="w-100 text-center">
            Selecciona turno y sucursal
          </Modal.Title>
          <Button
            variant="link"
            onClick={() => {
              handleCloseModal(navigate);
            }}
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
                    <div className="d-flex flex-column flex-md-row justify-content-center gap-3 ingresar-venta-shift-selector">
                      <Button
                        variant={
                          turnoValue === "AM" ? "primary" : "outline-primary"
                        }
                        className="ingresar-venta-shift-btn shadow w-100 w-md-auto"
                        onClick={() => setValue("turno", "AM")}
                      >
                        🌅 AM
                      </Button>
                      <Button
                        variant={
                          turnoValue === "PM" ? "primary" : "outline-primary"
                        }
                        className="ingresar-venta-shift-btn shadow w-100 w-md-auto"
                        onClick={() => setValue("turno", "PM")}
                      >
                        🌇 PM
                      </Button>
                    </div>
                    {errors.turno && (
                      <span className="ingresar-venta-text-danger small">
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
                        className={`ingresar-venta-custom-select shadow w-100 ${
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
                      <span className="ingresar-venta-text-danger small">
                        No se pudieron cargar las sucursales. Intente más tarde.
                      </span>
                    )}
                  </Form.Group>
                  {isLoading && (
                    <div className="d-flex justify-content-center mt-3">
                      <DotsMove />
                    </div>
                  )}
                </Form>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer className="bg-purple">
          <Button
            variant="light"
            onClick={() => {
              handleCloseModal(navigate);
            }}
            className="bt-cancelar shadow"
          >
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Encabezado de la orden */}
      {!showModal && !isLoading && (
        <Card className="ingresar-venta-order-header-card mt-4 shadow-lg">
          <Card.Body>
            <Row className="text-center">
              {/* Sucursal */}
              <Col xs={12} md={3} className="mb-3 mb-md-0">
                <div className="ingresar-venta-order-header-item text-start">
                  <span className="ingresar-venta-order-header-label text-secondary">
                    <FaStore className="text-primary" /> Sucursal:
                  </span>
                  <span className="ingresar-venta-order-header-value">
                    {
                      sucursales.find((s) => s.idSucursal == sucursalValue)
                        ?.nombreSucursal
                    }
                  </span>
                </div>
              </Col>

              {/* Fecha */}
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

              {/* Turno */}
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

              {/* Usuario */}
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
              <Col xs={8} md={4}>
                <div className="d-flex justify-content-center">
                  <Button
                    variant="primary"
                    className="submit-btn"
                    type="submit"
                  >
                    {isLoading ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                    ) : (
                      <>
                        <span className="btn-icon">🚀</span>
                        Guardar Orden
                      </>
                    )}
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
