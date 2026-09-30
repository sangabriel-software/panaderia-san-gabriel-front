import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  FiArrowLeft,
  FiSearch,
  FiUsers,
  FiBell,
  FiBellOff,
  FiX,
} from "react-icons/fi";
import useGetUsuariosNotiActivos from "../../../hooks/notificaciones/useGetUsuariosNotiActivos";
import { activarNotificacionService, desactivarNotificacionService } from "../../../services/notificaciones/notificacones.service";
import {
  getInitials,
  isActivo,
  contarActivos,
  getCambios,
  isUsuarioCambiado,
  separarCambios,
  buildPayloadInsertar,
  buildPayloadActualizar,
} from "./Notificaciones.utils.js";
import Alert from "../../../components/Alerts/Alert";

function NotificacionesEspeciales() {
  const navigate = useNavigate();
  const { usuariosNotiActivos, loadingUsuariosNotiActivos } = useGetUsuariosNotiActivos();

  const [usuarios, setUsuarios] = useState([]);
  const [originalUsuarios, setOriginalUsuarios] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "success" | "error" | null
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (usuariosNotiActivos?.length) {
      setUsuarios(usuariosNotiActivos);
      setOriginalUsuarios(usuariosNotiActivos);
    }
  }, [usuariosNotiActivos]);

  const cambios = useMemo(() => getCambios(usuarios, originalUsuarios), [usuarios, originalUsuarios]);
  const hasChanges = cambios.length > 0;

  const totalCount = usuarios.length;
  const activosCount = contarActivos(usuarios);
  const porcentajeActivos = totalCount ? Math.round((activosCount / totalCount) * 100) : 0;

  // Búsqueda aplicada; luego se separa en dos grupos por estado
  const usuariosBuscados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return usuarios;
    return usuarios.filter((u) =>
      `${u.nombreUsuario} ${u.apellidoUsuario} ${u.correoUsuario}`.toLowerCase().includes(term)
    );
  }, [usuarios, busqueda]);

  const grupoActivos = useMemo(() => usuariosBuscados.filter((u) => isActivo(u)), [usuariosBuscados]);
  const grupoInactivos = useMemo(() => usuariosBuscados.filter((u) => !isActivo(u)), [usuariosBuscados]);

  const handleToggle = (idUsuario) => {
    setUsuarios((prev) => prev.map((u) => (u.idUsuario === idUsuario ? { ...u, activo: u.activo === 1 ? 0 : 1 } : u)));
  };

  const handleSetAll = (valor) => {
    const ids = new Set(usuariosBuscados.map((u) => u.idUsuario));
    setUsuarios((prev) => prev.map((u) => (ids.has(u.idUsuario) ? { ...u, activo: valor } : u)));
  };

  const handleDescartar = () => setUsuarios(originalUsuarios);

  const handleGuardar = async () => {
    setSaving(true);
    setSaveStatus(null);

    const fechaConHora = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const { aInsertar, aActualizar } = separarCambios(cambios, originalUsuarios);

    try {
      const promesas = [];
      if (aInsertar.length > 0) promesas.push(activarNotificacionService(buildPayloadInsertar(aInsertar, fechaConHora)));
      if (aActualizar.length > 0) promesas.push(desactivarNotificacionService(buildPayloadActualizar(aActualizar, fechaConHora)));

      await Promise.all(promesas);
      setOriginalUsuarios(usuarios);
      setSaveStatus("success");
    } catch (error) {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const UserRow = ({ usuario }) => {
    const activo = isActivo(usuario);
    const changed = isUsuarioCambiado(usuario, originalUsuarios);

    return (
      <li>
        <button
          type="button"
          role="switch"
          aria-checked={activo}
          onClick={() => handleToggle(usuario.idUsuario)}
          disabled={saving}
          className="flex w-full items-center gap-3 border-0 bg-transparent px-4 py-3.5 text-left transition-colors hover:bg-brand-50/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
              activo ? "bg-brand-100 text-brand-700" : "bg-surface-2 text-muted"
            }`}
          >
            {getInitials(usuario.nombreUsuario, usuario.apellidoUsuario)}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-ink">
                {usuario.nombreUsuario} {usuario.apellidoUsuario}
              </p>
              {changed && (
                <span className="shrink-0 rounded-full bg-warning-50 px-2 py-0.5 text-2xs font-semibold text-warning-700">
                  Sin guardar
                </span>
              )}
            </div>
            <p className="truncate text-xs text-muted">{usuario.correoUsuario}</p>
          </div>

          <span
            aria-hidden="true"
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ${
              activo ? "bg-brand-600" : "bg-surface-2"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform duration-150 ${
                activo ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </span>
        </button>
      </li>
    );
  };

  return (
    <div className={`flex flex-col gap-6 ${hasChanges ? "pb-24" : ""}`}>
      {/* ── Alertas flotantes ────────────────────────────────────────── */}
      {saveStatus === "success" && (
        <Alert
          floating
          position="top-right"
          type="success"
          title="Cambios guardados"
          duration={3000}
          onDismiss={() => setSaveStatus(null)}
        />
      )}
      {saveStatus === "error" && (
        <Alert
          floating
          position="top-right"
          type="danger"
          title="No se pudo guardar"
          message="Revisa tu conexión e intenta de nuevo."
          onDismiss={() => setSaveStatus(null)}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/config")}
          aria-label="Volver a configuración"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiBell size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Notificaciones especiales</h1>
          <p className="text-sm text-muted">Elige quién recibe avisos de órdenes especiales</p>
        </div>
      </header>

      {/* ── Resumen ──────────────────────────────────────────────────── */}
      {!loadingUsuariosNotiActivos && totalCount > 0 && (
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center gap-5">
            {/* Anillo de porcentaje */}
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
              <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgb(236 236 238)" strokeWidth="7" className="text-surface-2" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={2 * Math.PI * 26 * (1 - porcentajeActivos / 100)}
                  className="transition-[stroke-dashoffset] duration-500 ease-out"
                />
              </svg>
              <span className="absolute text-xs font-bold text-ink">{porcentajeActivos}%</span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold text-ink">
                {activosCount} <span className="text-base font-normal text-muted">de {totalCount} activos</span>
              </p>
              <p className="text-xs text-muted">Usuarios que reciben notificaciones de órdenes especiales</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Buscador y acciones masivas ──────────────────────────────── */}
      {!loadingUsuariosNotiActivos && totalCount > 0 && (
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="relative">
            <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-muted transition-colors hover:text-ink"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted">
              {usuariosBuscados.length} {usuariosBuscados.length === 1 ? "usuario" : "usuarios"}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSetAll(1)}
                disabled={saving}
                className="rounded-lg border-0 bg-transparent px-2.5 py-1 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-50"
              >
                Activar todos
              </button>
              <button
                type="button"
                onClick={() => handleSetAll(0)}
                disabled={saving}
                className="rounded-lg border-0 bg-transparent px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-50"
              >
                Desactivar todos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lista, agrupada por estado ───────────────────────────────── */}
      {loadingUsuariosNotiActivos ? (
        <div className="flex items-center justify-center py-16">
          <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiUsers size={20} />
          </span>
          <p className="text-sm text-muted">Aún no hay usuarios registrados.</p>
        </div>
      ) : usuariosBuscados.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiSearch size={20} />
          </span>
          <p className="text-sm text-muted">Ningún usuario coincide con la búsqueda.</p>
          <button
            type="button"
            onClick={() => setBusqueda("")}
            className="rounded-lg border-0 bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grupoActivos.length > 0 && (
            <section>
              <div className="mb-2 flex items-center gap-2 px-1">
                <FiBell size={13} className="text-brand-600" />
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Activos <span className="text-brand-600">({grupoActivos.length})</span>
                </h2>
              </div>
              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                {grupoActivos.map((u) => (
                  <UserRow key={u.idUsuario} usuario={u} />
                ))}
              </ul>
            </section>
          )}

          {grupoInactivos.length > 0 && (
            <section>
              <div className="mb-2 flex items-center gap-2 px-1">
                <FiBellOff size={13} className="text-muted" />
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Inactivos ({grupoInactivos.length})
                </h2>
              </div>
              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                {grupoInactivos.map((u) => (
                  <UserRow key={u.idUsuario} usuario={u} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* ── Barra de acciones, solo con cambios pendientes ───────────── */}
      {hasChanges && (
        <div className="fixed inset-x-0 bottom-0 z-30 animate-slide-up border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-2xl items-center gap-3">
            <button
              type="button"
              onClick={handleDescartar}
              disabled={saving}
              className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                  Guardando...
                </>
              ) : (
                `Guardar ${cambios.length} ${cambios.length === 1 ? "cambio" : "cambios"}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificacionesEspeciales;