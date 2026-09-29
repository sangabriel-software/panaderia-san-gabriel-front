import { useParams, useNavigate } from "react-router";
import { FiTruck, FiMapPin, FiUser, FiClock, FiArrowLeft, FiPackage, FiInbox, FiHash } from "react-icons/fi";
import dayjs from "dayjs";
import "dayjs/locale/es";
import useGetDetalleTraslado from "../../../hooks/Traslados/useGetDetalleTraslado";
import Alert from "../../../components/Alerts/Alert";

dayjs.locale("es");

const formatFechaCompleta = (fecha) => dayjs(fecha).format("D [de] MMMM [de] YYYY · HH:mm");

function DetalleTraslados() {
  const { idTraslado } = useParams();
  const navigate = useNavigate();
  const { detalleTraslado, loadingDetalleTraslado, showErrorDetalleTraslado } = useGetDetalleTraslado(idTraslado);
  const { idSucursal } = useParams();

  const handleGoBack = () => navigate(`/traslados-productos/traslados-lista/${encodeURIComponent(idSucursal)}`);

  const BackButton = () => (
    <button
      type="button"
      onClick={handleGoBack}
      aria-label="Volver"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-blue-50 hover:text-blue-700"
    >
      <FiArrowLeft size={17} />
    </button>
  );

  if (loadingDetalleTraslado) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="text-sm text-muted">Cargando detalles del traslado...</p>
      </div>
    );
  }

  if (showErrorDetalleTraslado) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Detalle del traslado</h1>
        </header>
        <Alert type="danger" title="No se pudo cargar el traslado" message="Intenta volver e ingresar de nuevo." />
      </div>
    );
  }

  if (!detalleTraslado || !detalleTraslado.encabezadoTraslado || !detalleTraslado.detalle) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Detalle del traslado</h1>
        </header>
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiInbox size={20} />
          </span>
          <p className="text-sm text-muted">No se encontraron datos para este traslado.</p>
        </div>
      </div>
    );
  }

  const { encabezadoTraslado, detalle } = detalleTraslado;
  const totalProductos = detalle.reduce((sum, item) => sum + item.cantidadATrasladar, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <BackButton />
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.4)]">
          <FiTruck size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Traslado #{encabezadoTraslado.idTraslado}</h1>
          <p className="text-sm text-muted">Detalle completo del traslado de productos</p>
        </div>
      </header>

      {/* ── Fila de estadísticas ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <FiHash size={16} className="text-blue-600" />
          <p className="mt-2 text-lg font-bold text-ink">{detalle.length}</p>
          <p className="text-xs text-muted">Productos</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <FiPackage size={16} className="text-blue-600" />
          <p className="mt-2 text-lg font-bold text-ink">{totalProductos}</p>
          <p className="text-xs text-muted">Unidades totales</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <FiUser size={16} className="text-blue-600" />
          <p className="mt-2 truncate text-lg font-bold text-ink">
            {encabezadoTraslado.usuarioResponsable || "—"}
          </p>
          <p className="text-xs text-muted">Responsable</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <FiClock size={16} className="text-blue-600" />
          <p className="mt-2 truncate text-lg font-bold text-ink">
            {formatFechaCompleta(encabezadoTraslado.fechaTraslado)}
          </p>
          <p className="text-xs text-muted">Fecha</p>
        </div>
      </div>

      {/* ── Ruta: línea vertical tipo rastreo, origen → destino ─────────── */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-ink">Ruta del traslado</h2>

        <div className="relative flex flex-col gap-6 pl-1">
          {/* Línea conectora */}
          <div className="absolute bottom-4 left-[15px] top-4 w-px bg-gradient-to-b from-brand-500 to-blue-600" />

          <div className="relative flex items-start gap-4">
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-brand">
              <FiMapPin size={14} />
            </span>
            <div className="pt-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Origen</p>
              <p className="text-sm font-medium text-ink">{encabezadoTraslado.sucursalOrigen || "No especificado"}</p>
            </div>
          </div>

          <div className="relative flex items-start gap-4">
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.4)]">
              <FiMapPin size={14} />
            </span>
            <div className="pt-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Destino</p>
              <p className="text-sm font-medium text-ink">{encabezadoTraslado.sucursalDestino || "No especificado"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Productos trasladados ────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-line bg-surface-2/60 px-5 py-3">
          <h2 className="text-sm font-semibold text-ink">Productos a trasladar</h2>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-2xs font-semibold text-blue-700">
            {detalle.length} {detalle.length === 1 ? "producto" : "productos"}
          </span>
        </div>

        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-surface-2/40">
            <tr>
              <th className="w-3/5 px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Producto
              </th>
              <th className="w-2/5 px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                Cantidad
              </th>
            </tr>
          </thead>
          <tbody>
            {detalle.map((item, i) => (
              <tr
                key={item.idTrasladoDetalle}
                className={`border-t border-line ${i % 2 === 1 ? "bg-surface-2/30" : ""}`}
              >
                <td className="px-5 py-3">
                  <p className="truncate font-medium text-ink">{item.nombreProducto || "Producto sin nombre"}</p>
                  <p className="text-xs text-muted">ID: {item.idProducto}</p>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="inline-flex justify-center rounded-full bg-blue-50 px-2.5 py-1 text-sm font-bold text-blue-700">
                    {item.cantidadATrasladar} u.
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-blue-200 bg-blue-50/50">
              <td className="px-5 py-3 text-sm font-bold text-ink">Total</td>
              <td className="px-5 py-3 text-right text-sm font-bold text-blue-700">{totalProductos} unidades</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default DetalleTraslados;