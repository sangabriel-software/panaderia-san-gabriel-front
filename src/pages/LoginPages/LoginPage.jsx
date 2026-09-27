import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as DarkReader from "darkreader";
import { FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import sgMark from "../../assets/sg-mark.svg";
import { handleLogin } from "./loginUtils";

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
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isChangingTheme, setIsChangingTheme] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("logout") === "success") {
      toast.success("Sesión cerrada correctamente", {
        autoClose: 2000,
        toastId: "logout-success",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  useEffect(() => {
    if (theme === "dark") {
      DarkReader.enable({ brightness: 100, contrast: 100, sepia: 0 });
    } else {
      DarkReader.disable();
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    if (isChangingTheme) return;
    setIsChangingTheme(true);
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    const apply = () => {
      if (newTheme === "dark") {
        DarkReader.enable({ brightness: 99, contrast: 90, sepia: 10 });
      } else {
        DarkReader.disable();
      }
      setIsChangingTheme(false);
    };
    if ("requestIdleCallback" in window) requestIdleCallback(apply);
    else setTimeout(apply, 0);
  }, [theme, isChangingTheme]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      {/* ── Textura de fondo: cuadrícula punteada de borde a borde ─────── */}
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

      {/* Halo de marca, sutil, esquina superior izquierda */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />

      {/* Toggle de tema */}
      <button
        type="button"
        onClick={toggleTheme}
        disabled={isChangingTheme}
        aria-label="Cambiar tema"
        className="fixed right-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/80 text-muted shadow-card backdrop-blur-sm transition-colors hover:text-brand-700"
      >
        {isChangingTheme ? (
          <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-brand-300 border-t-transparent" />
        ) : theme === "dark" ? (
          <span className="text-sm">☀︎</span>
        ) : (
          <span className="text-sm">☾</span>
        )}
      </button>

      {/* ── Contenido ────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-16 px-6 py-12 lg:flex-row lg:justify-between lg:gap-8">
        {/* Columna izquierda: mensaje de marca */}
        <div className="max-w-md text-center lg:text-left">
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
            Inventario, producción, pedidos y ventas — todo lo que pasa en
            Panadería San Gabriel, en un mismo lugar.
          </p>
        </div>

        {/* Columna derecha: tarjeta de login */}
        <div className="w-full max-w-sm rounded-3xl border border-line bg-surface/90 p-8 shadow-modal backdrop-blur-sm animate-fade-in">
          <div className="mb-7 flex items-center gap-3">
            <img src={sgMark} alt="Panadería San Gabriel" className="h-12 w-12 rounded-2xl shadow-brand" />
            <div>
              <p className="text-sm font-semibold text-ink">Panadería San Gabriel</p>
              <p className="text-xs text-muted">Acceso al panel</p>
            </div>
          </div>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((data) => handleLogin(data, navigate, setIsLoading))}
            noValidate
          >
            <div>
              <label htmlFor="usuario" className="mb-1.5 block text-xs font-medium text-muted">
                Usuario
              </label>
              <input
                type="text"
                id="usuario"
                autoCapitalize="none"
                autoComplete="username"
                placeholder="Tu usuario"
                className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 ${
                  errors.usuario
                    ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20"
                    : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                }`}
                {...register("usuario", { required: "El usuario es obligatorio" })}
              />
              {errors.usuario && (
                <p className="mt-1.5 text-xs text-danger-600">{errors.usuario.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contrasena" className="mb-1.5 block text-xs font-medium text-muted">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="contrasena"
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 pr-10 text-sm text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 ${
                    errors.contrasena
                      ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20"
                      : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                  }`}
                  {...register("contrasena", { required: "La contraseña es obligatoria" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-muted transition-colors hover:text-ink"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.contrasena && (
                <p className="mt-1.5 text-xs text-danger-600">{errors.contrasena.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group mt-2 flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors duration-150 hover:bg-brand-500 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                  Cargando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <FiArrowRight size={15} className="transition-transform duration-150 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            © {new Date().getFullYear()} Panadería San Gabriel
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;