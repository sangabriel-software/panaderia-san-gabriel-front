import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiSearch, FiX, FiShield, FiEdit2, FiTrash2, FiInbox } from "react-icons/fi";
import { useRoles, useRoleSearch } from "../../../../hooks/roleshooks/roles.hooks";
import { handleConfirmDelete, handleEditRole } from "./ManageRolesUtils";
import Alert from "../../../../components/Alerts/Alert";

function ManageRoles() {
  const { roles, loading, showError, showInfo, setRoles } = useRoles();
  const { filteredRoles, searchQuery, showNoResults, handleSearch } = useRoleSearch(roles);
  const navigate = useNavigate();

  const [confirmingId, setConfirmingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const inputDisabled = showError || showInfo;

  const handleDeleteConfirm = async (idRol) => {
    setIsDeleting(true);
    await handleConfirmDelete(
      idRol,
      setRoles,
      () => setConfirmingId(null),
      setErrorMessage,
      () => {}
    );
    setIsDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Alerta flotante de error ─────────────────────────────────── */}
      {errorMessage && (
        <Alert
          floating
          position="top-right"
          type="danger"
          title="No se pudo eliminar"
          message={errorMessage}
          onDismiss={() => setErrorMessage("")}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/users")}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiShield size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Roles</h1>
          <p className="text-sm text-muted">Administra los roles del sistema</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/users/createRol")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 sm:w-auto"
        >
          <FiPlus size={15} /> Agregar rol
        </button>
      </header>

      {/* ── Buscador ─────────────────────────────────────────────────── */}
      <div className="relative">
        <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder={inputDisabled ? "No se pueden realizar búsquedas" : "Buscar rol..."}
          value={searchQuery}
          onChange={handleSearch}
          readOnly={inputDisabled}
          className={`w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 ${
            inputDisabled ? "cursor-not-allowed bg-surface-2 text-muted" : ""
          }`}
        />
        {searchQuery && !inputDisabled && (
          <button
            type="button"
            onClick={() => handleSearch({ target: { value: "" } })}
            aria-label="Limpiar búsqueda"
            className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-muted transition-colors hover:text-ink"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* ── Estados vacíos ───────────────────────────────────────────── */}
      {filteredRoles.length === 0 && !loading && !showError && showInfo && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiShield size={20} />
          </span>
          <p className="text-sm text-muted">No existen roles ingresados.</p>
        </div>
      )}

      {showNoResults && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiSearch size={20} />
          </span>
          <p className="text-sm text-muted">No se encontraron roles que coincidan con la búsqueda.</p>
        </div>
      )}

      {showError && !showInfo && (
        <Alert type="danger" title="No se pudieron cargar los roles" message="Intenta más tarde." />
      )}

      {/* ── Lista de roles ───────────────────────────────────────────── */}
      {filteredRoles.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => {
            const confirmando = confirmingId === role.idRol;

            return (
              <div
                key={role.idRol}
                className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition-shadow duration-150 hover:shadow-modal"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <FiShield size={18} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-ink">{role.nombreRol}</h3>
                    <p className="truncate text-xs text-muted">{role.descripcionRol || "Sin descripción"}</p>
                  </div>
                </div>

                <div className="mt-auto flex gap-2 border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={() => handleEditRole(role.idRol, navigate)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-brand-50 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    <FiEdit2 size={13} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(confirmando ? null : role.idRol)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-danger-50 py-2 text-xs font-semibold text-danger-700 transition-colors hover:bg-danger-100"
                  >
                    <FiTrash2 size={13} /> Eliminar
                  </button>
                </div>

                {confirmando && (
                  <div className="animate-slide-up rounded-xl border border-danger-200 bg-danger-50 p-3">
                    <p className="text-xs font-semibold text-danger-800">¿Eliminar "{role.nombreRol}"?</p>
                    <p className="mt-0.5 text-2xs text-danger-700">Esta acción no se puede deshacer.</p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={isDeleting}
                        className="flex-1 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteConfirm(role.idRol)}
                        disabled={isDeleting}
                        className="flex flex-1 items-center justify-center rounded-lg border-0 bg-danger-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-danger-500 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? (
                          <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                        ) : (
                          "Eliminar"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ManageRoles;