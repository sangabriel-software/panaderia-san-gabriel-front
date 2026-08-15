// CategoriasPage.jsx - Componente optimizado
import { useState, useMemo } from "react";
import useGetCategorias from "../../hooks/categorias/UseGetCategorias";
import { ingresarCategoriaService, actualizarCategoriaService, eliminarCategoriaService } from "../../services/categorias/categorias.service";
import "./CategoriasStyle.css";
import { currentDate } from "../../utils/dateUtils";

// ── Iconos inline ────────────────────────────────────
const Icons = {
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Delete: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  ),
  Success: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Error: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Folder: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
};

const CategoriasPage = () => {
  const { categorias, loadingCategorias, showErrorCategorias, setCategorias } = useGetCategorias();

  // ── Estados ─────────────────────────────────────────
  const [modo, setModo] = useState(null); // "nuevo" | "editar" | "eliminar"
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [form, setForm] = useState({ nombreCategoria: "", descripcionCategoria: "" });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Toast ────────────────────────────────────────────
  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Abrir modos ──────────────────────────────────────
  const abrirNuevo = () => {
    setForm({ nombreCategoria: "", descripcionCategoria: "" });
    setFormError("");
    setModo("nuevo");
  };

  const abrirEditar = (cat) => {
    setCategoriaSeleccionada(cat);
    setForm({
      nombreCategoria: cat.nombreCategoria,
      descripcionCategoria: cat.descripcionCategoria,
    });
    setFormError("");
    setModo("editar");
  };

  const abrirEliminar = (cat) => {
    setCategoriaSeleccionada(cat);
    setModo("eliminar");
  };

  const cerrar = () => {
    setModo(null);
    setCategoriaSeleccionada(null);
    setForm({ nombreCategoria: "", descripcionCategoria: "" });
    setFormError("");
  };

  // ── Validación ──────────────────────────────────────
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

  // ── CRUD ─────────────────────────────────────────────
    const handleInsertar = async () => {
        if (!validar()) return;
        setLoading(true);
        try {
            const payload = {
                nombreCategoria: form.nombreCategoria.trim(),
                descripcionCategoria: form.descripcionCategoria.trim(),
                fechaCreacion: currentDate()
            };
            const res = await ingresarCategoriaService(payload);
            setCategorias(prev => [
                ...prev,
                {
                    ...payload,
                    idCategoria: res.categoriaId,
                    estado: "A"
                }
            ]);
            mostrarToast("success", "Categoría creada correctamente.");
            cerrar();
        } catch {
            mostrarToast("error", "No se pudo crear la categoría.");
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
      setCategorias((prev) =>
        prev.map((c) =>
          c.idCategoria === categoriaSeleccionada.idCategoria ? { ...c, ...payload } : c
        )
      );
      mostrarToast("success", "Categoría actualizada.");
      cerrar();
    } catch {
      mostrarToast("error", "No se pudo actualizar.");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    setLoading(true);
    try {
      await eliminarCategoriaService(categoriaSeleccionada.idCategoria);
      setCategorias((prev) =>
        prev.filter((c) => c.idCategoria !== categoriaSeleccionada.idCategoria)
      );
      mostrarToast("success", "Categoría eliminada.");
      cerrar();
    } catch(error) {
      if (error.status === 409) {
        const mensaje =
        error.response?.data?.error?.message ||
        "No se pudo eliminar.";
        mostrarToast("error", mensaje + "\n" + "Reasígnelos antes de eliminarla.");
      }else{
        mostrarToast("error", "No se pudo eliminar.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Memo ─────────────────────────────────────────────
  const categoriasActivas = useMemo(
    () => categorias?.filter((c) => c.estado === "A") ?? [],
    [categorias]
  );

  // ── Render ───────────────────────────────────────────
  const renderContent = () => {
    if (loadingCategorias) {
      return (
        <div className="cat-loading">
          <div className="cat-spinner" />
          <span>Cargando categorías...</span>
        </div>
      );
    }

    if (showErrorCategorias) {
      return (
        <div className="cat-empty">
          <Icons.Error />
          <p>Error al cargar las categorías.</p>
        </div>
      );
    }

    if (categoriasActivas.length === 0) {
      return (
        <div className="cat-empty">
          <Icons.Folder />
          <p>No hay categorías registradas.</p>
          <button className="cat-btn-primary" onClick={abrirNuevo}>
            <Icons.Plus /> Crear primera categoría
          </button>
        </div>
      );
    }

    return (
      <div className="cat-grid">
        {categoriasActivas.map((cat) => (
          <div className="cat-card" key={cat.idCategoria}>
            <div className="cat-card-top">
              <div className="cat-card-avatar">
                {cat.nombreCategoria.charAt(0).toUpperCase()}
              </div>
              <div className="cat-card-info">
                <p className="cat-card-name">{cat.nombreCategoria}</p>
                <p className="cat-card-desc">
                  {cat.descripcionCategoria || "Sin descripción"}
                </p>
              </div>
            </div>
            <div className="cat-card-actions">
              <button className="cat-btn-edit" onClick={() => abrirEditar(cat)}>
                <Icons.Edit /> Editar
              </button>
              {
                cat.idCategoria !== 1 && (
                  <button 
                    disabled={cat.idCategoria === 1}
                    className="cat-btn-delete" 
                    onClick={() => abrirEliminar(cat)}>
                    <Icons.Delete /> Eliminar
                  </button>
                )
              }
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="cat-page">
      {/* Toast */}
      {toast && (
        <div className={`cat-toast cat-toast--${toast.tipo}`}>
          {toast.tipo === "success" ? <Icons.Success /> : <Icons.Error />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="cat-header">
        <div>
          <h1 className="cat-title">Categorías</h1>
          <p className="cat-subtitle">Gestiona las categorías de productos</p>
        </div>
        <button className="cat-btn-primary" onClick={abrirNuevo}>
          <Icons.Plus /> Nueva categoría
        </button>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Panel Modal */}
      {modo && (
        <div className="cat-overlay" onClick={cerrar}>
          <div className="cat-panel" onClick={(e) => e.stopPropagation()}>
            {modo === "nuevo" || modo === "editar" ? (
              <>
                <div className="cat-panel-header">
                  <h2 className="cat-panel-title">
                    {modo === "nuevo" ? "Nueva categoría" : "Editar categoría"}
                  </h2>
                  <button className="cat-panel-close" onClick={cerrar}>
                    <Icons.Close />
                  </button>
                </div>

                <div className="cat-panel-body">
                  <div className="cat-field">
                    <label className="cat-label">Nombre *</label>
                    <input
                      type="text"
                      className={`cat-input ${formError && !form.nombreCategoria.trim() ? "cat-input--error" : ""}`}
                      placeholder="Ej. Panadería"
                      value={form.nombreCategoria}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, nombreCategoria: e.target.value }));
                        setFormError("");
                      }}
                      maxLength={60}
                      autoFocus
                    />
                  </div>

                  <div className="cat-field">
                    <label className="cat-label">Descripción</label>
                    <textarea
                      className="cat-textarea"
                      placeholder="Describe brevemente esta categoría..."
                      value={form.descripcionCategoria}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, descripcionCategoria: e.target.value }))
                      }
                      rows={3}
                      maxLength={200}
                    />
                    <span className="cat-char-count">
                      {form.descripcionCategoria.length}/200
                    </span>
                  </div>

                  {formError && (
                    <div className="cat-form-error">
                      <Icons.Error /> {formError}
                    </div>
                  )}
                </div>

                <div className="cat-panel-footer">
                  <button className="cat-btn-ghost" onClick={cerrar} disabled={loading}>
                    Cancelar
                  </button>
                  <button
                    className="cat-btn-primary"
                    onClick={modo === "nuevo" ? handleInsertar : handleActualizar}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="cat-btn-spinner" /> Guardando...
                      </>
                    ) : modo === "nuevo" ? (
                      "Crear categoría"
                    ) : (
                      "Guardar cambios"
                    )}
                  </button>
                </div>
              </>
            ) : (
              // Eliminar
              <>
                <div className="cat-panel-header">
                  <h2 className="cat-panel-title">Eliminar categoría</h2>
                  <button className="cat-panel-close" onClick={cerrar}>
                    <Icons.Close />
                  </button>
                </div>

                <div className="cat-panel-body">
                  <div className="cat-confirm-icon">
                    <Icons.Delete />
                  </div>
                  <p className="cat-confirm-title">
                    ¿Eliminar "{categoriaSeleccionada?.nombreCategoria}"?
                  </p>
                  <p className="cat-confirm-sub">
                    Esta acción desactivará la categoría. 
                  </p>
                </div>

                <div className="cat-panel-footer">
                  <button className="cat-btn-ghost" onClick={cerrar} disabled={loading}>
                    Cancelar
                  </button>
                  <button
                    className="cat-btn-danger"
                    onClick={handleEliminar}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="cat-btn-spinner" /> Eliminando...
                      </>
                    ) : (
                      "Sí, eliminar"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriasPage;