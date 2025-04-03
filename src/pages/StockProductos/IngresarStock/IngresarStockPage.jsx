import { useState, useMemo } from "react";
import { Container, Table, Button, Form, Spinner, Dropdown } from "react-bootstrap";
import DotsMove from "../../../components/Spinners/DotsMove";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import "./IngresarStockPage.styles.css";
import { getInitials, getUniqueColor } from "./IngresarStock.utils";
import { BsArrowLeft, BsExclamationTriangleFill } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "../../../components/Alerts/Alert";
import Title from "../../../components/Title/Title";
import { getUserData } from "../../../utils/Auth/decodedata";
import { decryptId } from "../../../utils/CryptoParams";

const IngresarStockGeneralPage = () => {
  const usuario = getUserData();
  const { idSucursal } = useParams();
  const navigate = useNavigate();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const [stockValues, setStockValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  const prodPorHarina = productos?.filter((item) => item.tipoProduccion !== "bandejas");
  const categorias = [...new Set(productos?.map((item) => item.nombreCategoria) || [])];

  const productosFiltrados = useMemo(() => {
    let filtered = categoriaActiva === "Todas"
      ? prodPorHarina
      : prodPorHarina?.filter(item => item.nombreCategoria === categoriaActiva);

    if (searchTerm) {
      filtered = filtered?.filter(producto =>
        producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [prodPorHarina, categoriaActiva, searchTerm]);

  const handleStockChange = (idProducto, value) => {
    setStockValues((prev) => ({
      ...prev,
      [idProducto]: value ? parseInt(value) : null,
    }));
  };

  const handleSubmit = () => {
    setIsLoading(true);
    
    // Crear payload con todos los campos requeridos
    const payload = Object.entries(stockValues)
      .filter(([_, value]) => value !== null && !isNaN(value))
      .map(([idProducto, cantidad]) => {
        const producto = productosFiltrados.find(p => p.idProducto === parseInt(idProducto));
        
        return {
          idUsuario: usuario.idUsuario,
          idProducto: parseInt(idProducto),
          idSucursal: Number(decryptId(decodeURIComponent(idSucursal))),
          stock: cantidad,
          tipoProduccion: producto?.tipoProduccion || '',
          controlarStock: producto?.controlarStock || 0,
          controlarStockDiario: producto?.controlarStockDiario || 0,
        };
      });

    console.log("Payload completo a enviar:", payload);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      // Aquí iría la llamada a tu API para guardar los datos
      // api.guardarStock(payload).then(() => {...});
    }, 1500);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loadigProducts) {
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
    <Container className="">
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

      {/* Encabezado */}
      <div className="text-center">
        <div className="row">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/stock-productos")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <Title title="Inventario" />
          </div>
        </div>
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
              {categoriaActiva === "Todas" ? "Todas las categorías" : categoriaActiva}
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
              <th className="dark-header text-center" style={{ width: "60%" }}>Producto</th>
              <th className="dark-header text-center" style={{ width: "40%" }}>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados?.length > 0 ? (
              productosFiltrados.map((producto) => (
                <tr key={producto.idProducto}>
                  <td>
                    <div className="product-info">
                      <div
                        className="product-badge"
                        style={{ backgroundColor: getUniqueColor(producto.nombreProducto) }}
                      >
                        {getInitials(producto.nombreProducto)}
                      </div>
                      <span className="product-name">{producto.nombreProducto}</span>
                    </div>
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="number"
                      min="0"
                      value={stockValues[producto.idProducto] || ""}
                      onChange={(e) => handleStockChange(producto.idProducto, e.target.value)}
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
            Object.values(stockValues).every((val) => val === null || isNaN(val))
          }
        >
          {isLoading ? <Spinner animation="border" size="sm" /> : "Guardar Stock"}
        </Button>
      </div>

      {/* Popup de éxito */}
      {/* <SuccessPopup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="¡Éxito!"
        message="El stock se ha guardado correctamente"
      /> */}
    </Container>
  );
};

export default IngresarStockGeneralPage;