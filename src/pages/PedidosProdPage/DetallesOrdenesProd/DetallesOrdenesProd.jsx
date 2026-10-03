import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import {
  FiArrowLeft,
  FiCalendar,
  FiClipboard,
  FiClock,
  FiDownload,
  FiFileText,
  FiGrid,
  FiHome,
  FiLayers,
  FiMoon,
  FiShoppingBag,
  FiSun,
  FiUser,
} from "react-icons/fi";

import Alert from "../../../components/Alerts/Alert";
import useGetDetalleOrden from "../../../hooks/ordenesproduccion/useGetDetalleOrden";
import { useGetConsumoIngredientes } from "../../../hooks/consumoIngredientes/useGetConsumoIngredientes";
import { decryptId } from "../../../utils/CryptoParams";
import { generateOrderExcel } from "../../../utils/PdfUtils/ExcelUtils";
import { handleDownloadPDF } from "./DetallesOrdenesProdUtils";
import { getUniqueColor } from "../../../utils/utils";

// ─── Utilidades ────────────────────────────────────────────────────────────────

const CARD = "rounded-2xl border border-line bg-surface shadow-card";
const TH = "border-b border-line px-2 py-3 text-xs font-semibold text-muted sm:px-4";
const TD = "px-2 py-3 sm:px-4";
const FILA =
  "border-b border-line transition-colors last:border-0 hover:bg-brand-50/50 dark:hover:bg-brand-500/5";

const fmt = (n) => Number(n || 0).toLocaleString("es-GT", { maximumFractionDigits: 2 });

const suma = (lista, campo) => lista.reduce((acc, i) => acc + Number(i[campo] || 0), 0);

const parseFecha = (valor) => dayjs(String(valor).replace(" ", "T"));
const fmtFecha = (valor) => (valor ? parseFecha(valor).format("DD/MM/YYYY") : "—");
const fmtFechaHora = (valor) => (valor ? parseFecha(valor).format("DD/MM/YYYY HH:mm") : "—");

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

const ESTADOS = {
  P: {
    label: "Pendiente",
    clase: "bg-warning-500/15 text-warning-700 dark:text-warning-300",
    punto: "bg-warning-500",
  },
  C: {
    label: "Cerrada",
    clase: "bg-success-500/15 text-success-700 dark:text-success-300",
    punto: "bg-success-500",
  },
};

const TONOS_PILL = {
  brand: "bg-brand-500/15 text-brand-700 dark:text-brand-300",
  accent: "bg-accent-500/15 text-accent-700 dark:text-accent-300",
  warning: "bg-warning-500/15 text-warning-700 dark:text-warning-300",
  success: "bg-success-500/15 text-success-700 dark:text-success-300",
};

// ─── Piezas pequeñas ───────────────────────────────────────────────────────────

const Avatar = ({ nombre }) => (
  <span
    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs"
    style={{ backgroundColor: getUniqueColor(nombre) }}
  >
    {iniciales(nombre)}
  </span>
);

const Pill = ({ children, tone = "brand" }) => (
  <span
    className={`inline-flex min-w-[2.25rem] justify-center rounded-full px-2 py-1 text-sm font-bold tabular-nums sm:min-w-[2.5rem] sm:px-2.5 ${TONOS_PILL[tone]}`}
  >
    {children}
  </span>
);

const CeldaProducto = ({ nombre, detalle }) => (
  <td className={TD}>
    <div className="flex items-center gap-2 sm:gap-3">
      <Avatar nombre={nombre} />
      <div className="min-w-0">
        <p className="break-words font-medium text-ink">{nombre}</p>
        {detalle && <p className="text-2xs text-muted">{detalle}</p>}
      </div>
    </div>
  </td>
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

const Seccion = ({ titulo, subtitulo, cantidad, children }) => (
  <section className={`${CARD} overflow-hidden`}>
    <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-ink">{titulo}</h3>
        {subtitulo && <p className="text-sm text-muted">{subtitulo}</p>}
      </div>
      <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
        {cantidad} {cantidad === 1 ? "producto" : "productos"}
      </span>
    </div>
    {children}
  </section>
);

const ResumenCard = ({ icon: Icon, tone, titulo, cantidad, harina }) => (
  <div className={`${CARD} flex flex-col gap-3 p-4`}>
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <h3 className="text-md font-semibold leading-tight text-ink">{titulo}</h3>
        <p className="text-sm text-muted">
          {cantidad} {cantidad === 1 ? "producto" : "productos"}
        </p>
      </div>
    </div>
    <div className="flex items-baseline justify-between border-t border-line pt-3">
      <span className="text-sm text-muted">Harina</span>
      <span className="text-3xl font-bold text-ink tabular-nums">
        {fmt(harina)} <span className="text-sm font-medium text-muted">lb</span>
      </span>
    </div>
  </div>
);

// ─── Página ────────────────────────────────────────────────────────────────────

const DetallesOrdenesProduccionPage = () => {
  const navigate = useNavigate();
  const { idOrdenProduccion } = useParams();
  const idOrden = decryptId(decodeURIComponent(idOrdenProduccion));

  const { detalleOrden, loadingDetalleOrdene } = useGetDetalleOrden(idOrden);
  const { detalleConsumo } = useGetConsumoIngredientes(idOrden);

  const [errorExcel, setErrorExcel] = useState(false);

  const encabezado = detalleOrden?.encabezadoOrden ?? null;
  const items = detalleOrden?.detalleOrden ?? [];
  const consumo = Array.isArray(detalleConsumo) ? detalleConsumo : [];

  const { filasBandejas, filasHarina, totales } = useMemo(() => {
    // Harina usada por producto (el hook de consumo trae una fila por producto e ingrediente)
    const harinaPorProducto = consumo.reduce((acc, c) => {
      if (!String(c.Ingrediente ?? "").toLowerCase().includes("harina")) return acc;
      acc[c.Producto] = (acc[c.Producto] || 0) + Number(c.CantidadUsada || 0);
      return acc;
    }, {});

    const bandejas = items
      .filter((i) => i.tipoProduccion === "bandejas")
      .map((i) => ({ ...i, harinaUsada: harinaPorProducto[i.nombreProducto] ?? null }));

    // Todo lo que no es "bandejas" (harina, otros...) va junto
    const harina = items.filter((i) => i.tipoProduccion !== "bandejas");

    const harinaBandejas = bandejas.reduce((acc, i) => acc + Number(i.harinaUsada || 0), 0);
    const harinaSolicitada = suma(harina, "cantidadHarina");

    return {
      filasBandejas: bandejas,
      filasHarina: harina,
      totales: {
        bandejas: suma(bandejas, "cantidadBandejas"),
        unidades: suma(bandejas, "cantidadUnidades"),
        harinaBandejas,
        harinaSolicitada,
        harinaTotal: harinaBandejas + harinaSolicitada,
      },
    };
  }, [items, consumo]);

  // ── Descargas ────────────────────────────────────────────────────────────────

  const descargarExcel = () => {
    const ok = generateOrderExcel(idOrden, detalleOrden.detalleOrden, detalleConsumo, detalleOrden.encabezadoOrden);
    if (!ok) setErrorExcel(true);
  };

  const descargarPdf = () => handleDownloadPDF(idOrden, detalleOrden, detalleConsumo);

  // ── Carga ────────────────────────────────────────────────────────────────────

  if (loadingDetalleOrdene) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  const estado = ESTADOS[encabezado?.estadoOrden] ?? {
    label: encabezado?.estadoOrden ?? "—",
    clase: "bg-surface-2 text-muted",
    punto: "bg-muted",
  };
  const esAM = encabezado?.ordenTurno === "AM";
  const sinDatos = !encabezado;

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* ── Header ── */}
      <header className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/ordenes-produccion")}
          aria-label="Volver a órdenes de producción"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiClipboard size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">
            Orden de producción {encabezado ? `#${encabezado.idOrdenProduccion}` : ""}
          </h1>
          <p className="truncate text-sm text-muted">
            {encabezado
              ? `${encabezado.nombreSucursal} · Producción para el ${fmtFecha(encabezado.fechaAProducir)}`
              : "Detalle de la orden"}
          </p>
        </div>

        {!sinDatos && (
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={descargarExcel}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-success-500/40 bg-success-500/10 px-3.5 py-2 text-sm font-medium text-success-700 transition-colors hover:bg-success-500/20 dark:text-success-300 sm:flex-none"
            >
              <FiDownload size={15} />
              Excel
            </button>
            <button
              type="button"
              onClick={descargarPdf}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-danger-500/40 bg-danger-500/10 px-3.5 py-2 text-sm font-medium text-danger-700 transition-colors hover:bg-danger-500/20 dark:text-danger-300 sm:flex-none"
            >
              <FiFileText size={15} />
              PDF
            </button>
          </div>
        )}
      </header>

      {sinDatos ? (
        <Alert
          type="danger"
          title="No se pudo cargar la orden"
          message="Verifica tu conexión e intenta recargar la página."
        />
      ) : (
        <>
          {/* ── Datos de la orden ── */}
          <section className={`${CARD} p-4 sm:p-5`}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${estado.clase}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${estado.punto}`} />
                {estado.label}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  esAM
                    ? "bg-warning-500/15 text-warning-700 dark:text-warning-300"
                    : "bg-accent-500/15 text-accent-700 dark:text-accent-300"
                }`}
              >
                {esAM ? <FiSun size={12} /> : <FiMoon size={12} />}
                Turno {encabezado.ordenTurno}
              </span>
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem icon={FiHome} label="Sucursal">
                {encabezado.nombreSucursal}
              </InfoItem>
              <InfoItem icon={FiCalendar} label="Fecha a producir">
                {fmtFecha(encabezado.fechaAProducir)}
              </InfoItem>
              <InfoItem icon={FiUser} label="Panadero responsable">
                {encabezado.nombrePanadero}
              </InfoItem>
              <InfoItem icon={FiUser} label="Registrada por">
                {encabezado.nombreUsuario}
              </InfoItem>
              <InfoItem icon={FiClock} label="Fecha de creación">
                {fmtFechaHora(encabezado.fechaCreacion)}
              </InfoItem>
              <InfoItem icon={FiClock} label="Fecha de cierre">
                {encabezado.fechaCierre ? fmtFechaHora(encabezado.fechaCierre) : "Sin cerrar"}
              </InfoItem>
            </dl>
          </section>

          {items.length === 0 && (
            <Alert type="info" title="Sin productos" message="Esta orden no tiene productos registrados." />
          )}

          {/* ── Productos solicitados por bandejas (con harina usada) ── */}
          {filasBandejas.length > 0 && (
            <Seccion
              titulo="Productos solicitados por bandejas"
              subtitulo="La harina se calcula según el consumo de cada producto"
              cantidad={filasBandejas.length}
            >
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="bg-surface-2/95">
                  <tr>
                    <th className={`${TH} w-[34%] text-left`}>Producto</th>
                    <th className={`${TH} w-[19%] text-center`}>Bandejas</th>
                    <th className={`${TH} w-[21%] text-center`}>Unidades</th>
                    <th className={`${TH} w-[26%] text-center`}>Harina (lb)</th>
                  </tr>
                </thead>
                <tbody>
                  {filasBandejas.map((p, i) => (
                    <tr key={p.idDetalleOrdenProduccion} className={`${FILA} ${i % 2 === 1 ? "bg-surface-2/30" : ""}`}>
                      <CeldaProducto nombre={p.nombreProducto} detalle={p.nombreCategoria} />
                      <td className={`${TD} text-center`}>
                        <Pill tone="brand">{fmt(p.cantidadBandejas)}</Pill>
                      </td>
                      <td className={`${TD} text-center`}>
                        <Pill tone="accent">{fmt(p.cantidadUnidades)}</Pill>
                      </td>
                      <td className={`${TD} text-center`}>
                        {p.harinaUsada === null ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <Pill tone="warning">{fmt(p.harinaUsada)}</Pill>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-surface-2/60 font-semibold text-ink">
                    <td className={TD}>Total</td>
                    <td className={`${TD} text-center tabular-nums`}>{fmt(totales.bandejas)}</td>
                    <td className={`${TD} text-center tabular-nums`}>{fmt(totales.unidades)}</td>
                    <td className={`${TD} text-center tabular-nums`}>{fmt(totales.harinaBandejas)}</td>
                  </tr>
                </tfoot>
              </table>
            </Seccion>
          )}

          {/* ── Productos solicitados por harina y otros ── */}
          {filasHarina.length > 0 && (
            <Seccion titulo="Productos solicitados por harina" cantidad={filasHarina.length}>
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="bg-surface-2/95">
                  <tr>
                    <th className={`${TH} w-[65%] text-left`}>Producto</th>
                    <th className={`${TH} w-[35%] text-center`}>Harina (lb)</th>
                  </tr>
                </thead>
                <tbody>
                  {filasHarina.map((p, i) => (
                    <tr key={p.idDetalleOrdenProduccion} className={`${FILA} ${i % 2 === 1 ? "bg-surface-2/30" : ""}`}>
                      <CeldaProducto nombre={p.nombreProducto} detalle={p.nombreCategoria} />
                      <td className={`${TD} text-center`}>
                        <Pill tone="warning">{fmt(p.cantidadHarina)}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-surface-2/60 font-semibold text-ink">
                    <td className={TD}>Total</td>
                    <td className={`${TD} text-center tabular-nums`}>{fmt(totales.harinaSolicitada)}</td>
                  </tr>
                </tfoot>
              </table>
            </Seccion>
          )}

          {/* ── Resumen final ── */}
          {items.length > 0 && (
            <section aria-label="Resumen de harina" className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ResumenCard
                  icon={FiGrid}
                  tone="bg-brand-500/15 text-brand-600 dark:text-brand-300"
                  titulo="Productos solicitados por bandejas"
                  cantidad={filasBandejas.length}
                  harina={totales.harinaBandejas}
                />
                <ResumenCard
                  icon={FiShoppingBag}
                  tone="bg-warning-500/15 text-warning-600 dark:text-warning-300"
                  titulo="Productos solicitados por harina"
                  cantidad={filasHarina.length}
                  harina={totales.harinaSolicitada}
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-brand-600 p-4 text-white shadow-brand sm:p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <FiLayers size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold leading-tight">Total de harina de la orden</p>
                    <p className="text-sm text-white/75">Bandejas + harina</p>
                  </div>
                </div>
                <p className="shrink-0 text-4xl font-bold tabular-nums">
                  {fmt(totales.harinaTotal)} <span className="text-lg font-medium text-white/75">lb</span>
                </p>
              </div>
            </section>
          )}
        </>
      )}

      {errorExcel && (
        <Alert
          floating
          position="top-right"
          type="danger"
          title="No se pudo generar el Excel"
          message="Ocurrió un error al crear el archivo. Inténtalo de nuevo."
          onDismiss={() => setErrorExcel(false)}
          autoClose
          duration={3000}
        />
      )}
    </div>
  );
};

export default DetallesOrdenesProduccionPage;