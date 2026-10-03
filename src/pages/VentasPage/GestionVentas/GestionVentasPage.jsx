import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  FiPlus,
  FiSearch,
  FiX,
  FiCalendar,
  FiFilter,
  FiChevronDown,
  FiTrash2,
  FiFileText,
  FiUser,
  FiShoppingCart,
  FiInbox,
  FiChevronRight,
} from "react-icons/fi";
import Alert from "../../../components/Alerts/Alert";
import Pagination from "../../../components/Pagination/Pagination";
import PDFViewerModal from "../../../PDFViewerModal/PDFViewerModal";
import useGetVentas from "../../../hooks/ventas/useGetVentas";
import useFilterVentas from "../../../hooks/ventas/useFilterVentas";
import useGetEliminacionesTracking from "../../../hooks/EliminacionesTracking/useGetEliminacionesTracking";
import { getUserData } from "../../../utils/Auth/decodedata";
import { getUniqueColor } from "../../../utils/utils";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import { handleViewDetalleVenta } from "../DetalleVenta/DetalleVenta.utils";
import {
  getInitialFilters,
  handleFilterChange,
  handleClearAllFilters,
  hasActiveFilters,
  getCurrentItems,
  handleDeleteVenta,
} from "./GestionVentas.utils";
import * as ventasUtils from "./GestionVentas.utils";

// Opcional: cuando exista `export const handleViewPdfVenta = async (idVenta) => url` en
// GestionVentas.utils, aparecen los botones de PDF. Si no existe, la página funciona sin ellos.
const handleViewPdfVenta = ventasUtils.handleViewPdfVenta;

const ITEMS_PER_PAGE = 10;

const MOTIVO_LIMITE = "Solo se permite una eliminación por turno por sucursal";

const isToday = (fecha) => (fecha ? dayjs(fecha).isSame(dayjs(), "day") : false);

const formatQuetzales = (valor) =>
  `Q.${Number(valor || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Los nombres vienen con espacios sobrantes ("Lilian  López Aguilar ")
const limpiarNombre = (nombre) => (nombre ? nombre.replace(/\s+/g, " ").trim() : "—");

// El botón de PDF solo aparece cuando handleViewPdfVenta es una función
const PDF_DISPONIBLE = typeof handleViewPdfVenta === "function";

const TH = "border-b border-line px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted";

// ─── Confirmación inline de eliminación (tabla y móvil) ───────────────────────

const ConfirmarEliminar = ({ idVenta, isDeleting, onCancel, onConfirm, stacked }) => (
  <div className={`flex flex-wrap items-center justify-between gap-3 ${stacked ? "flex-col !items-stretch" : ""}`}>
    <div>
      <p className="text-sm font-semibold text-danger-800 dark:text-danger-300">¿Eliminar la venta VNT-{idVenta}?</p>
      <p className="mt-0.5 text-xs text-danger-700 dark:text-danger-400">Esta acción no se puede deshacer.</p>
    </div>
    <div className={`flex shrink-0 gap-2 ${stacked ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={onCancel}
        disabled={isDeleting}
        className={`rounded-lg border border-line bg-bg px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed ${
          stacked ? "flex-1" : ""
        }`}
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isDeleting}
        className={`flex min-w-[5.5rem] items-center justify-center rounded-lg border-0 bg-danger-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-danger-500 disabled:cursor-not-allowed disabled:bg-danger-400 ${
          stacked ? "flex-1" : ""
        }`}
      >
        {isDeleting ? (
          <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          "Eliminar"
        )}
      </button>
    </div>
  </div>
);

// ─── Página ────────────────────────────────────────────────────────────────────

const GestionVentasPage = () => {
  const navigate = useNavigate();
  const userData = getUserData();

  // ── Datos y filtros ──
  const [filters, setFilters] = useState(getInitialFilters);
  const { ventas, loadingVentas, showErrorVentas, showInfoVentas, setVentas } = useGetVentas();
  const filteredVentas = useFilterVentas(ventas, filters);
  const activeFilters = hasActiveFilters(filters);
  const { eliminacionesTracking, loadingEliminacionesTracking } = useGetEliminacionesTracking("VENTA");

  // ── Paginación ──
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredVentas.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages); // evita quedar en una página vacía al eliminar
  const currentSales = getCurrentItems(filteredVentas, safePage, ITEMS_PER_PAGE);

  // ── Acciones ──
  const [confirmingId, setConfirmingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [loadingViewPdf, setLoadingViewPdf] = useState(null);
  const [pdfData, setPdfData] = useState(null);

  const uniqueSucursales = useMemo(
    () => Array.from(new Set(ventas?.map((venta) => venta.nombreSucursal))).filter(Boolean),
    [ventas]
  );

  // Cualquier cambio de filtro regresa a la página 1
  const updateFilters = (nuevos) => {
    handleFilterChange(nuevos, setFilters);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.replace(/^VNT-/i, "");
    updateFilters({ ...filters, search: value });
  };

  // Regla de eliminación (misma que tenían VentasTable y VentasCard)
  const getEstadoEliminar = (sale) => {
    if (!isToday(sale.fechaVenta)) return { visible: false, puede: false, motivo: "" };
    if (userData?.idRol === 1) return { visible: true, puede: true, motivo: "Eliminar venta" };
    if (loadingEliminacionesTracking) return { visible: true, puede: false, motivo: "Verificando eliminaciones..." };
    if (!Array.isArray(eliminacionesTracking) || eliminacionesTracking.length === 0) {
      return { visible: true, puede: true, motivo: "Eliminar venta" };
    }
    const existente = eliminacionesTracking.find(
      (e) => e.nombreSucursal === sale.nombreSucursal && e.turno === sale.ventaTurno
    );
    if (existente && existente.cantidadEliminaciones >= 1) {
      return { visible: true, puede: false, motivo: MOTIVO_LIMITE };
    }
    return { visible: true, puede: true, motivo: "Eliminar venta" };
  };

  const handleOpenPdfViewer = async (idVenta) => {
    setLoadingViewPdf(idVenta);
    try {
      const pdfUrl = await handleViewPdfVenta(idVenta);
      setPdfData({ url: pdfUrl, filename: `venta-${idVenta}.pdf` });
    } catch (error) {
      console.error("Error al cargar PDF:", error);
      setErrorPopupMessage("No se pudo cargar el PDF. Intenta nuevamente.");
      setIsPopupErrorOpen(true);
    } finally {
      setLoadingViewPdf(null);
    }
  };

  const handleConfirmDelete = (idVenta) =>
    handleDeleteVenta(
      idVenta,
      setVentas,
      () => setConfirmingId(null), // reemplaza al antiguo "cerrar popup"
      setErrorPopupMessage,
      setIsPopupErrorOpen,
      setIsDeleting
    );

  if (loadingVentas) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm text-muted">Cargando ventas...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {isPopupErrorOpen && (
        <Alert
          floating
          position="top-right"
          type="danger"
          title="No se pudo completar"
          message={errorPopupMessage}
          onDismiss={() => setIsPopupErrorOpen(false)}
          autoClose
          duration={3000}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiShoppingCart size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Ventas</h1>
          <p className="text-sm text-muted">
            {filteredVentas.length} {filteredVentas.length === 1 ? "venta registrada" : "ventas registradas"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("ingresar-venta")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 sm:w-auto"
        >
          <FiPlus size={15} /> Ingresar Venta
        </button>
      </header>

      {showErrorVentas && (
        <Alert
          type="danger"
          title="No se pudieron cargar las ventas"
          message="Hubo un error al consultar las ventas. Intenta más tarde."
        />
      )}

      {/* ── Filtros ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <FiSearch size={14} className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-muted" />
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
              ORD-
            </span>
            <input
              type="text"
              placeholder="0000"
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-16 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, search: "" }, setFilters)}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-muted transition-colors hover:text-ink"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          <div className="relative">
            <FiCalendar size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange({ ...filters, date: e.target.value }, setFilters)}
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            />
            {filters.date && (
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, date: "" }, setFilters)}
                aria-label="Limpiar fecha"
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-muted transition-colors hover:text-ink"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          <div className="relative">
            <FiFilter size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <select
              value={filters.sucursal}
              onChange={(e) => handleFilterChange({ ...filters, sucursal: e.target.value }, setFilters)}
              className="w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            >
              <option value="">Todas las sucursales</option>
              {uniqueSucursales.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>

        {activeFilters && (
          <button
            type="button"
            onClick={() => {
              handleClearAllFilters(setFilters);
              setCurrentPage(1);
            }}
            className="mt-3 border-0 bg-transparent text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Estados vacíos ───────────────────────────────────────────── */}
      {filteredVentas.length === 0 && activeFilters && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiInbox size={20} />
          </span>
          <p className="text-sm text-muted">No se encontraron ventas que coincidan con la búsqueda.</p>
        </div>
      )}

      {filteredVentas.length === 0 && !activeFilters && !showErrorVentas && showInfoVentas && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiShoppingCart size={20} />
          </span>
          <p className="text-sm text-muted">No se han ingresado ventas.</p>
        </div>
      )}

      {/* ── Lista: tabla en desktop, tarjetas en móvil ──────────────────── */}
      {filteredVentas.length > 0 && (
        <>
          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:block">
            <table className="w-full table-fixed border-collapse text-sm">
              <thead className="bg-surface-2/95">
                <tr>
                  <th className={`${TH} w-[7%]`}>#</th>
                  <th className={`${TH} w-[14%]`}>No. de venta</th>
                  <th className={`${TH} w-[22%]`}>Sucursal</th>
                  <th className={`${TH} w-[21%]`}>Usuario</th>
                  <th className={`${TH} w-[13%]`}>Total</th>
                  <th className={`${TH} w-[13%]`}>Fecha venta</th>
                  <th className={`${TH} w-[10%]`}>Acciones</th>
                </tr>
              </thead>

              {/* Un <tbody> por fila: la confirmación se inserta justo debajo de su venta */}
              {currentSales.map((sale, i) => {
                const eliminar = getEstadoEliminar(sale);
                const confirmando = confirmingId === sale.idVenta;
                const completada = sale.estadoVenta === "C";
                const cargandoPdf = loadingViewPdf === sale.idVenta;

                return (
                  <tbody key={sale.idVenta}>
                    <tr
                      onClick={() => handleViewDetalleVenta(sale.idVenta, navigate)}
                      className={`cursor-pointer border-b border-line transition-colors hover:bg-brand-50/50 dark:hover:bg-brand-500/5 ${
                        i % 2 === 1 ? "bg-surface-2/30" : ""
                      } ${confirmando ? "border-b-0" : ""}`}
                    >
                      <td className="px-3 py-3 text-center text-muted">#{(safePage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                      <td className="px-3 py-3 text-center font-semibold text-ink">VNT-{sale.idVenta}</td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className="inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                          style={{ backgroundColor: getUniqueColor(sale.nombreSucursal) }}
                        >
                          {sale.nombreSucursal}
                        </span>
                      </td>
                      <td className="truncate px-3 py-3 text-center text-ink">{limpiarNombre(sale.nombreUsuario)}</td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
                            completada
                              ? "bg-success-500/15 text-success-700 dark:text-success-300"
                              : "bg-warning-500/15 text-warning-700 dark:text-warning-300"
                          }`}
                        >
                          {formatQuetzales(sale.totalVenta)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-ink">
                        {formatDateToDisplay(sale.fechaVenta)}
                        {isToday(sale.fechaVenta) && (
                          <span className="ml-2 rounded-full bg-brand-500/15 px-2 py-0.5 text-2xs font-semibold text-brand-700 dark:text-brand-300">
                            Hoy
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {PDF_DISPONIBLE && (
                            <button
                              type="button"
                              onClick={() => handleOpenPdfViewer(sale.idVenta)}
                              disabled={cargandoPdf}
                              aria-label="Ver PDF"
                              title="Ver PDF"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-wait dark:text-brand-300 dark:hover:bg-brand-500/10"
                            >
                              {cargandoPdf ? (
                                <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-brand-300 border-t-brand-600" />
                              ) : (
                                <FiFileText size={16} />
                              )}
                            </button>
                          )}
                          {eliminar.visible && (
                            <button
                              type="button"
                              onClick={() => eliminar.puede && setConfirmingId(confirmando ? null : sale.idVenta)}
                              disabled={!eliminar.puede}
                              aria-label="Eliminar venta"
                              title={eliminar.motivo}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg border-0 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                confirmando
                                  ? "bg-danger-500/15 text-danger-600"
                                  : "bg-transparent text-muted hover:bg-danger-500/10 hover:text-danger-600"
                              }`}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {confirmando && (
                      <tr className="border-b border-line">
                        <td colSpan={7} className="animate-slide-up bg-danger-500/10 px-4 py-3">
                          <ConfirmarEliminar
                            idVenta={sale.idVenta}
                            isDeleting={isDeleting}
                            onCancel={() => setConfirmingId(null)}
                            onConfirm={() => handleConfirmDelete(sale.idVenta)}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </table>
          </div>

          {/* Móvil */}
          <ul className="flex flex-col gap-3 sm:hidden">
            {currentSales.map((sale) => {
              const eliminar = getEstadoEliminar(sale);
              const confirmando = confirmingId === sale.idVenta;
              const completada = sale.estadoVenta === "C";
              const cargandoPdf = loadingViewPdf === sale.idVenta;
              const hayAcciones = PDF_DISPONIBLE || eliminar.visible;

              return (
                <li key={sale.idVenta} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                  <button
                    type="button"
                    onClick={() => handleViewDetalleVenta(sale.idVenta, navigate)}
                    className="flex w-full items-start gap-2 border-0 bg-transparent p-4 text-left"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                          style={{ backgroundColor: getUniqueColor(sale.nombreSucursal) }}
                        >
                          {sale.nombreSucursal}
                        </span>
                        <span className="text-sm font-bold text-ink">VNT-{sale.idVenta}</span>
                        {isToday(sale.fechaVenta) && (
                          <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-2xs font-semibold text-brand-700 dark:text-brand-300">
                            Hoy
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <FiCalendar size={12} /> {formatDateToDisplay(sale.fechaVenta)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiUser size={12} /> {limpiarNombre(sale.nombreUsuario)}
                        </span>
                        <span className="text-ink">Turno {sale.ventaTurno}</span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-sm font-bold tabular-nums ${
                            completada
                              ? "bg-success-500/15 text-success-700 dark:text-success-300"
                              : "bg-warning-500/15 text-warning-700 dark:text-warning-300"
                          }`}
                        >
                          {formatQuetzales(sale.totalVenta)}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted">
                          <span className={`h-2 w-2 rounded-full ${completada ? "bg-success-500" : "bg-warning-500"}`} />
                          {completada ? "Completado" : "Pendiente"}
                        </span>
                      </div>
                    </div>
                    <FiChevronRight size={16} className="mt-1 shrink-0 text-muted" />
                  </button>

                  {hayAcciones && (
                    <div className="flex flex-col gap-2 border-t border-line px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {PDF_DISPONIBLE && (
                          <button
                            type="button"
                            onClick={() => handleOpenPdfViewer(sale.idVenta)}
                            disabled={cargandoPdf}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-brand-500/10 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-500/20 disabled:cursor-wait dark:text-brand-300"
                          >
                            {cargandoPdf ? (
                              <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-brand-300 border-t-brand-600" />
                            ) : (
                              <FiFileText size={14} />
                            )}
                            Ver PDF
                          </button>
                        )}
                        {eliminar.visible && (
                          <button
                            type="button"
                            onClick={() => eliminar.puede && setConfirmingId(confirmando ? null : sale.idVenta)}
                            disabled={!eliminar.puede}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-danger-500/10 py-2 text-xs font-semibold text-danger-700 transition-colors hover:bg-danger-500/20 disabled:cursor-not-allowed disabled:opacity-40 dark:text-danger-300"
                          >
                            <FiTrash2 size={14} /> Eliminar
                          </button>
                        )}
                      </div>
                      {eliminar.visible && !eliminar.puede && (
                        <p className="text-2xs text-muted">{eliminar.motivo}</p>
                      )}
                    </div>
                  )}

                  {confirmando && (
                    <div className="animate-slide-up border-t border-danger-500/30 bg-danger-500/10 px-4 py-3">
                      <ConfirmarEliminar
                        stacked
                        idVenta={sale.idVenta}
                        isDeleting={isDeleting}
                        onCancel={() => setConfirmingId(null)}
                        onConfirm={() => handleConfirmDelete(sale.idVenta)}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <Pagination
            totalItems={filteredVentas.length}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={safePage}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* ── Visor PDF ────────────────────────────────────────────────── */}
      {pdfData && <PDFViewerModal pdfUrl={pdfData.url} filename={pdfData.filename} onClose={() => setPdfData(null)} />}
    </div>
  );
};

export default GestionVentasPage;