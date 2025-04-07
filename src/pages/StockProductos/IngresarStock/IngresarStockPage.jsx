import { useState, useMemo } from "react";
import { Container, Table, Button, Form, Spinner, Dropdown, } from "react-bootstrap";
import DotsMove from "../../../components/Spinners/DotsMove";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import "./IngresarStockPage.styles.css";
import { getInitials, getUniqueColor, handleStockChange, handleSubmitGuardarStock } from "./IngresarStock.utils";
import { BsArrowLeft, BsExclamationTriangleFill, BsFillInfoCircleFill, } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "../../../components/Alerts/Alert";
import Title from "../../../components/Title/Title";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { decryptId } from "../../../utils/CryptoParams";

const IngresarStockGeneralPage = () => {
  const { idSucursal } = useParams();
  const navigate = useNavigate();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const { sucursales, loadingSucursales } = useGetSucursales();
  const [stockValues, setStockValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  /* Popups */
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");

    const decryptedIdSucursal = decryptId(decodeURIComponent(idSucursal));
    const sucursal = sucursales?.find(item => 
      Number(item.idSucursal) === Number(decryptedIdSucursal)
    );

  const prodPorHarina = productos?.filter((item) => item.tipoProduccion !== "bandejas");
  const categorias = [ ...new Set(productos?.map((item) => item.nombreCategoria) || []),];

  const productosFiltrados = useMemo(() => {
    let filtered = categoriaActiva === "Todas" ? prodPorHarina: prodPorHarina?.filter(
            (item) => item.nombreCategoria === categoriaActiva
          );

    if (searchTerm) {
      filtered = filtered?.filter((producto) =>
        producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [prodPorHarina, categoriaActiva, searchTerm]);


  /* Guardar Stock */
  const handleSubmit = async () => {
    await handleSubmitGuardarStock(stockValues, productos, idSucursal, setIsLoading, setIsPopupOpen, setStockValues, setErrorPopupMessage, setIsPopupErrorOpen);
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
            <Title
             title={`Inventario ${sucursal.nombreSucursal}`}
             />
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
                Cantidad de Unidades
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
                      value={stockValues[producto.idProducto] || ""}
                      onChange={(e) =>
                        handleStockChange(producto.idProducto, e.target.value, setStockValues)
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
            Object.values(stockValues).every(
              (val) => val === null || isNaN(val)
            )
          }
        >
          {isLoading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Guardar Stock"
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
        message="Se agrego el stock de productos"
        nombreBotonVolver="Ver Stock"
        nombreBotonNuevo="Ingreso nuevo"
        onView={() => navigate(`/stock-productos`)}
        onNew={() => {
          setIsPopupOpen(false);
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

export default IngresarStockGeneralPage;
