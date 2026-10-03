import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiHome,
  FiMap,
  FiPhone,
  FiMail,
  FiPlus,
  FiX,
  FiInbox,
  FiArrowLeft,
} from "react-icons/fi";
import Alert from "../../../components/Alerts/Alert";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import {
  handleConfirmDeleteSucursal,
  handleDeleteSucursal,
  handleIngresarSucursalSubmit,
  handleShowModal,
} from "./GestionDeSucursales.utils";
import { Navigate, useNavigate } from "react-router";

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

function GestionDeSucursalesPage() {
  const { sucursales, loadingSucursales, showErrorSucursales, setSucursales } = useGetSucursales();
  const [showForm, setShowForm] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [sucursalToDelete, setSucursalToDelete] = useState(null);
  const navigate = useNavigate();

  const openAddForm = () => {
    handleShowModal(null, setEditingSucursal, setValue, reset, setShowForm);
  };

  const openEditForm = (sucursal) => {
    handleShowModal(sucursal, setEditingSucursal, setValue, reset, setShowForm);
  };

  const closeForm = () => {
    setShowForm(false);
    reset();
    setEditingSucursal(null);
  };

  const onSubmit = async (data) => {
    await handleIngresarSucursalSubmit(
      data,
      setIsSaving,
      editingSucursal,
      setSucursales,
      (success) => {
        if (success) {
          setSuccessMessage(editingSucursal ? "La información se ha modificado con éxito." : "La sucursal se ha ingresado con éxito.");
        }
      },
      setErrorPopupMessage,
      setIsPopupErrorOpen,
      setShowForm,
      reset
    );
  };

  if (loadingSucursales) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (showErrorSucursales) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
            <FiMapPin size={19} />
          </span>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Sucursales</h1>
        </header>
        <Alert type="danger" title="No se pudieron cargar las sucursales" message="Intenta recargar la página." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Alertas flotantes ────────────────────────────────────────── */}
      {isPopupErrorOpen && (
        <Alert
          floating
          position="top-right"
          type="danger"
          title="No se pudo completar"
          message={errorPopupMessage}
          onDismiss={() => setIsPopupErrorOpen(false)}
        />
      )}
      {successMessage && (
        <Alert
          floating
          position="top-right"
          type="success"
          title="¡Éxito!"
          message={successMessage}
          duration={3000}
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
          <FiMapPin size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Sucursales</h1>
          <p className="text-sm text-muted">Administración de sucursales activas</p>
        </div>
        <button
          type="button"
          onClick={showForm && !editingSucursal ? closeForm : openAddForm}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 sm:w-auto"
        >
          {showForm && !editingSucursal ? (
            <>
              <FiX size={15} /> Cancelar
            </>
          ) : (
            <>
              <FiPlus size={15} /> Agregar sucursal
            </>
          )}
        </button>
      </header>

      {/* ── Panel de formulario, inline — crear o editar ─────────────── */}
      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="animate-slide-up rounded-2xl border border-line bg-surface p-5 shadow-card"
        >
          <h2 className="mb-4 text-sm font-semibold text-ink">
            {editingSucursal ? `Editar ${editingSucursal.nombreSucursal}` : "Nueva sucursal"}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiHome size={13} className="text-brand-600" /> Nombre de la sucursal *
              </label>
              <input
                type="text"
                {...register("nombreSucursal", { required: "Este campo es obligatorio" })}
                className={`${inputClass} ${errors.nombreSucursal ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20" : ""}`}
              />
              {errors.nombreSucursal && <p className="mt-1.5 text-xs text-danger-600">{errors.nombreSucursal.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiMap size={13} className="text-accent-600" /> Municipio *
              </label>
              <input
                type="text"
                {...register("municipioSucursal", { required: "Este campo es obligatorio" })}
                className={`${inputClass} ${errors.municipioSucursal ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20" : ""}`}
              />
              {errors.municipioSucursal && <p className="mt-1.5 text-xs text-danger-600">{errors.municipioSucursal.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiMapPin size={13} className="text-warning-600" /> Dirección *
              </label>
              <input
                type="text"
                {...register("direccionSucursal", { required: "Este campo es obligatorio" })}
                className={`${inputClass} ${errors.direccionSucursal ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20" : ""}`}
              />
              {errors.direccionSucursal && <p className="mt-1.5 text-xs text-danger-600">{errors.direccionSucursal.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiPhone size={13} className="text-brand-600" /> Teléfono
              </label>
              <input type="tel" {...register("telefonoSucursal")} className={inputClass} />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiMail size={13} className="text-accent-600" /> Correo electrónico
              </label>
              <input type="email" {...register("correoSucursal")} className={inputClass} />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
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
              ) : editingSucursal ? (
                "Guardar cambios"
              ) : (
                "Guardar sucursal"
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── Lista de sucursales ──────────────────────────────────────── */}
      {sucursales.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiInbox size={20} />
          </span>
          <p className="text-sm text-muted">No se han ingresado sucursales.</p>
          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500"
          >
            <FiPlus size={15} /> Agregar sucursal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sucursales.map((sucursal) => {
            const confirmando = confirmingId === sucursal.idSucursal;

            return (
              <div
                key={sucursal.idSucursal}
                className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition-shadow duration-150 hover:shadow-modal"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <FiHome size={18} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-ink">{sucursal.nombreSucursal}</h3>
                    <p className="truncate text-xs text-muted">{sucursal.municipioSucursal}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-sm text-ink">
                  <p className="flex items-start gap-2">
                    <FiMapPin size={14} className="mt-0.5 shrink-0 text-muted" />
                    <span className="min-w-0 truncate">{sucursal.direccionSucursal}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FiPhone size={14} className="shrink-0 text-muted" />
                    {sucursal.telefonoSucursal || "N/A"}
                  </p>
                </div>

                <div className="mt-auto flex gap-2 border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={() => openEditForm(sucursal)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-brand-50 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    <FiEdit2 size={13} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      confirmando
                        ? setConfirmingId(null)
                        : handleConfirmDeleteSucursal(sucursal.idSucursal, setSucursalToDelete, () => setConfirmingId(sucursal.idSucursal))
                    }
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-danger-50 py-2 text-xs font-semibold text-danger-700 transition-colors hover:bg-danger-100"
                  >
                    <FiTrash2 size={13} /> Eliminar
                  </button>
                </div>

                {confirmando && (
                  <div className="animate-slide-up rounded-xl border border-danger-200 bg-danger-50 p-3">
                    <p className="text-xs font-semibold text-danger-800">¿Eliminar esta sucursal?</p>
                    <p className="mt-0.5 text-2xs text-danger-700">Esta acción no se puede deshacer.</p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={isLoading}
                        className="flex-1 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteSucursal(
                            sucursalToDelete,
                            setSucursales,
                            () => setConfirmingId(null),
                            setErrorPopupMessage,
                            setIsPopupErrorOpen,
                            setIsLoading
                          )
                        }
                        disabled={isLoading}
                        className="flex flex-1 items-center justify-center rounded-lg border-0 bg-danger-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-danger-500 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
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

export default GestionDeSucursalesPage;