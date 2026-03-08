import { useEffect, useRef, useState } from "react";
import { Container, Form, Row, Col, Button, Card, InputGroup, Table, Dropdown } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { BsArrowLeft, BsArrowUp, BsExclamationTriangleFill, BsFilter, BsX } from "react-icons/bs";
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
import { filterProductsByName, getFilteredProductsByCategory, getInitials, getUniqueColor, getUserSucursalName, handleIngresarOrdenProduccionSubmit, scrollToAlert } from "./IngresarOrdenProdUtils";
import { getUserData } from "../../../utils/Auth/decodedata";
import "./ordenes.css";
import useGetFechaProduccion from "../../../hooks/fecha-produccion/useGetFechaProduccion";

// ─── Utilidades countdown ──────────────────────────────────────────────────────

const formatCountdown = (seconds) => {
  if (seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

// ─── Banner de ventana activa ──────────────────────────────────────────────────

const VentanaActivaBanner = ({ segundosRestantes, expiraEn }) => {
  const [seconds, setSeconds] = useState(segundosRestantes);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSeconds(segundosRestantes);
  }, [segundosRestantes]);

  useEffect(() => {
    if (seconds <= 0) return;
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [segundosRestantes]);

  if (!visible || seconds <= 0) return null;

  const expiraFormateado = expiraEn
    ? dayjs(expiraEn.replace(" ", "T")).format("HH:mm")
    : "--:--";

  return (
    <div className="vab-banner">
      <div className="vab-left">
        <span className="vab-dot" />
        <div className="vab-text">
          <span className="vab-title">Ingreso del día habilitado</span>
          <span className="vab-subtitle">Vence a las {expiraFormateado}</span>
        </div>
      </div>
      <div className="vab-right">
        <span className="vab-timer">{formatCountdown(seconds)}</span>
        <button
          className="vab-close"
          onClick={() => setVisible(false)}
          title="Cerrar"
        >
          <BsX size={18} />
        </button>
      </div>
    </div>
  );
};

// ─── Componente Principal ──────────────────────────────────────────────────────

const IngresarOrdenProd = () => {
  const usuario = getUserData();
  const alertRef = useRef(null);
  const navigate = useNavigate();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const { diaProduccion, loadingFechaProduccion } = useGetFechaProduccion();

  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
  const today    = dayjs().format("YYYY-MM-DD");
  const userData = getUserData();

  // ── Extraer datos del array que devuelve el hook ──────────────────────────
  const registroActivo     = Array.isArray(diaProduccion) && diaProduccion.length > 0 ? diaProduccion[0] : null;
  const ventanaActiva      = registroActivo?.fecha_produccion_a_setear === "today";
  const segundosRestantes  = registroActivo?.segundos_restantes ?? 0;
  const expiraEn           = registroActivo?.expira_en ?? null;
  const fechaMinima        = ventanaActiva ? today : tomorrow;
  const fechaDefault       = ventanaActiva ? today : tomorrow;

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, getValues } = useForm({
    defaultValues: {
      sucursal:       userData.idRol === 1 ? "" : userData.idSucursal.toString(),
      turno:          "AM",
      fechaAProducir: fechaDefault,
      nombrePanadero: "",
    },
  });

  // Setear sucursal automáticamente si no es admin
  useEffect(() => {
    if (userData.idRol !== 1 && userData.idSucursal) {
      setValue("sucursal", userData.idSucursal.toString());
    }
  }, [userData.idRol, userData.idSucursal, setValue]);

  // Actualizar fecha cuando lleguen los datos del hook
  useEffect(() => {
    if (!loadingFechaProduccion) {
      setValue("fechaAProducir", fechaDefault);
    }
  }, [loadingFechaProduccion, fechaDefault, setValue]);

  const turnoValue = watch("turno");
  const [activeCategory]         = useState("Panaderia");
  const [trayQuantities, setTrayQuantities]       = useState({});
  const [isPopupOpen, setIsPopupOpen]             = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen]   = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isLoading, setIsLoading]                 = useState(false);
  const [showOrderSummary, setShowOrderSummary]   = useState(false);
  const [searchTerm, setSearchTerm]               = useState("");
  const [productionTypeFilter, setProductionTypeFilter] = useState("todos");

  const handleShowOrderSummary  = () => setShowOrderSummary(true);
  const handleCloseOrderSummary = () => setShowOrderSummary(false);

  const filteredProducts = productos.filter((p) => p.idCategoria === 1 || p.idCategoria === 2);
  const productsToShow   = getFilteredProductsByCategory(productos, searchTerm, activeCategory, usuario)
    .filter((p) => productionTypeFilter === "todos" || p.tipoProduccion === productionTypeFilter);

  const onSubmit = async () => setShowOrderSummary(true);

  const handleConfirmOrder = async () => {
    const data = getValues();
    await handleIngresarOrdenProduccionSubmit(
      data, trayQuantities, setTrayQuantities,
      setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen,
      setIsLoading, reset
    );
    setShowOrderSummary(false);
  };

  scrollToAlert(errorPopupMessage, isPopupErrorOpen, alertRef);

  const [showScrollButton, setShowScrollButton] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 30, behavior: "smooth" });

  const getFilterLabel = () => {
    switch (productionTypeFilter) {
      case "bandejas": return "Bandejas";
      case "harina":   return "Harina";
      default:         return "Todos los productos";
    }
  };

  return (
    <Container className="glassmorphism-container py-4">

      {/* Banner ventana activa */}
      {ventanaActiva && (
        <VentanaActivaBanner
          segundosRestantes={segundosRestantes}
          expiraEn={expiraEn}
        />
      )}

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
                        {ventanaActiva && (
                          <span className="vab-fecha-badge">Hoy habilitado</span>
                        )}
                      </label>
                      <InputGroup className="modern-input-group">
                        <Form.Control
                          type="date"
                          {...register("fechaAProducir", {
                            required: "Seleccione una fecha",
                          })}
                          className="form-control modern-datepicker"
                          min={fechaMinima}
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
                          className="shift-btn-ventas"
                          onClick={() => setValue("turno", "AM")}
                        >
                          🌅 AM
                        </Button>
                        <Button
                          variant={turnoValue === "PM" ? "primary" : "outline-primary"}
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
                          <div className="spinner-border text-primary" role="status" />
                        </div>
                      ) : userData.idRol === 1 ? (
                        <Form.Select
                          {...register("sucursal", { required: "Seleccione sucursal" })}
                          className="modern-select"
                        >
                          <option value="">Seleccionar sucursal</option>
                          {sucursales.map((s) => (
                            <option key={s.idSucursal} value={s.idSucursal}>
                              {s.nombreSucursal}
                            </option>
                          ))}
                        </Form.Select>
                      ) : (
                        <div className="sucursal-assigned">
                          <Form.Control
                            type="text"
                            value={getUserSucursalName(sucursales, userData)}
                            readOnly
                            className="modern-input"
                          />
                          <input type="hidden" {...register("sucursal", { required: true })} />
                        </div>
                      )}
                      {errors.sucursal && (
                        <div className="text-danger small mt-1">{errors.sucursal.message}</div>
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
                        {...register("nombrePanadero", { required: "Campo requerido" })}
                        className="modern-input"
                      />
                      {errors.nombrePanadero && (
                        <div className="text-danger small mt-1">{errors.nombrePanadero.message}</div>
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
                disabled={isLoading || loadingSucursales || loadigProducts || showErrorSucursales || showErrorProductos}
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
          <div className="mb-4 search-filter-container">
            <div className="search-wrapper">
              <Form.Control
                type="text"
                placeholder="Buscar producto por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <FaSearch className="search-icon" />
            </div>

            <Dropdown className="filter-dropdown">
              <Dropdown.Toggle variant="primary" id="dropdown-filter">
                <BsFilter className="me-2" />
                {getFilterLabel()}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item active={productionTypeFilter === "todos"} onClick={() => setProductionTypeFilter("todos")}>
                  Todos los productos
                </Dropdown.Item>
                <Dropdown.Item active={productionTypeFilter === "bandejas"} onClick={() => setProductionTypeFilter("bandejas")}>
                  Bandejas
                </Dropdown.Item>
                <Dropdown.Item active={productionTypeFilter === "harina"} onClick={() => setProductionTypeFilter("harina")}>
                  Harina
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className="table-responsive excel-table-container">
            <Table striped bordered hover className="excel-table">
              <thead>
                <tr>
                  <th className="dark-header text-center">Producto</th>
                  <th className="dark-header text-center">Cantidad</th>
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
                          <span
                            style={{
                              fontSize: "16px",
                              fontWeight: "bold",
                              color: producto.tipoProduccion === "bandejas" ? "#28a745" : "#007bff",
                            }}
                            className="quantity-type-label"
                          >
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
                                  cantidad:             parseInt(e.target.value) || 0,
                                  idCategoria:          producto.idCategoria,
                                  tipoProduccion:       producto.tipoProduccion,
                                  controlarStock:       producto.controlarStock,
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
                      {productos.length === 0 ? "No se han ingresado Productos." : "No se encontraron Productos."}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      {/* Botón flotante scroll */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="btn btn-dark rounded-circle shadow"
          style={{
            position: "fixed", bottom: "1px", right: "1px",
            width: "40px", height: "40px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            opacity: showScrollButton ? 1 : 0,
            transform: showScrollButton ? "translateY(0)" : "translateY(20px)",
            pointerEvents: showScrollButton ? "auto" : "none",
            zIndex: 1000,
          }}
        >
          <BsArrowUp size={20} />
        </button>
      )}

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

      {/* Popup Éxito */}
      <SuccessPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="¡Éxito!"
        message="La orden se agregó correctamente"
        nombreBotonVolver="Ver Ordenes"
        nombreBotonNuevo="Ingresar orden"
        onView={() => navigate("/ordenes-produccion")}
        onNew={() => { setIsPopupOpen(false); reset(); }}
      />

      {/* Popup Errores */}
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