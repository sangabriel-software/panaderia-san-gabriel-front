import { useNavigate } from "react-router";
import { useCreateRolFormLogic } from "./rolesUtils";
import { FiArrowLeft, FiShield, FiCheck, FiSave } from "react-icons/fi";
import Alert from "../../../../components/Alerts/Alert";

function CreateRolForm() {
  const {
    register,
    handleSubmit,
    errors,
    permisos,
    loading,
    showError,
    selectedPermisos,
    isPopupOpen,
    isPopupErrorOpen,
    isPopupWarOpen,
    errorPopupMessage,
    resetForm,
    onToggleChange,
    onSubmit,
    setIsPopupOpen,
    setIsPopupErrorOpen,
    setIsPopupWarOpen,
    navigate,
  } = useCreateRolFormLogic();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (showError) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/users/roles")}
            aria-label="Volver"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            <FiArrowLeft size={17} />
          </button>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Ingresar Rol</h1>
        </header>
        <Alert type="danger" title="No se pudieron cargar los permisos" message="Intenta recargar la página." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Alertas flotantes ────────────────────────────────────────── */}
      {isPopupOpen && (
        <Alert
          floating
          position="top-right"
          type="success"
          title="¡Rol creado con éxito!"
          message="El rol y sus permisos han sido asignados correctamente."
          onDismiss={() => setIsPopupOpen(false)}
          actions={[
            { label: "Ver roles", variant: "primary", onClick: () => navigate("/users/roles") },
            {
              label: "Crear otro",
              variant: "secondary",
              onClick: () => {
                setIsPopupOpen(false);
                resetForm();
              },
            },
          ]}
        />
      )}
      {isPopupErrorOpen && (
        <Alert
          floating
          position="top-right"
          type="danger"
          title="No se pudo crear el rol"
          message={errorPopupMessage}
          onDismiss={() => setIsPopupErrorOpen(false)}
        />
      )}
      {isPopupWarOpen && (
        <Alert
          floating
          position="top-right"
          type="warning"
          title="Atención"
          message={errorPopupMessage}
          onDismiss={() => setIsPopupWarOpen(false)}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/users/roles")}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiShield size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Ingresar Rol</h1>
          <p className="text-sm text-muted">Ingresa los permisos del rol seleccionado</p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        {/* ── Datos del rol ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-ink">Información del rol</h2>

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="nombreRol" className="mb-1.5 block text-xs font-medium text-muted">
                Nombre del rol *
              </label>
              <input
                type="text"
                id="nombreRol"
                placeholder="Ingrese el nombre del rol"
                {...register("nombreRol", { required: "El nombre del rol es obligatorio." })}
                className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 ${
                  errors.nombreRol
                    ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20"
                    : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                }`}
              />
              {errors.nombreRol && <p className="mt-1.5 text-xs text-danger-600">{errors.nombreRol.message}</p>}
            </div>

            <div>
              <label htmlFor="descripcionRol" className="mb-1.5 block text-xs font-medium text-muted">
                Descripción del rol *
              </label>
              <input
                type="text"
                id="descripcionRol"
                placeholder="Ingrese la descripción del rol"
                {...register("descripcionRol", { required: "La descripción del rol es obligatoria." })}
                className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 ${
                  errors.descripcionRol
                    ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20"
                    : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                }`}
              />
              {errors.descripcionRol && <p className="mt-1.5 text-xs text-danger-600">{errors.descripcionRol.message}</p>}
            </div>
          </div>
        </div>

        {/* ── Permisos ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Permisos del rol</h2>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-2xs font-semibold text-brand-700">
              {selectedPermisos.length} seleccionados
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {permisos.map(({ idPermiso, nombrePermiso }) => {
              const checked = selectedPermisos.includes(idPermiso);
              return (
                <button
                  key={idPermiso}
                  type="button"
                  onClick={() => onToggleChange(idPermiso)}
                  className={`flex items-center gap-3 rounded-xl border-0 p-3 text-left text-sm font-medium transition-colors ${
                    checked ? "bg-brand-50 text-brand-700" : "bg-surface-2 text-ink hover:bg-surface-2/70"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors ${
                      checked ? "bg-brand-600 text-white" : "border border-line bg-surface"
                    }`}
                  >
                    {checked && <FiCheck size={13} />}
                  </span>
                  <span className="truncate">{nombrePermiso}</span>
                </button>
              );
            })}
          </div>

          {errors.permisos && <p className="mt-3 text-center text-xs text-danger-600">{errors.permisos.message}</p>}
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 py-3 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500"
        >
          <FiSave size={15} /> Guardar rol
        </button>
      </form>
    </div>
  );
}

export default CreateRolForm;