import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiSearch,
  FiX,
  FiFilter,
  FiChevronDown,
  FiBox,
  FiPackage,
  FiSave,
} from "react-icons/fi";
import { getInitials, getUniqueColor, handleStockChange, handleSubmitGuardarStock } from "../StockProductos/IngresarStock/IngresarStock.utils";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { decryptId } from "../../../utils/CryptoParams";
import useGetStockGeneral from "../../../hooks/stock/useGetStockGeneral";
import useGetStockDelDia from "../../../hooks/stock/useGetStockDelDia";
import useGetProductosInventario from "../../../hooks/productosprecios/useGetProductosInventario";
import Alert from "../../components/Alerts/Alert";

function IngresarStockGeneralPage() {
  const { idSucursal } = useParams();
  const navigate = useNavigate();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosInventario();
  const { sucursales, loadingSucursales } = useGetSucursales();
  const [stockValues, setStockValues] = useState({});
  const [currentStock, setCurrentStock] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  // Reemplazan los antiguos popups modales — ahora son banners inline, no bloqueantes.
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");

  const decryptedIdSucursal = decryptId(decodeURIComponent(idSucursal));
  const sucursal = sucursales?.find((item) => Number(item.idSucursal) === Number(decryptedIdSucursal));

  const { stockGeneral: initialStockGeneral, loadingStockGeneral } = useGetStockGeneral(idSucursal);
  const { stockDelDia: initialStockDelDia, loadingStockDiario } = useGetStockDelDia(idSucursal);

  useEffect(() => {
    if (productos && (initialStockGeneral || initialStockDelDia)) {
      const initialCurrentStock = {};
      productos?.forEach((producto) => {
        if (producto?.controlarStock === 1) {
          const stockGen = Array.isArray(initialStockGeneral)
            ? initialStockGeneral.find((item) => item.idProducto === producto.idProducto)
            : null;
          initialCurrentStock[producto.idProducto] = stockGen?.cantidadExistente || 0;
        }
        if (producto?.controlarStockDiario === 1) {
          const stockDia = Array.isArray(initialStockDelDia)
            ? initialStockDelDia.find((item) => item.idProducto === producto.idProducto)
            : null;
          initialCurrentStock[producto.idProducto] = stockDia?.cantidadExistente || 0;
        }
      });
      setCurrentStock(initialCurrentStock);
    }
  }, [productos, initialStockGeneral, initialStockDelDia]);

  const updateCurrentStock = (newStockValues) => {
    setCurrentStock((prev) => {
      const updated = { ...prev };
      Object.entries(newStockValues).forEach(([idProducto, cantidad]) => {
        if (cantidad !== null && !isNaN(cantidad)) {
          const producto = productos.find((p) => p.idProducto === parseInt(idProducto));
          const cantidadReal = producto?.nombreProducto === "Frances" ? parseInt(cantidad) * 6 : parseInt(cantidad);
          updated[idProducto] = (updated[idProducto] || 0) + cantidadReal;
        }
      });
      return updated;
    });
  };

  const categorias = ["Todas", ...new Set(productos?.map((item) => item.nombreCategoria) || [])];

  const productosFiltrados = useMemo(() => {
    let filtered = categoriaActiva === "Todas" ? productos : productos?.filter((item) => item.nombreCategoria === categoriaActiva);
    if (searchTerm) {
      filtered = filtered?.filter((producto) => producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return filtered;
  }, [productos, categoriaActiva, searchTerm]);

  const clearSearch = () => setSearchTerm("");

  const cantidadesIngresadas = Object.values(stockValues).filter((val) => val !== null && val !== "" && !isNaN(val)).length;

  const handleSubmit = async () => {
    await handleSubmitGuardarStock(
      stockValues,
      productos,
      idSucursal,
      setIsLoading,
      setIsPopupOpen,
      setStockValues,
      setErrorPopupMessage,
      setIsPopupErrorOpen,
      updateCurrentStock
    );
  };

  if (loadigProducts || loadingSucursales || loadingStockGeneral || loadingStockDiario) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/stock-productos")}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiBox size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">
            Inventario {sucursal?.nombreSucursal}
          </h1>
          <p className="text-sm text-muted">Ingresa las unidades que vas a agregar al stock</p>
        </div>
      </header>

      {/* ── Banners inline (reemplazan modales) ─────────────────────── */}
      {showErrorProductos && productosFiltrados?.length === 0 && (
        <Alert type="danger" title="No se pudieron cargar los productos" message="Intenta recargar la página." />
      )}

      {productos?.length === 0 && (
        <Alert type="info" title="Sin productos registrados" message="No se han ingresado productos todavía." />
      )}

      {isPopupErrorOpen && (
        <Alert
          type="danger"
          title="Ocurrió un error"
          message={errorPopupMessage}
          onDismiss={() => setIsPopupErrorOpen(false)}
        />
      )}

      {isPopupOpen && (
        <Alert
          type="success"
          title="¡Inventario actualizado!"
          message="Se agregó el stock de productos correctamente."
          onDismiss={() => setIsPopupOpen(false)}
          actions={[
            {
              label: "Ver stock",
              variant: "primary",
              onClick: () => navigate(`/stock-productos/stock-general/${encodeURIComponent(idSucursal)}`),
            },
            {
              label: "Ingresar más",
              variant: "secondary",
              onClick: () => setIsPopupOpen(false),
            },
          ]}
        />
      )}

      {/* ── Filtros ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="box-border w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-muted transition-colors hover:text-ink"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          {categorias.length > 1 && (
            <div className="relative shrink-0 sm:hidden">
              <FiFilter size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <select
                value={categoriaActiva}
                onChange={(e) => setCategoriaActiva(e.target.value)}
                className="box-border w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              >
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
              <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          )}
        </div>

        {categorias.length > 1 && (
          <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                type="button"
                onClick={() => setCategoriaActiva(categoria)}
                className={`shrink-0 rounded-full border-0 px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  categoriaActiva === categoria
                    ? "bg-brand-600 text-white shadow-brand"
                    : "bg-surface-2 text-muted hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabla de productos ───────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-surface-2/95">
            <tr>
              <th className="border-b border-line px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Producto
              </th>
              <th className="border-b border-line px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                Stock actual
              </th>
              <th className="border-b border-line px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                Unidades / Filas a ingresar
              </th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados?.length > 0 ? (
              productosFiltrados.map((producto, i) => (
                <tr
                  key={producto.idProducto}
                  className={`border-b border-line last:border-0 transition-colors hover:bg-brand-50/50 ${i % 2 === 1 ? "bg-surface-2/30" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: getUniqueColor(producto.nombreProducto) }}
                      >
                        {getInitials(producto.nombreProducto)}
                      </span>
                      <span className="font-medium text-ink">{producto.nombreProducto}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex min-w-[3rem] justify-center rounded-full bg-surface-2 px-2.5 py-1 text-sm font-bold text-ink">
                      {currentStock[producto.idProducto] || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      value={stockValues[producto.idProducto] || ""}
                      onChange={(e) => handleStockChange(producto.idProducto, e.target.value, setStockValues)}
                      onWheel={(e) => e.target.blur()}
                      placeholder="0"
                      className="box-border mx-auto block w-24 rounded-lg border border-line bg-surface px-3 py-2 text-center text-sm font-semibold text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-4 py-10 text-center text-sm text-muted">
                  No hay productos disponibles en esta categoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Barra de guardar, flotante al fondo ─────────────────────── */}
      <div className="sticky bottom-4 z-10 flex justify-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || cantidadesIngresadas === 0}
          className="flex w-full max-w-md items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-modal transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
              Guardando...
            </>
          ) : (
            <>
              <FiSave size={16} />
              Guardar Inventario
              {cantidadesIngresadas > 0 && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{cantidadesIngresadas}</span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default IngresarStockGeneralPage;