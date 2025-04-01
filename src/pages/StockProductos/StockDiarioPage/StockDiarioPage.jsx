import { useNavigate, useParams } from "react-router";
import useGetStockDelDia from "../../../hooks/stock/useGetStockDelDia";
import { BsArrowLeft, BsX } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { Container, Spinner, Alert, Form } from "react-bootstrap";
import "./StockDiarioPage.styles.css";
import { FaStore, FaCalendarAlt, FaBoxOpen, FaSearch } from "react-icons/fa";
import DotsMove from "../../../components/Spinners/DotsMove";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import { useState, useMemo, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

const StockDiarioPage = () => {
  const { idSucursal } = useParams();
  const { stockDelDia, loadingStockDiario } = useGetStockDelDia(idSucursal);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Detectar dispositivos
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });
  const isDesktop = useMediaQuery({ minWidth: 992 });

  // Efecto para mostrar/ocultar el botón de scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función para volver al inicio
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
    return stockDelDia.filter((producto) =>
      producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stockDelDia, searchTerm, isArray]);

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

      {/* Barra de búsqueda */}
      {!isEmptyStock && (
        <div className="mb-4">
          <div
            className="position-relative"
            style={{ maxWidth: "500px", margin: "0 auto" }}
          >
            <Form.Control
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="stock-diario-search-input"
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
      )}

      {/* Contenido condicional */}
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
        <div className="stock-diario-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((producto) => (
              <div key={producto.idStockDiario} className="stock-diario-card">
                <h3 className="stock-diario-product-name">
                  {producto.nombreProducto}
                </h3>
                <div className="stock-diario-quantity-container">
                  <span className="stock-diario-quantity">
                    {producto.cantidadExistente}
                  </span>
                  <span className="stock-diario-quantity-label">
                    unidades disponibles
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="w-100 d-flex justify-content-center">
              <div className="no-products-message">
                No se encontraron productos con ese nombre.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botón de scroll para móviles */}
      {isMobile && showScrollButton && (
        <button 
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          aria-label="Volver arriba"
        >
          <BsArrowLeft size={24} />
        </button>
      )}
    </Container>
  );
};

export default StockDiarioPage;