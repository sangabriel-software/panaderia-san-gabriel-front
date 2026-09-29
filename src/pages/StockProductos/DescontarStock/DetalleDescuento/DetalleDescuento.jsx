import { useParams, useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiTag,
  FiUser,
  FiClock,
  FiMapPin,
  FiMinus,
  FiInbox,
} from "react-icons/fi";
import useGetDetalleDescuento from "../../../../hooks/DescuentoDeStock/useGetDetalleDescuento";
import { encryptId } from "../../../../utils/CryptoParams";
import { currentDateToFormat } from "../../../../utils/dateUtils";
import Alert from "../../../../components/Alerts/Alert";

const TIPO_TONES = {
  MAYOREO: "bg-accent-50 text-accent-700",
  "MAL ESTADO": "bg-danger-50 text-danger-700",
};
const DEFAULT_TIPO_TONE = "bg-brand-50 text-brand-700";

function DetalleDescuento() {
  const { idDescuento } = useParams();
  const navigate = useNavigate();
  const { descuentoDetalle, loadingDescuentoDetalle, showErrorDescuentoDetalle } =
    useGetDetalleDescuento(idDescuento);

  const handleGoBack = () => {
    if (descuentoDetalle?.encabezadoDescuento?.idSucursal) {
      const encryptedId = encryptId(descuentoDetalle.encabezadoDescuento.idSucursal.toString());
      navigate(`/descuento-stock/stock-descuentos-lista/${encodeURIComponent(encryptedId)}`);
    } else {
      navigate("/descuento-stock");
    }
  };

  const formatFecha = (fecha) =>
    new Date(fecha)
      .toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", " ·");

  const BackButton = () => (
    <button
      type="button"
      onClick={handleGoBack}
      aria-label="Volver"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
    >
      <FiArrowLeft size={17} />
    </button>
  );

  if (loadingDescuentoDetalle) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm text-muted">Cargando detalles del descuento...</p>
      </div>
    );
  }

  if (showErrorDescuentoDetalle) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Detalle del descuento</h1>
        </header>
        <Alert
          type="danger"
          title="No se pudo cargar el descuento"
          message="Intenta volver a la lista e ingresar de nuevo."
        />
      </div>
    );
  }

  if (!descuentoDetalle || !descuentoDetalle.encabezadoDescuento) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Detalle del descuento</h1>
        </header>
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiInbox size={20} />
          </span>
          <p className="text-sm text-muted">No se encontraron detalles para este descuento.</p>
        </div>
      </div>
    );
  }

  const { encabezadoDescuento, detalleDescuento } = descuentoDetalle;
  const tipoTone = TIPO_TONES[(encabezadoDescuento.tipoDescuento || "").toUpperCase()] || DEFAULT_TIPO_TONE;
  const activo = encabezadoDescuento.estado === "A";

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <BackButton />
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning-500 text-white">
          <FiTag size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">
            Descuento #{encabezadoDescuento.idDescuento}
          </h1>
          <p className="text-sm text-muted">Detalle completo de la modificación de stock</p>
        </div>
      </header>

      {/* ── Tarjeta principal ────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        {/* Barra superior: tipo + estado */}
        <div className="flex items-center justify-between border-b border-line bg-surface-2/60 px-5 py-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tipoTone}`}>
            {encabezadoDescuento.tipoDescuento}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-2xs font-semibold ${
              activo ? "bg-brand-50 text-brand-700" : "bg-surface-2 text-muted"
            }`}
          >
            {activo ? "Activo" : "Inactivo"}
          </span>
        </div>

        {/* Datos generales */}
        <dl className="grid grid-cols-1 gap-4 border-b border-line px-5 py-5 sm:grid-cols-3">
          <div className="flex items-start gap-2.5">
            <FiUser size={16} className="mt-0.5 shrink-0 text-brand-600" />
            <div className="min-w-0">
              <dt className="text-xs text-muted">Registrado por</dt>
              <dd className="truncate text-sm font-medium text-ink">{encabezadoDescuento.nombreUsuario}</dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <FiClock size={16} className="mt-0.5 shrink-0 text-brand-600" />
            <div className="min-w-0">
              <dt className="text-xs text-muted">Fecha</dt>
              <dd className="truncate text-sm font-medium text-ink">
                {formatFecha(encabezadoDescuento.fechaDescuento)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <FiMapPin size={16} className="mt-0.5 shrink-0 text-brand-600" />
            <div className="min-w-0 flex-1">
              <dt className="text-xs text-muted">Sucursal</dt>
              <dd className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-medium text-ink">{encabezadoDescuento.nombreSucursal}</span>
                {encabezadoDescuento.descuentoTurno && (
                  <span className="rounded-full bg-accent-50 px-2 py-0.5 text-2xs font-semibold text-accent-700">
                    {encabezadoDescuento.descuentoTurno}
                  </span>
                )}
              </dd>
            </div>
          </div>
        </dl>

        {/* Productos descontados */}
        <div className="px-5 py-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">
            Productos descontados
            <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-2xs font-semibold text-muted">
              {detalleDescuento?.length || 0}
            </span>
          </h2>

          {detalleDescuento?.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {detalleDescuento.map((producto) => {
                const unidad =
                  producto.nombreProducto === "Frances"
                    ? currentDateToFormat(encabezadoDescuento.fechaDescuento) < "2026-08-15"
                      ? "Unidades"
                      : "Filas"
                    : "Unidades";

                return (
                  <li
                    key={producto.idDetalleDescuento}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2/40 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{producto.nombreProducto}</p>
                      <p className="text-xs text-muted">ID: {producto.idProducto}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-danger-50 px-2.5 py-1 text-sm font-bold text-danger-700">
                      <FiMinus size={12} />
                      {producto.unidadesDescontadas} {unidad}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-sm text-muted">
              No hay productos registrados en este descuento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalleDescuento;