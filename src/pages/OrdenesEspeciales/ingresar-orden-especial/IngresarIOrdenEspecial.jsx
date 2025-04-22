import { useState, useMemo } from "react";
import { Container, Table, Button, Form, Spinner, Dropdown, Row, Col } from "react-bootstrap";
import DotsMove from "../../../components/Spinners/DotsMove";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import { BsArrowLeft, BsExclamationTriangleFill, BsFillInfoCircleFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Alert from "../../../components/Alerts/Alert";
import Title from "../../../components/Title/Title";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getInitials } from "../../PedidosProdPage/IngresarOrdenProd/IngresarOrdenProdUtils";
import { getUniqueColor } from "../../../utils/utils";
import "./IngresarOrdenEspecial.styles.css";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import dayjs from "dayjs";
import { ingresarOrdenEspecialService } from "../../../services/ordenesEspeciales/ordenesEspeciales.service";

const IngresarOrdenEspecialPage = () => {
  const navigate = useNavigate();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const [cantidadValues, setCantidadValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  
  // Datos del cliente y fechas
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState(new Date());
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  
  /* Popups */
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");

  const prodPorHarina = productos?.filter((item) => item.tipoProduccion !== "bandejas");
  const categorias = [...new Set(productos?.map((item) => item.nombreCategoria) || [])];

  const productosFiltrados = useMemo(() => {
    let filtered = categoriaActiva === "Todas" 
      ? prodPorHarina 
      : prodPorHarina?.filter((item) => item.nombreCategoria === categoriaActiva);

    if (searchTerm) {
      filtered = filtered?.filter((producto) =>
        producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [prodPorHarina, categoriaActiva, searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleCantidadChange = (idProducto, value) => {
    setCantidadValues(prev => ({
      ...prev,
      [idProducto]: value === "" ? "" : parseInt(value)
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Validaciones
      if (!nombreCliente.trim()) {
        throw new Error("El nombre del cliente es requerido");
      }
      
      if (!telefonoCliente.trim()) {
        throw new Error("El teléfono del cliente es requerido");
      }
      
      if (!sucursalSeleccionada) {
        throw new Error("Debe seleccionar una sucursal de entrega");
      }
      
      const productosSeleccionados = Object.entries(cantidadValues)
        .filter(([_, cantidad]) => cantidad > 0)
        .map(([idProducto, cantidadUnidades]) => ({
          idProducto: parseInt(idProducto),
          cantidadUnidades,
          fechaCreacion: dayjs().format("YYYY-MM-DD")
        }));
      
      if (productosSeleccionados.length === 0) {
        throw new Error("Debe seleccionar al menos un producto");
      }
      
      // Crear payload
      const payload = {
        ordenEncabezado: {
          idSucursal: sucursalSeleccionada.idSucursal,
          idUsuario: 1, // Usuario por defecto
          nombreCliente: nombreCliente.trim(),
          telefonoCliente: telefonoCliente.trim(),
          fechaEntrega: dayjs(fechaEntrega).format("YYYY-MM-DD"),
          fechaAProducir: dayjs(fechaEntrega).format("YYYY-MM-DD"), // Misma que fechaEntrega
          fechaCreacion: dayjs().format("YYYY-MM-DD")
        },
        ordenDetalle: productosSeleccionados
      };
      
      // Enviar a la API
      await ingresarOrdenEspecialService(payload);
      
      setIsPopupOpen(true);
      setCantidadValues({});
    } catch (error) {
      setErrorPopupMessage(error.message);
      setIsPopupErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadigProducts || loadingSucursales) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <DotsMove />
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {/* Alerta de error */}
      {showErrorProductos && productosFiltrados?.length === 0 && (
        <div className="row justify-content-center my-2">
          <div className="col-md-6 text-center">
            <Alert
              type="danger"
              message="Error al cargar los productos"
              icon={<BsExclamationTriangleFill />}
            />
          </div>
        </div>
      )}

      {showErrorSucursales && (
        <div className="row justify-content-center my-2">
          <div className="col-md-6 text-center">
            <Alert
              type="danger"
              message="Error al cargar las sucursales"
              icon={<BsExclamationTriangleFill />}
            />
          </div>
        </div>
      )}

      {/* Encabezado */}
      <div className="text-center">
        <div className="row">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate(-1)}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <Title title="Crear Orden Especial" />
          </div>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="card p-4 mb-4 shadow-sm">
        <h5 className="mb-4">Información del Cliente</h5>
        <Row>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Nombre del Cliente *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre completo"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Teléfono del Cliente *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el número de teléfono"
                value={telefonoCliente}
                onChange={(e) => setTelefonoCliente(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Fecha de Entrega *</Form.Label>
              <DatePicker
                selected={fechaEntrega}
                onChange={(date) => setFechaEntrega(date)}
                minDate={new Date()}
                className="form-control"
                dateFormat="dd/MM/yyyy"
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Sucursal de Entrega *</Form.Label>
              <Dropdown>
                <Dropdown.Toggle variant="light" className="w-100 text-start" style={{ border: "1px solid #ced4da" }}>
                  {sucursalSeleccionada ? sucursalSeleccionada.nombreSucursal : "Seleccione una sucursal"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  {sucursales?.map((sucursal) => (
                    <Dropdown.Item 
                      key={sucursal.idSucursal}
                      onClick={() => setSucursalSeleccionada(sucursal)}
                      active={sucursalSeleccionada?.idSucursal === sucursal.idSucursal}
                    >
                      {sucursal.nombreSucursal} - {sucursal.municipioSucursal}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* Filtros */}
      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4 my-3">
        <div className="flex-grow-1">
          <h6 className="mb-3">Buscar producto:</h6>
          <div className="position-relative">
            <Form.Control
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="btn btn-clear-search position-absolute end-0 top-50 translate-middle-y"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        <div>
          <h6 className="mb-3">Filtrar por categoría:</h6>
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-categorias">
              {categoriaActiva === "Todas"
                ? "Todas las categorías"
                : categoriaActiva}
            </Dropdown.Toggle>
            <Dropdown.Menu className="category-dropdown-menu">
              <Dropdown.Item
                active={categoriaActiva === "Todas"}
                onClick={() => setCategoriaActiva("Todas")}
              >
                Todas
              </Dropdown.Item>
              {categorias.map((categoria) => (
                <Dropdown.Item
                  className="category-dropdown-item"
                  key={categoria}
                  active={categoriaActiva === categoria}
                  onClick={() => setCategoriaActiva(categoria)}
                >
                  {categoria}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="table-responsive excel-table-container mb-4">
        <Table striped bordered hover className="excel-table">
          <thead>
            <tr>
              <th className="dark-header text-center" style={{ width: "60%" }}>
                Producto
              </th>
              <th className="dark-header text-center" style={{ width: "40%" }}>
                Cantidad Requerida
              </th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados?.length > 0 ? (
              productosFiltrados.map((producto) => (
                <tr key={producto.idProducto}>
                  <td>
                    <div className="product-info">
                      <div
                        className="product-badge-stock"
                        style={{
                          backgroundColor: getUniqueColor(
                            producto.nombreProducto
                          ),
                        }}
                      >
                        {getInitials(producto.nombreProducto)}
                      </div>
                      <span className="product-name">
                        {producto.nombreProducto}
                      </span>
                    </div>
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="number"
                      min="0"
                      value={cantidadValues[producto.idProducto] || ""}
                      onChange={(e) =>
                        handleCantidadChange(producto.idProducto, e.target.value)
                      }
                      className="quantity-input"
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center py-4">
                  No hay productos disponibles en esta categoría
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Botón de guardar */}
      <div className="text-center">
        <Button
          className="btn-guardar-stock"
          size="lg"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            Object.values(cantidadValues).every(
              (val) => val === null || isNaN(val) || val <= 0
            ) ||
            !nombreCliente.trim() ||
            !telefonoCliente.trim() ||
            !sucursalSeleccionada
          }
        >
          {isLoading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Crear Orden Especial"
          )}
        </Button>
      </div>

      {productos.length === 0 && (
        <div className="row justify-content-center my-3">
          <div className="col-md-6 text-center">
            <Alert
              type="primary"
              message="No se han ingresado Productos."
              icon={<BsFillInfoCircleFill />}
            />
          </div>
        </div>
      )}

      {/* Popup de Éxito */}
      <SuccessPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="¡Éxito!"
        message="La orden especial ha sido creada correctamente"
        nombreBotonVolver="Ver Órdenes"
        nombreBotonNuevo="Crear otra"
        onView={() => navigate(`/ordenes-especiales`)}
        onNew={() => {
          setIsPopupOpen(false);
          setNombreCliente("");
          setTelefonoCliente("");
          setCantidadValues({});
          setSucursalSeleccionada(null);
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

export default IngresarOrdenEspecialPage;