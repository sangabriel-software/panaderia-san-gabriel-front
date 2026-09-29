import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import useGetUsuariosNotiActivos from "../../../hooks/notificaciones/useGetUsuariosNotiActivos";
import { activarNotificacionService, desactivarNotificacionService } from "../../../services/notificaciones/notificacones.service";
import {
  FILTROS,
  getInitials,
  isActivo,
  contarActivos,
  getCambios,
  isUsuarioCambiado,
  separarCambios,
  buildPayloadInsertar,
  buildPayloadActualizar,
  filtrarUsuarios,
} from "./Notificaciones.utils.js";

// ── Iconos ────────────────────────────────────────────────────────────────
const IconBase = ({ children, className = "h-5 w-5", strokeWidth = 2 }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const IconBack = () => (
  <IconBase>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </IconBase>
);

const IconSearch = ({ className }) => (
  <IconBase className={className}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </IconBase>
);

const IconCheck = () => (
  <IconBase className="h-4.5 w-4.5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </IconBase>
);

const IconAlert = () => (
  <IconBase className="h-4.5 w-4.5">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </IconBase>
);

const IconUsers = () => (
  <IconBase className="h-8 w-8" strokeWidth={1.5}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </IconBase>
);

const NotificacionesEspeciales = () => {
  const navigate = useNavigate();
  const { usuariosNotiActivos, loadingUsuariosNotiActivos } = useGetUsuariosNotiActivos();

  const [usuarios, setUsuarios] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [originalUsuarios, setOriginalUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState(FILTROS.TODOS);

  useEffect(() => {
    if (usuariosNotiActivos?.length) {
      setUsuarios(usuariosNotiActivos);
      setOriginalUsuarios(usuariosNotiActivos);
    }
  }, [usuariosNotiActivos]);

  // Derivados: ya no se necesita un estado "hasChanges" que pueda quedar desincronizado
  const cambios = useMemo(
    () => getCambios(usuarios, originalUsuarios),
    [usuarios, originalUsuarios]
  );
  const hasChanges = cambios.length > 0;

  const usuariosVisibles = useMemo(
    () => filtrarUsuarios(usuarios, busqueda, filtro),
    [usuarios, busqueda, filtro]
  );

  const activosCount = contarActivos(usuarios);
  const totalCount = usuarios.length;
  const porcentajeActivos = totalCount ? Math.round((activosCount / totalCount) * 100) : 0;

  const conteoFiltros = {
    [FILTROS.TODOS]: totalCount,
    [FILTROS.ACTIVOS]: activosCount,
    [FILTROS.INACTIVOS]: totalCount - activosCount,
  };

  const handleToggle = (idUsuario) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.idUsuario === idUsuario
          ? { ...u, activo: u.activo === 1 ? 0 : 1 }
          : u
      )
    );
    setSaveStatus(null);
  };

  // Activa o desactiva únicamente los usuarios que se ven en la lista (respeta búsqueda y filtro)
  const handleSetVisibles = (valor) => {
    const ids = new Set(usuariosVisibles.map((u) => u.idUsuario));
    setUsuarios((prev) =>
      prev.map((u) => (ids.has(u.idUsuario) ? { ...u, activo: valor } : u))
    );
    setSaveStatus(null);
  };

  const handleDescartar = () => {
    setUsuarios(originalUsuarios);
    setSaveStatus(null);
  };

  const handleGuardar = async () => {
    setSaving(true);
    setSaveStatus(null);

    const fechaConHora = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const { aInsertar, aActualizar } = separarCambios(cambios, originalUsuarios);

    try {
      const promesas = [];

      if (aInsertar.length > 0) {
        promesas.push(activarNotificacionService(buildPayloadInsertar(aInsertar, fechaConHora)));
      }

      if (aActualizar.length > 0) {
        promesas.push(desactivarNotificacionService(buildPayloadActualizar(aActualizar, fechaConHora)));
      }

      await Promise.all(promesas);

      setOriginalUsuarios(usuarios);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const filtrosConfig = [
    { id: FILTROS.TODOS, label: "Todos" },
    { id: FILTROS.ACTIVOS, label: "Activos" },
    { id: FILTROS.INACTIVOS, label: "Inactivos" },
  ];

  return (
    <div className="min-h-full bg-bg text-ink">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-line bg-bg/85 pt-safe-top backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => navigate("/config")}
            aria-label="Volver a configuración"
            className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-2"
          >
            <IconBack />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-ink">Notificaciones especiales</h1>
            <p className="truncate text-sm text-muted">Elige quién recibe avisos de órdenes especiales</p>
          </div>
        </div>
      </header>

      {/* ── Feedback (toast) ───────────────────────────────────────────── */}
      {saveStatus && (
        <div
          role="status"
          className="fixed inset-x-4 top-20 z-40 mx-auto max-w-md animate-scale-in"
        >
          {saveStatus === "success" ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-md font-medium text-success-800 shadow-modal dark:border-success-800 dark:bg-success-950 dark:text-success-200">
              <IconCheck />
              Cambios guardados
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-md font-medium text-danger-800 shadow-modal dark:border-danger-800 dark:bg-danger-950 dark:text-danger-200">
              <span className="mt-0.5"><IconAlert /></span>
              <span>No se pudieron guardar los cambios. Revisa tu conexión e intenta de nuevo.</span>
            </div>
          )}
        </div>
      )}

      <main className={`mx-auto w-full max-w-2xl space-y-4 px-4 pt-4 ${hasChanges ? "pb-32" : "pb-10"}`}>

        {/* ── Resumen ──────────────────────────────────────────────────── */}
        <section className="card">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-md text-muted">Reciben notificaciones</p>
            <p className="text-md text-muted">
              <span className="text-4xl font-semibold text-ink">{activosCount}</span> de {totalCount}
            </p>
          </div>
          <div
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2"
            role="progressbar"
            aria-valuenow={porcentajeActivos}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Porcentaje de usuarios con notificaciones activas"
          >
            {/* Único estilo inline: el ancho es dinámico y Tailwind no puede generarlo */}
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${porcentajeActivos}%` }}
            />
          </div>
        </section>

        {/* ── Búsqueda y filtros ───────────────────────────────────────── */}
        {!loadingUsuariosNotiActivos && totalCount > 0 && (
          <section className="space-y-3">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o correo"
                aria-label="Buscar usuario"
                className="input pl-10"
              />
            </div>

            <div className="flex rounded-xl bg-surface-2 p-1" role="tablist" aria-label="Filtrar usuarios">
              {filtrosConfig.map((f) => {
                const selected = filtro === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setFiltro(f.id)}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors duration-150 ${
                      selected
                        ? "bg-bg text-ink shadow-card"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {f.label}
                    <span className="ml-1.5 text-muted">{conteoFiltros[f.id]}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Lista ────────────────────────────────────────────────────── */}
        {loadingUsuariosNotiActivos ? (
          <ul
            className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface"
            aria-busy="true"
            aria-label="Cargando usuarios"
          >
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="flex animate-pulse items-center gap-3 px-4 py-3.5">
                <div className="h-10 w-10 shrink-0 rounded-full bg-surface-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/2 rounded-md bg-surface-2" />
                  <div className="h-3 w-3/4 rounded-md bg-surface-2" />
                </div>
                <div className="h-7 w-12 shrink-0 rounded-full bg-surface-2" />
              </li>
            ))}
          </ul>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-12 text-center text-muted">
            <IconUsers />
            <p className="mt-3 text-md font-medium text-ink">Aún no hay usuarios</p>
            <p className="mt-1 text-sm">Cuando registres usuarios, podrás activar sus notificaciones desde aquí.</p>
          </div>
        ) : usuariosVisibles.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-12 text-center text-muted">
            <IconSearch className="h-8 w-8" />
            <p className="mt-3 text-md font-medium text-ink">Sin resultados</p>
            <p className="mt-1 text-sm">Prueba con otro nombre o cambia el filtro.</p>
            <button
              type="button"
              onClick={() => {
                setBusqueda("");
                setFiltro(FILTROS.TODOS);
              }}
              className="btn-ghost mt-3 text-brand-600 dark:text-brand-400"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <section>
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm text-muted">
                {usuariosVisibles.length} {usuariosVisibles.length === 1 ? "usuario" : "usuarios"}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSetVisibles(1)}
                  disabled={saving}
                  className="rounded-lg px-2 py-1 text-sm font-medium text-brand-600 transition-colors hover:bg-surface-2 disabled:opacity-50 dark:text-brand-400"
                >
                  Activar todos
                </button>
                <button
                  type="button"
                  onClick={() => handleSetVisibles(0)}
                  disabled={saving}
                  className="rounded-lg px-2 py-1 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-50"
                >
                  Desactivar todos
                </button>
              </div>
            </div>

            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {usuariosVisibles.map((usuario) => {
                const activo = isActivo(usuario);
                const changed = isUsuarioCambiado(usuario, originalUsuarios);

                return (
                  <li key={usuario.idUsuario}>
                    {/* Toda la fila es el interruptor: objetivo táctil grande en móvil */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={activo}
                      aria-label={`Notificaciones de ${usuario.nombreUsuario} ${usuario.apellidoUsuario}`}
                      onClick={() => handleToggle(usuario.idUsuario)}
                      disabled={saving}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2 active:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-md font-semibold transition-colors duration-150 ${
                          activo
                            ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                            : "bg-surface-2 text-muted"
                        }`}
                      >
                        {getInitials(usuario.nombreUsuario, usuario.apellidoUsuario)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-md font-medium text-ink">
                            {usuario.nombreUsuario} {usuario.apellidoUsuario}
                          </p>
                          {changed && <span className="badge-warning shrink-0">Sin guardar</span>}
                        </div>
                        <p className="truncate text-sm text-muted">{usuario.correoUsuario}</p>
                      </div>

                      {/* Interruptor visual */}
                      <span
                        aria-hidden="true"
                        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-150 ${
                          activo ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-card transition-transform duration-150 ${
                            activo ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>

      {/* ── Barra de acciones (solo con cambios pendientes) ─────────────── */}
      {hasChanges && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 pb-safe-bottom backdrop-blur animate-slide-up">
          <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={handleDescartar}
              disabled={saving}
              className="btn-secondary"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={saving}
              className="btn-primary flex-1"
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
};

export default NotificacionesEspeciales;