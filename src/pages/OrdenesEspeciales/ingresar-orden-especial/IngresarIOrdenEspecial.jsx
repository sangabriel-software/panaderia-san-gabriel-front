import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  FiArrowLeft,
  FiSearch,
  FiX,
  FiFilter,
  FiChevronDown,
  FiUser,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiPackage,
  FiSave,
} from "react-icons/fi";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import { getInitials } from "../../PedidosProdPage/IngresarOrdenProd/IngresarOrdenProdUtils";
import { getUniqueColor } from "../../../utils/utils";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { ingresarOrdenEspecialService } from "../../../services/ordenesEspeciales/ordenesEspeciales.service";
import { getUserData } from "../../../utils/Auth/decodedata";
import Alert from "../../../components/Alerts/Alert";

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

const selectClass =
  "w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

function IngresarOrdenEspecialPage() {
  const navigate = useNavigate();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const [cantidadValues, setCantidadValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const userData = getUserData();

  const [nombreCliente, setNombreCliente] = useState("");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState(new Date());
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");

  useEffect(() => {
    if (!loadingSucursales && sucursales.length > 0 && userData?.idRol !== 1) {
      const sucursalUsuario = sucursales.find((s) => s.idSucursal === userData.idSucursal);
      if (sucursalUsuario) setSucursalSeleccionada(sucursalUsuario);
    }
  }, [loadingSucursales, sucursales, userData]);

  const categorias = ["Todas", ...new Set(productos?.map((item) => item.nombreCategoria) || [])];

  const productosFiltrados = useMemo(() => {
    let filtered = categoriaActiva === "Todas" ? productos : productos?.filter((item) => item.nombreCategoria === categoriaActiva);
    if (searchTerm) {
      filtered = filtered?.filter((producto) => producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return filtered;
  }, [productos, categoriaActiva, searchTerm]);

  const clearSearch = () => setSearchTerm("");

  const handleCantidadChange = (idProducto, value) => {
    setCantidadValues((prev) => ({
      ...prev,
      [idProducto]: value === "" ? "" : parseInt(value),
    }));
  };

  const productosConCantidad = Object.values(cantidadValues).filter((v) => v > 0).length;
  const isFormValid =
    productosConCantidad > 0 && nombreCliente.trim() && telefonoCliente.trim() && sucursalSeleccionada;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!nombreCliente.trim()) throw new Error("El nombre del cliente es requerido");
      if (!telefonoCliente.trim()) throw new Error("El teléfono del cliente es requerido");
      if (!sucursalSeleccionada) throw new Error("Debe seleccionar una sucursal de entrega");

      const productosSeleccionados = Object.entries(cantidadValues)
        .filter(([_, cantidad]) => cantidad > 0)
        .map(([idProducto, cantidadUnidades]) => {
          const producto = productos?.find((p) => p.idProducto === parseInt(idProducto));
          return {
            idProducto: parseInt(idProducto),
            cantidadUnidades,
            nombreProducto: producto?.nombreProducto || "",
            fechaCreacion: dayjs().format("YYYY-MM-DD"),
          };
        });

      if (productosSeleccionados.length === 0) throw new Error("Debe seleccionar al menos un producto");

      const payload = {
        ordenEncabezado: {
          idSucursal: sucursalSeleccionada.idSucursal,
          nombreSucursal: sucursalSeleccionada.nombreSucursal,
          idUsuario: userData.idUsuario,
          nombreUsuario: `${userData.nombre} ${userData.apellido}`,
          nombreCliente: nombreCliente.trim(),
          telefonoCliente: telefonoCliente.trim(),
          fechaEntrega: dayjs(fechaEntrega).format("YYYY-MM-DD"),
          fechaAProducir: dayjs(fechaEntrega).format("YYYY-MM-DD"),
          fechaCreacion: dayjs().format("YYYY-MM-DD"),
        },
        ordenDetalle: productosSeleccionados,
      };

      await ingresarOrdenEspecialService(payload);

      setIsPopupOpen(true);
      setCantidadValues({});
    } catch (error) {
      setErrorPopupMessage(error.message);
      setIsPopupErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadigProducts || loadingSucursales) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* ── Alertas flotantes ────────────────────────────────────────── */}
      {isPopupErrorOpen && (
        <Alert
          floating
          position="top-right"
          type="danger"
          title="No se pudo crear la orden"
          message={errorPopupMessage}
          onDismiss={() => setIsPopupErrorOpen(false)}
        />
      )}

      {isPopupOpen && (
        <Alert
          floating
          position="top-right"
          type="success"
          title="¡Orden especial creada!"
          message="La orden especial se creó correctamente."
          onDismiss={() => setIsPopupOpen(false)}
          actions={[
            { label: "Ver órdenes", variant: "primary", onClick: () => navigate("/pedido-especial") },
            {
              label: "Crear otra",
              variant: "secondary",
              onClick: () => {
                setIsPopupOpen(false);
                setNombreCliente("");
                setTelefonoCliente("");
                setCantidadValues({});
                if (userData.idRol === 1) setSucursalSeleccionada(null);
              },
            },
          ]}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiPackage size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Crear Orden Especial</h1>
          <p className="text-sm text-muted">Ingresa los datos del cliente y los productos solicitados</p>
        </div>
      </header>

      {showErrorProductos && productosFiltrados?.length === 0 && (
        <Alert type="danger" title="No se pudieron cargar los productos" />
      )}
      {showErrorSucursales && <Alert type="danger" title="No se pudieron cargar las sucursales" />}
      {productos?.length === 0 && <Alert type="info" title="Sin productos registrados" message="No se han ingresado productos todavía." />}

      {/* ── Información del cliente ──────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-ink">Información del cliente</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
              <FiUser size={13} className="text-brand-600" /> Nombre del cliente *
            </label>
            <input
              type="text"
              placeholder="Ingrese el nombre completo"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
              <FiPhone size={13} className="text-brand-600" /> Teléfono del cliente *
            </label>
            <input
              type="text"
              placeholder="Ingrese el número de teléfono"
              value={telefonoCliente}
              onChange={(e) => setTelefonoCliente(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
              <FiCalendar size={13} className="text-brand-600" /> Fecha de entrega *
            </label>
            <input
              type="date"
              value={fechaEntrega ? dayjs(fechaEntrega).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}
              onChange={(e) => setFechaEntrega(new Date(e.target.value))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
              <FiMapPin size={13} className="text-brand-600" /> Sucursal de entrega *
            </label>
            {userData.idRol === 1 ? (
              <div className="relative">
                <select
                  value={sucursalSeleccionada?.idSucursal || ""}
                  onChange={(e) => {
                    const sucursal = sucursales.find((s) => s.idSucursal === Number(e.target.value));
                    setSucursalSeleccionada(sucursal || null);
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
            ) : (
              <div className={`${inputClass} flex items-center bg-surface-2 text-muted`}>
                {sucursalSeleccionada?.nombreSucursal || "Tu sucursal asignada"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Filtros ──────────────────────────────────────────────────── */}
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

          {categorias.length > 1 && (
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
          )}
        </div>

        {categorias.length > 1 && (
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
        )}
      </div>

      {/* ── Tabla de productos ───────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-surface-2/95">
            <tr>
              <th className="w-3/5 border-b border-line px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted sm:px-4">
                Producto
              </th>
              <th className="w-2/5 border-b border-line px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted sm:px-4">
                <span className="sm:hidden">Cantidad</span>
                <span className="hidden sm:inline">Cantidad requerida</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados?.length > 0 ? (
              productosFiltrados.map((producto, i) => (
                <tr
                  key={producto.idProducto}
                  className={`border-b border-line last:border-0 transition-colors hover:bg-brand-50/50 ${
                    i % 2 === 1 ? "bg-surface-2/30" : ""
                  }`}
                >
                  <td className="px-2 py-3 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs"
                        style={{ backgroundColor: getUniqueColor(producto.nombreProducto) }}
                      >
                        {getInitials(producto.nombreProducto)}
                      </span>
                      <span className="min-w-0 break-words font-medium text-ink">{producto.nombreProducto}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 sm:px-4">
                    <input
                      type="number"
                      min="0"
                      value={cantidadValues[producto.idProducto] || ""}
                      onChange={(e) => handleCantidadChange(producto.idProducto, e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      placeholder="0"
                      className="mx-auto block w-full max-w-[6rem] rounded-lg border border-line bg-surface px-2 py-2 text-center text-sm font-semibold text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-4 py-10 text-center text-sm text-muted">
                  No hay productos disponibles en esta categoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Barra de guardar, fija al fondo ──────────────────────────── */}
      <div className="sticky bottom-4 z-10 flex justify-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !isFormValid}
          className={`flex w-full max-w-md items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors sm:w-auto sm:px-10 ${
            !isFormValid && !isLoading
              ? "cursor-not-allowed border border-line bg-surface-2 text-muted"
              : "border-0 bg-brand-600 text-white shadow-modal hover:bg-brand-500"
          }`}
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
              Creando...
            </>
          ) : (
            <>
              <FiSave size={16} />
              Crear Orden Especial
              {productosConCantidad > 0 && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{productosConCantidad}</span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default IngresarOrdenEspecialPage;