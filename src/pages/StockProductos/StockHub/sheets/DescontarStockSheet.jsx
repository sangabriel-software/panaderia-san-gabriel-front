import { useState, useMemo } from "react";
import { Form, Spinner } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { getInitials, getUniqueColor } from "../../IngresarStock/IngresarStock.utils";
import { getUserData } from "../../../../utils/Auth/decodedata";
// TODO: reemplazar por el nombre real del servicio que crea un descuento.
// Debería vivir junto a cancelarDescuentoStockServices en:
// ../../../../services/descuentoDeStock/descuentoDeStock.service.js
import { descontarStockService } from "../../../../services/descuentoDeStock/descuentoDeStock.service";
import "./Sheets.css";

const TIPOS_DESCUENTO = ["MAYOREO", "MAL ESTADO"];

const DescontarStockSheet = ({ idSucursal, productos, onSuccess }) => {
  const usuario = getUserData();
  const [searchTerm, setSearchTerm] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [tipoDescuento, setTipoDescuento] = useState("MAYOREO");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const productosFiltrados = useMemo(() => {
    if (!searchTerm) return productos;
    return productos?.filter((p) => p.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [productos, searchTerm]);

  const cantidadValida = Number(cantidad) > 0;
  const stockDisponible = productoSeleccionado ? Number(productoSeleccionado.cantidadExistente) : 0;
  const excedeStock = cantidadValida && Number(cantidad) > stockDisponible;

  const puedeGuardar = productoSeleccionado && cantidadValida && !excedeStock && !isLoading;

  const handleSubmit = async () => {
    if (!puedeGuardar) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      await descontarStockService({
        idSucursal,
        idProducto: productoSeleccionado.idProducto,
        cantidad: Number(cantidad),
        tipoDescuento,
        idUsuario: usuario.idUsuario,
      });
      onSuccess();
    } catch (error) {
      setErrorMessage(error?.message || "Error al registrar el descuento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sheet-form">
      {errorMessage && <p className="sheet-error">{errorMessage}</p>}

      {!productoSeleccionado ? (
        <>
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
              <div
                key={producto.idProducto}
                className="sheet-product-row sheet-product-row--selectable"
                onClick={() => setProductoSeleccionado(producto)}
                role="button"
                tabIndex={0}
              >
                <div
                  className="sheet-product-badge"
                  style={{ backgroundColor: getUniqueColor(producto.nombreProducto) }}
                >
                  {getInitials(producto.nombreProducto)}
                </div>
                <span className="sheet-product-name">{producto.nombreProducto}</span>
                <span className="sheet-product-stock">{producto.cantidadExistente} disp.</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="sheet-product-row sheet-product-row--selectable sheet-product-row--selected">
            <div
              className="sheet-product-badge"
              style={{ backgroundColor: getUniqueColor(productoSeleccionado.nombreProducto) }}
            >
              {getInitials(productoSeleccionado.nombreProducto)}
            </div>
            <span className="sheet-product-name">{productoSeleccionado.nombreProducto}</span>
            <span className="sheet-product-stock">{stockDisponible} disp.</span>
            <button
              className="sheet-radio"
              style={{ flex: "none", padding: "6px 10px" }}
              onClick={() => {
                setProductoSeleccionado(null);
                setCantidad("");
              }}
            >
              Cambiar
            </button>
          </div>

          <div className="sheet-field">
            <label className="sheet-label">Cantidad a descontar</label>
            <Form.Control
              type="number"
              min="1"
              max={stockDisponible}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="0"
              className="sheet-select"
              onWheel={(e) => e.target.blur()}
            />
            {excedeStock && (
              <span className="sheet-error" style={{ padding: "6px 10px" }}>
                No puedes descontar más de lo disponible ({stockDisponible}).
              </span>
            )}
          </div>

          <div className="sheet-field">
            <label className="sheet-label">Motivo</label>
            <div className="sheet-radio-group">
              {TIPOS_DESCUENTO.map((tipo) => (
                <button
                  key={tipo}
                  className={`sheet-radio ${tipoDescuento === tipo ? "sheet-radio--active" : ""}`}
                  onClick={() => setTipoDescuento(tipo)}
                >
                  {tipo === "MAYOREO" ? "Mayoreo" : "Mal estado"}
                </button>
              ))}
            </div>
          </div>

          <button className="sheet-submit-btn sheet-submit-btn--amber" onClick={handleSubmit} disabled={!puedeGuardar}>
            {isLoading ? <Spinner animation="border" size="sm" /> : "Confirmar descuento"}
          </button>
        </>
      )}
    </div>
  );
};

export default DescontarStockSheet;
