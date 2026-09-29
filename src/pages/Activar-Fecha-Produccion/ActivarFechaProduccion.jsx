import { useState, useEffect, useRef, useCallback } from "react";
import { FiClock, FiZap, FiInfo } from "react-icons/fi";
import { ingresarFechaProduccionService } from "../../services/activar-fecha-produccion/activar-fecha-produccion.service";
import useGetFechaProduccion from "../../hooks/fecha-produccion/useGetFechaProduccion";
import Alert from "../../components/Alerts/Alert";

// ─── Utilidades de fecha ───────────────────────────────────────────────────
const formatDateTimeForDB = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
};

const formatTime = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDate = (date) =>
  date.toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" });

const formatCountdown = (seconds) => {
  if (seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return [m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

const DURATION_MS = 60 * 60 * 1000; // 1 hora
const DURATION_SECONDS = 3600;

function ActivarFechaProduccion() {
  const { diaProduccion, loadingFechaProduccion, showErrorFechaProduccion } = useGetFechaProduccion();

  const [isActive, setIsActive] = useState(false);
  const [activadoEn, setActivadoEn] = useState(null);
  const [expiraEn, setExpiraEn] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const initializedRef = useRef(false);

  const now = new Date();
  const previewInicio = now;
  const previewFin = new Date(now.getTime() + DURATION_MS);

  useEffect(() => {
    if (initializedRef.current) return;
    const registro = Array.isArray(diaProduccion) ? diaProduccion[0] : null;
    if (!registro) return;

    const active = registro.fecha_produccion_a_setear === "today";
    setIsActive(active);

    if (active) {
      setActivadoEn(new Date(registro.activado_en.replace(" ", "T")));
      setExpiraEn(new Date(registro.expira_en.replace(" ", "T")));
      setSecondsRemaining(registro.segundos_restantes ?? 0);
    }
  }, [diaProduccion]);

  useEffect(() => {
    if (!isActive) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsActive(false);
          setActivadoEn(null);
          setExpiraEn(null);
          initializedRef.current = false;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const handleToggle = useCallback(async () => {
    if (toggling || isActive) return;
    setToggling(true);
    setError(null);

    try {
      const ahora = new Date();
      const expira = new Date(ahora.getTime() + DURATION_MS);

      const payload = {
        activado_por: 1,
        activado_en: formatDateTimeForDB(ahora),
        expira_en: formatDateTimeForDB(expira),
        notas: "Ventana de 60 minutos",
      };

      await ingresarFechaProduccionService(payload);

      initializedRef.current = true;
      setActivadoEn(ahora);
      setExpiraEn(expira);
      setSecondsRemaining(DURATION_SECONDS);
      setIsActive(true);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Error al activar la fecha. Intente de nuevo.");
    } finally {
      setToggling(false);
    }
  }, [isActive, toggling]);

  if (loadingFechaProduccion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  const displayActivadoEn = isActive ? activadoEn : previewInicio;
  const displayExpiraEn = isActive ? expiraEn : previewFin;

  // Progreso del anillo: 1 → recién activado, 0 → a punto de expirar
  const progress = isActive ? secondsRemaining / DURATION_SECONDS : 0;
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiZap size={19} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink">Fecha de producción</h1>
          <p className="text-sm text-muted">Habilita el ingreso de órdenes para el día actual</p>
        </div>
      </header>

      {showErrorFechaProduccion && (
        <Alert type="danger" title="No se pudo consultar el estado" message="Intenta recargar la página." />
      )}
      {error && <Alert type="danger" title="No se pudo activar" message={error} onDismiss={() => setError(null)} />}

      {/* ── Panel central: anillo de progreso o botón de activación ────── */}
      <div className="flex flex-col items-center gap-8 rounded-2xl border border-line bg-surface p-8 shadow-card">
        <div className="relative flex h-52 w-52 items-center justify-center">
          {isActive ? (
            <>
              {/* Anillo de progreso, cuenta regresiva de la ventana activa */}
              <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
                <circle cx="100" cy="100" r={radius} fill="none" stroke="rgb(226 226 230)" strokeWidth="12" className="text-line" />
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-500" />
                <span className="mt-2 text-3xl font-bold tabular-nums text-ink">{formatCountdown(secondsRemaining)}</span>
                <span className="mt-1 text-xs font-medium text-muted">Tiempo restante</span>
              </div>
            </>
          ) : (
            // Botón circular grande: la acción principal de toda la pantalla
            <button
              type="button"
              onClick={handleToggle}
              disabled={toggling}
              className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-full border-0 bg-brand-50 text-brand-700 shadow-inner transition-colors hover:bg-brand-100 disabled:cursor-wait disabled:opacity-60"
            >
              {toggling ? (
                <span className="h-8 w-8 animate-spin-smooth rounded-full border-4 border-brand-300 border-t-brand-600" />
              ) : (
                <>
                  <FiZap size={32} />
                  <span className="text-sm font-semibold">Activar ventana</span>
                  <span className="text-xs text-brand-600/80">1 hora de duración</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Estado */}
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
            isActive ? "bg-brand-50 text-brand-700" : "bg-surface-2 text-muted"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isActive ? "bg-brand-500" : "bg-muted"}`} />
          {isActive ? "Ingreso habilitado para el día de hoy" : "Solo se pueden ingresar órdenes para mañana"}
        </div>

        {/* Horario: inicio → fin */}
        <div className="flex w-full max-w-sm items-center justify-between rounded-xl border border-line bg-surface-2/40 px-5 py-4">
          <div className="text-center">
            <p className="text-2xs font-semibold uppercase tracking-wide text-muted">Inicio</p>
            <p className="mt-1 text-lg font-bold text-ink">{displayActivadoEn ? formatTime(displayActivadoEn) : "--:--"}</p>
            <p className="text-2xs text-muted">{displayActivadoEn ? formatDate(displayActivadoEn) : ""}</p>
          </div>
          <FiClock size={16} className="shrink-0 text-brand-600" />
          <div className="text-center">
            <p className="text-2xs font-semibold uppercase tracking-wide text-muted">Fin</p>
            <p className="mt-1 text-lg font-bold text-ink">{displayExpiraEn ? formatTime(displayExpiraEn) : "--:--"}</p>
            <p className="text-2xs text-muted">{displayExpiraEn ? formatDate(displayExpiraEn) : ""}</p>
          </div>
        </div>
      </div>

      {/* ── Nota informativa ─────────────────────────────────────────── */}
      <div className="flex items-start gap-2.5 rounded-xl border border-line bg-surface-2/40 px-4 py-3">
        <FiInfo size={15} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-xs text-muted">La ventana se desactiva automáticamente al expirar el tiempo.</p>
      </div>
    </div>
  );
}

export default ActivarFechaProduccion;