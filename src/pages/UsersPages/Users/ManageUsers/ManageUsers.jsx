import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import {
  FiArrowLeft,
  FiUsers,
  FiPlus,
  FiX,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiLock,
  FiUnlock,
  FiUser,
  FiMail,
  FiShield,
  FiMapPin,
  FiChevronDown,
  FiInbox,
  FiSave,
} from "react-icons/fi";
import Alert from "../../../../components/Alerts/Alert";
import useOptionsMenu from "../../../../hooks/usuarioshook/useOptionsMenu";
import { useGetUsers } from "../../../../hooks/usuarioshook/useGetUsers";
import useRoles from "../../../../hooks/roleshooks/roles.hooks";
import useGetSucursales from "../../../../hooks/sucursales/useGetSucursales";
import { handleBloqueoDesbloqueo, handleConfirmDelete, useUsersSerch } from "./ManageUsersUtils";
import { handleCreateUserSubmit } from "./CreateUsersUtils";
import { actualizardatosUsuarioServices } from "../../../../services/userServices/usersservices/users.service";

const selectClass =
  "w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted";

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2";

const splitName = (fullName) => {
  if (!fullName) return { nombre: "", apellido: "" };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { nombre: parts[0], apellido: "" };
  if (parts.length === 2) return { nombre: parts[0], apellido: parts[1] };
  if (parts.length === 3) return { nombre: `${parts[0]} ${parts[1]}`, apellido: parts[2] };
  const mitad = Math.floor(parts.length / 2);
  return { nombre: parts.slice(0, mitad).join(" "), apellido: parts.slice(mitad).join(" ") };
};

const AVATAR_TONES = ["bg-brand-50"];

function ManageUsers() {
  const navigate = useNavigate();
  const { usuarios, loadingUsers, showErrorUsers, showInfoUsers, setUsuarios } = useGetUsers();
  const { filteredUsers, searchQuery, showNoResults, handleSearch } = useUsersSerch(usuarios);
  const { roles, loading: loadingRoles, showError: showErrorRoles } = useRoles();
  const { sucursales, loading: loadingSucursales, showError: showErrorSucursales } = useGetSucursales();
  const { activeOptionsId } = useOptionsMenu();

  const [modo, setModo] = useState(null); // "nuevo" | "editar"
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const abrirNuevo = () => {
    setSelectedUser(null);
    reset({ nombreUsuario: "", apellidoUsuario: "", usuario: "", correoUsuario: "", idRol: "", idSucursal: "" });
    setModo("nuevo");
  };

  const abrirEditar = (user) => {
    const { nombre, apellido } = splitName(user.nombreUsuario);
    setSelectedUser(user);
    reset({
      nombreUsuario: nombre,
      apellidoUsuario: apellido,
      usuario: user.usuario || "",
      correoUsuario: user.correoUsuario || "",
      idRol: user.idRol || "",
      idSucursal: user.idSucursal || "",
    });
    setModo("editar");
  };

  const cerrarForm = () => {
    setModo(null);
    setSelectedUser(null);
    reset();
  };

  const onSubmit = async (data) => {
    if (modo === "nuevo") {
      setIsSaving(true);
      handleCreateUserSubmit(
        data,
        reset,
        () => {
          setSuccessMessage("El usuario ha sido creado correctamente. Se envió al correo ingresado.");
          cerrarForm();
        },
        () => setErrorMessage("Ocurrió un error al crear el usuario."),
        setErrorMessage,
        setIsSaving
      );
      return;
    }

    // Editar
    setIsSaving(true);
    try {
      const payload = {
        idUsuario: selectedUser.idUsuario,
        nombreUsuario: data.nombreUsuario.trim(),
        apellidoUsuario: data.apellidoUsuario.trim(),
        usuario: data.usuario.trim(),
        correoUsuario: data.correoUsuario.trim(),
        idRol: data.idRol,
        idSucursal: data.idSucursal,
      };

      await actualizardatosUsuarioServices(payload);

      const rolSeleccionado = roles.find((r) => r.idRol == payload.idRol);
      const sucursalSeleccionada = sucursales.find((s) => s.idSucursal == payload.idSucursal);

      setUsuarios((prev) =>
        prev.map((u) =>
          u.idUsuario === selectedUser.idUsuario
            ? {
                ...u,
                nombreUsuario: `${payload.nombreUsuario} ${payload.apellidoUsuario}`.trim(),
                usuario: payload.usuario,
                correoUsuario: payload.correoUsuario,
                idRol: payload.idRol,
                nombreRol: rolSeleccionado?.nombreRol || u.nombreRol,
                idSucursal: payload.idSucursal,
                nombreSucursal: sucursalSeleccionada?.nombreSucursal || u.nombreSucursal,
              }
            : u
        )
      );

      setSuccessMessage("El usuario se actualizó correctamente.");
      cerrarForm();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error al actualizar el usuario. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = (idUsuario) => {
    handleConfirmDelete(idUsuario, setUsuarios, () => setConfirmingId(null), setErrorMessage, () => {});
  };

  const inputDisabled = showErrorUsers || showInfoUsers;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Alertas flotantes ────────────────────────────────────────── */}
      {errorMessage && (
        <Alert
          floating
          position="top-right"
          type="danger"
          title="No se pudo completar"
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      )}
      {successMessage && (
        <Alert
          floating
          position="top-right"
          type="success"
          title="¡Éxito!"
          message={successMessage}
          duration={4000}
          onDismiss={() => setSuccessMessage("")}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/config")}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiUsers size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Usuarios</h1>
          <p className="text-sm text-muted">Administra los usuarios del sistema</p>
        </div>
        <button
          type="button"
          onClick={modo === "nuevo" ? cerrarForm : abrirNuevo}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 sm:w-auto"
        >
          {modo === "nuevo" ? (
            <>
              <FiX size={15} /> Cancelar
            </>
          ) : (
            <>
              <FiPlus size={15} /> Crear usuario
            </>
          )}
        </button>
      </header>

      {/* ── Buscador ─────────────────────────────────────────────────── */}
      <div className="relative">
        <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder={inputDisabled ? "No se pueden realizar búsquedas" : "Buscar usuario..."}
          value={searchQuery}
          onChange={handleSearch}
          readOnly={inputDisabled}
          className={`w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 ${
            inputDisabled ? "cursor-not-allowed bg-surface-2 text-muted" : ""
          }`}
        />
      </div>

      {/* ── Panel de formulario, inline — crear o editar ─────────────── */}
      {modo && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="animate-slide-up rounded-2xl border border-line bg-surface p-5 shadow-card"
        >
          <h2 className="mb-4 text-sm font-semibold text-ink">
            {modo === "nuevo" ? "Nuevo usuario" : `Editar ${selectedUser?.nombreUsuario}`}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiUser size={13} className="text-brand-600" /> Nombre(s) *
              </label>
              <input
                type="text"
                placeholder="Ingrese el nombre del usuario"
                {...register("nombreUsuario", { required: "El nombre del usuario es obligatorio." })}
                className={`${inputClass} ${errors.nombreUsuario ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20" : "border-line focus:border-brand-500 focus:ring-brand-500/25"}`}
              />
              {errors.nombreUsuario && <p className="mt-1.5 text-xs text-danger-600">{errors.nombreUsuario.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiUser size={13} className="text-accent-600" /> Apellido(s) {modo === "nuevo" && "*"}
              </label>
              <input
                type="text"
                placeholder="Ingrese el apellido del usuario"
                {...register("apellidoUsuario", modo === "nuevo" ? { required: "El apellido del usuario es obligatorio." } : {})}
                className={`${inputClass} ${errors.apellidoUsuario ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20" : "border-line focus:border-brand-500 focus:ring-brand-500/25"}`}
              />
              {errors.apellidoUsuario && <p className="mt-1.5 text-xs text-danger-600">{errors.apellidoUsuario.message}</p>}
            </div>

            {modo === "editar" && (
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                  <FiUser size={13} className="text-muted" /> Nombre de usuario
                </label>
                <input type="text" readOnly {...register("usuario")} className={`${inputClass} border-line bg-surface-2 text-muted`} />
              </div>
            )}

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiMail size={13} className="text-warning-600" /> Correo electrónico *
              </label>
              <input
                type="text"
                placeholder="Ingrese el correo electrónico"
                {...register("correoUsuario", {
                  required: "El correo electrónico es obligatorio.",
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, message: "Ingrese un correo electrónico válido." },
                })}
                className={`${inputClass} ${errors.correoUsuario ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20" : "border-line focus:border-brand-500 focus:ring-brand-500/25"}`}
              />
              {errors.correoUsuario && <p className="mt-1.5 text-xs text-danger-600">{errors.correoUsuario.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiShield size={13} className="text-brand-600" /> Rol *
              </label>
              <div className="relative">
                <select
                  disabled={loadingRoles}
                  {...register("idRol", { required: "El rol del usuario es obligatorio." })}
                  className={selectClass}
                >
                  <option value="">Selecciona un rol...</option>
                  {roles.map((rol) => (
                    <option key={rol.idRol} value={rol.idRol}>
                      {rol.nombreRol}
                    </option>
                  ))}
                </select>
                <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
              </div>
              {errors.idRol && <p className="mt-1.5 text-xs text-danger-600">{errors.idRol.message}</p>}
              {showErrorRoles && <p className="mt-1.5 text-xs text-danger-600">Error al cargar roles</p>}
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiMapPin size={13} className="text-accent-600" /> Sucursal asignada *
              </label>
              <div className="relative">
                <select
                  disabled={loadingSucursales}
                  {...register("idSucursal", { required: "La sucursal del usuario es obligatoria." })}
                  className={selectClass}
                >
                  <option value="">Selecciona una sucursal...</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.idSucursal} value={sucursal.idSucursal}>
                      {sucursal.nombreSucursal} - {sucursal.municipioSucursal}
                    </option>
                  ))}
                </select>
                <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
              </div>
              {errors.idSucursal && <p className="mt-1.5 text-xs text-danger-600">{errors.idSucursal.message}</p>}
              {showErrorSucursales && <p className="mt-1.5 text-xs text-danger-600">Error al cargar sucursales</p>}
            </div>
          </div>

          {modo === "nuevo" && (
            <p className="mt-4 rounded-xl bg-brand-50 px-3.5 py-2.5 text-xs text-brand-700">
              Se generará un usuario y contraseña automáticos, enviados al correo ingresado.
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={cerrarForm}
              disabled={isSaving}
              className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex min-w-[9rem] items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                  Guardando...
                </>
              ) : (
                <>
                  <FiSave size={15} /> {modo === "nuevo" ? "Crear usuario" : "Guardar cambios"}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── Estados vacíos ───────────────────────────────────────────── */}
      {filteredUsers.length === 0 && !loadingUsers && !showErrorUsers && showInfoUsers && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiInbox size={20} />
          </span>
          <p className="text-sm text-muted">No hay usuarios ingresados.</p>
        </div>
      )}

      {showNoResults && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiSearch size={20} />
          </span>
          <p className="text-sm text-muted">No se encontraron usuarios que coincidan con la búsqueda.</p>
        </div>
      )}

      {showErrorUsers && !showInfoUsers && (
        <Alert type="danger" title="No se pudieron cargar los usuarios" message="Intenta más tarde." />
      )}

      {/* ── Lista de usuarios ────────────────────────────────────────── */}
      {!loadingUsers && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredUsers.map((user, i) => {
            const activo = user.estadoUsuario === "A";
            const confirmando = confirmingId === user.idUsuario;
            const avatarTone = AVATAR_TONES[i % AVATAR_TONES.length];

            return (
              <div
                key={user.idUsuario}
                className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition-shadow duration-150 hover:shadow-modal"
              >
                <div className="flex items-start gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-brand-500 ${avatarTone}`}>
                    {user.nombreUsuario?.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-ink">{user.nombreUsuario}</h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-semibold ${
                          activo ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"
                        }`}
                      >
                        {activo ? "Activo" : "Bloqueado"}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted">@{user.usuario}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-ink">
                    <FiShield size={11} className="text-brand-600" /> {user.nombreRol}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-ink">
                    <FiMapPin size={11} className="text-accent-600" /> {user.nombreSucursal || "Sin sucursal"}
                  </span>
                </div>

                <div className="mt-auto flex gap-2 border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={() => abrirEditar(user)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-brand-50 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    <FiEdit2 size={13} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleBloqueoDesbloqueo(user.idUsuario, user.estadoUsuario, setUsuarios, () => {}, setErrorMessage, () => {})
                    }
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 py-2 text-xs font-semibold transition-colors ${
                      activo ? "bg-danger-50 text-danger-700 hover:bg-danger-100" : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                    }`}
                  >
                    {activo ? <FiLock size={13} /> : <FiUnlock size={13} />} {activo ? "Bloquear" : "Desbloquear"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(confirmando ? null : user.idUsuario)}
                    aria-label="Eliminar usuario"
                    title="Eliminar usuario"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-0 transition-colors ${
                      confirmando ? "bg-danger-50 text-danger-600" : "bg-transparent text-muted hover:bg-danger-50 hover:text-danger-600"
                    }`}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>

                {confirmando && (
                  <div className="animate-slide-up rounded-xl border border-danger-200 bg-danger-50 p-3">
                    <p className="text-xs font-semibold text-danger-800">¿Eliminar a {user.nombreUsuario}?</p>
                    <p className="mt-0.5 text-2xs text-danger-700">Esta acción no se puede deshacer.</p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="flex-1 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-2"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteConfirm(user.idUsuario)}
                        className="flex flex-1 items-center justify-center rounded-lg border-0 bg-danger-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-danger-500"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {loadingUsers && (
        <div className="flex items-center justify-center py-16">
          <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      )}
    </div>
  );
}

export default ManageUsers;