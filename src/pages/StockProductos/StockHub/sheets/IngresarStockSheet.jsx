import { useState, useMemo } from "react";
import { Form, Spinner } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import useGetProductosInventario from "../../../../hooks/productosprecios/useGetProductosInventario";
import { getInitials, getUniqueColor, handleStockChange, handleSubmitGuardarStock } from "../../IngresarStock/IngresarStock.utils";
import "./Sheets.css";

/**
 * Formulario de ingreso de stock, vive dentro del BottomSheet del hub.
 * Reutiliza la misma lógica de guardado que IngresarStockGeneralPage
 * (handleSubmitGuardarStock), solo cambia la presentación para caber
 * en un panel deslizante en vez de una página completa.
 */
const IngresarStockSheet = ({ idSucursal, onSuccess }) => {
  const { productos, loadigProducts, showErrorProductos } = useGetProductosInventario();
  const [stockValues, setStockValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const productosFiltrados = useMemo(() => {
    if (!searchTerm) return productos;
    return productos?.filter((p) => p.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [productos, searchTerm]);

  const hasValues = Object.values(stockValues).some((val) => val !== null && !isNaN(val) && val !== "");

  const handleSubmit = async () => {
    setErrorMessage("");
    await handleSubmitGuardarStock(
      stockValues,
      productos,
      idSucursal,
      setIsLoading,
      () => onSuccess(),
      setStockValues,
      setErrorMessage,
      () => {},
      () => {}
    );
  };

  if (loadigProducts) {
    return (
      <div className="sheet-loading">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return (
    <div className="sheet-form">
      {showErrorProductos && <p className="sheet-error">Error al cargar los productos</p>}
      {errorMessage && <p className="sheet-error">{errorMessage}</p>}

      <div className="sheet-search">
        <FaSearch className="sheet-search-icon" />
        <Form.Control
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sheet-search-input"
        />
      </div>

      <div className="sheet-product-list">
        {productosFiltrados?.map((producto) => (
          <div key={producto.idProducto} className="sheet-product-row">
            <div
              className="sheet-product-badge"
              style={{ backgroundColor: getUniqueColor(producto.nombreProducto) }}
            >
              {getInitials(producto.nombreProducto)}
            </div>
            <span className="sheet-product-name">{producto.nombreProducto}</span>
            <Form.Control
              type="number"
              min="0"
              value={stockValues[producto.idProducto] || ""}
              onChange={(e) => handleStockChange(producto.idProducto, e.target.value, setStockValues)}
              className="sheet-qty-input"
              placeholder="0"
              onWheel={(e) => e.target.blur()}
            />
          </div>
        ))}
      </div>

      <button className="sheet-submit-btn sheet-submit-btn--green" onClick={handleSubmit} disabled={isLoading || !hasValues}>
        {isLoading ? <Spinner animation="border" size="sm" /> : "Guardar ingreso"}
      </button>
    </div>
  );
};

export default IngresarStockSheet;
