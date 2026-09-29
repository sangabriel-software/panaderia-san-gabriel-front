import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  FiArrowLeft,
  FiEdit,
  FiSave,
  FiX,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiUser,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiPackage,
  FiInbox,
} from "react-icons/fi";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import { getInitials } from "../../PedidosProdPage/IngresarOrdenProd/IngresarOrdenProdUtils";
import { getUniqueColor } from "../../../utils/utils";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { actualizarOrdenEspecialService } from "../../../services/ordenesEspeciales/ordenesEspeciales.service";
import useGetOrdenEDetalle from "../../../hooks/orenesEspeciales/useGetOrenEDetalle";
import { getUserData } from "../../../utils/Auth/decodedata";
import Alert from "../../../components/Alerts/Alert";

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

const selectClass =
  "w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

function OrdenEspecialDetail() {
  const { idOrdenEspecial } = useParams();
  const userData = getUserData();
  const navigate = useNavigate();

  const {
    detalleOrdenEspecial,
    loadingDetalleOrdenEspecial,
    showErrorDetalleOrdenEspecial,
    errorMessage: errorDetalleMessage,
    setDetalleOrdenEspecial,
  } = useGetOrdenEDetalle(idOrdenEspecial);

  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();

  const [cantidadValues, setCantidadValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");

  const productosEnOrdenIds = useMemo(() => {
    return detalleOrdenEspecial?.ordenDetalle?.map((p) => p.idProducto) || [];
  }, [detalleOrdenEspecial]);

  useEffect(() => {
    if (detalleOrdenEspecial?.ordenDetalle && productos) {
      const cantidades = {};
      detalleOrdenEspecial.ordenDetalle.forEach((producto) => {
        cantidades[producto.idProducto] = producto.cantidadUnidades;
      });
      setCantidadValues(cantidades);
    }
  }, [detalleOrdenEspecial, productos]);

  const categorias = useMemo(() => {
    if (!productos || !detalleOrdenEspecial?.ordenDetalle) return ["Todas"];
    const productosEnOrden = productos.filter((p) => productosEnOrdenIds.includes(p.idProducto));
    return ["Todas", ...new Set(productosEnOrden.map((p) => p.nombreCategoria))];
  }, [productos, detalleOrdenEspecial, productosEnOrdenIds]);

  const productosFiltrados = useMemo(() => {
    if (!productos || !detalleOrdenEspecial?.ordenDetalle) return [];
    let filtered = productos.filter((p) => productosEnOrdenIds.includes(p.idProducto));

    if (categoriaActiva !== "Todas") {
      filtered = filtered.filter((p) => p.nombreCategoria === categoriaActiva);
    }
    if (searchTerm) {
      filtered = filtered.filter((p) => p.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (!isEditing) {
      filtered = filtered.filter((p) => (cantidadValues[p.idProducto] || 0) > 0);
    }
    return filtered;
  }, [productos, detalleOrdenEspecial, categoriaActiva, searchTerm, cantidadValues, isEditing, productosEnOrdenIds]);

  const clearSearch = () => setSearchTerm("");

  const handleCantidadChange = (idProducto, value) => {
    setCantidadValues((prev) => ({
      ...prev,
      [idProducto]: value === "" ? "" : parseInt(value),
    }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCategoriaActiva("Todas");
    setSearchTerm("");
    if (detalleOrdenEspecial?.ordenDetalle) {
      const cantidades = {};
      detalleOrdenEspecial.ordenDetalle.forEach((producto) => {
        cantidades[producto.idProducto] = producto.cantidadUnidades;
      });
      setCantidadValues(cantidades);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!detalleOrdenEspecial?.ordenEncabezado?.nombreCliente?.trim()) {
        throw new Error("El nombre del cliente es requerido");
      }
      if (!detalleOrdenEspecial?.ordenEncabezado?.telefonoCliente?.trim()) {
        throw new Error("El teléfono del cliente es requerido");
      }
      if (!detalleOrdenEspecial?.ordenEncabezado?.idSucursal) {
        throw new Error("Debe seleccionar una sucursal de entrega");
      }
      if (!detalleOrdenEspecial?.ordenEncabezado?.fechaEntrega) {
        throw new Error("La fecha de entrega es requerida");
      }

      const productosSeleccionados = Object.entries(cantidadValues)
        .filter(([_, cantidad]) => cantidad > 0)
        .map(([idProducto, cantidad]) => {
          const productoOriginal = detalleOrdenEspecial.ordenDetalle.find(
            (p) => p.idProducto === parseInt(idProducto)
          );
          return {
            idDetalleOrdenEspecial: productoOriginal?.idDetalleOrdenEspecial || null,
            idProducto: parseInt(idProducto),
            cantidadUnidades: cantidad,
            nombreProducto: productos.find((p) => p.idProducto === parseInt(idProducto))?.nombreProducto || "",
            precioUnitario: productos.find((p) => p.idProducto === parseInt(idProducto))?.precioVenta || 0,
          };
        });

      if (productosSeleccionados.length === 0) {
        throw new Error("Debe seleccionar al menos un producto");
      }

      const payload = {
        ordenEncabezado: {
          idOrdenEspecial: parseInt(idOrdenEspecial),
          nombreCliente: detalleOrdenEspecial.ordenEncabezado.nombreCliente.trim(),
          telefonoCliente: detalleOrdenEspecial.ordenEncabezado.telefonoCliente.trim(),
          idSucursal: detalleOrdenEspecial.ordenEncabezado.idSucursal,
          fechaEntrega: dayjs(detalleOrdenEspecial.ordenEncabezado.fechaEntrega).format("YYYY-MM-DD"),
          fechaAProducir: dayjs(detalleOrdenEspecial.ordenEncabezado.fechaEntrega).format("YYYY-MM-DD"),
          idUsuario: userData.idUsuario,
        },
        ordenDetalle: productosSeleccionados,
      };

      await actualizarOrdenEspecialService(payload);

      setDetalleOrdenEspecial({
        ...detalleOrdenEspecial,
        ordenDetalle: productosSeleccionados,
      });

      setIsPopupOpen(true);
      setIsEditing(false);
      setCategoriaActiva("Todas");
      setSearchTerm("");
    } catch (error) {
      setErrorPopupMessage(error.message);
      setIsPopupErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const BackButton = () => (
    <button
      type="button"
      onClick={() => navigate(-1)}
      aria-label="Volver"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
    >
      <FiArrowLeft size={17} />
    </button>
  );

  if (loadigProducts || loadingSucursales || loadingDetalleOrdenEspecial || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm text-muted">Cargando orden especial...</p>
      </div>
    );
  }

  if (showErrorDetalleOrdenEspecial) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Orden Especial #{idOrdenEspecial}</h1>
        </header>
        <Alert type="danger" title="No se pudo cargar la orden" message={errorDetalleMessage} />
      </div>
    );
  }

  if (!detalleOrdenEspecial) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Orden Especial #{idOrdenEspecial}</h1>
        </header>
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiInbox size={20} />
          </span>
          <p className="text-sm text-muted">No se encontró la orden especial.</p>
        </div>
      </div>
    );
  }

  const sucursalSeleccionada = sucursales.find((s) => s.idSucursal === detalleOrdenEspecial.ordenEncabezado.idSucursal);
  const entregaVencida = dayjs(detalleOrdenEspecial.ordenEncabezado.fechaEntrega).isBefore(dayjs(), "day");

  return (
    <div className="flex flex-col gap-6">
      {/* ── Alertas flotantes ────────────────────────────────────────── */}
      {isPopupErrorOpen && (
        <Alert
          floating
          position="top-right"
          type="danger"
          title="No se pudo guardar"
          message={errorPopupMessage}
          onDismiss={() => setIsPopupErrorOpen(false)}
        />
      )}
      {isPopupOpen && (
        <Alert
          floating
          position="top-right"
          type="success"
          title="¡Orden actualizada!"
          message="La orden especial se actualizó correctamente."
          duration={3000}
          onDismiss={() => setIsPopupOpen(false)}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <BackButton />
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiPackage size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Orden Especial #{idOrdenEspecial}</h1>
          <p className="text-sm text-muted">{isEditing ? "Editando información" : "Detalle de la orden"}</p>
        </div>
      </header>

      {showErrorProductos && productosFiltrados?.length === 0 && (
        <Alert type="danger" title="No se pudieron cargar los productos" />
      )}
      {showErrorSucursales && <Alert type="danger" title="No se pudieron cargar las sucursales" />}

      {/* ── Información del cliente ──────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">Información del cliente</h2>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={entregaVencida}
              title={entregaVencida ? "No se puede editar una orden con fecha de entrega vencida" : ""}
              className="flex items-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted disabled:shadow-none"
            >
              <FiEdit size={15} /> Modificar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
              >
                <FiX size={15} /> Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <FiSave size={15} />
                )}
                Guardar cambios
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          // ── Vista de solo lectura: ficha de datos, no inputs deshabilitados ──
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <FiUser size={16} className="mt-0.5 shrink-0 text-brand-600" />
              <div className="min-w-0">
                <dt className="text-xs text-muted">Cliente</dt>
                <dd className="truncate text-sm font-medium text-ink">
                  {detalleOrdenEspecial.ordenEncabezado.nombreCliente || "—"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FiPhone size={16} className="mt-0.5 shrink-0 text-brand-600" />
              <div className="min-w-0">
                <dt className="text-xs text-muted">Teléfono</dt>
                <dd className="truncate text-sm font-medium text-ink">
                  {detalleOrdenEspecial.ordenEncabezado.telefonoCliente || "—"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FiCalendar size={16} className="mt-0.5 shrink-0 text-brand-600" />
              <div className="min-w-0">
                <dt className="text-xs text-muted">Fecha de entrega</dt>
                <dd className="flex items-center gap-2 text-sm font-medium text-ink">
                  {dayjs(detalleOrdenEspecial.ordenEncabezado.fechaEntrega).format("DD/MM/YYYY")}
                  {entregaVencida && (
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-2xs font-semibold text-muted">Vencida</span>
                  )}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FiMapPin size={16} className="mt-0.5 shrink-0 text-brand-600" />
              <div className="min-w-0">
                <dt className="text-xs text-muted">Sucursal de entrega</dt>
                <dd className="truncate text-sm font-medium text-ink">
                  {sucursalSeleccionada?.nombreSucursal || "Sin asignar"}
                </dd>
              </div>
            </div>
          </dl>
        ) : (
          // ── Modo edición: campos reales ──
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Nombre del cliente *</label>
              <input
                type="text"
                placeholder="Ingrese el nombre completo"
                value={detalleOrdenEspecial.ordenEncabezado.nombreCliente || ""}
                onChange={(e) =>
                  setDetalleOrdenEspecial({
                    ...detalleOrdenEspecial,
                    ordenEncabezado: { ...detalleOrdenEspecial.ordenEncabezado, nombreCliente: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Teléfono de la orden *</label>
              <input
                type="text"
                placeholder="Ingrese el número de teléfono"
                value={detalleOrdenEspecial.ordenEncabezado.telefonoCliente || ""}
                onChange={(e) =>
                  setDetalleOrdenEspecial({
                    ...detalleOrdenEspecial,
                    ordenEncabezado: { ...detalleOrdenEspecial.ordenEncabezado, telefonoCliente: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Fecha de entrega *</label>
              <div className="relative">
                <FiCalendar size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="date"
                  value={dayjs(detalleOrdenEspecial.ordenEncabezado.fechaEntrega).format("YYYY-MM-DD") || ""}
                  min={dayjs().format("YYYY-MM-DD")}
                  onChange={(e) =>
                    setDetalleOrdenEspecial({
                      ...detalleOrdenEspecial,
                      ordenEncabezado: { ...detalleOrdenEspecial.ordenEncabezado, fechaEntrega: e.target.value },
                    })
                  }
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Sucursal de entrega *</label>
              <div className="relative">
                <FiMapPin size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <select
                  value={detalleOrdenEspecial.ordenEncabezado.idSucursal || ""}
                  onChange={(e) => {
                    const sucursal = sucursales.find((s) => s.idSucursal === Number(e.target.value));
                    setDetalleOrdenEspecial({
                      ...detalleOrdenEspecial,
                      ordenEncabezado: {
                        ...detalleOrdenEspecial.ordenEncabezado,
                        idSucursal: sucursal?.idSucursal,
                        sucursalEntrega: sucursal?.nombreSucursal,
                      },
                    });
                  }}
                  className={selectClass}
                >
                  <option value="">Seleccione una sucursal</option>
                  {sucursales?.map((s) => (
                    <option key={s.idSucursal} value={s.idSucursal}>
                      {s.nombreSucursal}
                    </option>
                  ))}
                </select>
                <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Filtros de productos, solo en edición ───────────────────── */}
      {isEditing && (
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-muted transition-colors hover:text-ink"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>

            <div className="relative shrink-0 sm:hidden">
              <FiFilter size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <select
                value={categoriaActiva}
                onChange={(e) => setCategoriaActiva(e.target.value)}
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

          <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                type="button"
                onClick={() => setCategoriaActiva(categoria)}
                className={`shrink-0 rounded-full border-0 px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  categoriaActiva === categoria
                    ? "bg-brand-600 text-white shadow-brand"
                    : "bg-surface-2 text-muted hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Productos ────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-line bg-surface-2/60 px-5 py-3">
          <h2 className="text-sm font-semibold text-ink">Productos de la orden</h2>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-2xs font-semibold text-brand-700">
            {productosFiltrados.length}
          </span>
        </div>

        {productosFiltrados.length > 0 ? (
          <table className="w-full table-fixed border-collapse text-sm">
            <thead className="bg-surface-2/40">
              <tr>
                <th className="w-3/5 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted sm:px-5">
                  Producto
                </th>
                <th className="w-2/5 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted sm:px-5">
                  Cantidad
                </th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto, i) => (
                <tr key={producto.idProducto} className={`border-t border-line ${i % 2 === 1 ? "bg-surface-2/30" : ""}`}>
                  <td className="px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: getUniqueColor(producto.nombreProducto) }}
                      >
                        {getInitials(producto.nombreProducto)}
                      </span>
                      <span className="truncate font-medium text-ink">{producto.nombreProducto}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center sm:px-5">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={cantidadValues[producto.idProducto] || ""}
                        onChange={(e) => handleCantidadChange(producto.idProducto, e.target.value)}
                        placeholder="0"
                        className="mx-auto block w-24 rounded-lg border border-line bg-surface px-2 py-2 text-center text-sm font-semibold text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                    ) : (
                      <span className="inline-flex min-w-[3rem] justify-center rounded-full bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-700">
                        {cantidadValues[producto.idProducto] || 0}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-muted">
            {isEditing ? "No hay productos disponibles con los filtros actuales." : "No hay productos en esta orden."}
          </p>
        )}
      </div>
    </div>
  );
}

export default OrdenEspecialDetail;