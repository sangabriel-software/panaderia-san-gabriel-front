import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import {
  FiPlus,
  FiSearch,
  FiX,
  FiChevronDown,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiInbox,
  FiSave,
  FiFilter,
  FiDollarSign,
  FiHash,
} from "react-icons/fi";
import { useGetProductosYPrecios } from "../../../hooks/productosprecios/useGetProductosYprecios";
import useGetCategorias from "../../../hooks/categorias/UseGetCategorias";
import Alert from "../../../components/Alerts/Alert";
import {
  checkForChanges,
  handleUpdateProduct,
  useCategoriasYFiltrado,
  useSerchPrductos,
  resetFormToInitialValues,
  useProductFormSetup,
  useCheckFormChanges,
  useSwitchExclusivity,
  handleModify,
  handleConfirmDeleteProducto,
} from "./ManageProductsUtils";

const inputClass =
  "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2";
const selectClass =
  "w-full appearance-none rounded-xl border bg-surface py-2.5 pl-3.5 pr-9 text-sm font-medium text-ink transition-colors focus:outline-none focus:ring-2";

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

function ManageProducts() {
  const { productos, loadigProducts, showErrorProductos, showInfoProductos, setProductos } = useGetProductosYPrecios();
  const { filteredProductos, searchQuery, showNoResults, handleSearch } = useSerchPrductos(productos);
  const { categorias, filteredByCategory, selectedCategory, setSelectedCategory } = useCategoriasYFiltrado(
    productos,
    filteredProductos
  );
  const navigate = useNavigate();

  const [confirmingId, setConfirmingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showEditPanel, setShowEditPanel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [initialProductValues, setInitialProductValues] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loadingModificar, setLoadingModificar] = useState(false);

  const editPanelRef = useRef(null);

  const { categorias: categoriasModify, loadingCategorias, showErrorCategorias } = useGetCategorias();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [isPanaderia, setIsPanaderia] = useState(false);
  const [tipoProduccion, setTipoProduccion] = useState("bandejas");

  const formValues = watch();
  const controlStock = watch("controlStock") === 1;
  const stockDiario = watch("stockDiario") === 1;
  const controlarInventario = watch("controlarInventario") === 1;

  useProductFormSetup(selectedProduct, setValue, reset, setIsPanaderia, setTipoProduccion, setInitialProductValues);
  useCheckFormChanges(selectedProduct, initialProductValues, formValues, isPanaderia, setHasChanges);
  useSwitchExclusivity(controlStock, stockDiario, setValue, setHasChanges);

  // Lleva el panel a la vista apenas se abre — soluciona el caso de editar
  // un producto que está más abajo en la grilla y el formulario aparecer
  // fuera de pantalla, arriba del todo, sin que el usuario lo note.
  // useEffect(() => {
  //   if (showEditPanel && editPanelRef.current) {
  //     editPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  //   }
  // }, [showEditPanel]);

  // Versión más robusta del scroll anterior:
  //  - Depende también del producto seleccionado: si showEditPanel pasa a true ANTES de que
  //    selectedProduct esté listo, el formulario todavía no existe (editPanelRef es null) y el
  //    efecto anterior nunca volvía a ejecutarse. Así se vuelve a intentar cuando el formulario ya se montó.
  //    También funciona al pasar de editar un producto a editar otro con el panel ya abierto.
  //  - requestAnimationFrame espera a que el formulario esté pintado y a que useProductFormSetup
  //    termine de rellenar los campos; sin esto el scroll se calcula con el layout viejo y se queda corto.
  //  - Se usa scrollIntoView (y no window.scrollTo) porque encuentra solo el contenedor que realmente
  //    hace scroll (window, body o un <main> con overflow), según como esté armado el layout.
  useEffect(() => {
    if (!showEditPanel || !selectedProduct) return;

    const frame = requestAnimationFrame(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, [showEditPanel, selectedProduct?.idProducto]);

  // Firma correcta: (selectedProduct, reset, setValue, setIsPanaderia, setTipoProduccion, setHasChanges).
  // Antes se llamaba con los parámetros en el orden equivocado, lo que lanzaba
  // un error no capturado dentro de resetFormToInitialValues y detenía la
  // ejecución antes de cerrar el panel — por eso Cancelar/X no funcionaban.
  const closeEditPanel = () => {
    if (selectedProduct) {
      resetFormToInitialValues(selectedProduct, reset, setValue, setIsPanaderia, setTipoProduccion, setHasChanges);
    }
    setShowEditPanel(false);
    setSelectedProduct(null);
    setInitialProductValues(null);
  };

  const openEditPanel = (producto) => {
    handleModify(
      producto,
      setSelectedProduct,
      () => setShowEditPanel(true),
      reset,
      setIsPanaderia,
      setTipoProduccion,
      setInitialProductValues,
      setHasChanges
    );
  };

  const onSubmit = async (data) => {
    await handleUpdateProduct(
      data,
      selectedProduct,
      setProductos,
      setShowEditPanel,
      (val) => {
        setSelectedProduct(val);
        if (val === null) setSuccessMessage("El producto se actualizó correctamente.");
      },
      setInitialProductValues,
      setHasChanges,
      setErrorMessage,
      () => {},
      setLoadingModificar
    );
  };

  const handleDeleteConfirm = async (idProducto) => {
    setIsDeleting(true);
    await handleConfirmDeleteProducto(
      idProducto,
      setProductos,
      () => setConfirmingId(null),
      setErrorMessage,
      () => {}
    );
    setIsDeleting(false);
  };

  if (loadigProducts) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

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
          duration={3000}
          onDismiss={() => setSuccessMessage("")}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiPackage size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Productos</h1>
          <p className="text-sm text-muted">Administración de productos existentes</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("ingresar-producto")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 sm:w-auto"
        >
          <FiPlus size={15} /> Ingresar producto
        </button>
      </header>

      {/* ── Filtros ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder={showErrorProductos || showInfoProductos ? "No se pueden realizar búsquedas" : "Buscar producto..."}
              value={searchQuery}
              onChange={handleSearch}
              readOnly={showErrorProductos || showInfoProductos}
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            />
          </div>

          <div className="relative shrink-0 sm:w-56">
            <FiFilter size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            >
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
            <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>
      </div>

      {/* ── Panel de edición, inline ─────────────────────────────────── */}
      {/* scroll-mt: deja un margen arriba al hacer scrollIntoView, para que no quede tapado por una barra fija */}
      {showEditPanel && selectedProduct && (
        <form
          ref={editPanelRef}
          onSubmit={handleSubmit(onSubmit)}
          className="animate-slide-up flex scroll-mt-[calc(var(--header-height)+1rem)] flex-col gap-5 rounded-2xl border border-line bg-surface p-5 shadow-card"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Modificar {selectedProduct.nombreProducto}</h2>
            <button
              type="button"
              onClick={closeEditPanel}
              aria-label="Cerrar"
              className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Datos básicos */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted">Nombre del producto *</label>
              <input
                type="text"
                placeholder="Ingrese el nombre"
                defaultValue={selectedProduct.nombreProducto}
                {...register("nombreProducto", { required: "El nombre del producto es obligatorio." })}
                className={`${inputClass} ${
                  errors.nombreProducto
                    ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20"
                    : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                }`}
              />
              {errors.nombreProducto && <p className="mt-1.5 text-xs text-danger-600">{errors.nombreProducto.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted">Categoría *</label>
              <div className="relative">
                <select
                  defaultValue={selectedProduct.idCategoria}
                  {...register("idCategoria", { required: "La categoría es obligatoria." })}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setValue("idCategoria", newValue);
                    const isNowPanaderia = newValue == 1 || newValue == 2;
                    setIsPanaderia(isNowPanaderia);
                    if (isNowPanaderia) {
                      setTipoProduccion("bandejas");
                      setValue("tipoProduccion", "bandejas");
                    } else {
                      setTipoProduccion(null);
                      setValue("tipoProduccion", null);
                    }
                    setHasChanges(checkForChanges(watch(), initialProductValues));
                  }}
                  className={`${selectClass} ${
                    errors.idCategoria
                      ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20"
                      : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                  }`}
                >
                  <option value="">Selecciona una categoría...</option>
                  {loadingCategorias ? (
                    <option>Cargando categorías...</option>
                  ) : showErrorCategorias ? (
                    <option>Error al cargar categorías</option>
                  ) : (
                    categoriasModify.map((categoria) => (
                      <option key={categoria.idCategoria} value={categoria.idCategoria}>
                        {categoria.nombreCategoria}
                      </option>
                    ))
                  )}
                </select>
                <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
              </div>
              {errors.idCategoria && <p className="mt-1.5 text-xs text-danger-600">{errors.idCategoria.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiHash size={12} className="text-brand-600" /> Cantidad *
              </label>
              <input
                type="number"
                placeholder="Ingrese la cantidad"
                defaultValue={selectedProduct.cantidad}
                {...register("cantidad", { required: "La cantidad es obligatoria.", min: { value: 1, message: "La cantidad debe ser mayor a 0." } })}
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
                <FiDollarSign size={12} className="text-brand-600" /> Precio *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ingrese el precio"
                defaultValue={selectedProduct.precio}
                {...register("precio", { required: "El precio es obligatorio.", min: { value: 0.01, message: "El precio debe ser mayor a 0." } })}
                className={`${inputClass} ${
                  errors.precio
                    ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20"
                    : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                }`}
              />
              {errors.precio && <p className="mt-1.5 text-xs text-danger-600">{errors.precio.message}</p>}
            </div>
          </div>

          {/* Configuración de inventario */}
          <div className="rounded-xl border border-line bg-surface-2/40 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Configuración de inventario</h3>
            <SwitchField
              label="Controlar inventario"
              checked={controlarInventario}
              onChange={(val) => {
                setValue("controlarInventario", val ? 1 : 0);
                setHasChanges(true);
              }}
            />
          </div>

          {/* Configuración de panadería */}
          {isPanaderia && (
            <div className="rounded-xl border border-line bg-surface-2/40 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Configuración para producción y stock
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SwitchField
                  label="Control de stock"
                  checked={controlStock}
                  disabled={stockDiario}
                  onChange={(val) => {
                    setValue("controlStock", val ? 1 : 0);
                    setHasChanges(true);
                  }}
                />
                <SwitchField
                  label="Stock diario"
                  checked={stockDiario}
                  disabled={controlStock}
                  onChange={(val) => {
                    setValue("stockDiario", val ? 1 : 0);
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium text-muted">Tipo de producción</label>
                <div className="flex gap-2">
                  {["bandejas", "harina"].map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => {
                        setTipoProduccion(tipo);
                        setValue("tipoProduccion", tipo);
                        setHasChanges(true);
                      }}
                      className={`flex-1 rounded-xl border-0 py-2 text-sm font-semibold capitalize transition-colors ${
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
                    defaultValue={selectedProduct.unidadesPorBandeja || ""}
                    {...register("unidadesPorBandeja", {
                      required: tipoProduccion === "bandejas" ? "Las unidades por bandeja son obligatorias." : false,
                      min: { value: 1, message: "Las unidades por bandeja deben ser mayor a 0." },
                    })}
                    onChange={(e) => {
                      setValue("unidadesPorBandeja", e.target.value);
                      setHasChanges(checkForChanges(watch(), initialProductValues));
                    }}
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

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeEditPanel}
              disabled={loadingModificar}
              className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!hasChanges || loadingModificar}
              className={`flex min-w-[9rem] items-center justify-center gap-2 rounded-xl border-0 px-4 py-2 text-sm font-semibold transition-colors ${
                !hasChanges && !loadingModificar
                  ? "cursor-not-allowed bg-surface-2 text-muted"
                  : "bg-brand-600 text-white shadow-brand hover:bg-brand-500"
              }`}
            >
              {loadingModificar ? (
                <>
                  <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                  Guardando...
                </>
              ) : (
                <>
                  <FiSave size={15} /> Modificar
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── Estados vacíos ───────────────────────────────────────────── */}
      {filteredProductos.length === 0 && !loadigProducts && !showErrorProductos && showInfoProductos && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiInbox size={20} />
          </span>
          <p className="text-sm text-muted">No hay productos ingresados.</p>
        </div>
      )}

      {showNoResults && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiSearch size={20} />
          </span>
          <p className="text-sm text-muted">No se encontraron productos que coincidan con la búsqueda.</p>
        </div>
      )}

      {showErrorProductos && !showInfoProductos && (
        <Alert type="danger" title="No se pudieron cargar los productos" message="Intenta más tarde." />
      )}

      {/* ── Lista de productos ───────────────────────────────────────── */}
      {filteredByCategory.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredByCategory.map((producto) => {
            const confirmando = confirmingId === producto.idProducto;

            return (
              <div
                key={producto.idProducto}
                className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition-shadow duration-150 hover:shadow-modal"
              >
                <div className="flex items-start gap-3">
                  {producto.imagenB64 ? (
                    <img
                      src={producto.imagenB64}
                      alt={producto.nombreProducto}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <FiPackage size={22} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-ink">{producto.nombreProducto}</h3>
                    <p className="truncate text-xs text-muted">{producto.nombreCategoria}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-sm">
                      <span className="font-semibold text-brand-700">Q{producto.precio}</span>
                      <span className="text-muted">{producto.cantidad} unidades</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex gap-2 border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={() => openEditPanel(producto)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-brand-50 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    <FiEdit2 size={13} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(confirmando ? null : producto.idProducto)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-danger-50 py-2 text-xs font-semibold text-danger-700 transition-colors hover:bg-danger-100"
                  >
                    <FiTrash2 size={13} /> Eliminar
                  </button>
                </div>

                {confirmando && (
                  <div className="animate-slide-up rounded-xl border border-danger-200 bg-danger-50 p-3">
                    <p className="text-xs font-semibold text-danger-800">¿Eliminar "{producto.nombreProducto}"?</p>
                    <p className="mt-0.5 text-2xs text-danger-700">Ya no se mostrará en ninguna parte.</p>
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
                        onClick={() => handleDeleteConfirm(producto.idProducto)}
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

export default ManageProducts;