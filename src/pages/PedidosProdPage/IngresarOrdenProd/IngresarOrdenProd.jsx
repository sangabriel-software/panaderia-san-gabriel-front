import { useRef, useState } from "react";
import { Container, Form, Row, Col, Button, Card, InputGroup } from "react-bootstrap";
import { useForm } from "react-hook-form";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import { useGetSucursales } from "../../../hooks/sucursales/useGetSucursales";
import { BsArrowLeft, BsExclamationTriangleFill } from "react-icons/bs";
import { useNavigate } from "react-router";
import Title from "../../../components/Title/Title";
import { getInitials, getUniqueColor, handleIngresarOrdenProduccionSubmit, scrollToAlert } from "./IngresarOrdenProdUtils";
import Alert from "../../../components/Alerts/Alert";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import OrderSummary from "../../../components/OrderSummary/OrderSummary";
import dayjs from "dayjs";
import "./ordenes.css";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";

const IngresarOrdenProd = () => {
  const alertRef = useRef(null);
  const navigate = useNavigate();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, getValues } = useForm({
    defaultValues: { sucursal: "", turno: "AM", fechaAProducir: tomorrow, nombrePanadero: "" },
  });

  const turnoValue = watch("turno");
  const [activeCategory, setActiveCategory] = useState("Panadería");
  const [trayQuantities, setTrayQuantities] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleShowOrderSummary = () => setShowOrderSummary(true);
  const handleCloseOrderSummary = () => setShowOrderSummary(false);

  const panaderiaProducts = productos.filter((p) => p.nombreCategoria === "Panadería");
  const reposteriaProducts = productos.filter((p) => p.nombreCategoria === "Repostería");

  const filterProductsByName = (products, searchTerm) => {
    if (!searchTerm) return products;
    return products.filter((producto) =>
      producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredProducts = filterProductsByName(productos, searchTerm);
  const filteredPanaderiaProducts = searchTerm? filteredProducts.filter((p) => p.nombreCategoria === "Panadería") : panaderiaProducts;
  const filteredReposteriaProducts = searchTerm ? filteredProducts.filter((p) => p.nombreCategoria === "Repostería") : reposteriaProducts;
  const productsToShow = searchTerm ? filteredProducts : activeCategory === "Panadería" ? filteredPanaderiaProducts : filteredReposteriaProducts;

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
                          min={tomorrow}
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
                          variant={turnoValue === "AM" ? "primary" : "outline-primary"}
                          className="shift-btn"
                          onClick={() => setValue("turno", "AM")}
                        >
                          🌅 AM
                        </Button>
                        <Button
                          variant={turnoValue === "PM" ? "primary" : "outline-primary"}
                          className="shift-btn"
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
                          <div className="spinner-border text-primary" role="status" />
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
                  <span className="spinner-border spinner-border-sm" role="status" />
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
          <div className="mb-4">
            <Form.Control
              type="text"
              placeholder="Buscar producto por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-data search-bar"
            />
          </div>

          {/* Selector de categoría */}
          <div className="category-selector mb-4">
            <Button
              variant={activeCategory === "Panadería" ? "primary" : "outline-primary"}
              onClick={() => setActiveCategory("Panadería")}
              className="category-btn"
            >
              Panadería ({searchTerm ? filteredProducts.length : filteredPanaderiaProducts.length})
            </Button>
            <Button
              variant={activeCategory === "Repostería" ? "primary" : "outline-primary"}
              onClick={() => setActiveCategory("Repostería")}
              className="category-btn"
            >
              Repostería ({searchTerm ? filteredProducts.length : filteredReposteriaProducts.length})
            </Button>
          </div>

          {/* Lista de productos filtrados */}
          <Row className="g-4 product-grid">
            {productsToShow.map((producto) => (
              <Col key={producto.idProducto} xs={12} md={6} lg={4} xl={3}>
                <Card className="product-card">
                  <Card.Body className="product-card-body">
                    <div
                      className="product-badge"
                      style={{
                        backgroundColor: getUniqueColor(producto.nombreProducto),
                      }}
                    >
                      {getInitials(producto.nombreProducto)}
                    </div>
                    <h3 className="product-title">{producto.nombreProducto}</h3>
                    <p className="product-category">
                      {producto.nombreCategoria === "Panadería" ? "Bandejas" : "Unidades"}
                    </p>
                    <InputGroup className="product-input-group">
                      <Form.Control
                        type="number"
                        min="0"
                        value={trayQuantities[producto.idProducto] || ""}
                        onChange={(e) =>
                          setTrayQuantities({
                            ...trayQuantities,
                            [producto.idProducto]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="product-input"
                      />
                    </InputGroup>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Botón Flotante para Móvil */}
      <Button
        variant="primary"
        className="floating-scroll-btn d-md-none"
        onClick={() => window.scrollTo({ top: 240, behavior: "smooth" })}
      >
        ↑
      </Button>

      {/* Resumen de Orden */}
      <OrderSummary
        show={showOrderSummary}
        handleClose={handleCloseOrderSummary}
        orderData={getValues()}
        trayQuantities={trayQuantities}
        productos={productos}
        sucursales={sucursales}
        onConfirm={handleConfirmOrder}
        isLoading={isLoading}
      />

      {/* Popup de Éxito */}
      <SuccessPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="¡Éxito!"
        message="La orden se agrego correctamente"
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