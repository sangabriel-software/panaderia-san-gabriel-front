import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { Modal, Button, Form, Spinner, Container, Row, Col, Card, InputGroup } from "react-bootstrap";
import { FaTimes, FaCalendarAlt, FaClock, FaStore, FaUser, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./IngresarVentaPage.css";
import { useForm } from "react-hook-form";
import { getUserData } from "../../../utils/Auth/decodedata";
import { handleBuscarVentas, handleCloseModal } from "./IngresarVenta.Utils";
import DotsMove from "../../../components/Spinners/DotsMove";
import SalesSummary from "../../../components/ventas/SalesSumamary/SalesSummary";
import Title from "../../../components/Title/Title";
import { BsArrowLeft } from "react-icons/bs";
import { ingresarVentaService } from "../../../services/ventas/ventas.service";

// Función para obtener las iniciales de un nombre
const getInitials = (name) => {
  const words = name.split(" ");
  return words.map((word) => word[0]).join("").toUpperCase();
};

// Función para generar un color único basado en el nombre del producto
const getUniqueColor = (name) => {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D5", "#A4D555", "#D4A5A5",
    "#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#073B4C"
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const IngresarVentaPage = () => {
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const usuario = getUserData();
  const [orden, setOrden] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ordenYProductos, setOrdenYProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const { sucursales, loadingSucursales } = useGetSucursales();
  const navigate = useNavigate();

  const { register, watch, setValue, formState: { errors } } = useForm({ defaultValues: { turno: "AM", sucursal: "" } });
  const turnoValue = watch("turno");
  const sucursalValue = watch("sucursal");

  const [activeCategory, setActiveCategory] = useState("");
  const [trayQuantities, setTrayQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showSalesSummary, setShowSalesSummary] = useState(false);

  useEffect(() => {
    if (turnoValue && sucursalValue) {
      handleBuscarVentas(setIsLoading, turnoValue, sucursalValue, setOrden, setProductos, setOrdenYProductos, setShowModal, setErrorPopupMessage, setIsPopupErrorOpen);
    }
  }, [turnoValue, sucursalValue]);

  const categorias = [...new Set(ordenYProductos.map((p) => p.nombreCategoria))];

  useEffect(() => {
    if (categorias.length > 0 && !activeCategory) {
      setActiveCategory(categorias[0]);
    }
  }, [categorias, activeCategory]);

  const filterProductsByName = (products, searchTerm) => {
    if (!searchTerm) return products;
    return products.filter((producto) =>
      producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredProducts = filterProductsByName(ordenYProductos, searchTerm);
  const productsToShow = searchTerm
    ? filteredProducts
    : filteredProducts.filter((p) => p.nombreCategoria === activeCategory);

  const handleModificarDatos = () => {
    setValue("sucursal", "");
    setValue("turno", "AM");
    setShowModal(true);
  };

  const handleGuardarVenta = async () => {
    setIsLoading(true);
  
    const fechaActual = dayjs().format("YYYY-MM-DD");
  
    // Acceder al idOrdenProduccion desde encabezadoOrden
    const idOrdenProduccion = orden.encabezadoOrden ? orden.encabezadoOrden.idOrdenProduccion : null;
  
    const encabezadoVenta = {
      idOrdenProduccion: idOrdenProduccion, // Usar el idOrdenProduccion correcto
      idUsuario: usuario.idUsuario,
      idSucursal: sucursalValue,
      fechaVenta: fechaActual,
      fechaCreacion: fechaActual,
    };
  
    const detalleVenta = Object.keys(trayQuantities)
    .filter((idProducto) => trayQuantities[idProducto] > 0) // Solo productos con cantidad > 0
    .map((idProducto) => {
      const producto = productos.find((p) => p.idProducto === parseInt(idProducto));
      return {
        idProducto: producto.idProducto,
        idCategoria: producto.idCategoria,
        unidadesNoVendidas:
          producto.idCategoria === 1 && idOrdenProduccion ? trayQuantities[idProducto] : null, // Solo si es categoría 1 y hay orden
        cantidadVendida:
          !idOrdenProduccion || (idOrdenProduccion &&  producto.idCategoria) ? trayQuantities[idProducto] : null, // Solo si no hay orden
        fechaCreacion: fechaActual,
      };
    });
  
    const payload = {
      encabezadoVenta,
      detalleVenta,
    };

    console.log(payload)
  
    try {
      const resIngrearVenta = await ingresarVentaService(payload);
      setShowSalesSummary(false); // Cerrar el modal después de guardar
      setIsLoading(false);
      navigate("/ventas");
    } catch (error) {
      if(error.status === 422){
        alert("Has ingrsado mas unidades restantes que las producidad en algun producto")
      }
      setIsLoading(false);
      setErrorPopupMessage("Error al guardar la venta. Intente nuevamente.");
      setIsPopupErrorOpen(true);
    }
  };



  return (
    <Container>
      {/* Modal para ingreso de datos para la consulta de ordenes */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        fullscreen
        className="ingresar-venta-modal"
      >
        <Modal.Header className="bg-purple text-white">
          <Modal.Title className="w-100 text-center">
            Selecciona turno y sucursal
          </Modal.Title>
          <Button
            variant="link"
            onClick={() => handleCloseModal(navigate)}
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
                  <Form.Group className="mb-4">
                    <label className="form-label small text-uppercase text-muted fw-bold mb-2">
                      Turno
                    </label>
                    <div className="d-flex flex-column flex-md-row justify-content-center gap-3 ingresar-venta-shift-selector">
                      <Button
                        variant={turnoValue === "AM" ? "primary" : "outline-primary"}
                        className="ingresar-venta-shift-btn shadow w-100 w-md-auto"
                        onClick={() => setValue("turno", "AM")}
                      >
                        🌅 AM
                      </Button>
                      <Button
                        variant={turnoValue === "PM" ? "primary" : "outline-primary"}
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

                  <Form.Group controlId="formSucursal" className="mb-4">
                    <label className="form-label small text-uppercase text-muted fw-bold mb-2">
                      Sucursal
                    </label>
                    {loadingSucursales ? (
                      <div className="loading-spinner">
                        <div className="spinner-border text-primary" role="status" />
                      </div>
                    ) : (
                      <Form.Select
                        {...register("sucursal", { required: true })}
                        className={`ingresar-venta-custom-select shadow w-100 ${errors.sucursal ? "is-invalid" : ""}`}
                      >
                        <option value="">Selecciona una sucursal</option>
                        {sucursales.map((sucursal) => (
                          <option key={sucursal.idSucursal} value={sucursal.idSucursal}>
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
            onClick={() => handleCloseModal(navigate)}
            className="bt-cancelar shadow"
          >
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Encabezado */}
      <div className="text-center mb-">
        <div className="d-flex align-items-center justify-content-center gap-5">
          <button
            className="btn btn-return rounded-circle shadow-sm"
            onClick={() => navigate("/ventas")}
          >
            <BsArrowLeft size={20} />
          </button>
          <Title
            title="Ingresar venta"
            className="gradient-text"
            icon="🍞"
          />
        </div>
      </div>

      {!showModal && !isLoading && (
        <Card className="ingresar-venta-order-header-card mt-1 shadow-lg">
          <Card.Body>
            {/* Botón para modificar datos en la esquina superior derecha */}
            <div className="d-flex justify-content-end">
              <Button
                variant="warning"
                className="modificar-btn"
                onClick={handleModificarDatos}
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
              <Col xs={12} md={6} lg={3}>
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
      )}

      {/* Sección de Productos */}
      {!showModal && !isLoading && (
        <div className="products-section mt-4">
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
            {categorias.map((categoria) => (
              <Button
                key={categoria}
                variant={activeCategory === categoria ? "primary" : "outline-primary"}
                onClick={() => setActiveCategory(categoria)}
                className="category-btn"
              >
                {categoria} (
                {filterProductsByName(ordenYProductos, searchTerm).filter(
                  (p) => p.nombreCategoria === categoria
                ).length}
                )
              </Button>
            ))}
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
                      {producto.nombreCategoria === "Panadería" ? "Unidades no vendidas" : "Unidades"}
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

      {/* Modal de SalesSummary */}
      <SalesSummary
        show={showSalesSummary}
        handleClose={() => setShowSalesSummary(false)}
        orderData={{
          sucursal: sucursalValue,
          turno: turnoValue,
          fechaAProducir: dayjs().format("YYYY-MM-DD"),
          nombrePanadero: usuario.usuario,
        }}
        trayQuantities={trayQuantities}
        productos={productos}
        sucursales={sucursales}
        isLoading={isLoading}
        onConfirm={handleGuardarVenta} // Lógica de guardado aquí
        paymentData={{
          montoTotal: 0, // Aquí puedes calcular el monto total
          metodoPago: "Efectivo", // Método de pago por defecto
          estadoPago: "Pendiente", // Estado de pago por defecto
        }}
      />
    </Container>
  );
};

export default IngresarVentaPage;