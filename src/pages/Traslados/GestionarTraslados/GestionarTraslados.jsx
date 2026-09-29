import { useNavigate, useParams } from "react-router";
import { useState, useMemo } from "react";
import {
  FiArrowLeft,
  FiTruck,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiUser,
  FiMapPin,
  FiInbox,
} from "react-icons/fi";
import useGetTraslados from "../../../hooks/Traslados/UseGetTraslados";
import { encryptId } from "../../../utils/CryptoParams";
import { eliminarTrasladoService } from "../../../services/Traslados/traslados.service";
import {
  formatFecha,
  formatFechaCompleta,
  formatFechaRelativa,
  extraerOpcionesFiltros,
  filtrarTraslados,
  validarEliminacionTraslado,
} from "./GestionarTraslados.utils";
import Alert from "../../../components/Alerts/Alert";

const ESTADO_TONES = {
  COMPLETADO: "bg-brand-50 text-brand-700",
  CANCELADO: "bg-danger-50 text-danger-700",
  PENDIENTE: "bg-warning-50 text-warning-700",
};
const DEFAULT_ESTADO_TONE = "bg-surface-2 text-muted";

const selectClass =
  "w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-9 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

const sameDay = (a, b) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

// Un traslado solo se puede eliminar si ocurrió hoy — más allá de su estado
const esFechaDeHoy = (fecha) => sameDay(new Date(fecha), new Date());

const toDayKey = (fecha) => {
  const d = new Date(fecha);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const dayLabel = (fecha) => {
  const d = new Date(fecha);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (sameDay(d, hoy)) return "Hoy";
  if (sameDay(d, ayer)) return "Ayer";
  return d.toLocaleDateString("es-GT", { weekday: "long", day: "numeric", month: "long" });
};

function GestionarTraslados() {
  const navigate = useNavigate();
  const { traslados, loadingTraslados, showErrorTraslados, setTraslados } = useGetTraslados();
  const [confirmingId, setConfirmingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState({ sucursalOrigen: "", sucursalDestino: "", usuario: "" });
  const { idSucursal } = useParams();

  const { sucursalesOrigen, sucursalesDestino, usuarios } = useMemo(
    () => extraerOpcionesFiltros(traslados),
    [traslados]
  );

  const porFiltros = useMemo(() => filtrarTraslados(traslados, filtros), [traslados, filtros]);

  const trasladosFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return porFiltros;
    return porFiltros.filter((t) => {
      const haystack = `${t.idTraslado} ${t.sucursalOrigen} ${t.sucursalDestino} ${t.usuarioResponsable}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [porFiltros, searchTerm]);

  const grupos = useMemo(() => {
    const ordenados = [...trasladosFiltrados].sort((a, b) => new Date(b.fechaTraslado) - new Date(a.fechaTraslado));
    const result = [];
    ordenados.forEach((t) => {
      const key = toDayKey(t.fechaTraslado);
      const last = result[result.length - 1];
      if (last && last.key === key) last.items.push(t);
      else result.push({ key, label: dayLabel(t.fechaTraslado), items: [t] });
    });
    return result;
  }, [trasladosFiltrados]);

  const handleFiltroChange = (e) => {
    setFiltros((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFiltros = () => {
    setFiltros({ sucursalOrigen: "", sucursalDestino: "", usuario: "" });
    setSearchTerm("");
  };

  const hayFiltros = filtros.sucursalOrigen || filtros.sucursalDestino || filtros.usuario || searchTerm.trim();

  const handleViewDetails = (idTraslado) => {
    const encryptedId = encryptId(idTraslado.toString());
    navigate(`/traslados-productos/detalles-traslado/${encodeURIComponent(encryptedId)}/detalle/${encodeURIComponent(idSucursal)}`);
  };

  const handleAddTraslado = () => navigate(`/traslados-productos/ingresar-traslado/${encodeURIComponent(idSucursal)}`);

  const handleDeleteConfirm = async (traslado) => {
    setIsDeleting(true);
    try {
      await eliminarTrasladoService(traslado.idTraslado);
      setTraslados(traslados.filter((t) => t.idTraslado !== traslado.idTraslado));
      setConfirmingId(null);
      setSuccessMessage(`Se eliminó el traslado #${traslado.idTraslado}.`);
    } catch (error) {
      setConfirmingId(null);
      setErrorMessage(error.message || "Error al eliminar el traslado");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loadingTraslados) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm text-muted">Cargando historial de traslados...</p>
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
          title="Traslado eliminado"
          message={successMessage}
          duration={3000}
          onDismiss={() => setSuccessMessage("")}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/stock-productos/stock-general/${encodeURIComponent(idSucursal)}`)}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white shadow-accent">
          <FiTruck size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Historial de Traslados</h1>
          <p className="text-sm text-muted">{traslados?.length || 0} traslados registrados</p>
        </div>
        <button
          type="button"
          onClick={handleAddTraslado}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 sm:w-auto"
        >
          <FiPlus size={15} /> Crear traslado
        </button>
      </header>

      {showErrorTraslados && (
        <Alert type="danger" title="No se pudo cargar el historial" message="Intenta recargar la página." />
      )}

      {/* ── Filtros ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="relative">
          <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por sucursal, responsable o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="relative">
            <FiMapPin size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <select name="sucursalOrigen" value={filtros.sucursalOrigen} onChange={handleFiltroChange} className={selectClass}>
              <option value="">Todos los orígenes</option>
              {sucursalesOrigen.map((s, i) => (
                <option key={`origen-${i}`} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>

          <div className="relative">
            <FiMapPin size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <select name="sucursalDestino" value={filtros.sucursalDestino} onChange={handleFiltroChange} className={selectClass}>
              <option value="">Todos los destinos</option>
              {sucursalesDestino.map((s, i) => (
                <option key={`destino-${i}`} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>

          <div className="relative">
            <FiUser size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <select name="usuario" value={filtros.usuario} onChange={handleFiltroChange} className={selectClass}>
              <option value="">Todos los responsables</option>
              {usuarios.map((u, i) => (
                <option key={`usuario-${i}`} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>

        {hayFiltros && (
          <button
            type="button"
            onClick={clearFiltros}
            className="mt-3 border-0 bg-transparent text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Lista agrupada por día ───────────────────────────────────── */}
      {grupos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiInbox size={20} />
          </span>
          <p className="text-sm text-muted">
            {hayFiltros ? "Ningún traslado coincide con los filtros." : "Aún no hay traslados registrados."}
          </p>
          {hayFiltros ? (
            <button
              type="button"
              onClick={clearFiltros}
              className="rounded-lg border-0 bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              Limpiar filtros
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddTraslado}
              className="flex items-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500"
            >
              <FiPlus size={15} /> Crear nuevo traslado
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grupos.map((grupo) => (
            <section key={grupo.key}>
              <div className="mb-2 flex items-center gap-2 px-1">
                <h2 className="text-sm font-semibold text-ink first-letter:uppercase">{grupo.label}</h2>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-2xs font-semibold text-muted">
                  {grupo.items.length}
                </span>
              </div>

              <ul className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                {grupo.items.map((traslado) => {
                  const estado = (traslado.estado || "PENDIENTE").toUpperCase();
                  const estadoTone = ESTADO_TONES[estado] || DEFAULT_ESTADO_TONE;
                  const puedeEliminar =
                    validarEliminacionTraslado(traslado) && esFechaDeHoy(traslado.fechaTraslado);
                  const confirmando = confirmingId === traslado.idTraslado;

                  return (
                    <li key={traslado.idTraslado} className="border-b border-line last:border-0">
                      <div className="flex items-stretch">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(traslado.idTraslado)}
                          className="flex min-w-0 flex-1 flex-col gap-2 border-0 bg-transparent p-4 text-left transition-colors hover:bg-brand-50/50 sm:flex-row sm:items-center sm:gap-3"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                            <FiTruck size={17} />
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="text-sm font-semibold text-ink">Traslado #{traslado.idTraslado}</span>
                              <span className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${estadoTone}`}>
                                {estado}
                              </span>
                            </div>

                            {/* Ruta: origen → destino */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                              <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1 text-ink">
                                <FiMapPin size={11} className="text-brand-600" /> {traslado.sucursalOrigen}
                              </span>
                              <FiChevronRight size={12} className="shrink-0 text-muted" />
                              <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1 text-ink">
                                <FiMapPin size={11} className="text-accent-600" /> {traslado.sucursalDestino}
                              </span>
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                              <span className="flex items-center gap-1">
                                <FiUser size={12} /> {traslado.usuarioResponsable}
                              </span>
                              <span
                                className="flex items-center gap-1"
                                title={formatFechaCompleta(traslado.fechaTraslado)}
                              >
                                <FiClock size={12} /> {formatFecha(traslado.fechaTraslado)} ·{" "}
                                {formatFechaRelativa(traslado.fechaTraslado)}
                              </span>
                            </div>
                          </div>

                          <FiChevronRight size={16} className="hidden shrink-0 text-muted sm:block" />
                        </button>

                        {puedeEliminar && (
                          <button
                            type="button"
                            onClick={() => setConfirmingId(confirmando ? null : traslado.idTraslado)}
                            aria-label="Eliminar traslado"
                            title="Eliminar traslado"
                            className={`flex w-14 shrink-0 items-center justify-center border-0 border-l border-line transition-colors ${
                              confirmando
                                ? "bg-danger-50 text-danger-600"
                                : "bg-transparent text-muted hover:bg-danger-50 hover:text-danger-600"
                            }`}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>

                      {confirmando && (
                        <div className="animate-slide-up border-t border-danger-200 bg-danger-50 px-4 py-3">
                          <p className="text-sm font-semibold text-danger-800">
                            ¿Eliminar el traslado #{traslado.idTraslado}?
                          </p>
                          <p className="mt-0.5 text-xs text-danger-700">
                            Esta acción no se puede deshacer. {traslado.sucursalOrigen} → {traslado.sucursalDestino},
                            responsable {traslado.usuarioResponsable}.
                          </p>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmingId(null)}
                              disabled={isDeleting}
                              className="rounded-lg border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteConfirm(traslado)}
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
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default GestionarTraslados;