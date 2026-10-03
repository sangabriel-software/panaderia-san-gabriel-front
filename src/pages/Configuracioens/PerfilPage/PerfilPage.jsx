import { useState } from "react";
import { useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiEdit2,
  FiCheck,
  FiLock,
  FiEye,
  FiEyeOff,
  FiSave,
  FiShield,
  FiAtSign,
} from "react-icons/fi";
import { getUserData } from "../../../utils/Auth/decodedata";
import { getLocalStorage } from "../../../utils/Auth/localstorage";
import Alert from "../../../components/Alerts/Alert";
import {
  guardarCambiosCredenciales,
  handleChange,
  handleChangePassword,
  handleEdit,
  handleSave,
  handleSavePersonalData,
  validatePasswords,
} from "./Permfil.utils";

const inputWrapClass = "flex items-center gap-2";
const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted";

const getInitials = (nombre, apellido) =>
  `${nombre?.charAt(0) || ""}${apellido?.charAt(0) || ""}`.toUpperCase() || "?";

function PerfilPage() {
  const navigate = useNavigate();
  const userData = JSON.parse(getLocalStorage("userData")) || getUserData();

  const [editField, setEditField] = useState(null);
  const [formData, setFormData] = useState({
    nombreUsuario: userData.nombreUsuario || userData.nombre,
    apellidoUsuario: userData.apellidoUsuario || userData.apellido,
    correoUsuario: userData.correoUsuario || userData.correo,
    usuario: userData.usuario,
    contrasena: "",
    confirmarContrasena: "",
    idUsuario: userData.idUsuario,
  });
  const [isChanged, setIsChanged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCredenciales, setShowCredenciales] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const FieldEditButton = ({ field, tone }) => (
    <button
      type="button"
      onClick={() =>
        editField === field ? handleSave(field, setEditField, setIsEditing) : handleEdit(field, setEditField, setIsEditing)
      }
      aria-label={editField === field ? "Confirmar" : "Editar campo"}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-0 transition-colors ${
        editField === field
          ? "bg-brand-600 text-white hover:bg-brand-500"
          : `bg-transparent text-muted hover:bg-${tone}-50 hover:text-${tone}-600`
      }`}
    >
      {editField === field ? <FiCheck size={16} /> : <FiEdit2 size={14} />}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      {showSuccess && (
        <Alert
          floating
          position="top-right"
          type="success"
          title="¡Cambios guardados!"
          message="Tu información se actualizó correctamente."
          duration={3000}
          onDismiss={() => setShowSuccess(false)}
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
          <FiUser size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Datos personales</h1>
          <p className="text-sm text-muted">Configura tus datos personales y tus credenciales</p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg">
        {/* ── Tarjeta de identidad, con gradiente de marca ────────────── */}
        <div className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-600 to-accent-600 p-5 shadow-brand">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold text-white backdrop-blur-sm">
              {getInitials(formData.nombreUsuario, formData.apellidoUsuario)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-white">
                {formData.nombreUsuario} {formData.apellidoUsuario}
              </p>
              <p className="flex items-center gap-1 truncate text-sm text-white/80">
                <FiAtSign size={12} /> {formData.usuario}
              </p>
            </div>
          </div>
        </div>

        {/* ── Navegación tipo segmented control ─────────────────────── */}
        <div className="mb-5 flex rounded-xl bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => setShowCredenciales(false)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              !showCredenciales ? "bg-surface text-brand-700 shadow-card" : "text-muted hover:text-ink"
            }`}
          >
            Datos personales
          </button>
          <button
            type="button"
            onClick={() => setShowCredenciales(true)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              showCredenciales ? "bg-surface text-accent-700 shadow-card" : "text-muted hover:text-ink"
            }`}
          >
            Credenciales
          </button>
        </div>

        {/* ── Datos personales ─────────────────────────────────────── */}
        {!showCredenciales && (
          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiUser size={13} className="text-brand-600" /> Nombre
              </label>
              <div className={inputWrapClass}>
                <input
                  type="text"
                  value={formData.nombreUsuario}
                  disabled={!isEditing || editField !== "nombreUsuario"}
                  onChange={(e) => handleChange(e, "nombreUsuario", formData, setFormData, setIsChanged)}
                  className={`${inputClass} focus:border-brand-500 focus:ring-brand-500/25`}
                />
                <FieldEditButton field="nombreUsuario" tone="brand" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiUser size={13} className="text-accent-600" /> Apellido
              </label>
              <div className={inputWrapClass}>
                <input
                  type="text"
                  value={formData.apellidoUsuario}
                  disabled={!isEditing || editField !== "apellidoUsuario"}
                  onChange={(e) => handleChange(e, "apellidoUsuario", formData, setFormData, setIsChanged)}
                  className={`${inputClass} focus:border-accent-500 focus:ring-accent-500/25`}
                />
                <FieldEditButton field="apellidoUsuario" tone="accent" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiMail size={13} className="text-warning-600" /> Correo
              </label>
              <div className={inputWrapClass}>
                <input
                  type="email"
                  value={formData.correoUsuario}
                  disabled={!isEditing || editField !== "correoUsuario"}
                  onChange={(e) => handleChange(e, "correoUsuario", formData, setFormData, setIsChanged)}
                  className={`${inputClass} focus:border-warning-500 focus:ring-warning-500/25`}
                />
                <FieldEditButton field="correoUsuario" tone="warning" />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleSavePersonalData(formData, userData, setIsSaving, setShowSuccess, setIsChanged, guardarCambiosCredenciales)
              }
              disabled={!isChanged || isSaving}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted disabled:shadow-none"
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                  Guardando...
                </>
              ) : (
                <>
                  <FiSave size={15} /> Guardar cambios
                </>
              )}
            </button>
          </div>
        )}

        {/* ── Credenciales ─────────────────────────────────────────── */}
        {showCredenciales && (
          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2 rounded-xl bg-danger-50 px-3.5 py-2.5">
              <FiShield size={15} className="shrink-0 text-danger-600" />
              <p className="text-xs font-medium text-danger-700">
                Los cambios de contraseña afectan el acceso a tu cuenta.
              </p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiAtSign size={13} className="text-accent-600" /> Usuario
              </label>
              <input type="text" value={formData.usuario} disabled className={inputClass} />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiLock size={13} className="text-danger-600" /> Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.contrasena}
                  onChange={(e) => handleChange(e, "contrasena", formData, setFormData, setIsChanged)}
                  className={`${inputClass} pr-10 focus:border-danger-500 focus:ring-danger-500/25`}
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
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiLock size={13} className="text-danger-600" /> Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmarContrasena}
                  onChange={(e) => handleChange(e, "confirmarContrasena", formData, setFormData, setIsChanged)}
                  onKeyUp={() => validatePasswords(formData, setPasswordError)}
                  className={`${inputClass} pr-10 focus:border-danger-500 focus:ring-danger-500/25`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-muted transition-colors hover:text-ink"
                >
                  {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {passwordError && <p className="mt-1.5 text-xs text-danger-600">{passwordError}</p>}
            </div>

            {changePasswordSuccess && <Alert type="success" title={changePasswordSuccess} />}
            {changePasswordError && <Alert type="danger" title={changePasswordError} />}

            <button
              type="button"
              onClick={() =>
                handleChangePassword(
                  formData,
                  userData,
                  setIsSaving,
                  setChangePasswordError,
                  setChangePasswordSuccess,
                  setShowSuccess,
                  setFormData,
                  setPasswordError
                )
              }
              disabled={!isChanged || isSaving || !!passwordError}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl border-0 bg-danger-600 py-2.5 text-sm font-semibold text-white shadow-danger transition-colors hover:bg-danger-500 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted disabled:shadow-none"
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                  Guardando...
                </>
              ) : (
                <>
                  <FiLock size={15} /> Cambiar contraseña
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PerfilPage;