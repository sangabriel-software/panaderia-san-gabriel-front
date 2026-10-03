import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiXCircle, FiX } from "react-icons/fi";

const TYPE_STYLES = {
  success: { bg: "bg-brand-50", border: "border-brand-200", iconBg: "bg-brand-600", text: "text-brand-800", Icon: FiCheckCircle },
  danger: { bg: "bg-danger-50", border: "border-danger-200", iconBg: "bg-danger-600", text: "text-danger-800", Icon: FiXCircle },
  warning: { bg: "bg-warning-50", border: "border-warning-200", iconBg: "bg-warning-500", text: "text-warning-800", Icon: FiAlertTriangle },
  info: { bg: "bg-accent-50", border: "border-accent-200", iconBg: "bg-accent-600", text: "text-accent-800", Icon: FiInfo },
  primary: { bg: "bg-accent-50", border: "border-accent-200", iconBg: "bg-accent-600", text: "text-accent-800", Icon: FiInfo },
};

const ACTION_VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-500 shadow-brand",
  secondary: "bg-white text-ink border border-line hover:bg-surface-2",
};

// Vertical (top/bottom) + horizontal (justify-*) del contenedor flotante.
const POSITION_CLASSES = {
  "top-left": "top-4 justify-start",
  "top-center": "top-4 justify-center",
  "top-right": "top-4 justify-end",
  "bottom-left": "bottom-4 justify-start",
  "bottom-center": "bottom-4 justify-center",
  "bottom-right": "bottom-4 justify-end",
};

const DEFAULT_DURATION = 5000;

/**
 * Banner de alerta reutilizable, inline o flotante.
 *
 * Props:
 * - type: "success" | "danger" | "warning" | "info" ("primary" = alias de "info")
 * - title / message: texto del banner
 * - icon: JSX opcional para reemplazar el ícono del tipo
 * - actions: [{ label, onClick, variant: "primary" | "secondary" }]
 * - onDismiss: se ejecuta al cerrar (con la X o por autocierre). Si se pasa, muestra la X.
 * - className: clases extra para el banner
 *
 * Posición:
 * - floating: true → fija sobre la pantalla, sin necesidad de hacer scroll
 * - position: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
 *   (por defecto "top-right")
 *
 * Autocierre:
 * - autoClose: true | false → si la alerta debe desaparecer sola.
 *   Si no lo pasas: true cuando es flotante y no tiene actions; false en los demás casos.
 * - duration: milisegundos antes de desaparecer (por defecto 5000). Solo aplica si autoClose está activo.
 * - Se pausa mientras el mouse está encima; al salir, la cuenta vuelve a empezar completa.
 */
function Alert({
  type = "info",
  title,
  message,
  icon,
  actions,
  onDismiss,
  className = "",
  floating = false,
  position = "top-right",
  autoClose,
  duration = DEFAULT_DURATION,
}) {
  const styles = TYPE_STYLES[type] || TYPE_STYLES.info;
  const { Icon } = styles;
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);

  // Ref para que el timer no se reinicie cuando el padre re-renderiza
  // (un onDismiss inline cambia de identidad en cada render).
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  // Compatibilidad: autoClose={3000} (número) sigue funcionando como "sí, en 3000 ms".
  const autoCloseIsNumber = typeof autoClose === "number";
  const shouldAutoClose = autoCloseIsNumber ? true : autoClose ?? (floating && !actions?.length);
  const delay = autoCloseIsNumber ? autoClose : duration;

  useEffect(() => {
    if (!shouldAutoClose || paused || !visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      dismissRef.current?.();
    }, delay);
    return () => clearTimeout(timer);
    // title/message en las dependencias: si llega contenido nuevo, la cuenta se reinicia.
  }, [shouldAutoClose, delay, paused, visible, title, message]);

  if (!visible) return null;

  const alertBox = (
    <div
      role="alert"
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className={`flex gap-3 rounded-2xl border p-4 animate-slide-up ${
        floating ? "shadow-modal" : "shadow-card"
      } ${styles.bg} ${styles.border} ${className}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${styles.iconBg}`}>
        {icon || <Icon size={17} />}
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className={`text-sm font-semibold ${styles.text}`}>{title}</p>}
        {message && <p className={`text-sm ${title ? "mt-0.5" : ""} ${styles.text}`}>{message}</p>}
        {actions?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((action, i) => (
              <button
                key={i}
                type="button"
                onClick={action.onClick}
                className={`rounded-lg border-0 px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  ACTION_VARIANTS[action.variant || "primary"]
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
          aria-label="Cerrar"
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-0 bg-transparent transition-colors hover:bg-black/5 ${styles.text}`}
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  );

  if (!floating) return alertBox;

  // Portal a <body>: evita que un ancestro con transform (como el <main> animado
  // del layout) atrape el position:fixed. El wrapper deja pasar los clics
  // (pointer-events-none) y solo la alerta los recibe.
  return createPortal(
    <div
      className={`pointer-events-none fixed inset-x-0 z-[60] flex px-4 ${
        POSITION_CLASSES[position] || POSITION_CLASSES["top-right"]
      }`}
    >
      <div className="pointer-events-auto w-full max-w-sm">{alertBox}</div>
    </div>,
    document.body
  );
}

export default Alert;