import { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiPlus,
  FiSearch,
  FiX,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiPackage,
  FiInbox,
  FiInfo,
} from "react-icons/fi";
import useGetRecetas from "../../hooks/recetas/useGetRecetas";
import useGetProductosYPrecios from "../../hooks/productosprecios/useGetProductosYprecios";
import Alert from "../../components/Alerts/Alert";
import SearchableSelect from "../../components/SearchableSelect/SearchableSelect";
import {
  getProductOptions,
  handleIngresarReceta,
  handleModificarReceta,
  handleDeleteReceta,
} from "./GestionDeRecetas.utils";

function GestionDeRecetasPage() {
  const { recetas, loadingRecetas, showErrorRecetas, setRecetas } = useGetRecetas();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const navigate = useNavigate();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchableSelectError, setSearchableSelectError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const searchableSelectRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingReceta, setEditingReceta] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: errorsEdit },
  } = useForm();

  const recetasFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return recetas;
    return recetas.filter((r) => `${r.nombreProducto} ${r.nombreIngrediente}`.toLowerCase().includes(term));
  }, [recetas, searchTerm]);

  const closeAddForm = () => {
    setShowAddForm(false);
    resetAdd();
    setSelectedProduct(null);
    setSearchableSelectError("");
  };

  const onSubmitAdd = (data) => {
    handleIngresarReceta(
      data,
      selectedProduct,
      setEditingReceta,
      closeAddForm,
      resetAdd,
      setRecetas,
      setSelectedProduct,
      setSearchableSelectError,
      setErrorMessage,
      (success) => {
        if (success) setSuccessMessage("La receta se ha ingresado con éxito.");
      },
      setIsPopupErrorOpen,
      setErrorPopupMessage
    );
  };

  const startEdit = (receta) => {
    setEditingId(receta.idReceta);
    setEditingValue(receta.cantidadNecesaria);
    setEditValue("cantidadNecesaria", receta.cantidadNecesaria);
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetEdit();
  };

  const onSubmitEdit = (data, receta) => {
    handleModificarReceta(
      data,
      receta,
      setRecetas,
      setEditingReceta,
      () => setEditingId(null),
      resetEdit,
      setErrorMessage,
      (success) => {
        if (success) setSuccessMessage("La información se ha modificado con éxito.");
      },
      setIsPopupErrorOpen,
      setErrorPopupMessage
    );
  };

  const confirmDelete = (idProducto) => {
    setIsLoading(true);
    handleDeleteReceta(idProducto, setRecetas, () => setConfirmingId(null), setErrorPopupMessage, setIsPopupErrorOpen, setIsLoading);
  };

  if (loadingRecetas || loadigProducts) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (showErrorRecetas || showErrorProductos) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/config")}
            aria-label="Volver"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            <FiArrowLeft size={17} />
          </button>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Configuración de ingredientes</h1>
        </header>
        <Alert type="danger" title="No se pudieron cargar los datos" message="Intenta recargar la página." />
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
          <FiPackage size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Configuración de ingredientes</h1>
          <p className="text-sm text-muted">{recetas.length} recetas configuradas</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 sm:w-auto"
        >
          <FiPlus size={15} /> {showAddForm ? "Cancelar" : "Agregar receta"}
        </button>
      </header>

      {showInfoBanner && (
        <Alert
          type="info"
          title="¿Qué es esto?"
          message="Configura cuánta materia prima consume cada producto, para que se refleje automáticamente en las órdenes de producción."
          onDismiss={() => setShowInfoBanner(false)}
        />
      )}

      {errorMessage && (
        <Alert type="danger" title={errorMessage} onDismiss={() => setErrorMessage("")} />
      )}

      {/* ── Panel de agregar, inline — no modal ──────────────────────── */}
      {showAddForm && (
        <form
          onSubmit={handleSubmitAdd(onSubmitAdd)}
          className="animate-slide-up rounded-2xl border border-line bg-surface p-5 shadow-card"
        >
          <h2 className="mb-4 text-sm font-semibold text-ink">Nueva receta</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Producto *</label>
              <SearchableSelect
                options={getProductOptions(productos)}
                placeholder="Selecciona un producto..."
                onSelect={(selected) => {
                  setSelectedProduct(selected);
                  setSearchableSelectError("");
                }}
                ref={searchableSelectRef}
                required
              />
              {searchableSelectError && <p className="mt-1.5 text-xs text-danger-600">{searchableSelectError}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Ingrediente</label>
              <div className="flex h-[42px] items-center rounded-xl border border-line bg-surface-2 px-3.5 text-sm font-medium text-muted">
                Harina
              </div>
              <input type="hidden" value="Harina" {...registerAdd("nombreIngrediente")} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Cantidad necesaria *</label>
              <input
                type="number"
                step="any"
                placeholder="0"
                {...registerAdd("cantidadNecesaria", { required: true })}
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
              {errorsAdd.cantidadNecesaria && <p className="mt-1.5 text-xs text-danger-600">Este campo es requerido</p>}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeAddForm}
              className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl border-0 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500"
            >
              Guardar receta
            </button>
          </div>
        </form>
      )}

      {/* ── Buscador ─────────────────────────────────────────────────── */}
      {recetas.length > 0 && (
        <div className="relative">
          <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar producto o ingrediente..."
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

      {/* ── Lista de recetas ─────────────────────────────────────────── */}
      {recetas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiInbox size={20} />
          </span>
          <p className="text-sm text-muted">No se han configurado recetas todavía.</p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500"
          >
            <FiPlus size={15} /> Agregar receta
          </button>
        </div>
      ) : recetasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiSearch size={20} />
          </span>
          <p className="text-sm text-muted">Ninguna receta coincide con tu búsqueda.</p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          {recetasFiltradas.map((receta, i) => {
            const editando = editingId === receta.idReceta;
            const confirmando = confirmingId === receta.idProducto;

            return (
              <li key={receta.idReceta} className={`border-b border-line last:border-0 ${i % 2 === 1 ? "bg-surface-2/30" : ""}`}>
                {editando ? (
                  <form
                    onSubmit={handleSubmitEdit((data) => onSubmitEdit(data, receta))}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{receta.nombreProducto}</p>
                      <p className="text-xs text-muted">Ingrediente: {receta.nombreIngrediente}</p>
                    </div>
                    <div className="sm:w-40">
                      <label className="mb-1 block text-2xs font-medium text-muted">Cantidad necesaria</label>
                      <input
                        type="number"
                        step="any"
                        autoFocus
                        {...registerEdit("cantidadNecesaria", { required: true })}
                        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                      {errorsEdit.cantidadNecesaria && <p className="mt-1 text-2xs text-danger-600">Requerido</p>}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-muted transition-colors hover:bg-surface-2"
                      >
                        <FiX size={15} />
                      </button>
                      <button
                        type="submit"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border-0 bg-brand-600 text-white transition-colors hover:bg-brand-500"
                      >
                        <FiCheck size={15} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-4 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                      {receta.nombreProducto?.charAt(0).toUpperCase()}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{receta.nombreProducto}</p>
                      <p className="truncate text-xs text-muted">{receta.nombreIngrediente}</p>
                    </div>

                    <span className="shrink-0 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-bold text-ink">
                      {receta.cantidadNecesaria} {receta.unidadMedida}
                    </span>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(receta)}
                        aria-label="Editar"
                        title="Editar cantidad"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border-0 bg-transparent text-muted transition-colors hover:bg-brand-50 hover:text-brand-700"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(confirmando ? null : receta.idProducto)}
                        aria-label="Eliminar"
                        title="Eliminar receta"
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border-0 transition-colors ${
                          confirmando ? "bg-danger-50 text-danger-600" : "bg-transparent text-muted hover:bg-danger-50 hover:text-danger-600"
                        }`}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {confirmando && (
                  <div className="animate-slide-up border-t border-danger-200 bg-danger-50 px-4 py-3">
                    <p className="text-sm font-semibold text-danger-800">
                      ¿Eliminar la receta de {receta.nombreProducto}?
                    </p>
                    <p className="mt-0.5 text-xs text-danger-700">Esta acción no se puede deshacer.</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={isLoading}
                        className="rounded-lg border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(receta.idProducto)}
                        disabled={isLoading}
                        className="flex min-w-[5.5rem] items-center justify-center rounded-lg border-0 bg-danger-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-danger-500 disabled:cursor-not-allowed disabled:bg-danger-400"
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default GestionDeRecetasPage;