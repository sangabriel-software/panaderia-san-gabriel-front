import { useState, useMemo } from "react";
import { Form, Spinner } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { getInitials, getUniqueColor } from "../../IngresarStock/IngresarStock.utils";
import { getUserData } from "../../../../utils/Auth/decodedata";
// TODO: reemplazar por el nombre real del servicio que crea un traslado.
// Debería vivir junto a eliminarTrasladoService en:
// ../../../../services/Traslados/traslados.service.js
import { ingresarTrasladoService } from "../../../../services/Traslados/traslados.service";
import "./Sheets.css";

const TrasladarStockSheet = ({ idSucursalOrigen, idSucursalOrigenRaw, sucursales, productos, onSuccess }) => {
  const usuario = getUserData();
  const [searchTerm, setSearchTerm] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [idSucursalDestino, setIdSucursalDestino] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // sucursales trae ids planos (sin cifrar), por eso el filtro usa
  // idSucursalOrigenRaw y no idSucursalOrigen (que va cifrado al backend).
  const sucursalesDestino = useMemo(
    () => sucursales?.filter((s) => Number(s.idSucursal) !== Number(idSucursalOrigenRaw)) || [],
    [sucursales, idSucursalOrigenRaw]
  );

  const productosFiltrados = useMemo(() => {
    if (!searchTerm) return productos;
    return productos?.filter((p) => p.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [productos, searchTerm]);

  const cantidadValida = Number(cantidad) > 0;
  const stockDisponible = productoSeleccionado ? Number(productoSeleccionado.cantidadExistente) : 0;
  const excedeStock = cantidadValida && Number(cantidad) > stockDisponible;
  const puedeGuardar = productoSeleccionado && cantidadValida && !excedeStock && idSucursalDestino && !isLoading;

  const handleSubmit = async () => {
    if (!puedeGuardar) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      await ingresarTrasladoService({
        idSucursalOrigen,
        idSucursalDestino,
        idProducto: productoSeleccionado.idProducto,
        cantidad: Number(cantidad),
        idUsuario: usuario.idUsuario,
      });
      onSuccess();
    } catch (error) {
      setErrorMessage(error?.message || "Error al registrar el traslado");
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
            <label className="sheet-label">Sucursal destino</label>
            <Form.Select
              className="sheet-select"
              value={idSucursalDestino}
              onChange={(e) => setIdSucursalDestino(e.target.value)}
            >
              <option value="">Selecciona una sucursal</option>
              {sucursalesDestino.map((s) => (
                <option key={s.idSucursal} value={s.idSucursal}>
                  {s.nombreSucursal}
                </option>
              ))}
            </Form.Select>
          </div>

          <div className="sheet-field">
            <label className="sheet-label">Cantidad a trasladar</label>
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
                No puedes trasladar más de lo disponible ({stockDisponible}).
              </span>
            )}
          </div>

          <button className="sheet-submit-btn sheet-submit-btn--blue" onClick={handleSubmit} disabled={!puedeGuardar}>
            {isLoading ? <Spinner animation="border" size="sm" /> : "Confirmar traslado"}
          </button>
        </>
      )}
    </div>
  );
};

export default TrasladarStockSheet;