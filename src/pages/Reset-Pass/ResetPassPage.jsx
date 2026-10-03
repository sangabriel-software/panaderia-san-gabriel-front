import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import {
  FiArrowLeft,
  FiKey,
  FiRefreshCw,
  FiCopy,
  FiClock,
  FiLock,
  FiSearch,
  FiX,
  FiUsers,
} from "react-icons/fi";
import useGetUsers from "../../hooks/usuarioshook/useGetUsers";
import { resetearPassService } from "../../services/userServices/usersservices/users.service";
import Alert from "../../components/Alerts/Alert";

const STORAGE_KEY = "rp_passes";
const EXPIRY_MINUTES = 15;

const AVATAR_TONES = [
  "bg-brand-50",
];

const getInitials = (nombre) =>
  nombre.trim().split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");

const timeLeft = (exp) => {
  const diff = dayjs(exp).diff(dayjs(), "second");
  if (diff <= 0) return null;
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
};

// ── Persistencia ─────────────────────────────────────────────────────────
const loadPasses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const cleaned = {};
    Object.entries(parsed).forEach(([id, data]) => {
      if (data && dayjs().isBefore(dayjs(data.exp))) cleaned[id] = data;
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

// ── Timer ────────────────────────────────────────────────────────────────
function PassTimer({ exp, onExpire }) {
  const [label, setLabel] = useState(timeLeft(exp));

  useEffect(() => {
    const t = setInterval(() => {
      const left = timeLeft(exp);
      if (!left) {
        clearInterval(t);
        onExpire();
        return;
      }
      setLabel(left);
    }, 1000);
    return () => clearInterval(t);
  }, [exp]);

  return (
    <span className="flex items-center gap-1 text-xs font-medium text-danger-800">
      <FiClock size={12} /> {label}
    </span>
  );
}

function ResetPassPage() {
  const navigate = useNavigate();
  const { usuarios, loadingUsers, showErrorUsers } = useGetUsers();

  const [passes, setPasses] = useState(loadPasses);
  const [loading, setLoading] = useState({});
  const [toastMsg, setToastMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => {
    savePasses(passes);
  }, [passes]);

  const showToast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
  };

  const handleCopy = (val) => {
    navigator.clipboard?.writeText(val).catch(() => {});
    showToast("Contraseña copiada al portapapeles");
  };

  const handleReset = async (idUsuario) => {
    const current = passes[idUsuario];
    if (current && dayjs().isBefore(dayjs(current.exp))) return;

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

  const usuariosActivos = useMemo(() => usuarios?.filter((u) => u.estadoUsuario === "A") ?? [], [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return usuariosActivos;
    return usuariosActivos.filter((u) =>
      `${u.nombreUsuario} ${u.usuario} ${u.nombreRol}`.toLowerCase().includes(term)
    );
  }, [usuariosActivos, searchTerm]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Toast flotante ───────────────────────────────────────────── */}
      {toastMsg && (
        <Alert
          floating
          position="top-right"
          type="success"
          title={toastMsg}
          duration={2400}
          onDismiss={() => setToastMsg("")}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/config")}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiKey size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Resetear contraseña</h1>
          <p className="text-sm text-muted">
            La contraseña generada es visible {EXPIRY_MINUTES} minutos. Durante ese tiempo no se puede volver a resetear.
          </p>
        </div>
      </header>

      {showErrorUsers && (
        <Alert type="danger" title="No se pudieron cargar los usuarios" message="Intenta recargar la página." />
      )}

      {/* ── Buscador ─────────────────────────────────────────────────── */}
      {!loadingUsers && usuariosActivos.length > 0 && (
        <div className="relative">
          <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-muted transition-colors hover:text-ink"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      )}

      {/* ── Lista de usuarios ────────────────────────────────────────── */}
      {loadingUsers ? (
        <div className="flex items-center justify-center py-16">
          <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : usuariosActivos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiUsers size={20} />
          </span>
          <p className="text-sm text-muted">No hay usuarios activos.</p>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiSearch size={20} />
          </span>
          <p className="text-sm text-muted">Ningún usuario coincide con la búsqueda.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {usuariosFiltrados.map((u, idx) => {
            const key = String(u.idUsuario);
            const pass = passes[key];
            const hasPass = pass && dayjs().isBefore(dayjs(pass.exp));
            const isLoading = loading[u.idUsuario];
            const avatarTone = AVATAR_TONES[idx % AVATAR_TONES.length];

            return (
              <li
                key={u.idUsuario}
                className={`overflow-hidden rounded-2xl border bg-surface shadow-card transition-colors ${
                  hasPass ? "border-brand-300" : "border-line"
                }`}
              >
                <div className="flex items-center gap-3 p-4">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-brand-700 ${avatarTone}`}>
                    {getInitials(u.nombreUsuario)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{u.nombreUsuario}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                      <span>@{u.usuario}</span>
                      <span className="rounded-full bg-surface-2 px-2 py-0.5 text-2xs font-semibold text-ink">{u.nombreRol}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReset(u.idUsuario)}
                    disabled={isLoading || hasPass}
                    title={hasPass ? "Espera a que expire la contraseña actual" : "Resetear contraseña"}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl border-0 px-3.5 py-2 text-xs font-semibold transition-colors ${
                      hasPass
                        ? "cursor-not-allowed bg-surface-2 text-muted"
                        : isLoading
                        ? "cursor-wait bg-brand-50 text-brand-700"
                        : "bg-brand-50 text-brand-700 shadow-brand hover:bg-brand-100"
                    }`}
                  >
                    {isLoading ? (
                      <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-brand-300 border-t-brand-600" />
                    ) : hasPass ? (
                      <FiLock size={13} />
                    ) : (
                      <FiRefreshCw size={13} />
                    )}
                    {isLoading ? "Generando..." : hasPass ? "Bloqueado" : "Resetear"}
                  </button>
                </div>

                {/* Tarjeta de credencial temporal — distinta del resto de la fila */}
                {hasPass && (
                  <div className="animate-slide-up flex items-center justify-between gap-3 border-t border-brand-200 bg-brand-50 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <FiLock size={14} className="shrink-0 text-brand-600" />
                      <span className="truncate font-mono text-sm font-semibold text-brand-900">{pass.val}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(pass.val)}
                        aria-label="Copiar contraseña"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-0 bg-white/60 text-accent-700 transition-colors hover:bg-white"
                      >
                        <FiCopy size={13} />
                      </button>
                    </div>
                    <PassTimer exp={pass.exp} onExpire={() => handleExpire(u.idUsuario)} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ResetPassPage;