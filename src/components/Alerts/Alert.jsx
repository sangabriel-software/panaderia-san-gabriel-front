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

/**
 * Banner de alerta no-modal, reutilizable en toda la app.
 * - type: "success" | "danger" | "warning" | "info" (alias "primary" = "info", por compatibilidad)
 * - title / message: texto del banner
 * - icon: JSX opcional para sobreescribir el ícono por defecto del tipo
 * - actions: [{ label, onClick, variant: "primary" | "secondary" }] — opcional, para casos
 *   como "guardado con éxito" que necesitan botones de acción, sin usar un modal.
 * - onDismiss: si se pasa, muestra una X para cerrar el banner.
 */
function Alert({ type = "info", title, message, icon, actions, onDismiss, className = "" }) {
  const styles = TYPE_STYLES[type] || TYPE_STYLES.info;
  const { Icon } = styles;

  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-2xl border p-4 shadow-card animate-slide-up ${styles.bg} ${styles.border} ${className}`}
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
                className={`rounded-lg border-0 px-3.5 py-1.5 text-xs font-semibold transition-colors ${ACTION_VARIANTS[action.variant || "primary"]}`}
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
          onClick={onDismiss}
          aria-label="Cerrar"
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-0 bg-transparent transition-colors hover:bg-black/5 ${styles.text}`}
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  );
}

export default Alert;