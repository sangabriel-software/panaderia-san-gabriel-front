import { useRef, useState } from "react";
import { Container, Form, Row, Col, Button, Card, InputGroup, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { BsArrowLeft, BsExclamationTriangleFill, BsFillInfoCircleFill } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router";
import Title from "../../../components/Title/Title";
import Alert from "../../../components/Alerts/Alert";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import OrderSummary from "../../../components/OrderSummary/OrderSummary";
import dayjs from "dayjs";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import { useGetSucursales } from "../../../hooks/sucursales/useGetSucursales";
import { filterProductsByName, getFilteredProductsByCategory, getInitials, getUniqueColor, handleIngresarOrdenProduccionSubmit, scrollToAlert } from "./IngresarOrdenProdUtils";
import { getUserData } from "../../../utils/Auth/decodedata";
import "./ordenes.css";

const IngresarOrdenProd = () => {
  const usuario = getUserData();
  const alertRef = useRef(null);
  const navigate = useNavigate();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
  const today = dayjs().format("YYYY-MM-DD");
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, getValues } = useForm({
    defaultValues: {
      sucursal: "",
      turno: "AM",
      fechaAProducir: usuario.idRol === 1 && usuario.rol === "Admin" ? tomorrow : today,
      nombrePanadero: "",
    },
  });

  const turnoValue = watch("turno");
  const [activeCategory] = useState("Panaderia");
  const [trayQuantities, setTrayQuantities] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleShowOrderSummary = () => setShowOrderSummary(true);
  const handleCloseOrderSummary = () => setShowOrderSummary(false);

  const filteredProducts = productos.filter((producto) => producto.idCategoria === 1);
  const productsToShow = getFilteredProductsByCategory(productos, searchTerm, activeCategory, usuario);

  const onSubmit = async (data) => {
    setShowOrderSummary(true);
  };

  const handleConfirmOrder = async () => {
    const data = getValues();
    await handleIngresarOrdenProduccionSubmit(
      data,
      trayQuantities,
      setTrayQuantities,
      setIsPopupOpen,
      setErrorPopupMessage,
      setIsPopupErrorOpen,
      setIsLoading,
      reset
    );
    setShowOrderSummary(false);
  };

  scrollToAlert(errorPopupMessage, isPopupErrorOpen, alertRef);

  return (
    <Container className="glassmorphism-container py-4">
      {/* Encabezado */}
      <div className="text-center mb-5">
        <div className="d-flex align-items-center justify-content-center gap-3">
          <button
            className="btn btn-return rounded-circle shadow-sm"
            onClick={() => navigate("/ordenes-produccion")}
          >
            <BsArrowLeft size={20} />
          </button>
          <Title
            title="Nueva Orden de Producción"
            className="gradient-text"
            icon="🍞"
          />
        </div>
      </div>

      {/* Manejo de Errores */}
      {errorPopupMessage && !isPopupErrorOpen && (
        <>
          <div ref={alertRef} />
          <Alert
            type="danger"
            message={errorPopupMessage}
            icon={<BsExclamationTriangleFill />}
            className="mt-4 mx-auto text-center"
            style={{ maxWidth: "500px" }}
          />
        </>
      )}

      {/* Formulario Principal */}
      <Card className="glass-card mb-5">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-4">
              {/* Sección Fecha y Turno */}
              <Col xs={12} lg={6}>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <label className="form-label small text-uppercase text-muted fw-bold mb-2">
                        Fecha de Producción
                      </label>
                      <InputGroup className="modern-input-group">
                        <Form.Control
                          type="date"
                          {...register("fechaAProducir", {
                            required: "Seleccione una fecha",
                          })}
                          className="form-control modern-datepicker"
                          min={
                            usuario.idRol === 1 && usuario.rol === "Admin"
                              ? tomorrow
                              : today
                          }
                        />
                      </InputGroup>
                      {errors.fechaAProducir && (
                        <div className="text-danger small mt-1">
                          {errors.fechaAProducir.message}
                        </div>
                      )}
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group>
                      <label className="form-label small text-uppercase text-muted fw-bold mb-2">
                        Turno
                      </label>
                      <div className="d-flex gap-2 shift-selector">
                        <Button
                          variant={
                            turnoValue === "AM" ? "primary" : "outline-primary"
                          }
                          className="shift-btn-ventas"
                          onClick={() => setValue("turno", "AM")}
                        >
                          🌅 AM
                        </Button>
                        <Button
                          variant={
                            turnoValue === "PM" ? "primary" : "outline-primary"
                          }
                          className="shift-btn-ventas"
                          onClick={() => setValue("turno", "PM")}
                        >
                          🌇 PM
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              {/* Sección Sucursal y Panadero */}
              <Col xs={12} lg={6}>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <Form.Group>
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
                          {...register("sucursal", {
                            required: "Seleccione sucursal",
                          })}
                          className="modern-select"
                        >
                          <option value="">Seleccionar sucursal</option>
                          {sucursales.map((s) => (
                            <option key={s.idSucursal} value={s.idSucursal}>
                              {s.nombreSucursal}
                            </option>
                          ))}
                        </Form.Select>
                      )}
                      {errors.sucursal && (
                        <div className="text-danger small mt-1">
                          {errors.sucursal.message}
                        </div>
                      )}
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group>
                      <label className="form-label small text-uppercase text-muted fw-bold mb-2">
                        Panadero Responsable
                      </label>
                      <Form.Control
                        type="text"
                        placeholder="Nombre del panadero"
                        {...register("nombrePanadero", {
                          required: "Campo requerido",
                        })}
                        className="modern-input"
                      />
                      {errors.nombrePanadero && (
                        <div className="text-danger small mt-1">
                          {errors.nombrePanadero.message}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Botón de Envío */}
            <div className="text-center mt-5">
              <Button
                variant="primary"
                className="submit-btn"
                type="submit"
                disabled={
                  isLoading ||
                  loadingSucursales ||
                  loadigProducts ||
                  showErrorSucursales ||
                  showErrorProductos
                }
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
          </Form>
        </Card.Body>
      </Card>

      {/* Sección de Productos */}
      {loadigProducts ? (
        <div className="loading-products">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <div className="products-section">
          {/* Barra de búsqueda */}
          <div className="mb-4 search-container">
            <Form.Control
              type="text"
              placeholder="Buscar producto por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </div>

          {/* Tabla de productos */}
{/* Tabla de productos */}
<div className="table-responsive excel-table-container">
  <Table striped bordered hover className="excel-table">
    <thead>
      <tr>
        <th className="dark-header text-center">Producto</th>
        <th className="dark-header text-center">Cantidad a Solicitar</th>
      </tr>
    </thead>
    <tbody>
      {productsToShow.length > 0 ? (
        productsToShow.map((producto) => (
          <tr key={producto.idProducto}>
            <td className="text-center align-middle">
              <div className="product-info">
                <div 
                  className="product-badge-ingresar-orden"
                  style={{ backgroundColor: getUniqueColor(producto.nombreProducto) }}
                >
                  {getInitials(producto.nombreProducto)}
                </div>
                <span className="product-name">{producto.nombreProducto}</span>
              </div>
            </td>
            <td className="text-center align-middle">
              <div className="quantity-input-container">
                <span className="quantity-type-label">
                  {producto.tipoProduccion === "bandejas" ? "Bandejas" : "Libras"}
                </span>
                <Form.Control
                  type="number"
                  min="0"
                  value={trayQuantities[producto.idProducto]?.cantidad || ""}
                  onChange={(e) =>
                    setTrayQuantities({
                      ...trayQuantities,
                      [producto.idProducto]: {
                        cantidad: parseInt(e.target.value) || 0,
                        idCategoria: producto.idCategoria,
                        tipoProduccion: producto.tipoProduccion,
                        controlarStock: producto.controlarStock,
                        controlarStockDiario: producto.controlarStockDiario,
                      },
                    })
                  }
                  className="quantity-input"
                />
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="2" className="text-center py-4">
            {productos.length === 0 
              ? "No se han ingresado Productos." 
              : "No se encontraron Productos."}
          </td>
        </tr>
      )}
    </tbody>
  </Table>
</div>
        </div>
      )}

      {/* Botón Flotante para Móvil */}
      <Button
        variant="primary"
        className="floating-scroll-btn d-md-none"
        onClick={() => window.scrollTo({ top: 100, behavior: "smooth" })}
      >
        ↑
      </Button>

      {/* Resumen de Orden */}
      <OrderSummary
        show={showOrderSummary}
        handleClose={handleCloseOrderSummary}
        orderData={getValues()}
        trayQuantities={trayQuantities}
        productos={filteredProducts}
        sucursales={sucursales}
        onConfirm={handleConfirmOrder}
        isLoading={isLoading}
      />

      {/* Popup de Éxito */}
      <SuccessPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="¡Éxito!"
        message="La orden se agregó correctamente"
        nombreBotonVolver="Ver Ordenes"
        nombreBotonNuevo="Ingresar orden"
        onView={() => navigate("/ordenes-produccion")}
        onNew={() => {
          setIsPopupOpen(false);
          reset();
        }}
      />

      {/* Popup errores */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />
    </Container>
  );
};

export default IngresarOrdenProd;