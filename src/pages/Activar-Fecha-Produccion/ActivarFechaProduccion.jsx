import { useState, useEffect, useRef, useCallback } from "react";
import { ingresarFechaProduccionService } from "../../services/activar-fecha-produccion/activar-fecha-produccion.service";
import useGetFechaProduccion from "../../hooks/fecha-produccion/useGetFechaProduccion";
import "./ActivarFechaProduccion.styles.css";

// ─── Utilidades de fecha ───────────────────────────────────────────────────────

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

const formatDate = (date) => {
  return date.toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCountdown = (seconds) => {
  if (seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

const DURATION_MS = 60 * 60 * 1000; // 1 hora

// ─── Componente Principal ──────────────────────────────────────────────────────

const ActivarFechaProduccion = () => {
  const {
    diaProduccion,
    loadingFechaProduccion,
    showErrorFechaProduccion,
  } = useGetFechaProduccion();

  const [isActive, setIsActive]                 = useState(false);
  const [activadoEn, setActivadoEn]             = useState(null);
  const [expiraEn, setExpiraEn]                 = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [toggling, setToggling]                 = useState(false);
  const [error, setError]                       = useState(null);

  const intervalRef    = useRef(null);
  const initializedRef = useRef(false); // evita re-sincronizar si el usuario activa en la misma sesión

  // Preview: horas que se mostrarían si se activara ahora mismo
  const now           = new Date();
  const previewInicio = now;
  const previewFin    = new Date(now.getTime() + DURATION_MS);

  // ── Sincronizar con respuesta del backend al montar ───────────────────────
  useEffect(() => {
    // Si ya fue inicializado en esta sesión (activación manual), no sobreescribir
    if (initializedRef.current) return;

    // diaProduccion es un array — tomamos el primer elemento
    const registro = Array.isArray(diaProduccion) ? diaProduccion[0] : null;
    if (!registro) return;

    const active = registro.fecha_produccion_a_setear === "today";
    setIsActive(active);

    if (active) {
      // Parsear fechas que vienen como string "YYYY-MM-DD HH:mm:ss"
      setActivadoEn(new Date(registro.activado_en.replace(" ", "T")));
      setExpiraEn(new Date(registro.expira_en.replace(" ", "T")));
      // segundos_restantes viene calculado por la BD — es el tiempo real que queda
      setSecondsRemaining(registro.segundos_restantes ?? 0);
    }
  }, [diaProduccion]);

  // ── Countdown ticker ─────────────────────────────────────────────────────
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

  // ── Handler del toggle ────────────────────────────────────────────────────
  const handleToggle = useCallback(async () => {
    if (toggling || isActive) return;

    setToggling(true);
    setError(null);

    try {
      const ahora  = new Date();
      const expira = new Date(ahora.getTime() + DURATION_MS);

      const payload = {
        activado_por: 1, // reemplazar con el id del usuario autenticado
        activado_en:  formatDateTimeForDB(ahora),
        expira_en:    formatDateTimeForDB(expira),
        notas:        "Ventana de 60 minutos",
      };

      await ingresarFechaProduccionService(payload);

      // Marcar como inicializado para que el useEffect del hook no sobreescriba
      initializedRef.current = true;

      setActivadoEn(ahora);
      setExpiraEn(expira);
      setSecondsRemaining(3600); // arranca desde 3600 porque acaba de activarse
      setIsActive(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? "Error al activar la fecha. Intente de nuevo.";
      setError(msg);
    } finally {
      setToggling(false);
    }
  }, [isActive, toggling]);

  // ── Render: loading ───────────────────────────────────────────────────────
  if (loadingFechaProduccion) {
    return (
      <div className="afp-wrapper">
        <div className="afp-card">
          <div className="afp-loading">
            <div className="afp-spinner" />
          </div>
        </div>
      </div>
    );
  }

  // ── Render principal ──────────────────────────────────────────────────────
  const displayActivadoEn = isActive ? activadoEn : previewInicio;
  const displayExpiraEn   = isActive ? expiraEn   : previewFin;

  return (
    <div className="afp-wrapper">
      <div className="afp-card">

        {/* Header */}
        <div className="afp-header">
          <div className={`afp-header-icon ${isActive ? "active" : ""}`}>
            {isActive ? "🟢" : "📅"}
          </div>
          <div className="afp-header-text">
            <h2>Activación de fecha de producción</h2>
            <p>Habilita el ingreso de órdenes para el día actual</p>
          </div>
        </div>

        {/* Body */}
        <div className="afp-body">

          {/* Preview de horas */}
          <div className={`afp-time-preview ${isActive ? "is-active" : ""}`}>
            <div className="afp-time-block">
              <span className="afp-time-label">Inicio</span>
              <span className="afp-time-value">
                {displayActivadoEn ? formatTime(displayActivadoEn) : "--:--"}
              </span>
              <span className="afp-time-date">
                {displayActivadoEn ? formatDate(displayActivadoEn) : ""}
              </span>
            </div>

            <div className="afp-time-arrow">→</div>

            <div className="afp-time-block">
              <span className="afp-time-label">Fin</span>
              <span className="afp-time-value">
                {displayExpiraEn ? formatTime(displayExpiraEn) : "--:--"}
              </span>
              <span className="afp-time-date">
                {displayExpiraEn ? formatDate(displayExpiraEn) : ""}
              </span>
            </div>
          </div>

          {/* Toggle row */}
          <div className="afp-toggle-row">
            <div className="afp-toggle-info">
              <span className="afp-toggle-title">
                {isActive ? "Ventana activa" : "Activar fecha del día"}
              </span>
              <span className="afp-toggle-subtitle">
                {isActive
                  ? "Las órdenes pueden ingresarse para hoy"
                  : "Al activar se habilitará por 1 hora"}
              </span>
            </div>

            <label
              className="afp-toggle-switch"
              title={isActive ? "Ventana activa" : "Activar ventana"}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={handleToggle}
                disabled={toggling || isActive}
              />
              <span className="afp-toggle-track" />
              <span className="afp-toggle-thumb" />
            </label>
          </div>

          {/* Estado */}
          <div className={`afp-status ${isActive ? "active" : "inactive"}`}>
            <span className="afp-status-dot" />
            {isActive
              ? "Ingreso habilitado para el día de hoy"
              : "Solo se pueden ingresar órdenes para mañana"}
          </div>

          {/* Countdown — solo visible si está activo */}
          {isActive && (
            <div className="afp-countdown">
              <span className="afp-countdown-label">Tiempo restante</span>
              <span className="afp-countdown-timer">
                {formatCountdown(secondsRemaining)}
              </span>
            </div>
          )}

          {/* Error del hook */}
          {showErrorFechaProduccion && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "var(--color-danger-light)",
                border: "1px solid #f5c0bb",
                borderRadius: "var(--radius-md)",
                fontSize: "0.82rem",
                color: "var(--color-danger)",
              }}
            >
              ⚠️ Error al consultar el estado de activación.
            </div>
          )}

          {/* Error del toggle */}
          {error && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "var(--color-danger-light)",
                border: "1px solid #f5c0bb",
                borderRadius: "var(--radius-md)",
                fontSize: "0.82rem",
                color: "var(--color-danger)",
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="afp-footer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          La ventana se desactiva automáticamente al expirar el tiempo.
        </div>

      </div>
    </div>
  );
};

export default ActivarFechaProduccion;