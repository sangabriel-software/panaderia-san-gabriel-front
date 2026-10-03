import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiTag,
  FiTrash2,
  FiMinus,
  FiSearch,
  FiX,
  FiFilter,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiUser,
  FiInbox,
  FiMinusCircle,
} from "react-icons/fi";
import useGetStockDescontado from "../../../../hooks/DescuentoDeStock/useGetStockDescontado";
import { encryptId } from "../../../../utils/CryptoParams";
import { cancelarDescuentoStockServices } from "../../../../services/descuentoDeStock/descuentoDeStock.service";
import Alert from "../../../../components/Alerts/Alert";
import { handleNavigate } from "./StockDescuentosList.utils";

const TIPO_TONES = {
  MAYOREO: { icon: "bg-accent-50 text-accent-700", badge: "bg-accent-50 text-accent-700" },
  "MAL ESTADO": { icon: "bg-danger-50 text-danger-700", badge: "bg-danger-50 text-danger-700" },
};
const DEFAULT_TONE = { icon: "bg-brand-50 text-brand-700", badge: "bg-brand-50 text-brand-700" };

const tipoKey = (d) => (d.tipoDescuento || "SIN TIPO").toUpperCase();

const sameDay = (a, b) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

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

const formatHora = (fecha) =>
  new Date(fecha).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });

const chipClass = (active) =>
  `shrink-0 rounded-full border-0 px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
    active
      ? "bg-brand-600 text-white shadow-brand"
      : "bg-surface-2 text-muted hover:bg-brand-50 hover:text-brand-700"
  }`;

function StockDescuentosList() {
  const { idSucursal } = useParams();
  const navigate = useNavigate();
  const { stockDescontadoList, loadingStockDescontado, showErrorStockDescontado, setStockDescontadoList } =
    useGetStockDescontado(idSucursal);

  const [confirmingId, setConfirmingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [soloHoy, setSoloHoy] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const lista = stockDescontadoList || [];

  // Tipos dinámicos con su contador, tomados de los datos reales
  const tipos = useMemo(() => {
    const map = new Map();
    lista.forEach((d) => {
      const key = tipoKey(d);
      if (!map.has(key)) map.set(key, { key, label: d.tipoDescuento || "Sin tipo", count: 0 });
      map.get(key).count += 1;
    });
    return [...map.values()];
  }, [lista]);

  const hoyCount = useMemo(() => lista.filter((d) => esFechaDeHoy(d.fechaDescuento)).length, [lista]);

  const filtrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return lista.filter((d) => {
      if (filtroTipo !== "TODOS" && tipoKey(d) !== filtroTipo) return false;
      if (soloHoy && !esFechaDeHoy(d.fechaDescuento)) return false;
      if (term) {
        const haystack = `${d.idDescuento} ${d.nombreUsuario || ""} ${d.tipoDescuento || ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [lista, filtroTipo, soloHoy, searchTerm]);

  // Más recientes primero, agrupados por día
  const grupos = useMemo(() => {
    const ordenados = [...filtrados].sort((a, b) => new Date(b.fechaDescuento) - new Date(a.fechaDescuento));
    const result = [];
    ordenados.forEach((d) => {
      const key = toDayKey(d.fechaDescuento);
      const last = result[result.length - 1];
      if (last && last.key === key) last.items.push(d);
      else result.push({ key, label: dayLabel(d.fechaDescuento), items: [d] });
    });
    return result;
  }, [filtrados]);

  const hayFiltros = filtroTipo !== "TODOS" || soloHoy || searchTerm.trim() !== "";

  const limpiarFiltros = () => {
    setFiltroTipo("TODOS");
    setSoloHoy(false);
    setSearchTerm("");
  };

  const handleViewDetails = (idDescuento) => {
    const encryptedId = encryptId(idDescuento.toString());
    navigate(`/descuento-stock/detalle-descuento/${encodeURIComponent(encryptedId)}`);
  };

  const handleAddDiscount = () => {
    navigate(`/descuento-stock/descontar-stock/${encodeURIComponent(idSucursal)}`);
  };

  const handleDeleteConfirm = async (descuento) => {
    setIsDeleting(true);
    try {
      await cancelarDescuentoStockServices(descuento.idDescuento);
      setStockDescontadoList(stockDescontadoList.filter((d) => d.idDescuento !== descuento.idDescuento));
      setConfirmingId(null);
      setSuccessMessage(`Se eliminó el descuento #${descuento.idDescuento}.`);
    } catch (error) {
      setConfirmingId(null);
      setErrorMessage(error.message || "Error al eliminar el descuento");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loadingStockDescontado) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm text-muted">Cargando descuentos de stock...</p>
      </div>
    );
  }

  const soloHoyButton = (
    <button
      type="button"
      onClick={() => setSoloHoy((v) => !v)}
      aria-pressed={soloHoy}
      className={`${chipClass(soloHoy)} flex items-center gap-1.5`}
    >
      <FiClock size={12} /> Solo hoy
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Alertas flotantes (resultado de eliminar) ─────────────────── */}
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
          title="Descuento eliminado"
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
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning-500 text-white">
          <FiMinusCircle size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Historial de Descuentos</h1>
          <p className="text-sm text-muted">
            {lista.length} {lista.length === 1 ? "registro" : "registros"} · {hoyCount} hoy
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddDiscount}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 sm:w-auto"
        >
          <FiMinus size={15} /> Descontar producto
        </button>
      </header>

      {showErrorStockDescontado && (
        <Alert
          type="danger"
          title="No se pudieron cargar los descuentos"
          message="Intenta recargar la página."
        />
      )}

      {/* ── Filtros ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="relative">
          <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por usuario, ID o tipo..."
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

        {/* Móvil: select nativo + toggle "Solo hoy" */}
        <div className="mt-3 flex gap-2 sm:hidden">
          <div className="relative min-w-0 flex-1">
            <FiFilter size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full appearance-none rounded-xl border border-line bg-surface py-2 pl-10 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            >
              <option value="TODOS">Todos los tipos</option>
              {tipos.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label} ({t.count})
                </option>
              ))}
            </select>
            <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>
          {soloHoyButton}
        </div>

        {/* Desktop: chips con contador */}
        <div className="mt-3 hidden flex-wrap items-center gap-2 sm:flex">
          <button type="button" onClick={() => setFiltroTipo("TODOS")} className={chipClass(filtroTipo === "TODOS")}>
            Todos <span className="ml-1 opacity-70">{lista.length}</span>
          </button>
          {tipos.map((t) => (
            <button key={t.key} type="button" onClick={() => setFiltroTipo(t.key)} className={chipClass(filtroTipo === t.key)}>
              {t.label} <span className="ml-1 opacity-70">{t.count}</span>
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-line" />
          {soloHoyButton}
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="ml-auto border-0 bg-transparent text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* ── Lista agrupada por día ───────────────────────────────────── */}
      {grupos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiInbox size={20} />
          </span>
          <p className="text-sm text-muted">
            {hayFiltros ? "Ningún descuento coincide con los filtros." : "Aún no hay descuentos registrados."}
          </p>
          {hayFiltros ? (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="rounded-lg border-0 bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              Limpiar filtros
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddDiscount}
              className="flex items-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500"
            >
              <FiMinus size={15} /> Descontar producto
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
                {grupo.items.map((descuento) => {
                  const tone = TIPO_TONES[tipoKey(descuento)] || DEFAULT_TONE;
                  const puedeEliminar = esFechaDeHoy(descuento.fechaDescuento);
                  const confirmando = confirmingId === descuento.idDescuento;

                  return (
                    <li key={descuento.idDescuento} className="border-b border-line last:border-0">
                      <div className="flex items-stretch">
                        {/* Zona principal: toda la fila abre el detalle */}
                        <button
                          type="button"
                          onClick={() => handleViewDetails(descuento.idDescuento)}
                          className="flex min-w-0 flex-1 items-center gap-3 border-0 bg-transparent p-4 text-left transition-colors hover:bg-brand-50/50"
                        >
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
                            <FiTag size={17} />
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="text-sm font-semibold text-ink">Descuento #{descuento.idDescuento}</span>
                              <span className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${tone.badge}`}>
                                {descuento.tipoDescuento}
                              </span>
                              {descuento.estado !== "A" && (
                                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-2xs font-semibold text-muted">
                                  Inactivo
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                              <span className="flex items-center gap-1">
                                <FiUser size={12} /> {descuento.nombreUsuario}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiClock size={12} /> {formatHora(descuento.fechaDescuento)}
                              </span>
                            </div>
                          </div>

                          <FiChevronRight size={16} className="shrink-0 text-muted" />
                        </button>

                        {/* Eliminar: solo descuentos de hoy */}
                        {puedeEliminar && (
                          <button
                            type="button"
                            onClick={() => setConfirmingId(confirmando ? null : descuento.idDescuento)}
                            aria-label="Eliminar descuento"
                            title="Eliminar descuento"
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

                      {/* Confirmación inline, sin modal */}
                      {confirmando && (
                        <div className="animate-slide-up border-t border-danger-200 bg-danger-50 px-4 py-3">
                          <p className="text-sm font-semibold text-danger-800">
                            ¿Eliminar el descuento #{descuento.idDescuento}?
                          </p>
                          <p className="mt-0.5 text-xs text-danger-700">
                            Esta acción no se puede deshacer. Registrado por {descuento.nombreUsuario}.
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
                              onClick={() => handleDeleteConfirm(descuento)}
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

export default StockDescuentosList;