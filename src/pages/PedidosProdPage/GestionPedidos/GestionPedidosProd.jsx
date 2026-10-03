import { useState, useMemo } from "react";
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
  FiClipboard,
  FiInbox,
  FiChevronRight,
} from "react-icons/fi";
import Alert from "../../../components/Alerts/Alert";
import Pagination from "../../../components/Pagination/Pagination";
import PDFViewerModal from "../../../PDFViewerModal/PDFViewerModal";
import useGetOrdenesProduccion from "../../../hooks/ordenesproduccion/useGetOrdenesProduccion";
import useFilterOrders from "../../../hooks/ordenesproduccion/useFilterOrders";
import { handleViewDetalle } from "../DetallesOrdenesProd/DetallesOrdenesProdUtils";
import { getUniqueColor } from "../../../utils/utils";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import {
  getInitialFilters,
  handleFilterChange,
  handleClearAllFilters,
  hasActiveFilters,
  getCurrentItems,
  handleDeleteOrder,
  handleViewPdf,
} from "./GestionPedidosProdUtils";

const ITEMS_PER_PAGE = 10;

const isToday = (dateString) => (dateString ? dayjs(dateString).isSame(dayjs(), "day") : false);
const isTodayOrPast = (dateString) =>
  dateString ? dayjs(dateString).isSame(dayjs().startOf("day"), "day") || dayjs(dateString).isBefore(dayjs().startOf("day"), "day") : false;

function GestionPedidosProd() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState(getInitialFilters);
  const { ordenesProduccion, loadingOrdenes, showErrorOrdenes, showInfoOrdenes, setOrdenesProduccion } = useGetOrdenesProduccion();
  const filteredOrders = useFilterOrders(ordenesProduccion, filters);
  const activeFilters = hasActiveFilters(filters);

  const [currentPage, setCurrentPage] = useState(1);
  const currentOrders = getCurrentItems(filteredOrders, currentPage, ITEMS_PER_PAGE);

  const [confirmingId, setConfirmingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);

  const [loadingViewPdf, setLoadingViewPdf] = useState(null);
  const [pdfData, setPdfData] = useState(null);

  const uniqueSucursales = useMemo(
    () => Array.from(new Set(ordenesProduccion?.map((order) => order.nombreSucursal))).filter(Boolean),
    [ordenesProduccion]
  );

  const handleSearchChange = (e) => {
    let value = e.target.value.replace(/^ORD-/i, "");
    handleFilterChange({ ...filters, search: value }, setFilters);
  };

  const handleOpenPdfViewer = async (idOrder) => {
    setLoadingViewPdf(idOrder);
    try {
      const pdfUrl = await handleViewPdf(idOrder);
      setPdfData({ url: pdfUrl, filename: `orden-produccion-${idOrder}.pdf` });
    } catch (error) {
      console.error("Error al cargar PDF:", error);
      setErrorPopupMessage("No se pudo cargar el PDF. Intenta nuevamente.");
      setIsPopupErrorOpen(true);
    } finally {
      setLoadingViewPdf(null);
    }
  };

  const handleConfirmDelete = async (idOrden) => {
    setIsDeleting(true);
    try {
      // El 3er argumento reemplaza al antiguo "abrir modal": aquí solo cierra la confirmación inline
      await handleDeleteOrder(idOrden, setOrdenesProduccion, () => setConfirmingId(null), setErrorPopupMessage, setIsPopupErrorOpen);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loadingOrdenes) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm text-muted">Cargando órdenes de producción...</p>
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
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiClipboard size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Órdenes de Producción</h1>
          <p className="text-sm text-muted">{filteredOrders.length} órdenes registradas</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("ingresar-orden")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 sm:w-auto"
        >
          <FiPlus size={15} /> Ingresar Orden
        </button>
      </header>

      {showErrorOrdenes && (
        <Alert type="danger" title="No se pudieron cargar las órdenes" message="Intenta más tarde." />
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
      {filteredOrders.length === 0 && activeFilters && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiInbox size={20} />
          </span>
          <p className="text-sm text-muted">No se encontraron órdenes que coincidan con la búsqueda.</p>
        </div>
      )}

      {filteredOrders.length === 0 && !activeFilters && !showErrorOrdenes && showInfoOrdenes && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiClipboard size={20} />
          </span>
          <p className="text-sm text-muted">No se han ingresado órdenes de producción.</p>
        </div>
      )}

      {/* ── Lista: tabla en desktop, tarjetas en móvil ──────────────────── */}
      {filteredOrders.length > 0 && (
        <>
          {/* Desktop */}
          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:block">
            <table className="w-full table-fixed border-collapse text-sm">
              <thead className="bg-surface-2/95">
                <tr>
                  <th className="w-[8%] border-b border-line px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    #
                  </th>
                  <th className="w-[17%] border-b border-line px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    Orden
                  </th>
                  <th className="w-[25%] border-b border-line px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    Sucursal
                  </th>
                  <th className="w-[13%] border-b border-line px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    Turno
                  </th>
                  <th className="w-[22%] border-b border-line px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    Fecha producción
                  </th>
                  <th className="w-[15%] border-b border-line px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    Acciones
                  </th>
                </tr>
              </thead>

              {/* Un <tbody> por fila: permite insertar la fila de confirmación
        justo debajo de la orden correspondiente, sin romper la tabla */}
              {currentOrders.map((order, i) => {
                const noEliminable = isTodayOrPast(order.fechaAProducir);
                const esHoy = isToday(order.fechaAProducir);
                const confirmando = confirmingId === order.idOrdenProduccion;

                return (
                  <tbody key={order.idOrdenProduccion}>
                    <tr
                      onClick={() => handleViewDetalle(order.idOrdenProduccion, navigate)}
                      className={`cursor-pointer border-b border-line transition-colors hover:bg-brand-50/50 ${i % 2 === 1 ? "bg-surface-2/30" : ""
                        } ${confirmando ? "border-b-0" : ""}`}
                    >
                      <td className="px-3 py-3 text-center text-muted">#{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                      <td className="px-3 py-3 text-center font-semibold text-ink">ORD-{order.idOrdenProduccion}</td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className="inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                          style={{ backgroundColor: getUniqueColor(order.nombreSucursal) }}
                        >
                          {order.nombreSucursal}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-ink">{order.ordenTurno}</td>
                      <td className="px-3 py-3 text-center text-ink">
                        {formatDateToDisplay(order.fechaAProducir)}
                        {esHoy && (
                          <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-2xs font-semibold text-brand-700">
                            Hoy
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenPdfViewer(order.idOrdenProduccion)}
                            disabled={loadingViewPdf === order.idOrdenProduccion}
                            aria-label="Ver PDF"
                            title="Ver PDF"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-wait"
                          >
                            {loadingViewPdf === order.idOrdenProduccion ? (
                              <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-brand-300 border-t-brand-600" />
                            ) : (
                              <FiFileText size={16} />
                            )}
                          </button>
                          {!noEliminable && (
                            <button
                              type="button"
                              onClick={() => setConfirmingId(confirmando ? null : order.idOrdenProduccion)}
                              aria-label="Eliminar orden"
                              title="Eliminar orden"
                              className={`flex h-8 w-8 items-center justify-center rounded-lg border-0 transition-colors ${confirmando
                                  ? "bg-danger-50 text-danger-600"
                                  : "bg-transparent text-muted hover:bg-danger-50 hover:text-danger-600"
                                }`}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Confirmación inline, justo debajo de ESTA fila — visible sin
              importar la posición de la orden en la tabla */}
                    {confirmando && (
                      <tr className="border-b border-line">
                        <td colSpan={6} className="animate-slide-up bg-danger-50 px-4 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-danger-800">
                                ¿Eliminar la orden ORD-{order.idOrdenProduccion}?
                              </p>
                              <p className="mt-0.5 text-xs text-danger-700">Esta acción no se puede deshacer.</p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() => setConfirmingId(null)}
                                disabled={isDeleting}
                                className="rounded-lg border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmDelete(order.idOrdenProduccion)}
                                disabled={isDeleting}
                                className="flex min-w-[5.5rem] items-center justify-center rounded-lg border-0 bg-danger-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-danger-500 disabled:cursor-not-allowed disabled:bg-danger-400"
                              >
                                {isDeleting ? (
                                  <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                                ) : (
                                  "Eliminar"
                                )}
                              </button>
                            </div>
                          </div>
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
            {currentOrders.map((order) => {
              const noEliminable = isTodayOrPast(order.fechaAProducir);
              const esHoy = isToday(order.fechaAProducir);
              const confirmando = confirmingId === order.idOrdenProduccion;

              return (
                <li key={order.idOrdenProduccion} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                  <button
                    type="button"
                    onClick={() => handleViewDetalle(order.idOrdenProduccion, navigate)}
                    className="flex w-full flex-col gap-2 border-0 bg-transparent p-4 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: getUniqueColor(order.nombreSucursal) }}
                      >
                        {order.nombreSucursal}
                      </span>
                      <span className="text-sm font-bold text-ink">ORD-{order.idOrdenProduccion}</span>
                      {esHoy && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-2xs font-semibold text-brand-700">Hoy</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <FiCalendar size={12} /> {formatDateToDisplay(order.fechaAProducir)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClipboard size={12} /> {order.cantidadProductos} productos
                      </span>
                      <span className="flex items-center gap-1">
                        <FiUser size={12} /> {order.nombrePanadero || "Sin asignar"}
                      </span>
                      <span className="text-ink">Turno {order.ordenTurno}</span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 border-t border-line px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => handleOpenPdfViewer(order.idOrdenProduccion)}
                      disabled={loadingViewPdf === order.idOrdenProduccion}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-brand-50 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-wait"
                    >
                      {loadingViewPdf === order.idOrdenProduccion ? (
                        <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-brand-300 border-t-brand-600" />
                      ) : (
                        <FiFileText size={14} />
                      )}
                      Ver PDF
                    </button>
                    {!noEliminable && (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(confirmando ? null : order.idOrdenProduccion)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-danger-50 py-2 text-xs font-semibold text-danger-700 transition-colors hover:bg-danger-100"
                      >
                        <FiTrash2 size={14} /> Eliminar
                      </button>
                    )}
                    <FiChevronRight size={16} className="shrink-0 text-muted" />
                  </div>

                  {confirmando && (
                    <div className="animate-slide-up border-t border-danger-200 bg-danger-50 px-4 py-3">
                      <p className="text-sm font-semibold text-danger-800">¿Eliminar la orden ORD-{order.idOrdenProduccion}?</p>
                      <p className="mt-0.5 text-xs text-danger-700">Esta acción no se puede deshacer.</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          disabled={isDeleting}
                          className="flex-1 rounded-lg border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(order.idOrdenProduccion)}
                          disabled={isDeleting}
                          className="flex flex-1 items-center justify-center rounded-lg border-0 bg-danger-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-danger-500 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? (
                            <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                          ) : (
                            "Eliminar"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <Pagination
            totalItems={filteredOrders.length}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* ── Visor PDF ────────────────────────────────────────────────── */}
      {pdfData && <PDFViewerModal pdfUrl={pdfData.url} filename={pdfData.filename} onClose={() => setPdfData(null)} />}
    </div>
  );
}

export default GestionPedidosProd;