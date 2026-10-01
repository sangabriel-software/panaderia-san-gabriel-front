import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiPlus,
  FiX,
  FiEdit2,
  FiTrash2,
  FiFolder,
  FiTag,
  FiAlignLeft,
} from "react-icons/fi";
import useGetCategorias from "../../hooks/categorias/UseGetCategorias";
import { ingresarCategoriaService, actualizarCategoriaService, eliminarCategoriaService } from "../../services/categorias/categorias.service";
import { currentDate } from "../../utils/dateUtils";
import Alert from "../../components/Alerts/Alert";

const CARD_TONES = [
  { bg: "bg-brand-50", avatar: "bg-brand-600", text: "text-brand-700" },
  { bg: "bg-accent-50", avatar: "bg-accent-600", text: "text-accent-700" },
  { bg: "bg-warning-50", avatar: "bg-warning-500", text: "text-warning-700" },
  { bg: "bg-danger-50", avatar: "bg-danger-600", text: "text-danger-700" },
];

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

function CategoriasPage() {
  const navigate = useNavigate();
  const { categorias, loadingCategorias, showErrorCategorias, setCategorias } = useGetCategorias();

  const [modo, setModo] = useState(null); // "nuevo" | "editar"
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [form, setForm] = useState({ nombreCategoria: "", descripcionCategoria: "" });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const abrirNuevo = () => {
    setForm({ nombreCategoria: "", descripcionCategoria: "" });
    setFormError("");
    setCategoriaSeleccionada(null);
    setModo("nuevo");
  };

  const abrirEditar = (cat) => {
    setCategoriaSeleccionada(cat);
    setForm({ nombreCategoria: cat.nombreCategoria, descripcionCategoria: cat.descripcionCategoria });
    setFormError("");
    setModo("editar");
  };

  const cerrarForm = () => {
    setModo(null);
    setCategoriaSeleccionada(null);
    setForm({ nombreCategoria: "", descripcionCategoria: "" });
    setFormError("");
  };

  const validar = () => {
    const nombre = form.nombreCategoria.trim();
    if (!nombre) {
      setFormError("El nombre de la categoría es obligatorio.");
      return false;
    }
    if (nombre.length < 3) {
      setFormError("El nombre debe tener al menos 3 caracteres.");
      return false;
    }
    setFormError("");
    return true;
  };

  const handleInsertar = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      const payload = {
        nombreCategoria: form.nombreCategoria.trim(),
        descripcionCategoria: form.descripcionCategoria.trim(),
        fechaCreacion: currentDate(),
      };
      const res = await ingresarCategoriaService(payload);
      setCategorias((prev) => [...prev, { ...payload, idCategoria: res.categoriaId, estado: "A" }]);
      setSuccessMessage("Categoría creada correctamente.");
      cerrarForm();
    } catch {
      setErrorMessage("No se pudo crear la categoría.");
    } finally {
      setLoading(false);
    }
  };

  const handleActualizar = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      const payload = {
        idCategoria: categoriaSeleccionada.idCategoria,
        nombreCategoria: form.nombreCategoria.trim(),
        descripcionCategoria: form.descripcionCategoria.trim(),
      };
      await actualizarCategoriaService(payload);
      setCategorias((prev) => prev.map((c) => (c.idCategoria === categoriaSeleccionada.idCategoria ? { ...c, ...payload } : c)));
      setSuccessMessage("Categoría actualizada.");
      cerrarForm();
    } catch {
      setErrorMessage("No se pudo actualizar.");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (cat) => {
    setLoading(true);
    try {
      await eliminarCategoriaService(cat.idCategoria);
      setCategorias((prev) => prev.filter((c) => c.idCategoria !== cat.idCategoria));
      setSuccessMessage("Categoría eliminada.");
      setConfirmingId(null);
    } catch (error) {
      if (error.status === 409) {
        const mensaje = error.response?.data?.error?.message || "No se pudo eliminar.";
        setErrorMessage(`${mensaje} Reasígnelos antes de eliminarla.`);
      } else {
        setErrorMessage("No se pudo eliminar.");
      }
      setConfirmingId(null);
    } finally {
      setLoading(false);
    }
  };

  const categoriasActivas = useMemo(() => categorias?.filter((c) => c.estado === "A") ?? [], [categorias]);

  if (loadingCategorias) {
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
        <button
          type="button"
          onClick={() => navigate("/config")}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiTag size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Categorías</h1>
          <p className="text-sm text-muted">Gestiona las categorías de productos</p>
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
              <FiPlus size={15} /> Nueva categoría
            </>
          )}
        </button>
      </header>

      {showErrorCategorias && (
        <Alert type="danger" title="No se pudieron cargar las categorías" message="Intenta recargar la página." />
      )}

      {/* ── Panel de formulario, inline — crear o editar ─────────────── */}
      {modo && (
        <div className="animate-slide-up rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-ink">
            {modo === "nuevo" ? "Nueva categoría" : `Editar ${categoriaSeleccionada?.nombreCategoria}`}
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiTag size={13} className="text-brand-600" /> Nombre *
              </label>
              <input
                type="text"
                placeholder="Ej. Panadería"
                value={form.nombreCategoria}
                onChange={(e) => {
                  setForm((p) => ({ ...p, nombreCategoria: e.target.value }));
                  setFormError("");
                }}
                maxLength={60}
                autoFocus
                className={`${inputClass} ${formError && !form.nombreCategoria.trim() ? "border-danger-400 focus:border-danger-500 focus:ring-danger-500/20" : ""}`}
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <FiAlignLeft size={13} className="text-accent-600" /> Descripción
              </label>
              <textarea
                placeholder="Describe brevemente esta categoría..."
                value={form.descripcionCategoria}
                onChange={(e) => setForm((p) => ({ ...p, descripcionCategoria: e.target.value }))}
                rows={3}
                maxLength={200}
                className={`${inputClass} resize-none`}
              />
              <p className="mt-1 text-right text-2xs text-muted">{form.descripcionCategoria.length}/200</p>
            </div>

            {formError && <p className="text-xs text-danger-600">{formError}</p>}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={cerrarForm}
              disabled={loading}
              className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={modo === "nuevo" ? handleInsertar : handleActualizar}
              disabled={loading}
              className="flex min-w-[9rem] items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                  Guardando...
                </>
              ) : modo === "nuevo" ? (
                "Crear categoría"
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Lista de categorías ──────────────────────────────────────── */}
      {categoriasActivas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiFolder size={20} />
          </span>
          <p className="text-sm text-muted">No hay categorías registradas.</p>
          <button
            type="button"
            onClick={abrirNuevo}
            className="flex items-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500"
          >
            <FiPlus size={15} /> Crear primera categoría
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoriasActivas.map((cat, i) => {
            const tone = CARD_TONES[i % CARD_TONES.length];
            const confirmando = confirmingId === cat.idCategoria;
            const puedeEliminar = cat.idCategoria !== 1;

            return (
              <div
                key={cat.idCategoria}
                className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition-shadow duration-150 hover:shadow-modal"
              >
                <div className="flex items-start gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white ${tone.avatar}`}>
                    {cat.nombreCategoria.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-ink">{cat.nombreCategoria}</h3>
                    <p className="truncate text-xs text-muted">{cat.descripcionCategoria || "Sin descripción"}</p>
                  </div>
                </div>

                <div className="mt-auto flex gap-2 border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={() => abrirEditar(cat)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-brand-50 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    <FiEdit2 size={13} /> Editar
                  </button>
                  {puedeEliminar && (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(confirmando ? null : cat.idCategoria)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-0 bg-danger-50 py-2 text-xs font-semibold text-danger-700 transition-colors hover:bg-danger-100"
                    >
                      <FiTrash2 size={13} /> Eliminar
                    </button>
                  )}
                </div>

                {confirmando && (
                  <div className="animate-slide-up rounded-xl border border-danger-200 bg-danger-50 p-3">
                    <p className="text-xs font-semibold text-danger-800">¿Eliminar "{cat.nombreCategoria}"?</p>
                    <p className="mt-0.5 text-2xs text-danger-700">Esta acción desactivará la categoría.</p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={loading}
                        className="flex-1 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminar(cat)}
                        disabled={loading}
                        className="flex flex-1 items-center justify-center rounded-lg border-0 bg-danger-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-danger-500 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                        ) : (
                          "Sí, eliminar"
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

export default CategoriasPage;