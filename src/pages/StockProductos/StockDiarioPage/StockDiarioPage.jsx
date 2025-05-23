import { useNavigate, useParams } from "react-router";
import useGetStockDelDia from "../../../hooks/stock/useGetStockDelDia";
import { BsArrowLeft, BsX, BsArrowUp } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { Container, Spinner, Alert, Form, Table, Dropdown, Button } from "react-bootstrap";
import "./StockDiarioPage.styles.css";
import { FaStore, FaCalendarAlt, FaBoxOpen, FaSearch, FaPlus } from "react-icons/fa";
import DotsMove from "../../../components/Spinners/DotsMove";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import { useState, useMemo, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { getInitials, getUniqueColor } from "../IngresarStock/IngresarStock.utils";

const StockDiarioPage = () => {
  const { idSucursal } = useParams();
  const { stockDelDia, loadingStockDiario } = useGetStockDelDia(idSucursal);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");

  // Función para manejar el click en Ingresar Stock
  const handleIngresarStock = () => {
    navigate(`/stock-productos/ingresar-stock/${encodeURIComponent(idSucursal)}`);
  };

  // Detectar dispositivos
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });
  const isDesktop = useMediaQuery({ minWidth: 992 });

  // Obtener categorías únicas (mantenido para posible uso futuro)
  const categorias = useMemo(() => {
    if (!Array.isArray(stockDelDia)) return [];
    return ['Todas', ...new Set(stockDelDia.map(item => item.nombreCategoria))];
  }, [stockDelDia]);

  // Efecto para mostrar/ocultar el botón de scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Resto del código existente sin cambios...
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const isArray = Array.isArray(stockDelDia);
  const isEmptyStock = useMemo(() => {
    return (
      !isArray ||
      stockDelDia.length === 0 ||
      (stockDelDia.length === 1 && stockDelDia[0].idStockDiario === 0)
    );
  }, [isArray, stockDelDia]);

  const sucursalData = useMemo(() => {
    return isArray && stockDelDia.length > 0 ? stockDelDia[0] : {};
  }, [isArray, stockDelDia]);

  const fechaValidez = useMemo(() => {
    return sucursalData?.fechaValidez || "";
  }, [sucursalData]);

  const filteredProducts = useMemo(() => {
    if (!isArray) return [];
    
    let filtered = stockDelDia.filter((producto) => {
      const matchesSearch = producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoriaActiva === "Todas" || producto.nombreCategoria === categoriaActiva;
      return matchesSearch && matchesCategory;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [stockDelDia, searchTerm, isArray, sortConfig, categoriaActiva]);

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  if (loadingStockDiario) {
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
    <Container className="stock-diario-container">
      {/* ---------------- Titulo ----------------- */}
      <div className="text-center mb-3">
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
              title={`Stock Diario ${sucursalData.nombreSucursal || " "}`}
              description={`Productos disponibles para hoy - ${formatDateToDisplay(
                fechaValidez
              )}`}
            />
          </div>
        </div>
      </div>

      {/* Filtros con nuevo botón */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
        {/* Nuevo botón Ingresar Stock */}
        <Button 
          variant="success" 
          onClick={handleIngresarStock}
          className="d-flex align-items-center gap-2 me-md-3"
        >
          <FaPlus /> Ingresar Stock
        </Button>

        {/* Barra de búsqueda */}
        <div className="flex-grow-1" style={{ minWidth: "300px", maxWidth: "500px" }}>
          <div className="position-relative">
            <Form.Control
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="stock-diario-search-input"
              style={{ paddingRight: "2.5rem" }}
            />
            <FaSearch className="stock-diario-search-icon" />
            {searchTerm && (
              <BsX
                className="stock-diario-clear-icon"
                onClick={handleClearSearch}
              />
            )}
          </div>
        </div>

        {/* Dropdown de categorías (mantenido comentado) */}
        {/* <div style={{ minWidth: "250px" }}>
          <Dropdown>
            <Dropdown.Toggle 
              variant="primary" 
              id="dropdown-categorias" 
              className="stock-diario-category-dropdown w-100"
            >
              {categoriaActiva === "Todas" ? "Todas las categorías" : categoriaActiva}
            </Dropdown.Toggle>
            <Dropdown.Menu className="stock-diario-category-dropdown-menu w-100">
              <Dropdown.Item 
                active={categoriaActiva === "Todas"}
                onClick={() => setCategoriaActiva("Todas")}
                className="stock-diario-category-dropdown-item"
              >
                Todas
              </Dropdown.Item>
              {categorias.filter(cat => cat !== "Todas").map((categoria) => (
                <Dropdown.Item
                  key={categoria}
                  active={categoriaActiva === categoria}
                  onClick={() => setCategoriaActiva(categoria)}
                  className="stock-diario-category-dropdown-item"
                >
                  {categoria}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div> */}
      </div>

      {/* Contenido de la tabla (sin cambios) */}
      {isEmptyStock ? (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <Alert variant="info" className="stock-diario-empty-alert">
              <FaBoxOpen className="me-2" />
              No hay productos en el stock.
            </Alert>
          </div>
        </div>
      ) : (
        <div className="table-responsive excel-like-table-container">
          <Table striped bordered hover className="excel-like-table">
            <thead>
              <tr>
                <th
                  onClick={() => requestSort("nombreProducto")}
                  className="sortable-header dark-header text-center align-middle"
                >
                  <div className="header-content">
                    Producto
                    {sortConfig.key === "nombreProducto" && (
                      <BsArrowUp
                        className={`sort-icon ${
                          sortConfig.direction === "descending"
                            ? "descending"
                            : ""
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => requestSort("cantidadExistente")}
                  className="sortable-header dark-header text-center align-middle"
                >
                  <div className="header-content">
                    Cantidad
                    {sortConfig.key === "cantidadExistente" && (
                      <BsArrowUp
                        className={`sort-icon ${
                          sortConfig.direction === "descending"
                            ? "descending"
                            : ""
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th className="dark-header text-center align-middle">
                  Cantidad en
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((producto) => (
                  <tr key={producto.idStockDiario}>
                    <td className="prduct-cell">
                      <div className="product-info">
                        <div
                          className="product-badge-diario"
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
                    <td style={{ fontWeight: "bold", color: "#6B228B" }} className="quantity-cell-diario text-center align-middle fw-bold product-quantity-diario">
                      {producto.nombreProducto === "Frances"
                        ? producto.cantidadExistente / 6
                        : producto.cantidadExistente}
                    </td>
                    <td className="text-center align-middle" style={{ fontWeight: "bold", color: "#343A40" }}>
                      {producto.nombreProducto === "Frances"
                        ? "Filas"
                        : "Unidades"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 align-middle">
                    No se encontraron productos con ese nombre en esta categoría.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Botón de scroll para móviles (sin cambios) */}
      {isMobile && showScrollButton && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          aria-label="Volver arriba"
        >
          <BsArrowUp size={24} />
        </button>
      )}
    </Container>
  );
};

export default StockDiarioPage;