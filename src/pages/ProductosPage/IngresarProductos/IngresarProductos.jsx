import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiPackage,
  FiChevronDown,
  FiPlus,
  FiX,
  FiHash,
  FiDollarSign,
  FiSave,
} from "react-icons/fi";
import useGetCategorias from "../../../hooks/categorias/UseGetCategorias";
import { handleIngresarProductoSubmit, resetForm } from "./IngresarProductosUtils";
import { saveCategory } from "../../Categorias/categoriasUtils";
import Alert from "../../../components/Alerts/Alert";

const inputClass =
  "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted";
const selectClass =
  "w-full appearance-none rounded-xl border bg-surface py-2.5 pl-3.5 pr-9 text-sm font-medium text-ink transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted";

function SwitchField({ label, checked, onChange, disabled }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted">{label}</label>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-150 ${
          checked ? "bg-brand-600" : "bg-surface-2"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-card transition-transform duration-150 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function IngresarProductos() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: { idCategoria: "", controlStock: 0, stockDiario: 0, tipoProduccion: "bandejas", unidadesPorBandeja: "" },
  });

  // ── Categorías ───────────────────────────────────────────────────────
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [showErrorCategorySave, setShowErrorCategorySave] = useState(false);
  const { categorias, loadingCategorias } = useGetCategorias();
  const {
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    formState: { errors: errorsCategory },
    reset: resetCategory,
  } = useForm({ defaultValues: { nombreCategoria: "", descripcionCategoria: "" } });

  const selectedCategory = watch("idCategoria");
  const tipoProduccion = watch("tipoProduccion");
  const controlStock = watch("controlStock") === 1;
  const stockDiario = watch("stockDiario") === 1;
  const controlarInventario = watch("controlarInventario") === 1;

  const [isConfig, setIsConfig] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      const categoriaSeleccionada = categorias?.find((cat) => cat.idCategoria == selectedCategory);
      const esConfigurable = categoriaSeleccionada?.nombreCategoria === "Panaderia" || categoriaSeleccionada?.nombreCategoria === "Especiales";
      setIsConfig(esConfigurable);

      if (!esConfigurable) {
        setValue("controlStock", 0);
        setValue("stockDiario", 0);
        setValue("tipoProduccion", "bandejas");
        setValue("unidadesPorBandeja", "");
      }
    }
  }, [selectedCategory, categorias, setValue]);

  useEffect(() => {
    if (controlStock && stockDiario) setValue("stockDiario", 0);
  }, [controlStock, setValue]);

  useEffect(() => {
    if (stockDiario && controlStock) setValue("controlStock", 0);
  }, [stockDiario, setValue]);

  const onSubmit = async (data) => {
    await handleIngresarProductoSubmit(
      data,
      () => setSuccessMessage("El producto ha sido creado con éxito."),
      setErrorMessage,
      () => {},
      setIsLoading,
      reset
    );
  };

  const onSubmitCategory = async (data) => {
    await saveCategory(data, setIsCategorySaving, resetCategory, () => setShowCategoryPanel(false), setShowErrorCategorySave, categorias);
  };

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
          onDismiss={() => setSuccessMessage("")}
          actions={[
            { label: "Ver productos", variant: "primary", onClick: () => navigate("/productos") },
            {
              label: "Ingresar otro",
              variant: "secondary",
              onClick: () => {
                setSuccessMessage("");
                resetForm(reset);
              },
            },
          ]}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/productos")}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiPackage size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Productos</h1>
          <p className="text-sm text-muted">Ingreso de nuevos productos</p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        {/* ── Datos básicos ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-ink">Información del producto</h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Categoría del producto *</label>
              {loadingCategorias ? (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-brand-300 border-t-brand-600" />
                  Cargando categorías...
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      {...register("idCategoria", { required: "Debe seleccionar una categoría." })}
                      disabled={isLoading}
                      className={`${selectClass} ${
                        errors.idCategoria
                          ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20"
                          : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                      }`}
                    >
                      <option value="">Selecciona una categoría...</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.idCategoria} value={categoria.idCategoria}>
                          {categoria.nombreCategoria}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCategoryPanel((v) => !v)}
                    disabled={isLoading}
                    aria-label="Nueva categoría"
                    title="Nueva categoría"
                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border-0 bg-brand-600 text-white shadow-brand transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {showCategoryPanel ? <FiX size={18} /> : <FiPlus size={18} />}
                  </button>
                </div>
              )}
              {errors.idCategoria && <p className="mt-1.5 text-xs text-danger-600">{errors.idCategoria.message}</p>}
            </div>

            {/* Panel de nueva categoría, inline — no modal */}
            {showCategoryPanel && (
              <div className="animate-slide-up rounded-xl border border-line bg-surface-2/40 p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Nueva categoría</h3>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted">Nombre *</label>
                    <input
                      type="text"
                      placeholder="Ingrese el nombre de la categoría"
                      {...registerCategory("nombreCategoria", { required: "El nombre de la categoría es obligatorio." })}
                      disabled={isCategorySaving}
                      className={`${inputClass} ${
                        errorsCategory.nombreCategoria
                          ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20"
                          : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                      }`}
                    />
                    {errorsCategory.nombreCategoria && <p className="mt-1.5 text-xs text-danger-600">{errorsCategory.nombreCategoria.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted">Descripción</label>
                    <textarea
                      rows={2}
                      placeholder="Ingrese la descripción de la categoría"
                      {...registerCategory("descripcionCategoria")}
                      disabled={isCategorySaving}
                      className={`${inputClass} resize-none border-line focus:border-brand-500 focus:ring-brand-500/25`}
                    />
                  </div>
                  {showErrorCategorySave && <p className="text-xs text-danger-600">No se pudo guardar la categoría. Intenta de nuevo.</p>}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryPanel(false);
                        resetCategory();
                      }}
                      disabled={isCategorySaving}
                      className="rounded-lg border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitCategory(onSubmitCategory)}
                      disabled={isCategorySaving}
                      className="flex min-w-[6rem] items-center justify-center gap-1.5 rounded-lg border-0 bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCategorySaving ? (
                        <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        "Guardar"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Nombre del producto *</label>
              <input
                type="text"
                placeholder="Ingrese el nombre del producto"
                {...register("nombreProducto", { required: "El nombre del producto es obligatorio." })}
                disabled={isLoading}
                className={`${inputClass} ${
                  errors.nombreProducto
                    ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20"
                    : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                }`}
              />
              {errors.nombreProducto && <p className="mt-1.5 text-xs text-danger-600">{errors.nombreProducto.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                  <FiHash size={12} className="text-brand-600" /> Cantidad *
                </label>
                <input
                  type="number"
                  placeholder="Ingrese la cantidad"
                  {...register("cantidad", { required: "La cantidad es obligatoria.", min: { value: 1, message: "La cantidad debe ser mayor a 0." } })}
                  disabled={isLoading}
                  className={`${inputClass} ${
                    errors.cantidad
                      ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20"
                      : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                  }`}
                />
                {errors.cantidad && <p className="mt-1.5 text-xs text-danger-600">{errors.cantidad.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                  <FiDollarSign size={12} className="text-brand-600" /> Precio Q. *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ingrese el precio"
                  {...register("precio", { required: "El precio es obligatorio.", min: { value: 0.01, message: "El precio debe ser mayor a 0." } })}
                  disabled={isLoading}
                  className={`${inputClass} ${
                    errors.precio
                      ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20"
                      : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                  }`}
                />
                {errors.precio && <p className="mt-1.5 text-xs text-danger-600">{errors.precio.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Configuración de inventario ──────────────────────────── */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-ink">Configuración de inventario</h2>
          <SwitchField
            label="Controlar inventario"
            checked={controlarInventario}
            disabled={isLoading}
            onChange={(val) => setValue("controlarInventario", val ? 1 : 0)}
          />
        </div>

        {/* ── Configuración de producción y stock ──────────────────── */}
        {isConfig && (
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h2 className="mb-4 text-sm font-semibold text-ink">Configuración para producción y stock</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SwitchField
                label="Control de stock"
                checked={controlStock}
                disabled={isLoading || stockDiario}
                onChange={(val) => setValue("controlStock", val ? 1 : 0)}
              />
              <SwitchField
                label="Control de stock diario"
                checked={stockDiario}
                disabled={isLoading || controlStock}
                onChange={(val) => setValue("stockDiario", val ? 1 : 0)}
              />
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-muted">Tipo de producción</label>
              <div className="flex gap-2">
                {["bandejas", "harina"].map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setValue("tipoProduccion", tipo)}
                    className={`flex-1 rounded-xl border-0 py-2 text-sm font-semibold capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      tipoProduccion === tipo ? "bg-brand-600 text-white shadow-brand" : "bg-surface-2 text-muted hover:bg-surface-2/70"
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            {tipoProduccion === "bandejas" && (
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium text-muted">Unidades por bandeja *</label>
                <input
                  type="number"
                  placeholder="Ingrese las unidades por bandeja"
                  {...register("unidadesPorBandeja", {
                    required: "Las unidades por bandeja son obligatorias para producción por bandejas.",
                    min: { value: 1, message: "Las unidades por bandeja deben ser mayor a 0." },
                  })}
                  disabled={isLoading}
                  className={`${inputClass} ${
                    errors.unidadesPorBandeja
                      ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20"
                      : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                  }`}
                />
                {errors.unidadesPorBandeja && <p className="mt-1.5 text-xs text-danger-600">{errors.unidadesPorBandeja.message}</p>}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 py-3 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
              Procesando...
            </>
          ) : (
            <>
              <FiSave size={15} /> Ingresar producto
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default IngresarProductos;