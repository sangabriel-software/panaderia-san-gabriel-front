import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import useGetUsers from "../../hooks/usuarioshook/useGetUsers";
import { resetearPassService } from "../../services/userServices/usersservices/users.service";
import "./ResetPass.styles.css";

const STORAGE_KEY = "rp_passes";
const EXPIRY_MINUTES = 15;

const getInitials = (nombre) =>
  nombre.trim().split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");

const timeLeft = (exp) => {
  const diff = dayjs(exp).diff(dayjs(), "second");
  if (diff <= 0) return null;
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
};

// ── Persistencia ──────────────────────────────────────────────────────────────
const loadPasses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Limpiar los expirados
    const cleaned = {};
    Object.entries(parsed).forEach(([id, data]) => {
      if (data && dayjs().isBefore(dayjs(data.exp))) {
        cleaned[id] = data;
      }
    });
    return cleaned;
  } catch {
    return {};
  }
};

const savePasses = (passes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passes));
  } catch {}
};

// ── Timer component ───────────────────────────────────────────────────────────
const PassTimer = ({ exp, onExpire }) => {
  const [label, setLabel] = useState(timeLeft(exp));

  useEffect(() => {
    const t = setInterval(() => {
      const left = timeLeft(exp);
      if (!left) { clearInterval(t); onExpire(); return; }
      setLabel(left);
    }, 1000);
    return () => clearInterval(t);
  }, [exp]);

  return <span className="rp-expiry">{label}</span>;
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg }) => (
  <div className={`rp-toast ${msg ? "rp-toast--show" : ""}`}>{msg}</div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const ResetPassPage = () => {
  const { usuarios, loadingUsers, showErrorUsers } = useGetUsers();

  const [passes,  setPasses]  = useState(loadPasses);
  const [loading, setLoading] = useState({});
  const [toast,   setToast]   = useState("");
  const toastTimer = useRef(null);

  // Sincronizar con localStorage cada vez que cambia passes
  useEffect(() => { savePasses(passes); }, [passes]);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  };

  const handleCopy = (val) => {
    navigator.clipboard?.writeText(val).catch(() => {});
    showToast("Contraseña copiada al portapapeles");
  };

  const handleReset = async (idUsuario) => {
    const current = passes[idUsuario];
    if (current && dayjs().isBefore(dayjs(current.exp))) return; // bloqueado

    setLoading((prev) => ({ ...prev, [idUsuario]: true }));
    try {
      const res = await resetearPassService(idUsuario);
      const val = res?.passGenerada;
      const exp = dayjs().add(EXPIRY_MINUTES, "minute").toISOString();

      setPasses((prev) => ({ ...prev, [String(idUsuario)]: { val, exp } }));
      showToast("Contraseña reseteada correctamente");
    } catch {
      showToast("Error al resetear. Intenta de nuevo.");
    } finally {
      setLoading((prev) => ({ ...prev, [idUsuario]: false }));
    }
  };

  const handleExpire = (idUsuario) => {
    setPasses((prev) => {
      const next = { ...prev };
      delete next[String(idUsuario)];
      return next;
    });
  };

  const usuariosActivos = usuarios?.filter((u) => u.estadoUsuario === "A") ?? [];

  return (
    <div className="rp-page">

      <div className="rp-header">
        <h1 className="rp-title">Resetear contraseña</h1>
        <p className="rp-sub">
          La contraseña generada es visible {EXPIRY_MINUTES} minutos. Durante ese tiempo no se puede volver a resetear.
        </p>
      </div>

      {loadingUsers ? (
        <div className="rp-loading">
          <div className="rp-spinner" />
          <span>Cargando usuarios...</span>
        </div>
      ) : showErrorUsers ? (
        <div className="rp-empty">Error al cargar los usuarios.</div>
      ) : (
        <div className="rp-list">
          {usuariosActivos.map((u, idx) => {
            const key      = String(u.idUsuario);
            const pass     = passes[key];
            const hasPass  = pass && dayjs().isBefore(dayjs(pass.exp));
            const isLoading = loading[u.idUsuario];
            const isBlocked = hasPass;

            return (
              <div key={u.idUsuario} className={`rp-item ${hasPass ? "rp-item--active" : ""}`}>

                <div className={`rp-avatar rp-avatar--${idx % 5}`}>
                  {getInitials(u.nombreUsuario)}
                </div>

                <div className="rp-body">
                  <div className="rp-row">
                    <div className="rp-info">
                      <p className="rp-name">{u.nombreUsuario}</p>
                      <p className="rp-meta">
                        <span className="rp-idx">#{idx + 1}</span>
                        <span>@{u.usuario}</span>
                        <span className="rp-role-badge">{u.nombreRol}</span>
                      </p>
                    </div>

                    <button
                      className={`rp-btn ${isBlocked ? "rp-btn--blocked" : ""} ${isLoading ? "rp-btn--loading" : ""}`}
                      onClick={() => handleReset(u.idUsuario)}
                      disabled={isLoading || isBlocked}
                      title={isBlocked ? "Espera a que expire la contraseña actual" : "Resetear contraseña"}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                        style={{ animation: isLoading ? "rp-spin 0.7s linear infinite" : "none" }}>
                        <path d="M23 4v6h-6"/>
                        <path d="M1 20v-6h6"/>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                      </svg>
                      {isLoading ? "Generando..." : isBlocked ? "Bloqueado" : "Resetear"}
                    </button>
                  </div>

                  {hasPass && (
                    <div className="rp-pass-row">
                      <div className="rp-pass-box">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                          style={{ flexShrink: 0, opacity: 0.6 }} aria-hidden="true">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <span className="rp-pass-val">{pass.val}</span>
                        <button
                          className="rp-copy-btn"
                          onClick={() => handleCopy(pass.val)}
                          aria-label="Copiar contraseña"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <rect x="9" y="9" width="13" height="13" rx="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </button>
                      </div>
                      <PassTimer exp={pass.exp} onExpire={() => handleExpire(u.idUsuario)} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
};

export default ResetPassPage;