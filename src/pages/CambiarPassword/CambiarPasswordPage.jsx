import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiCheck, FiLock, FiArrowRight } from "react-icons/fi";

import { getUserData } from "../../utils/Auth/decodedata";
import { cambiarPassService } from "../../services/userServices/usersservices/users.service";
import sgMark from "../../assets/sg-mark.svg";
import useLogout from "../../services/session/logout";
import { removeLocalStorage } from "../../utils/Auth/localstorage";

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
  const { handleLogout } = useLogout();

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

  const isValid = rules.every((rule) => rule.ok);

  const completedRules = rules.filter((rule) => rule.ok).length;

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
          handleLogout();
        }, 3000);
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

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-8">

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="successGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M40 0 H0 V40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="2 4"
                className="text-line"
              />
            </pattern>

            <radialGradient
              id="successFade"
              cx="50%"
              cy="40%"
              r="70%"
            >
              <stop
                offset="0%"
                stopColor="white"
                stopOpacity="1"
              />

              <stop
                offset="100%"
                stopColor="white"
                stopOpacity="0.2"
              />
            </radialGradient>

            <mask id="successMask">
              <rect
                width="100%"
                height="100%"
                fill="url(#successFade)"
              />
            </mask>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#successGrid)"
            mask="url(#successMask)"
          />
        </svg>

        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />

        <div className="relative z-10 w-full max-w-md animate-scale-in">
          <div className="rounded-3xl border border-line bg-surface/90 p-6 text-center shadow-modal backdrop-blur-sm sm:p-10">

            <div className="mb-7 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface shadow-brand">
                <img
                  src={sgMark}
                  alt="Panadería San Gabriel"
                  className="h-14 w-14 rounded-2xl"
                />
              </div>
            </div>

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success-500/10 text-success-500 ring-8 ring-success-500/5">
              <FiCheck size={30} strokeWidth={2.5} />
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              Contraseña actualizada
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Tu contraseña fue actualizada correctamente.
              Serás redirigido al inicio de sesión.
            </p>

            <div className="mt-8">
              <div className="mb-2 flex items-center justify-between text-[11px] text-muted">
                <span>Redirigiendo</span>
                <span>Login</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full w-full origin-left rounded-full bg-brand-500"
                  style={{
                    animation:
                      "redirectProgress 3s linear forwards",
                  }}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
              Volviendo al inicio de sesión...
            </div>
          </div>
        </div>

        <style>{`
          @keyframes redirectProgress {
            from {
              transform: scaleX(0);
            }
            to {
              transform: scaleX(1);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="passwordGrid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M40 0 H0 V40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 4"
              className="text-line"
            />
          </pattern>

          <radialGradient
            id="passwordFade"
            cx="50%"
            cy="35%"
            r="75%"
          >
            <stop
              offset="0%"
              stopColor="white"
              stopOpacity="1"
            />

            <stop
              offset="100%"
              stopColor="white"
              stopOpacity="0.2"
            />
          </radialGradient>

          <mask id="passwordMask">
            <rect
              width="100%"
              height="100%"
              fill="url(#passwordFade)"
            />
          </mask>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#passwordGrid)"
          mask="url(#passwordMask)"
        />
      </svg>

      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:justify-between lg:gap-16">

        <div className="hidden max-w-md lg:block">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-xs font-medium text-brand-700 shadow-card backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Seguridad de la cuenta
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Protege
            <br />
            <span className="text-brand-600">
              tu cuenta.
            </span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            Establece una contraseña segura para mantener
            protegida tu información dentro del sistema de
            Panadería San Gabriel.
          </p>

          <div className="mt-8 space-y-3">

            <div className="flex items-center gap-3 text-sm text-muted">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                <FiLock size={15} />
              </div>
              Protección de acceso
            </div>

            <div className="flex items-center gap-3 text-sm text-muted">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                <FiCheck size={15} />
              </div>
              Validación de seguridad
            </div>

          </div>
        </div>

        <div className="w-full max-w-md animate-fade-in lg:max-w-sm">

          <div className="rounded-3xl border border-line bg-surface/90 p-5 shadow-modal backdrop-blur-sm sm:p-8">

            <div className="mb-7 text-center">

              <div className="mb-5 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface shadow-brand">
                  <img
                    src={sgMark}
                    alt="Panadería San Gabriel"
                    className="h-12 w-12 rounded-2xl"
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold tracking-tight text-ink">
                Cambia tu contraseña
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-muted">
                Por seguridad, establece una nueva contraseña
                antes de continuar.
              </p>
            </div>

            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-line bg-bg/60 p-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-sm font-semibold text-brand-600">
                {usuario?.usuario?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {usuario?.nombreUsuario || "Usuario"}
                </p>

                <p className="truncate text-xs text-muted">
                  @{usuario?.usuario}
                </p>
              </div>

              <div className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-500/10 text-success-500">
                <FiCheck size={14} />
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
              autoComplete="off"
            >

              {/* Nueva contraseña */}
              <div>
                <label
                  htmlFor="nueva"
                  className="mb-2 block text-xs font-semibold text-muted"
                >
                  Nueva contraseña
                </label>

                <div className="relative">

                  <input
                    id="nueva"
                    name="nueva"
                    type={showNueva ? "text" : "password"}
                    value={form.nueva}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="Crea una contraseña segura"
                    className="h-14 w-full rounded-xl border border-line bg-bg px-4 pr-12 text-lg font-medium tracking-wide text-ink placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-muted transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNueva((prev) => !prev)
                    }
                    aria-label={
                      showNueva
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    {showNueva ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label
                  htmlFor="confirmar"
                  className="mb-2 block text-xs font-semibold text-muted"
                >
                  Confirmar contraseña
                </label>

                <div className="relative">

                  <input
                    id="confirmar"
                    name="confirmar"
                    type={showConf ? "text" : "password"}
                    value={form.confirmar}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="Repite tu contraseña"
                    className={`h-14 w-full rounded-xl border bg-bg px-4 pr-12 text-lg font-medium tracking-wide text-ink placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-muted transition-all focus:outline-none focus:ring-4 ${
                      form.confirmar &&
                      form.nueva !== form.confirmar
                        ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/10"
                        : "border-line focus:border-brand-500 focus:ring-brand-500/10"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConf((prev) => !prev)
                    }
                    aria-label={
                      showConf
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    {showConf ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password strength */}
              {form.nueva && (
                <div className="rounded-2xl border border-line bg-bg/60 p-4 animate-slide-up">

                  <div className="mb-3 flex items-center justify-between">

                    <span className="text-xs font-semibold text-ink">
                      Seguridad de contraseña
                    </span>

                    <span className="text-[11px] font-medium text-muted">
                      {completedRules}/5
                    </span>

                  </div>

                  <div className="mb-4 flex gap-1">
                    {rules.map((rule, index) => (
                      <div
                        key={index}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          rule.ok
                            ? "bg-brand-500"
                            : "bg-surface-2"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">

                    {rules.map((rule, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 text-[11px] transition-colors ${
                          rule.ok
                            ? "text-brand-600"
                            : "text-muted"
                        }`}
                      >

                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                            rule.ok
                              ? "border-brand-500 bg-brand-500 text-white"
                              : "border-line text-transparent"
                          }`}
                        >
                          <FiCheck size={9} />
                        </span>

                        {rule.label}
                      </div>
                    ))}

                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-danger-500/20 bg-danger-500/10 px-3.5 py-3 text-xs text-danger-600 animate-slide-up">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white">
                    !
                  </span>

                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || loading}
                className="group flex h-14 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-base font-semibold text-white shadow-brand transition-all duration-150 hover:bg-brand-500 active:scale-[0.99] active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    Actualizar contraseña

                    <FiArrowRight
                      size={17}
                      className="transition-transform duration-150 group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>

            </form>

            <p className="mt-7 text-center text-[11px] text-muted">
              © {new Date().getFullYear()} Panadería San Gabriel
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CambiarPasswordPage;