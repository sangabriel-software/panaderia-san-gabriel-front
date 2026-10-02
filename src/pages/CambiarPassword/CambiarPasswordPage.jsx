import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../../utils/Auth/decodedata";
import { cambiarPassService } from "../../services/userServices/usersservices/users.service";

const CambiarPasswordPage = () => {
  const navigate = useNavigate();
  const usuario = getUserData();

  const [form, setForm] = useState({
    nueva: "",
    confirmar: "",
  });

  const [showNueva, setShowNueva] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const rules = [
    {
      label: "Al menos 8 caracteres",
      ok: form.nueva.length >= 8,
    },
    {
      label: "Una letra mayúscula",
      ok: /[A-Z]/.test(form.nueva),
    },
    {
      label: "Una letra minúscula",
      ok: /[a-z]/.test(form.nueva),
    },
    {
      label: "Un número",
      ok: /[0-9]/.test(form.nueva),
    },
    {
      label: "Las contraseñas coinciden",
      ok:
        form.nueva === form.confirmar &&
        form.confirmar !== "",
    },
  ];

  const completedRules = rules.filter((rule) => rule.ok).length;
  const isValid = rules.every((rule) => rule.ok);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        contrasena: form.nueva,
        usuario: usuario.usuario,
      };

      const res = await cambiarPassService(payload);

      if (res?.status === 200 || res?.message) {
        setSuccess(true);

        setTimeout(() => {
          navigate("/login");
        }, 2500);
      }
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
          "No se pudo actualizar la contraseña. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ─────────────────────────────────────────────────────────────
   * SUCCESS STATE
   * ─────────────────────────────────────────────────────────────
   */

  if (success) {
    return (
      <div className="min-h-screen bg-bg text-ink flex items-center justify-center px-4 relative overflow-hidden">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md animate-scale-in">
          <div className="rounded-3xl border border-line bg-surface/90 p-8 shadow-modal backdrop-blur-xl text-center">
            {/* Success icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-500/10 text-success-500 ring-1 ring-success-500/20">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-success-500">
                Seguridad actualizada
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-ink">
                Contraseña actualizada
              </h1>

              <p className="text-sm leading-6 text-muted">
                Tu contraseña se actualizó correctamente. Te enviaremos
                al inicio de sesión para continuar.
              </p>
            </div>

            {/* Progress */}
            <div className="mt-7 space-y-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full w-full rounded-full bg-success-500 animate-[slide-in_2.5s_linear]" />
              </div>

              <p className="text-[11px] text-muted">
                Redirigiendo...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ─────────────────────────────────────────────────────────────
   * MAIN
   * ─────────────────────────────────────────────────────────────
   */

  return (
    <div className="min-h-screen bg-bg text-ink relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[500px] w-[500px] rounded-full bg-brand-500/8 blur-3xl" />

        <div className="absolute top-1/3 -right-48 h-[450px] w-[450px] rounded-full bg-accent-500/8 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-[300px] w-[500px] rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">

          {/* ───────────────────────────────────────────────
              Desktop layout
          ─────────────────────────────────────────────── */}

          <div className="grid overflow-hidden rounded-3xl border border-line bg-surface/80 shadow-modal backdrop-blur-xl lg:grid-cols-[0.85fr_1.15fr]">

            {/* ─────────────────────────────────────────────
                LEFT PANEL
            ───────────────────────────────────────────── */}

            <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white dark:bg-black">
              {/* Decorative grid */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              {/* Glow */}
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />

              <div className="relative">
                {/* Logo mark */}
                <div className="mb-10 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-brand-300 shadow-glow">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <circle cx="12" cy="15.5" r="1" />
                  </svg>
                </div>

                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                  Protección de cuenta
                </p>

                <h2 className="max-w-sm text-3xl font-semibold leading-tight tracking-tight">
                  Mantén tu cuenta protegida.
                </h2>

                <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                  Configura una contraseña segura para proteger el acceso
                  a tu información y operaciones.
                </p>
              </div>

              {/* Security features */}
              <div className="relative space-y-3">
                {[
                  "Protección de acceso",
                  "Contraseña segura",
                  "Información protegida",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-400/10 text-brand-300">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>

                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* ─────────────────────────────────────────────
                FORM PANEL
            ───────────────────────────────────────────── */}

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mx-auto max-w-md">

                {/* Header */}
                <div className="mb-8">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 ring-1 ring-brand-500/20">
                    <svg
                      width="23"
                      height="23"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="10"
                        rx="2"
                      />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      <circle cx="12" cy="16" r="1" />
                    </svg>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                      Crea tu nueva contraseña
                    </h1>

                    <p className="text-sm leading-6 text-muted">
                      Antes de continuar necesitamos que establezcas
                      una contraseña nueva para tu cuenta.
                    </p>
                  </div>
                </div>

                {/* User identity */}
                <div className="mb-7 flex items-center gap-3 rounded-2xl border border-line bg-bg/70 p-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 text-sm font-semibold text-white shadow-brand">
                    {usuario?.usuario?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {usuario?.nombreUsuario ?? "Usuario"}
                    </p>

                    <p className="truncate text-xs text-muted">
                      @{usuario?.usuario}
                    </p>
                  </div>

                  <div className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-500/10 text-success-500">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  autoComplete="off"
                >
                  {/* Nueva contraseña */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                      Nueva contraseña
                    </label>

                    <div className="group relative">
                      <input
                        type={showNueva ? "text" : "password"}
                        name="nueva"
                        value={form.nueva}
                        onChange={handleChange}
                        autoComplete="new-password"
                        placeholder="Introduce una contraseña segura"
                        className="h-12 w-full rounded-xl border border-line bg-bg px-4 pr-12 text-sm text-ink outline-none transition-all placeholder:text-muted/60 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowNueva((prev) => !prev)}
                        aria-label={
                          showNueva ? "Ocultar contraseña" : "Mostrar contraseña"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                      >
                        {showNueva ? (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password strength */}
                  {form.nueva && (
                    <div className="animate-slide-up rounded-2xl border border-line bg-bg/60 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink">
                          Seguridad de la contraseña
                        </span>

                        <span
                          className={`text-[11px] font-semibold ${
                            completedRules === 5
                              ? "text-success-500"
                              : completedRules >= 3
                              ? "text-warning-500"
                              : "text-muted"
                          }`}
                        >
                          {completedRules}/5
                        </span>
                      </div>

                      {/* Strength bar */}
                      <div className="mb-4 grid grid-cols-5 gap-1">
                        {rules.map((rule, index) => (
                          <div
                            key={rule.label}
                            className={`h-1 rounded-full transition-all duration-300 ${
                              rule.ok
                                ? "bg-success-500"
                                : index < completedRules
                                ? "bg-warning-500"
                                : "bg-surface-2"
                            }`}
                          />
                        ))}
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {rules.map((rule) => (
                          <div
                            key={rule.label}
                            className={`flex items-center gap-2 text-xs transition-colors ${
                              rule.ok
                                ? "text-success-500"
                                : "text-muted"
                            }`}
                          >
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                rule.ok
                                  ? "bg-success-500/10"
                                  : "bg-surface-2"
                              }`}
                            >
                              {rule.ok ? (
                                <svg
                                  width="9"
                                  height="9"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                              )}
                            </span>

                            {rule.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confirmar contraseña */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                      Confirmar contraseña
                    </label>

                    <div className="relative">
                      <input
                        type={showConf ? "text" : "password"}
                        name="confirmar"
                        value={form.confirmar}
                        onChange={handleChange}
                        autoComplete="new-password"
                        placeholder="Repite tu contraseña"
                        className={`h-12 w-full rounded-xl border bg-bg px-4 pr-12 text-sm text-ink outline-none transition-all placeholder:text-muted/60 focus:ring-4 ${
                          form.confirmar &&
                          form.nueva !== form.confirmar
                            ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/10"
                            : form.confirmar &&
                              form.nueva === form.confirmar
                            ? "border-success-500 focus:border-success-500 focus:ring-success-500/10"
                            : "border-line focus:border-brand-500 focus:ring-brand-500/10"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowConf((prev) => !prev)}
                        aria-label={
                          showConf ? "Ocultar contraseña" : "Mostrar contraseña"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                      >
                        {showConf ? (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {form.confirmar &&
                      form.nueva !== form.confirmar && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-danger-500 animate-fade-in">
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          Las contraseñas no coinciden
                        </p>
                      )}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-danger-500/20 bg-danger-500/5 px-4 py-3 text-sm text-danger-500 animate-fade-in">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="mt-0.5 shrink-0"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>

                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!isValid || loading}
                    className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:bg-brand-500 hover:shadow-glow active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        Actualizar contraseña

                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Security note */}
                  <div className="flex items-start gap-2.5 pt-1 text-[11px] leading-5 text-muted">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      className="mt-0.5 shrink-0"
                    >
                      <rect
                        x="4"
                        y="10"
                        width="16"
                        height="11"
                        rx="2"
                      />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>

                    <span>
                      Tu contraseña se almacena de forma segura y no se
                      mostrará a otros usuarios.
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-[11px] text-muted">
            Actualización de credenciales · Acceso protegido
          </p>
        </div>
      </div>
    </div>
  );
};

export default CambiarPasswordPage;