import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../../utils/Auth/decodedata";
import { cambiarPassService } from "../../services/userServices/usersservices/users.service";
import "./CambiarPassword.styles.css";

const CambiarPasswordPage = () => {
  const navigate  = useNavigate();
  const usuario   = getUserData();


  const [form,       setForm]       = useState({ nueva: "", confirmar: "" });
  const [showNueva,  setShowNueva]  = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);

  // ── Reglas de validación ──────────────────────────────────────────────────
  const rules = [
    { label: "Al menos 8 caracteres",       ok: form.nueva.length >= 8 },
    { label: "Una letra mayúscula",          ok: /[A-Z]/.test(form.nueva) },
    { label: "Una letra minúscula",          ok: /[a-z]/.test(form.nueva) },
    { label: "Un número",                    ok: /[0-9]/.test(form.nueva) },
    { label: "Las contraseñas coinciden",    ok: form.nueva === form.confirmar && form.confirmar !== "" },
  ];

  const isValid = rules.every((r) => r.ok);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
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
        setTimeout(() => navigate("/login"), 2500);
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

  // ── Pantalla de éxito ─────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="cp-page">
        <div className="cp-card cp-success-card">
          <div className="cp-success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="cp-success-title">Contraseña actualizada</p>
          <p className="cp-success-sub">
            Serás redirigido al inicio de sesión en un momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-page">
      <div className="cp-card">

        {/* Ícono + Título */}
        <div className="cp-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1 className="cp-title">Cambia tu contraseña</h1>
        <p className="cp-sub">
          Por seguridad, debes establecer una nueva contraseña antes de continuar.
        </p>

        {/* Usuario */}
        <div className="cp-user-row">
          <div className="cp-user-avatar">
            {usuario?.usuario?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="cp-user-name">{usuario?.nombreUsuario ?? "Usuario"}</p>
            <p className="cp-user-alias">@{usuario?.usuario}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="cp-form" autoComplete="off">

          {/* Nueva contraseña */}
          <div className="cp-field">
            <label className="cp-label">Nueva contraseña</label>
            <div className="cp-input-wrap">
              <input
                type={showNueva ? "text" : "password"}
                name="nueva"
                className="cp-input"
                placeholder="••••••••"
                value={form.nueva}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="cp-eye"
                onClick={() => setShowNueva((p) => !p)}
                aria-label={showNueva ? "Ocultar" : "Mostrar"}
              >
                {showNueva ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="cp-field">
            <label className="cp-label">Confirmar contraseña</label>
            <div className="cp-input-wrap">
              <input
                type={showConf ? "text" : "password"}
                name="confirmar"
                className={`cp-input ${
                  form.confirmar && form.nueva !== form.confirmar ? "cp-input--error" : ""
                }`}
                placeholder="••••••••"
                value={form.confirmar}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="cp-eye"
                onClick={() => setShowConf((p) => !p)}
                aria-label={showConf ? "Ocultar" : "Mostrar"}
              >
                {showConf ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Reglas */}
          {form.nueva && (
            <div className="cp-rules">
              {rules.map((r, i) => (
                <div key={i} className={`cp-rule ${r.ok ? "cp-rule--ok" : ""}`}>
                  <span className="cp-rule-icon">
                    {r.ok ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                    )}
                  </span>
                  {r.label}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="cp-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            className="cp-btn"
            disabled={!isValid || loading}
          >
            {loading ? (
              <>
                <div className="cp-btn-spinner" />
                Actualizando...
              </>
            ) : (
              "Actualizar contraseña"
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CambiarPasswordPage;