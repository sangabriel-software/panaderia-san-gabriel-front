import { useState, useEffect, useMemo } from "react";
import { Container, Table, Button, Form, Spinner, Dropdown, Row, Col } from "react-bootstrap";
import DotsMove from "../../../components/Spinners/DotsMove";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import { BsArrowLeft, BsExclamationTriangleFill, BsFillInfoCircleFill } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "../../../components/Alerts/Alert";
import Title from "../../../components/Title/Title";
import { getInitials } from "../../PedidosProdPage/IngresarOrdenProd/IngresarOrdenProdUtils";
import { getUniqueColor } from "../../../utils/utils";
import "./OrdenEspecialDetalle.css";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import dayjs from "dayjs";
import { actualizarOrdenEspecialService } from "../../../services/ordenesEspeciales/ordenesEspeciales.service";
import { FiEdit, FiSave, FiX } from "react-icons/fi";
import useGetOrdenEDetalle from "../../../hooks/orenesEspeciales/useGetOrenEDetalle";

const OrdenEspecialDetail = () => {
  const { idOrdenEspecial } = useParams();
  const navigate = useNavigate();
  
  // Custom hook para cargar los datos de la orden
  const { 
    detalleOrdenEspecial, 
    loadingDetalleOrdenEspecial, 
    showErrorDetalleOrdenEspecial,
    errorMessage: errorDetalleMessage,
    setDetalleOrdenEspecial
  } = useGetOrdenEDetalle(idOrdenEspecial);

  // Hooks para productos y sucursales
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  
  // Estados locales
  const [cantidadValues, setCantidadValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para popups
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");

  // Efecto para inicializar las cantidades de productos cuando se cargan los datos
  useEffect(() => {
    if (detalleOrdenEspecial?.ordenDetalle && productos) {
      const cantidades = {};
      detalleOrdenEspecial.ordenDetalle.forEach(producto => {
        cantidades[producto.idProducto] = producto.cantidadUnidades;
      });
      setCantidadValues(cantidades);
    }
  }, [detalleOrdenEspecial, productos]);

  // Obtener categorías únicas de productos
  const categorias = useMemo(() => {
    return [...new Set(productos?.map((item) => item.nombreCategoria) || [])];
  }, [productos]);

  // Filtrar productos según categoría y término de búsqueda
  const productosFiltrados = useMemo(() => {
    let filtered = categoriaActiva === "Todas" 
      ? productos
      : productos?.filter((item) => item.nombreCategoria === categoriaActiva);

    if (searchTerm) {
      filtered = filtered?.filter((producto) =>
        producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered = filtered?.filter((producto) => (cantidadValues[producto.idProducto] || 0) > 0);

    return filtered || [];
  }, [productos, categoriaActiva, searchTerm]);

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Manejar cambio en cantidad de productos
  const handleCantidadChange = (idProducto, value) => {
    setCantidadValues(prev => ({
      ...prev,
      [idProducto]: value === "" ? "" : parseInt(value)
    }));
  };

  // Función para cancelar la edición y resetear los filtros
  const handleCancelEdit = () => {
    setIsEditing(false);
    setCategoriaActiva("Todas"); // Resetear categoría a "Todas"
    setSearchTerm(""); // Limpiar búsqueda
  };

  // Enviar datos actualizados al servidor
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Validaciones
      if (!detalleOrdenEspecial?.ordenEncabezado?.nombreCliente?.trim()) {
        throw new Error("El nombre del cliente es requerido");
      }
      
      if (!detalleOrdenEspecial?.ordenEncabezado?.telefonoCliente?.trim()) {
        throw new Error("El teléfono del cliente es requerido");
      }
      
      if (!detalleOrdenEspecial?.ordenEncabezado?.idSucursal) {
        throw new Error("Debe seleccionar una sucursal de entrega");
      }
      
      if (!detalleOrdenEspecial?.ordenEncabezado?.fechaEntrega) {
        throw new Error("La fecha de entrega es requerida");
      }
      
      // Preparar productos seleccionados
      const productosSeleccionados = Object.entries(cantidadValues)
        .filter(([_, cantidad]) => cantidad > 0)
        .map(([idProducto, cantidad]) => ({
          idProducto: parseInt(idProducto),
          cantidadUnidades: cantidad,
          nombreProducto: productos.find(p => p.idProducto === parseInt(idProducto))?.nombreProducto || "",
          precioUnitario: productos.find(p => p.idProducto === parseInt(idProducto))?.precioVenta || 0
        }));
      
      if (productosSeleccionados.length === 0) {
        throw new Error("Debe seleccionar al menos un producto");
      }
      
      // Crear payload para actualización
      const payload = {
        ordenEncabezado: {
          idOrdenEspecial: parseInt(idOrdenEspecial),
          nombreCliente: detalleOrdenEspecial.ordenEncabezado.nombreCliente.trim(),
          telefonoCliente: detalleOrdenEspecial.ordenEncabezado.telefonoCliente.trim(),
          idSucursal: detalleOrdenEspecial.ordenEncabezado.idSucursal,
          fechaEntrega: dayjs(detalleOrdenEspecial.ordenEncabezado.fechaEntrega).format("YYYY-MM-DD"),
          fechaAProducir: dayjs(detalleOrdenEspecial.ordenEncabezado.fechaEntrega).format("YYYY-MM-DD"),
          idUsuario: 1
        },
        ordenDetalle: productosSeleccionados
      };
      
      // Enviar a la API
      await actualizarOrdenEspecialService(payload);
      
      // Actualizar el estado local con los cambios
      setDetalleOrdenEspecial({
        ...detalleOrdenEspecial,
        ordenDetalle: productosSeleccionados
      });
      
      setIsPopupOpen(true);
      setIsEditing(false);
      setCategoriaActiva("Todas"); // Resetear categoría después de guardar
      setSearchTerm(""); // Limpiar búsqueda después de guardar
    } catch (error) {
      setErrorPopupMessage(error.message);
      setIsPopupErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar spinner mientras se cargan los datos
  if (loadigProducts || loadingSucursales || loadingDetalleOrdenEspecial || isLoading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <DotsMove />
      </Container>
    );
  }

  // Mostrar error si falla la carga de la orden
  if (showErrorDetalleOrdenEspecial) {
    return (
      <Container className="my-4">
        <Alert type="danger" message={errorDetalleMessage} icon={<BsExclamationTriangleFill />} />
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-3">
          Volver
        </Button>
      </Container>
    );
  }

  // Mostrar mensaje si no se encuentra la orden
  if (!detalleOrdenEspecial) {
    return (
      <Container className="my-4">
        <Alert type="info" message="No se encontró la orden especial" icon={<BsFillInfoCircleFill />} />
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-3">
          Volver
        </Button>
      </Container>
    );
  }

  // Obtener la sucursal seleccionada para mostrar su nombre
  const sucursalSeleccionada = sucursales.find(s => s.idSucursal === detalleOrdenEspecial.ordenEncabezado.idSucursal);

  return (
    <Container className="my-4">
      {/* Alertas de error para productos y sucursales */}
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
            <Title title={`Orden Especial #${idOrdenEspecial}`} />
          </div>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="card card-info-cliente p-4 mb-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5>Información del Cliente</h5>
          {!isEditing ? (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              <FiEdit className="me-2" /> Modificar
            </Button>
          ) : (
            <div>
              <Button variant="success" onClick={handleSubmit} disabled={isLoading} className="me-2">
                {isLoading ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FiSave className="me-2" />
                )}
                Guardar Cambios
              </Button>
              <Button variant="secondary" onClick={handleCancelEdit}>
                <FiX className="me-2" /> Cancelar
              </Button>
            </div>
          )}
        </div>
        
        <Row>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Nombre del Cliente *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre completo"
                value={detalleOrdenEspecial.ordenEncabezado.nombreCliente || ""}
                onChange={(e) => setDetalleOrdenEspecial({
                  ...detalleOrdenEspecial,
                  ordenEncabezado: {
                    ...detalleOrdenEspecial.ordenEncabezado,
                    nombreCliente: e.target.value
                  }
                })}
                readOnly={!isEditing}
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Teléfono de la orden *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el número de teléfono"
                value={detalleOrdenEspecial.ordenEncabezado.telefonoCliente || ""}
                onChange={(e) => setDetalleOrdenEspecial({
                  ...detalleOrdenEspecial,
                  ordenEncabezado: {
                    ...detalleOrdenEspecial.ordenEncabezado,
                    telefonoCliente: e.target.value
                  }
                })}
                readOnly={!isEditing}
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Fecha de Entrega *</Form.Label>
              <Form.Control
                type="date"
                value={dayjs(detalleOrdenEspecial.ordenEncabezado.fechaEntrega).format("YYYY-MM-DD") || ""}
                onChange={(e) => setDetalleOrdenEspecial({
                  ...detalleOrdenEspecial,
                  ordenEncabezado: {
                    ...detalleOrdenEspecial.ordenEncabezado,
                    fechaEntrega: e.target.value
                  }
                })}
                min={dayjs().format("YYYY-MM-DD")}
                disabled={!isEditing}
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Sucursal de Entrega *</Form.Label>
              <Dropdown>
                <Dropdown.Toggle 
                  variant="light" 
                  className="w-100 text-start dropdown-toggle-custom" 
                  style={{ border: "1px solid #e2e8f0" }}
                  disabled={!isEditing}
                >
                  {sucursalSeleccionada ? `${sucursalSeleccionada.nombreSucursal} - ${sucursalSeleccionada.municipioSucursal}` : "Seleccione una sucursal"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100 dropdown-menu-custom">
                  {sucursales?.map((sucursal) => (
                    <Dropdown.Item 
                    className="dropdown-item-custom"
                      key={sucursal.idSucursal}
                      onClick={() => setDetalleOrdenEspecial({
                        ...detalleOrdenEspecial,
                        ordenEncabezado: {
                          ...detalleOrdenEspecial.ordenEncabezado,
                          idSucursal: sucursal.idSucursal,
                          sucursalEntrega: sucursal.nombreSucursal
                        }
                      })}
                      active={detalleOrdenEspecial.ordenEncabezado.idSucursal === sucursal.idSucursal}
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

      {/* Filtros de productos (solo en modo edición) */}
      {isEditing && (
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
      )}

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
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((producto) => (
                <tr key={producto.idProducto}>
                  <td>
                    <div className="product-info">
                      <div
                        className="product-badge-stock"
                        style={{
                          backgroundColor: getUniqueColor(producto.nombreProducto),
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
                      readOnly={!isEditing}
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

      {/* Popup de éxito */}
      <SuccessPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          navigate(`/pedido-especial/detalle/${idOrdenEspecial}`);
        }}
        title="¡Éxito!"
        message="La orden especial ha sido actualizada correctamente"
        nombreBotonVolver="Ver Detalle"
        nombreBotonNuevo="Volver al Listado"
        onView={() => setIsPopupOpen(false)}
        onNew={() => navigate(`/pedido-especial`)}
      />

      {/* Popup de error */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />
    </Container>
  );
};

export default OrdenEspecialDetail;