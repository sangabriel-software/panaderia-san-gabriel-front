import { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTheme } from "../../context/ThemeContext";
import { FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import sgMark from "../../assets/sg-mark.svg";
import Alert from "../../components/Alerts/Alert";
import { handleLogin } from "./loginUtils";
import { hasValidSession, getStartRoute } from "../../utils/Auth/sessionRoute";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Aviso mostrado dentro de la tarjeta: { id, type, title, message, credenciales? }
  const [aviso, setAviso] = useState(null);

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    if (queryParams.get("logout") === "success") {
      setAviso({
        id: Date.now(),
        type: "success",
        title: "Sesión cerrada",
        message: "Sesión cerrada correctamente.",
      });

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  // Si ya hay sesión válida (por ejemplo, la PWA se reabrió o se volvió atrás),
  // no se muestra el login: se redirige a la última ruta visitada.
  // Va DESPUÉS de todos los hooks para no romper su orden.
  if (hasValidSession()) {
    return <Navigate to={getStartRoute()} replace />;
  }

  // Al volver a escribir se quita el aviso de error (el de "sesión cerrada" se queda)
  const limpiarError = () => {
    if (aviso?.type === "danger") setAviso(null);
  };

  const onSubmit = (data) => {
    setAviso(null);
    return handleLogin(data, navigate, setIsLoading, setAviso);
  };

  // Cuando las credenciales son incorrectas, los dos campos se marcan en rojo
  const credencialesInvalidas = aviso?.credenciales === true;

  const claseInput = (hayError) =>
    `h-14 w-full rounded-xl border bg-bg px-4 pr-12 text-lg font-medium tracking-wide text-ink placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-muted transition-all focus:outline-none focus:ring-4 ${
      hayError
        ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/15"
        : "border-line focus:border-brand-500 focus:ring-brand-500/10"
    }`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      {/* ─────────────────────────────────────────────
          BACKGROUND
      ───────────────────────────────────────────── */}

      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="dottedGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M40 0 H0 V40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 4"
              className="text-line"
            />
          </pattern>

          <radialGradient id="fadeMask" cx="50%" cy="35%" r="75%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0.25" />
          </radialGradient>

          <mask id="gridMask">
            <rect width="100%" height="100%" fill="url(#fadeMask)" />
          </mask>
        </defs>

        <rect width="100%" height="100%" fill="url(#dottedGrid)" mask="url(#gridMask)" />
      </svg>

      {/* Halos */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />

      {/* ─────────────────────────────────────────────
          THEME TOGGLE
      ───────────────────────────────────────────── */}

      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Cambiar tema"
        className="fixed right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/80 text-muted shadow-card backdrop-blur-sm transition-colors hover:text-brand-700 sm:right-6 sm:top-6"
      >
        {theme === "dark" ? <span className="text-sm">☀︎</span> : <span className="text-sm">☾</span>}
      </button>

      {/* ─────────────────────────────────────────────
          CONTENT
      ───────────────────────────────────────────── */}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:flex-row lg:justify-between lg:gap-8">
        {/* ─────────────────────────────────────────
            DESKTOP BRAND PANEL
            Se mantiene como estaba
        ───────────────────────────────────────── */}

        <div className="hidden max-w-md text-center lg:block lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-xs font-medium text-brand-700 shadow-card backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Sistema de gestión
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Panaderia
            <br />
            <span className="text-brand-600">San Gabriel.</span>
          </h1>

          <p className="mt-5 text-base leading-relaxed text-muted">
            Inventario, producción, pedidos y ventas — todo lo que pasa en Panadería San Gabriel, en un mismo
            lugar.
          </p>
        </div>

        {/* ─────────────────────────────────────────
            LOGIN
        ───────────────────────────────────────── */}

        <div className="w-full max-w-md animate-fade-in sm:max-w-sm lg:max-w-sm">
          <div className="rounded-3xl border border-line bg-surface/90 p-5 shadow-modal backdrop-blur-sm sm:p-8">
            {/* ─────────────────────────────────────
                MOBILE BRAND HEADER
            ───────────────────────────────────── */}

            <div className="mb-8 text-center lg:hidden">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface shadow-brand">
                  <img src={sgMark} alt="Panadería San Gabriel" className="h-14 w-14 rounded-2xl" />
                </div>
              </div>

              <h1 className="text-xl font-semibold tracking-tight text-ink">Panadería San Gabriel</h1>

              <p className="mt-1 text-sm text-muted">Acceso al sistema</p>
            </div>

            {/* ─────────────────────────────────────
                DESKTOP BRAND HEADER
            ───────────────────────────────────── */}

            <div className="mb-7 hidden items-center gap-3 lg:flex">
              <img src={sgMark} alt="Panadería San Gabriel" className="h-12 w-12 rounded-2xl shadow-brand" />

              <div>
                <p className="text-sm font-semibold text-ink">Panadería San Gabriel</p>

                <p className="text-xs text-muted">Acceso al panel</p>
              </div>
            </div>

            {/* ─────────────────────────────────────
                AVISO (error de acceso / sesión cerrada)
            ───────────────────────────────────── */}

            {aviso && (
              <Alert
                key={aviso.id}
                type={aviso.type}
                title={aviso.title}
                message={aviso.message}
                className="mb-5"
                onDismiss={() => setAviso(null)}
                // Los errores se quedan hasta que el usuario los corrige; el éxito se cierra solo
                autoClose={aviso.type === "success"}
                duration={3000}
              />
            )}

            {/* ─────────────────────────────────────
                FORM
            ───────────────────────────────────── */}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Usuario */}
              <div>
                <label htmlFor="usuario" className="mb-2 block text-xs font-semibold text-muted">
                  Usuario
                </label>

                <input
                  type="text"
                  id="usuario"
                  autoCapitalize="none"
                  autoComplete="username"
                  placeholder="Tu usuario"
                  aria-invalid={Boolean(errors.usuario) || credencialesInvalidas}
                  className={claseInput(Boolean(errors.usuario) || credencialesInvalidas)}
                  {...register("usuario", {
                    required: "El usuario es obligatorio",
                    onChange: limpiarError,
                  })}
                />

                {errors.usuario && <p className="mt-2 text-xs text-danger-600">{errors.usuario.message}</p>}
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="contrasena" className="mb-2 block text-xs font-semibold text-muted">
                  Contraseña
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="contrasena"
                    autoComplete="current-password"
                    placeholder="Tu contraseña"
                    aria-invalid={Boolean(errors.contrasena) || credencialesInvalidas}
                    className={claseInput(Boolean(errors.contrasena) || credencialesInvalidas)}
                    {...register("contrasena", {
                      required: "La contraseña es obligatoria",
                      onChange: limpiarError,
                    })}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>

                {errors.contrasena && <p className="mt-2 text-xs text-danger-600">{errors.contrasena.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="group mt-1 flex h-14 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-base font-semibold text-white shadow-brand transition-all duration-150 hover:bg-brand-500 active:scale-[0.99] active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                    Cargando...
                  </>
                ) : (
                  <>
                    Iniciar sesión
                    <FiArrowRight
                      size={17}
                      className="transition-transform duration-150 group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-7 text-center text-[11px] text-muted">
              © {new Date().getFullYear()} Panadería San Gabriel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;