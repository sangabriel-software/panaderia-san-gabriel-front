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
import { descargarPdfDuranteIngresoOrden, filterProductsByName, getFilteredProductsByCategory, getInitials, getUniqueColor, getUserSucursalName, handleIngresarOrdenProduccionSubmit, scrollToAlert } from "./IngresarOrdenProdUtils";
import { getUserData } from "../../../utils/Auth/decodedata";
import "./ordenes.css";
import useGetFechaProduccion from "../../../hooks/fecha-produccion/useGetFechaProduccion";
import { ingresarOrdenProduccionBatchService } from "../../../services/ordenesproduccion/ordenesProduccion.service";
import { getCurrentDateTimeWithSeconds } from "../../../utils/dateUtils";
import { descargarPlantillaOrden, limpiarCSV } from "../../../utils/PdfUtils/ExcelUtils";

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
  const csvInputRef = useRef(null);
  const navigate = useNavigate();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const { diaProduccion, loadingFechaProduccion } = useGetFechaProduccion();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
  const today = dayjs().format("YYYY-MM-DD");
  const userData = getUserData();

  console.log("Carga inicial")

  const registroActivo = Array.isArray(diaProduccion) && diaProduccion.length > 0 ? diaProduccion[0] : null;
  const ventanaActiva = registroActivo?.fecha_produccion_a_setear === "today";
  const segundosRestantes = registroActivo?.segundos_restantes ?? 0;
  const expiraEn = registroActivo?.expira_en ?? null;
  const fechaMinima = ventanaActiva ? today : tomorrow;
  const fechaDefault = ventanaActiva ? today : tomorrow;

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, getValues } = useForm({
    defaultValues: {
      sucursal: userData.idRol === 1 ? "" : userData.idSucursal.toString(),
      turno: "AM",
      fechaAProducir: fechaDefault,
      nombrePanadero: "",
    },
  });

  useEffect(() => {
    if (userData.idRol !== 1 && userData.idSucursal) {
      setValue("sucursal", userData.idSucursal.toString());
    }
  }, [userData.idRol, userData.idSucursal, setValue]);

  useEffect(() => {
    if (!loadingFechaProduccion) {
      setValue("fechaAProducir", fechaDefault);
    }
  }, [loadingFechaProduccion, fechaDefault, setValue]);

  const turnoValue = watch("turno");

  const [activeCategory, setActiveCategory] = useState("Panaderia");
  const [trayQuantities, setTrayQuantities] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [productionTypeFilter, setProductionTypeFilter] = useState("todos");
  const [showScrollButton, setShowScrollButton] = useState(false);

  // CSV
  const [modoIngreso, setModoIngreso] = useState("csv");
  const [csvFile, setCsvFile] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvResult, setCsvResult] = useState(null);

  const handleCloseOrderSummary = () => setShowOrderSummary(false);

  const filteredProducts = productos.filter((p) => p.idCategoria === 1 || p.idCategoria === 2);
  const productsToShow = getFilteredProductsByCategory(productos, searchTerm, activeCategory, usuario)
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

  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 30, behavior: "smooth" });

  const getFilterLabel = () => {
    switch (productionTypeFilter) {
      case "bandejas": return "Bandejas";
      case "harina": return "Harina";
      default: return "Todos los productos";
    }
  };

  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".xlsx")) {
      setCsvFile(file);
      setCsvResult(null);
    } else {
      setErrorPopupMessage("Solo se permiten archivos .xlsx");
      setIsPopupErrorOpen(true);
      e.target.value = "";
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    const { idUsuario } = getUserData();
    const data = getValues();

    if (!data.sucursal || !data.fechaAProducir || !data.turno || !data.nombrePanadero) {
      setErrorPopupMessage("Ingresa el turno, la sucursal y/o el nombre del panadero.");
      setIsPopupErrorOpen(true);
      return;
    }

    setCsvLoading(true);
    setCsvResult(null);

    try {
      // ✅ Limpiar encoding antes de enviar
      const ordenHaader = JSON.stringify({
        idSucursal: data.sucursal,
        ordenTurno: data.turno,
        nombrePanadero: data.nombrePanadero,
        fechaAProducir: data.fechaAProducir,
        idUsuario: idUsuario,
        fechaCreacion: getCurrentDateTimeWithSeconds(),
      });

      const formData = new FormData();
      const fechaArchivo = dayjs().format("YYYYMMDD-HHmmss");

      // ✅ Usa csvLimpio en lugar de csvFile
      formData.append(
        "ordenProduccionBatch",
        csvFile,
        `orden-produccion-${fechaArchivo}.xlsx`
      );
      formData.append("ordenHaader", ordenHaader);

      const res = await ingresarOrdenProduccionBatchService(formData);

      if (res.status === 200) {
        descargarPdfDuranteIngresoOrden(res.ordenProduccion.idOrdenGenerada);
      }

      setCsvResult({ insertados: res.idOrdenProduccion ? 1 : 0 });
      setIsPopupOpen(true);

    } catch (error) {
      if (error.status === 409) {
        setErrorPopupMessage(error.response.data.error.message);
      } else {
        setErrorPopupMessage("Hubo un error al ingresar la orden. Inténtelo más tarde.");
      }
      setIsPopupErrorOpen(true);
    } finally {
      setCsvLoading(false);
    }
  };

  const handleRemoveCsv = (e) => {
    e.stopPropagation();
    setCsvFile(null);
    setCsvResult(null);
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  const handleDescargarPlantilla = () => {
    const link = document.createElement("a");
    link.href = "/plantillas/plantilla_produccion.xlsxs";
    link.download = "plantilla_produccion.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* Drag and drop */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".xlsx")) {
      setCsvFile(file);
      setCsvResult(null);
    } else {
      setErrorPopupMessage("Solo se permiten archivos .xlsx");
      setIsPopupErrorOpen(true);
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

              {/* Fecha y Turno */}
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
                          {...register("fechaAProducir", { required: "Seleccione una fecha" })}
                          className="form-control modern-datepicker"
                          min={fechaMinima}
                        />
                      </InputGroup>
                      {errors.fechaAProducir && (
                        <div className="text-danger small mt-1">{errors.fechaAProducir.message}</div>
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

              {/* Sucursal y Panadero */}
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

            {/* Botón submit — solo modo manual */}
            {/* {modoIngreso === "manual" && (
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
            )} */}
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

          {/* Selector de modo */}
          <div className="modo-selector">
            {/* <button
              className={`modo-btn ${modoIngreso === "manual" ? "active" : ""}`}
              onClick={() => setModoIngreso("manual")}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Ingreso manual
            </button> */}
            <button
              className={`modo-btn ${modoIngreso === "csv" ? "active" : ""}`}
              onClick={() => setModoIngreso("csv")}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Cargar archivo XLSX
            </button>
          </div>

          {/* ── Modo Manual ── */}
          {modoIngreso === "manual" && (
            <>
              {/* <div className="mb-4 search-filter-container">
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
                                onWheel={(e) => e.target.blur()}
                                className="quantity-input"
                                placeholder="0"
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
              </div> */}
            </>
          )}

          {/* ── Modo CSV ── */}
          {modoIngreso === "csv" && (
            <div className="csv-section">

              {/* Info formato + botón plantilla */}
              <div className="csv-format-info-wrap">
                <div className="csv-format-info">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>El archivo debe tener las columnas: <strong>idProducto, cantidad, tipoProduccion</strong></span>
                </div>
                <button
                  type="button"
                  className="csv-plantilla-btn"
                  onClick={() => descargarPlantillaOrden(productos)}
                  disabled={!productos || productos.length === 0}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Descargar plantilla
                </button>
              </div>

              {/* Drop zone */}
              <div
                className={`csv-dropzone ${csvFile ? "has-file" : ""} ${isDraggingOver ? "dragging" : ""}`}
                onClick={() => !isDraggingOver && csvInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={handleCsvFileChange}
                  style={{ display: "none" }}
                />
                {isDraggingOver ? (
                  <div className="csv-drag-overlay">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                    <p className="csv-drag-text">Suelta el archivo aquí</p>
                  </div>
                ) : csvFile ? (
                  <div className="csv-file-selected">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                      stroke="#6a01ac" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <div>
                      <p className="csv-filename">{csvFile.name}</p>
                      <p className="csv-filesize">{(csvFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      className="csv-remove-btn"
                      onClick={handleRemoveCsv}
                      type="button"
                      aria-label="Quitar archivo"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="csv-empty">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                      stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round">
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                    <p className="csv-empty-text">Haz clic para seleccionar un archivo <strong>.xlsx</strong></p>
                    <p className="csv-empty-text">O arrastra y suelta un archivo aquí</p>
                  </div>
                )}
              </div>

              {/* Resultado */}
              {csvResult && (
                <div className="csv-result">
                  <div className="csv-result-item success">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {csvResult.insertados} producto{csvResult.insertados !== 1 ? "s" : ""} insertado{csvResult.insertados !== 1 ? "s" : ""}
                  </div>
                  {csvResult.errores?.length > 0 && (
                    <div className="csv-result-item error">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {csvResult.errores.length} fila{csvResult.errores.length !== 1 ? "s" : ""} con error
                    </div>
                  )}
                </div>
              )}

              {/* Botón enviar */}
              <button
                className="csv-submit-btn"
                onClick={handleCsvUpload}
                disabled={!csvFile || csvLoading}
                type="button"
              >
                {csvLoading ? (
                  <>
                    <span className="csv-spinner" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Enviar archivo
                  </>
                )}
              </button>

            </div>
          )}

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