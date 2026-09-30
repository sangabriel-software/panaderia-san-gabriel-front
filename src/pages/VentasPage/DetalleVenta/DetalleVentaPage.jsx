import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  FiActivity,
  FiArrowLeft,
  FiBarChart2,
  FiCalendar,
  FiChevronDown,
  FiClock,
  FiDollarSign,
  FiDownload,
  FiFileText,
  FiHome,
  FiMoon,
  FiShoppingBag,
  FiShoppingCart,
  FiSun,
  FiTarget,
  FiUser,
} from "react-icons/fi";

import Alert from "../../../components/Alerts/Alert";
import useGetDetalleVenta from "../../../hooks/ventas/useGetDetalleVenta";
import { decryptId } from "../../../utils/CryptoParams";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import { generarPDF, generarXLS } from "./DetalleVenta.utils";

// ─── Utilidades ────────────────────────────────────────────────────────────────

const CARD = "rounded-2xl border border-line bg-surface shadow-card";
const TH = "border-b border-line px-2 py-3 text-xs font-semibold text-muted sm:px-4";
const TD = "px-2 py-3 sm:px-4";

const redondear = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Q.1,234.50 — con signo cuando es negativo
const q = (valor) => {
  const n = redondear(valor || 0);
  const texto = Math.abs(n).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${n < 0 ? "-" : ""}Q.${texto}`;
};

const limpiar = (texto) => (texto ? String(texto).replace(/\s+/g, " ").trim() : "—");

const iniciales = (nombre = "") =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

const colorDe = (nombre = "") => {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360} 45% 40%)`;
};

// ─── Piezas pequeñas ───────────────────────────────────────────────────────────

const Avatar = ({ nombre }) => (
  <span
    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs"
    style={{ backgroundColor: colorDe(nombre) }}
  >
    {iniciales(nombre)}
  </span>
);

const InfoItem = ({ icon: Icon, label, children }) => (
  <div className="flex min-w-0 items-start gap-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300">
      <Icon size={15} />
    </span>
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="truncate text-md font-medium text-ink">{children}</dd>
    </div>
  </div>
);

const FilaBalance = ({ icon: Icon, tone, label, children }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="flex min-w-0 items-center gap-3 text-md text-muted">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        <Icon size={15} />
      </span>
      <span className="truncate">{label}</span>
    </span>
    {children}
  </div>
);

// ─── Página ────────────────────────────────────────────────────────────────────

const DetalleVentaPage = () => {
  const navigate = useNavigate();
  const { idVenta } = useParams();
  const idDescifrado = decryptId(decodeURIComponent(idVenta));

  const { detalleVenta, loadingDetalleVenta, showErrorDetalleVenta } = useGetDetalleVenta(idDescifrado);

  const [descargando, setDescargando] = useState(null); // "pdf" | "xls" | null
  const [errorDescarga, setErrorDescarga] = useState("");
  const [gastosAbiertos, setGastosAbiertos] = useState(false);

  // Se normaliza una sola vez: la forma { venta: {...} } o la directa
  const venta = detalleVenta?.venta ?? detalleVenta;
  const encabezado = venta?.encabezadoVenta ?? null;
  const productos = Array.isArray(venta?.detalleVenta) ? venta.detalleVenta : [];
  const ingresos = venta?.detalleIngresos ?? null;
  const gastos = Array.isArray(venta?.detalleGastos) ? venta.detalleGastos : [];

  const totalProductos = useMemo(
    () => productos.reduce((acc, p) => acc + Number(p.cantidadVendida || 0) * Number(p.precioUnitario || 0), 0),
    [productos]
  );

  // ── Descargas ────────────────────────────────────────────────────────────────

  const descargar = async (tipo) => {
    setDescargando(tipo);
    try {
      if (tipo === "pdf") await generarPDF(venta);
      else await generarXLS(venta);
    } catch (error) {
      console.error(`Error generando ${tipo === "pdf" ? "PDF" : "XLS"}:`, error);
      setErrorDescarga(
        tipo === "pdf"
          ? "No se pudo generar el PDF. Inténtalo de nuevo."
          : "No se pudo generar el Excel. Inténtalo de nuevo."
      );
    } finally {
      setDescargando(null);
    }
  };

  // ── Estados de carga ─────────────────────────────────────────────────────────

  if (loadingDetalleVenta) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm text-muted">Cargando detalle de la venta...</p>
      </div>
    );
  }

  const botonVolver = (
    <button
      type="button"
      onClick={() => navigate("/ventas")}
      aria-label="Volver a ventas"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
    >
      <FiArrowLeft size={17} />
    </button>
  );

  if (showErrorDetalleVenta || !encabezado) {
    return (
      <div className="flex flex-col gap-5">
        <header className="flex items-center gap-3">{botonVolver}</header>
        {showErrorDetalleVenta ? (
          <Alert
            type="danger"
            title="No se pudo cargar la venta"
            message="Hubo un error al consultar los detalles. Intenta más tarde."
          />
        ) : (
          <Alert
            type="info"
            title="Venta no encontrada"
            message="No se encontraron detalles para esta venta."
          />
        )}
      </div>
    );
  }

  // ── Cálculos del balance ─────────────────────────────────────────────────────

  const ingresado = Number(ingresos?.montoTotalIngresado || 0);
  const totalGastos = Number(ingresos?.montoTotalGastos || 0);
  const esperado = Number(ingresos?.montoEsperado || 0);
  const ventaReal = ingresado + totalGastos;
  const diferencia = redondear(ventaReal - esperado);

  const difPositiva = diferencia >= 0;
  const difEtiqueta = diferencia > 0 ? "Sobrante" : diferencia < 0 ? "Faltante" : "Cuadrada";

  const completada = encabezado.estadoVenta === "C";
  const esAM = encabezado.ventaTurno === "AM";

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* ── Header ── */}
      <header className="flex flex-wrap items-center gap-3">
        {botonVolver}
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiShoppingCart size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Venta VNT-{encabezado.idVenta}</h1>
          <p className="truncate text-sm text-muted">
            {encabezado.nombreSucursal} · {formatDateToDisplay(encabezado.fechaVenta)}
          </p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => descargar("xls")}
            disabled={descargando !== null}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-success-500/40 bg-success-500/10 px-3.5 py-2 text-sm font-medium text-success-700 transition-colors hover:bg-success-500/20 disabled:cursor-wait disabled:opacity-60 dark:text-success-300 sm:flex-none"
          >
            {descargando === "xls" ? (
              <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-success-500/40 border-t-success-600" />
            ) : (
              <FiDownload size={15} />
            )}
            Excel
          </button>
          <button
            type="button"
            onClick={() => descargar("pdf")}
            disabled={descargando !== null}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-danger-500/40 bg-danger-500/10 px-3.5 py-2 text-sm font-medium text-danger-700 transition-colors hover:bg-danger-500/20 disabled:cursor-wait disabled:opacity-60 dark:text-danger-300 sm:flex-none"
          >
            {descargando === "pdf" ? (
              <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-danger-500/40 border-t-danger-600" />
            ) : (
              <FiFileText size={15} />
            )}
            PDF
          </button>
        </div>
      </header>

      {/* ── Datos de la venta ── */}
      <section className={`${CARD} p-4 sm:p-5`}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              completada
                ? "bg-success-500/15 text-success-700 dark:text-success-300"
                : "bg-warning-500/15 text-warning-700 dark:text-warning-300"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${completada ? "bg-success-500" : "bg-warning-500"}`} />
            {completada ? "Cerrada" : "Pendiente"}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              esAM
                ? "bg-warning-500/15 text-warning-700 dark:text-warning-300"
                : "bg-accent-500/15 text-accent-700 dark:text-accent-300"
            }`}
          >
            {esAM ? <FiSun size={12} /> : <FiMoon size={12} />}
            Turno {encabezado.ventaTurno || "N/A"}
          </span>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem icon={FiHome} label="Sucursal">
            {encabezado.nombreSucursal}
          </InfoItem>
          <InfoItem icon={FiCalendar} label="Fecha de venta">
            {formatDateToDisplay(encabezado.fechaVenta)}
          </InfoItem>
          <InfoItem icon={FiUser} label="Vendido por">
            {limpiar(encabezado.nombreUsuario)}
          </InfoItem>
          <InfoItem icon={FiClock} label="Turno">
            {encabezado.ventaTurno || "N/A"}
          </InfoItem>
          <InfoItem icon={FiDollarSign} label="Venta ingresada">
            {q(encabezado.totalVenta)}
          </InfoItem>
        </dl>
      </section>

      {/* ── Productos vendidos ── */}
      <section className={`${CARD} overflow-hidden`}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-lg font-semibold text-ink">Productos vendidos</h2>
          <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
            {productos.length} {productos.length === 1 ? "producto" : "productos"}
          </span>
        </div>

        {productos.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">Esta venta no tiene productos registrados.</p>
        ) : (
          <table className="w-full table-fixed border-collapse text-sm">
            <thead className="bg-surface-2/95">
              <tr>
                <th className={`${TH} w-[40%] text-left`}>Producto</th>
                <th className={`${TH} w-[16%] text-center`}>
                  <span className="sm:hidden">Cant.</span>
                  <span className="hidden sm:inline">Cantidad</span>
                </th>
                <th className={`${TH} w-[20%] text-center`}>
                  <span className="sm:hidden">Precio</span>
                  <span className="hidden sm:inline">Precio unitario</span>
                </th>
                <th className={`${TH} w-[24%] text-center`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p, i) => {
                const nombre = limpiar(p.nombreProducto);
                return (
                  <tr
                    key={p.idDetalleVenta}
                    className={`border-b border-line transition-colors last:border-0 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 ${
                      i % 2 === 1 ? "bg-surface-2/30" : ""
                    }`}
                  >
                    <td className={TD}>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Avatar nombre={nombre} />
                        <span className="min-w-0 break-words font-medium text-ink">{nombre}</span>
                      </div>
                    </td>
                    <td className={`${TD} text-center tabular-nums text-ink`}>{p.cantidadVendida}</td>
                    <td className={`${TD} text-center tabular-nums text-muted`}>{q(p.precioUnitario)}</td>
                    <td className={`${TD} text-center`}>
                      <span className="inline-flex rounded-full bg-brand-500/15 px-2 py-1 text-xs font-bold tabular-nums text-brand-700 dark:text-brand-300 sm:px-2.5 sm:text-sm">
                        {q(Number(p.cantidadVendida) * Number(p.precioUnitario))}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-surface-2/60 font-semibold text-ink">
                <td colSpan={3} className={`${TD} text-right`}>
                  Total general
                </td>
                <td className={`${TD} text-center`}>
                  <span className="inline-flex rounded-full bg-success-500/15 px-2.5 py-1 text-sm font-bold tabular-nums text-success-700 dark:text-success-300">
                    {q(totalProductos)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>

      {/* ── Balance financiero ── */}
      {ingresos ? (
        <section className={`${CARD} p-4 sm:p-5`}>
          <h2 className="mb-4 text-lg font-semibold text-ink">Balance financiero</h2>

          <div className="flex flex-col gap-3.5">
            <FilaBalance
              icon={FiDollarSign}
              tone="bg-brand-500/15 text-brand-600 dark:text-brand-300"
              label="Dinero ingresado"
            >
              <span className="font-bold tabular-nums text-ink">{q(ingresado)}</span>
            </FilaBalance>

            {/* Gastos: se despliegan en la misma página (antes era un modal) */}
            <div>
              <button
                type="button"
                onClick={() => gastos.length > 0 && setGastosAbiertos((abierto) => !abierto)}
                aria-expanded={gastosAbiertos}
                aria-controls="detalle-gastos"
                disabled={gastos.length === 0}
                className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-xl border-0 bg-transparent px-2 py-1 text-left transition-colors enabled:hover:bg-surface-2 disabled:cursor-default"
              >
                <span className="flex min-w-0 items-center gap-3 text-md text-muted">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning-500/15 text-warning-600 dark:text-warning-300">
                    <FiShoppingBag size={15} />
                    {gastos.length > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-warning-500 px-1 text-[10px] font-bold text-white">
                        {gastos.length}
                      </span>
                    )}
                  </span>
                  <span className="truncate">Gastos del turno</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-bold tabular-nums text-warning-700 dark:text-warning-300">
                    +{q(totalGastos)}
                  </span>
                  {gastos.length > 0 && (
                    <FiChevronDown
                      size={15}
                      className={`text-muted transition-transform ${gastosAbiertos ? "rotate-180" : ""}`}
                    />
                  )}
                </span>
              </button>

              {gastosAbiertos && gastos.length > 0 && (
                <div
                  id="detalle-gastos"
                  className="mt-2 animate-slide-up overflow-hidden rounded-xl border border-line bg-bg"
                >
                  <table className="w-full table-fixed border-collapse text-sm">
                    <thead className="bg-surface-2/95">
                      <tr>
                        <th className={`${TH} w-[12%] text-center`}>#</th>
                        <th className={`${TH} w-[58%] text-left`}>Descripción</th>
                        <th className={`${TH} w-[30%] text-right`}>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastos.map((g, i) => (
                        <tr key={g.idGastoDiarioDetalle} className="border-b border-line last:border-0">
                          <td className={`${TD} text-center text-muted`}>{i + 1}</td>
                          <td className={`${TD} break-words text-ink`}>{limpiar(g.detalleGasto)}</td>
                          <td className={`${TD} text-right font-semibold tabular-nums text-warning-700 dark:text-warning-300`}>
                            {q(g.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-surface-2/60 font-semibold text-ink">
                        <td colSpan={2} className={`${TD} text-right`}>
                          Total
                        </td>
                        <td className={`${TD} text-right tabular-nums`}>{q(totalGastos)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {gastos.length === 0 && (
                <p className="mt-1 pl-11 text-xs text-muted">No se registraron gastos en este turno.</p>
              )}
            </div>

            <FilaBalance
              icon={FiBarChart2}
              tone="bg-accent-500/15 text-accent-600 dark:text-accent-300"
              label="Venta real"
            >
              <span className="rounded-full bg-accent-500/15 px-3 py-1 font-bold tabular-nums text-accent-700 dark:text-accent-300">
                {q(ventaReal)}
              </span>
            </FilaBalance>

            <FilaBalance
              icon={FiTarget}
              tone="bg-brand-500/15 text-brand-600 dark:text-brand-300"
              label="Venta esperada"
            >
              <span className="font-bold tabular-nums text-ink">{q(esperado)}</span>
            </FilaBalance>
          </div>

          {/* Resultado */}
          <div
            className={`mt-5 flex items-center justify-between gap-4 rounded-2xl border p-4 ${
              difPositiva
                ? "border-success-500/30 bg-success-500/10"
                : "border-danger-500/30 bg-danger-500/10"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  difPositiva
                    ? "bg-success-500/20 text-success-700 dark:text-success-300"
                    : "bg-danger-500/20 text-danger-700 dark:text-danger-300"
                }`}
              >
                <FiActivity size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-md font-semibold text-ink">Diferencia</p>
                <p className="text-xs text-muted">{difEtiqueta}</p>
              </div>
            </div>
            <p
              className={`shrink-0 text-3xl font-bold tabular-nums ${
                difPositiva ? "text-success-700 dark:text-success-300" : "text-danger-700 dark:text-danger-300"
              }`}
            >
              {q(diferencia)}
            </p>
          </div>
        </section>
      ) : (
        <Alert
          type="info"
          title="Sin ingresos registrados"
          message="Esta venta todavía no tiene un ingreso asociado, por eso no hay balance."
        />
      )}

      {errorDescarga && (
        <Alert
          floating
          position="top-right"
          type="danger"
          title="Error al descargar"
          message={errorDescarga}
          onDismiss={() => setErrorDescarga("")}
          autoClose
          duration={4000}
        />
      )}
    </div>
  );
};

export default DetalleVentaPage;