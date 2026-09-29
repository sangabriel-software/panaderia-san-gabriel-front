import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  FiPlusCircle,
  FiEye,
  FiTrash2,
  FiUser,
  FiPhone,
  FiCalendar,
  FiSearch,
  FiX,
  FiFilter,
  FiChevronDown,
  FiInbox,
  FiTag,
} from "react-icons/fi";
import useGetOrdenEHeader from "../../../hooks/orenesEspeciales/useGetOrdenEHeader";
import { eliminarOrdenEspecialService } from "../../../services/ordenesEspeciales/ordenesEspeciales.service";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import Alert from "../../../components/Alerts/Alert";
import Pagination from "../../../components/Pagination/Pagination";

const RECORDS_PER_PAGE = 8;

function OrdenesEspecialesList() {
  const { ordenesEspeciales, loadingOrdenEspecial, showErrorOrdenEspecial, setOrdenesEspeciales } = useGetOrdenEHeader();
  const navigate = useNavigate();

  const [confirmingId, setConfirmingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sucursalFilter, setSucursalFilter] = useState("");
  const [fechaFilter, setFechaFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const sucursalesUnicas = useMemo(() => {
    const sucursales = (ordenesEspeciales || []).map((o) => o.sucursalEntrega);
    return [...new Set(sucursales)].filter(Boolean).sort();
  }, [ordenesEspeciales]);

  const filteredOrdenes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (ordenesEspeciales || []).filter((orden) => {
      const matchesSearch =
        !term ||
        `${orden.idOrdenEspecial} ${orden.nombreCliente} ${orden.telefonoCliente}`.toLowerCase().includes(term);
      const matchesSucursal = sucursalFilter === "" || orden.sucursalEntrega === sucursalFilter;
      const matchesFecha = fechaFilter === "" || orden.fechaEntrega === fechaFilter;
      return matchesSearch && matchesSucursal && matchesFecha;
    });
  }, [ordenesEspeciales, searchTerm, sucursalFilter, fechaFilter]);

  const hayFiltros = searchTerm.trim() || sucursalFilter || fechaFilter;

  const totalPages = Math.ceil(filteredOrdenes.length / RECORDS_PER_PAGE);
  const currentRecords = useMemo(() => {
    const start = (currentPage - 1) * RECORDS_PER_PAGE;
    return filteredOrdenes.slice(start, start + RECORDS_PER_PAGE);
  }, [filteredOrdenes, currentPage]);

  const clearFilters = () => {
    setSearchTerm("");
    setSucursalFilter("");
    setFechaFilter("");
    setCurrentPage(1);
  };

  const handleNewOrder = () => navigate("/pedido-especial/ingresar-orden-especial");
  const handleViewDetails = (id) => navigate(`/pedido-especial/detalle-orden-especial/${id}`);

  const handleDeleteConfirm = async (orden) => {
    setIsDeleting(true);
    try {
      await eliminarOrdenEspecialService(orden.idOrdenEspecial);
      setOrdenesEspeciales(ordenesEspeciales.filter((o) => o.idOrdenEspecial !== orden.idOrdenEspecial));
      setConfirmingId(null);
      setSuccessMessage(`Se eliminó la orden #${orden.idOrdenEspecial}.`);
      // Si la página se quedó sin registros tras eliminar, retrocede una página
      if (currentRecords.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      setConfirmingId(null);
      setErrorMessage(error.message || "Error al eliminar la orden especial");
    } finally {
      setIsDeleting(false);
    }
  };

  const estadoInfo = (orden) => {
    const entregado = dayjs(orden.fechaEntrega).isBefore(dayjs(), "day");
    return entregado
      ? { label: "Entregado", tone: "bg-brand-50 text-brand-700" }
      : { label: "Sin entregar", tone: "bg-warning-50 text-warning-700" };
  };

  if (loadingOrdenEspecial) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm text-muted">Cargando órdenes especiales...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Alertas flotantes ────────────────────────────────────────── */}
      {errorMessage && (
        <Alert
          floating
          position="top-right"
          type="danger"
          title="No se pudo eliminar"
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      )}
      {successMessage && (
        <Alert
          floating
          position="top-right"
          type="success"
          title="Orden eliminada"
          message={successMessage}
          duration={3000}
          onDismiss={() => setSuccessMessage("")}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiTag size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Órdenes Especiales</h1>
          <p className="text-sm text-muted">{filteredOrdenes.length} órdenes registradas</p>
        </div>
        <button
          type="button"
          onClick={handleNewOrder}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 sm:w-auto"
        >
          <FiPlusCircle size={15} /> Ingresar Orden Especial
        </button>
      </header>

      {showErrorOrdenEspecial && (
        <Alert type="danger" title="No se pudieron cargar las órdenes" message="Intenta más tarde." />
      )}

      {/* ── Filtros ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <FiSearch size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Buscar cliente, teléfono o ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-muted transition-colors hover:text-ink"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          <div className="relative">
            <FiFilter size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <select
              value={sucursalFilter}
              onChange={(e) => {
                setSucursalFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            >
              <option value="">Todas las sucursales</option>
              {sucursalesUnicas.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>

          <div className="relative">
            <FiCalendar size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="date"
              value={fechaFilter}
              onChange={(e) => {
                setFechaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            />
            {fechaFilter && (
              <button
                type="button"
                onClick={() => setFechaFilter("")}
                aria-label="Limpiar fecha"
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-muted transition-colors hover:text-ink"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>

        {hayFiltros && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 border-0 bg-transparent text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Estado vacío ─────────────────────────────────────────────── */}
      {filteredOrdenes.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiInbox size={20} />
          </span>
          <p className="text-sm text-muted">
            {hayFiltros ? "No hay órdenes que coincidan con los filtros aplicados." : "No hay órdenes especiales registradas."}
          </p>
          {hayFiltros && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border-0 bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* ── Lista: tabla en desktop, tarjetas en móvil ──────────────────── */}
      {filteredOrdenes.length > 0 && (
        <>
          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:block">
            <table className="w-full table-fixed border-collapse text-sm">
              <thead className="bg-surface-2/95">
                <tr>
                  <th className="w-[8%] border-b border-line px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    ID
                  </th>
                  <th className="w-[22%] border-b border-line px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Cliente
                  </th>
                  <th className="w-[15%] border-b border-line px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    Teléfono
                  </th>
                  <th className="w-[20%] border-b border-line px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    Sucursal
                  </th>
                  <th className="w-[15%] border-b border-line px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    Entrega
                  </th>
                  <th className="w-[10%] border-b border-line px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    Estado
                  </th>
                  <th className="w-[10%] border-b border-line px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                    Acciones
                  </th>
                </tr>
              </thead>

              {currentRecords.map((orden, i) => {
                const estado = estadoInfo(orden);
                const confirmando = confirmingId === orden.idOrdenEspecial;

                return (
                  <tbody key={orden.idOrdenEspecial}>
                    <tr
                      onClick={() => handleViewDetails(orden.idOrdenEspecial)}
                      className={`cursor-pointer border-b border-line transition-colors hover:bg-brand-50/50 ${
                        i % 2 === 1 ? "bg-surface-2/30" : ""
                      } ${confirmando ? "border-b-0" : ""}`}
                    >
                      <td className="px-3 py-3 text-center text-muted">#{orden.idOrdenEspecial}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                            <FiUser size={12} />
                          </span>
                          <span className="truncate font-medium text-ink">{orden.nombreCliente}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-ink">{orden.telefonoCliente}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex max-w-full truncate rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink">
                          {orden.sucursalEntrega}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-ink">{formatDateToDisplay(orden.fechaEntrega)}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-2xs font-semibold ${estado.tone}`}>{estado.label}</span>
                      </td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(orden.idOrdenEspecial)}
                            aria-label="Ver detalles"
                            title="Ver detalles"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-brand-600 transition-colors hover:bg-brand-50"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(confirmando ? null : orden.idOrdenEspecial)}
                            aria-label="Eliminar orden"
                            title="Eliminar orden"
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border-0 transition-colors ${
                              confirmando
                                ? "bg-danger-50 text-danger-600"
                                : "bg-transparent text-muted hover:bg-danger-50 hover:text-danger-600"
                            }`}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {confirmando && (
                      <tr className="border-b border-line">
                        <td colSpan={7} className="animate-slide-up bg-danger-50 px-4 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-danger-800">
                                ¿Eliminar la orden #{orden.idOrdenEspecial} de {orden.nombreCliente}?
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
                                onClick={() => handleDeleteConfirm(orden)}
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
            {currentRecords.map((orden) => {
              const estado = estadoInfo(orden);
              const confirmando = confirmingId === orden.idOrdenEspecial;

              return (
                <li key={orden.idOrdenEspecial} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                  <button
                    type="button"
                    onClick={() => handleViewDetails(orden.idOrdenEspecial)}
                    className="flex w-full flex-col gap-2 border-0 bg-transparent p-4 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                        <FiUser size={14} />
                      </span>
                      <span className="text-sm font-semibold text-ink">{orden.nombreCliente}</span>
                      <span className="text-xs text-muted">#{orden.idOrdenEspecial}</span>
                      <span className={`ml-auto rounded-full px-2 py-0.5 text-2xs font-semibold ${estado.tone}`}>{estado.label}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <FiPhone size={12} /> {orden.telefonoCliente}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar size={12} /> {formatDateToDisplay(orden.fechaEntrega)}
                      </span>
                      <span className="text-ink">{orden.sucursalEntrega}</span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 border-t border-line px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(orden.idOrdenEspecial)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-brand-50 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                    >
                      <FiEye size={14} /> Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(confirmando ? null : orden.idOrdenEspecial)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-danger-50 py-2 text-xs font-semibold text-danger-700 transition-colors hover:bg-danger-100"
                    >
                      <FiTrash2 size={14} /> Eliminar
                    </button>
                  </div>

                  {confirmando && (
                    <div className="animate-slide-up border-t border-danger-200 bg-danger-50 px-4 py-3">
                      <p className="text-sm font-semibold text-danger-800">
                        ¿Eliminar la orden #{orden.idOrdenEspecial}?
                      </p>
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
                          onClick={() => handleDeleteConfirm(orden)}
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
            totalItems={filteredOrdenes.length}
            itemsPerPage={RECORDS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}

export default OrdenesEspecialesList;