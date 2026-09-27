import { useNavigate, useParams } from "react-router";
import {
  FiArrowLeft,
  FiX,
  FiArrowUp,
  FiSearch,
  FiPlus,
  FiMinusCircle,
  FiShuffle,
  FiBox,
  FiPackage,
  FiClock,
  FiFilter,
  FiChevronDown,
} from "react-icons/fi";
import { useState, useMemo, useEffect } from "react";
import { getInitials, getUniqueColor } from "../IngresarStock/IngresarStock.utils";
import useGetStockGeneral from "../../../hooks/stock/useGetStockGeneral";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { decryptId } from "../../../utils/CryptoParams";
import useGetStockDelDia from "../../../hooks/stock/useGetStockDelDia";

const ACTIONS_TONES = {
  brand: { icon: "bg-brand-600", bg: "bg-brand-50", text: "text-brand-700" },
  warning: { icon: "bg-warning-500", bg: "bg-warning-50", text: "text-warning-700" },
  accent: { icon: "bg-accent-600", bg: "bg-accent-50", text: "text-accent-700" },
};

function StockUnificado() {
  const { idSucursal } = useParams();
  const { stockGeneral, loadingStockGeneral } = useGetStockGeneral(idSucursal);
  const { stockDelDia, loadingStockDiario } = useGetStockDelDia(idSucursal);
  const { sucursales, loadingSucursales } = useGetSucursales();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");

  const decryptedIdSucursal = decryptId(decodeURIComponent(idSucursal));
  const sucursal = sucursales?.find((item) => Number(item.idSucursal) === Number(decryptedIdSucursal));

  const handleIngresarStock = () => navigate(`/stock-productos/ingresar-stock/${encodeURIComponent(idSucursal)}`);
  const handleDescontarStock = () => navigate(`/descuento-stock/stock-descuentos-lista/${encodeURIComponent(idSucursal)}`);
  const handleTraslados = () => navigate("/traslados-productos");

  const isStockDiarioEmpty = useMemo(() => {
    return (
      !stockDelDia ||
      !Array.isArray(stockDelDia) ||
      stockDelDia.length === 0 ||
      (stockDelDia.length === 1 && stockDelDia[0]?.idStockDiario === 0)
    );
  }, [stockDelDia]);

  const isStockGeneralEmpty = useMemo(() => {
    return !stockGeneral || !Array.isArray(stockGeneral) || stockGeneral.length === 0;
  }, [stockGeneral]);

  const combinedStock = useMemo(() => {
    if (isStockDiarioEmpty && isStockGeneralEmpty) return [];

    const productosDia = Array.isArray(stockDelDia)
      ? stockDelDia.filter((item) => item?.idStockDiario !== 0).map((item) => ({ ...item, esStockDiario: true }))
      : [];

    const productosGenerales = Array.isArray(stockGeneral)
      ? stockGeneral
          .filter((genItem) => !productosDia.some((diaItem) => diaItem.idProducto === genItem.idProducto))
          .map((item) => ({ ...item, esStockDiario: false }))
      : [];

    return [...productosDia, ...productosGenerales];
  }, [stockGeneral, stockDelDia, isStockDiarioEmpty, isStockGeneralEmpty]);

  const categorias = useMemo(() => {
    try {
      if (!Array.isArray(combinedStock) || combinedStock.length === 0) return ["Todas"];
      const categoriasUnicas = [
        ...new Set(combinedStock.map((item) => item?.nombreCategoria).filter((cat) => cat && typeof cat === "string")),
      ];
      return ["Todas", ...categoriasUnicas];
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      return ["Todas"];
    }
  }, [combinedStock]);

  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const isEmptyStock = useMemo(() => !Array.isArray(combinedStock) || combinedStock.length === 0, [combinedStock]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(combinedStock)) return [];

    let filtered = combinedStock.filter((producto) => {
      const matchesSearch = producto?.nombreProducto?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false;
      const matchesCategory = categoriaActiva === "Todas" || producto?.nombreCategoria === categoriaActiva;
      return matchesSearch && matchesCategory;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a.esStockDiario && !b.esStockDiario) return -1;
        if (!a.esStockDiario && b.esStockDiario) return 1;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    } else {
      filtered.sort((a, b) => {
        if (a.esStockDiario && !b.esStockDiario) return -1;
        if (!a.esStockDiario && b.esStockDiario) return 1;
        return 0;
      });
    }

    return filtered;
  }, [combinedStock, searchTerm, sortConfig, categoriaActiva]);

  const handleClearSearch = () => setSearchTerm("");

  const SortIndicator = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return (
      <FiArrowUp
        size={12}
        className={`transition-transform duration-150 ${sortConfig.direction === "descending" ? "rotate-180" : ""}`}
      />
    );
  };

  if (loadingStockGeneral || loadingStockDiario || loadingSucursales) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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
            Inventario General {sucursal?.nombreSucursal}
          </h1>
          <p className="text-sm text-muted">Todos los productos disponibles en inventario</p>
        </div>
      </header>

      {/* ── Acciones de inventario ──────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={handleIngresarStock}
          className={`flex items-center gap-3 rounded-2xl border-0 p-4 text-left transition-colors duration-150 ${ACTIONS_TONES.brand.bg} hover:brightness-95`}
        >
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${ACTIONS_TONES.brand.icon}`}>
            <FiPlus size={18} />
          </span>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${ACTIONS_TONES.brand.text}`}>Ingresar Inventario</p>
            <p className="text-xs text-muted">Agregar unidades</p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleDescontarStock}
          className={`flex items-center gap-3 rounded-2xl border-0 p-4 text-left transition-colors duration-150 ${ACTIONS_TONES.warning.bg} hover:brightness-95`}
        >
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${ACTIONS_TONES.warning.icon}`}>
            <FiMinusCircle size={18} />
          </span>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${ACTIONS_TONES.warning.text}`}>Descontar Inventario</p>
            <p className="text-xs text-muted">Reducir inventario</p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleTraslados}
          className={`flex items-center gap-3 rounded-2xl border-0 p-4 text-left transition-colors duration-150 ${ACTIONS_TONES.accent.bg} hover:brightness-95`}
        >
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${ACTIONS_TONES.accent.icon}`}>
            <FiShuffle size={18} />
          </span>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${ACTIONS_TONES.accent.text}`}>Traslados</p>
            <p className="text-xs text-muted">Mover entre sucursales</p>
          </div>
        </button>
      </section>

      {/* ── Filtros ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Buscador — box-border explícito como refuerzo, independiente
              de si el fix global de box-sizing ya está aplicado o no */}
          <div className="relative min-w-0 flex-1">
            <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="box-border w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-muted transition-colors hover:text-ink"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          {/* Dropdown de categorías en móvil — <select> nativo, sin librería */}
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
              <FiChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
          )}
        </div>

        {/* Categorías como chips — solo en desktop */}
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

      {/* ── Contenido ────────────────────────────────────────────────── */}
      {isEmptyStock ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiPackage size={20} />
          </span>
          <p className="text-sm text-muted">No hay productos disponibles en el stock.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-surface-2/95">
              <tr>
                <th
                  onClick={() => requestSort("nombreProducto")}
                  className="cursor-pointer select-none border-b border-line px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  <div className="flex items-center gap-1.5">
                    Producto <SortIndicator column="nombreProducto" />
                  </div>
                </th>
                <th
                  onClick={() => requestSort("cantidadExistente")}
                  className="cursor-pointer select-none border-b border-line px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    Cantidad <SortIndicator column="cantidadExistente" />
                  </div>
                </th>
                <th className="border-b border-line px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                  Unidad
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((producto, i) => {
                  const esFrances = producto.nombreProducto === "Frances";
                  return (
                    <tr
                      key={`${producto.idProducto}-${producto.esStockDiario ? "dia" : "gen"}`}
                      className={`border-b border-line last:border-0 transition-colors hover:bg-brand-50/50 ${
                        i % 2 === 1 ? "bg-surface-2/30" : ""
                      }`}
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
                          {producto.esStockDiario && (
                            <span className="flex shrink-0 items-center gap-1 rounded-full bg-warning-50 px-2 py-0.5 text-2xs font-semibold text-warning-700">
                              <FiClock size={10} /> Hoy
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex min-w-[3rem] justify-center rounded-full bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-700">
                          {producto.cantidadExistente}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-muted">{esFrances ? "Filas" : "Unidades"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-10 text-center text-sm text-muted">
                    No se encontraron productos con ese nombre en esta categoría.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Botón flotante: volver arriba ───────────────────────────── */}
      {showScrollButton && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Volver arriba"
          className="fixed bottom-6 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border-0 bg-brand-600 text-white shadow-brand transition-transform duration-150 hover:scale-105 active:scale-95 animate-fade-in"
        >
          <FiArrowUp size={18} />
        </button>
      )}
    </div>
  );
}

export default StockUnificado;