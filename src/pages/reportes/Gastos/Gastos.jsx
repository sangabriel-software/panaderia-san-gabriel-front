import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { consultarGastosService } from "../../../services/reportes/reportes.service";
import { handleConsultar } from "./Gastos.utils";

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconMoney = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const IconArrowLeft = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
    />
  </svg>
);

const IconCalendar = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const IconBuilding = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

const IconSearch = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const IconChevron = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const IconAlert = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const IconDoc = () => (
  <svg
    className="h-7 w-7"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const IconPDF = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

// ─── Formatters ──────────────────────────────────────────────────────────────

const formatQ = (val) =>
  `Q ${parseFloat(val || 0).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
  })}`;

const formatPeriodo = (inicio, fin) => `${inicio}\n${fin}`;

// ─── PDF Generator ───────────────────────────────────────────────────────────

const generarPDF = async ({
  gastos,
  totalGastos,
  sucursalNombre,
  fechaInicio,
  fechaFin,
}) => {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const GREEN = [16, 185, 129];
  const GREEN_DARK = [5, 150, 105];
  const GREEN_LIGHT = [236, 253, 245];
  const SLATE_800 = [30, 41, 59];
  const SLATE_500 = [100, 116, 139];
  const SLATE_200 = [226, 232, 240];
  const WHITE = [255, 255, 255];

  // Encabezado
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, pageW, 38, "F");

  doc.setFillColor(...GREEN);
  doc.circle(pageW - 10, -5, 28, "F");

  doc.setFillColor(255, 255, 255, 0.08);
  doc.circle(pageW - 22, 42, 18, "F");

  doc.setFillColor(...WHITE);
  doc.roundedRect(12, 8, 22, 22, 3, 3, "F");

  doc.setFontSize(14);
  doc.setTextColor(...GREEN_DARK);
  doc.setFont("helvetica", "bold");
  doc.text("Q", 23, 23, { align: "center" });

  doc.setTextColor(...WHITE);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Gastos", 40, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(209, 250, 229);
  doc.text("Consulta y análisis de gastos por sucursal", 40, 25);

  const ahora = new Date().toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.setFontSize(7.5);
  doc.setTextColor(167, 243, 208);
  doc.text(`Generado: ${ahora}`, pageW - 12, 33, {
    align: "right",
  });

  // Tarjetas resumen
  let y = 46;

  const cards = [
    {
      label: "Sucursal",
      value: sucursalNombre,
    },
    {
      label: "Período",
      value: `${fechaInicio}  →  ${fechaFin}`,
    },
    {
      label: "Total gastos",
      value: formatQ(totalGastos),
      highlight: true,
    },
    {
      label: "Registros",
      value: `${gastos.length} gastos`,
    },
  ];

  const cardW = (pageW - 28) / 2;

  cards.forEach((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);

    const cx = 14 + col * (cardW + 4);
    const cy = y + row * 20;

    if (card.highlight) {
      doc.setFillColor(...GREEN_LIGHT);
      doc.roundedRect(cx, cy, cardW, 16, 2, 2, "F");

      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.4);
      doc.roundedRect(cx, cy, cardW, 16, 2, 2, "S");

      doc.setTextColor(...GREEN_DARK);
    } else {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(cx, cy, cardW, 16, 2, 2, "F");

      doc.setDrawColor(...SLATE_200);
      doc.setLineWidth(0.3);
      doc.roundedRect(cx, cy, cardW, 16, 2, 2, "S");

      doc.setTextColor(...SLATE_500);
    }

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(card.label.toUpperCase(), cx + 5, cy + 6);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    const textColor = card.highlight ? GREEN_DARK : SLATE_800;

    doc.setTextColor(...textColor);
    doc.text(String(card.value), cx + 5, cy + 13);
  });

  y += 46;

  doc.setDrawColor(...SLATE_200);
  doc.setLineWidth(0.3);
  doc.line(14, y, pageW - 14, y);

  y += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_800);
  doc.text("Detalle de Gastos", 14, y);

  y += 5;

  const rows = gastos.map((g, i) => [
    i + 1,
    g.detalleGasto,
    g.fechaIngreso,
    formatQ(g.montoGasto),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Descripción", "Fecha", "Monto"]],
    body: rows,
    foot: [["", "", "TOTAL", formatQ(totalGastos)]],
    margin: {
      left: 14,
      right: 14,
    },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: {
        top: 3.5,
        bottom: 3.5,
        left: 4,
        right: 4,
      },
      textColor: SLATE_800,
      lineColor: SLATE_200,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: GREEN_DARK,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    footStyles: {
      fillColor: GREEN_LIGHT,
      textColor: GREEN_DARK,
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: {
        cellWidth: 10,
        halign: "center",
        textColor: SLATE_500,
      },
      1: {
        cellWidth: "auto",
      },
      2: {
        cellWidth: 28,
        halign: "center",
      },
      3: {
        cellWidth: 30,
        halign: "right",
        fontStyle: "bold",
      },
    },
    didDrawPage: () => {
      const pg = doc.internal.getCurrentPageInfo().pageNumber;
      const total = doc.internal.getNumberOfPages();

      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE_500);

      doc.text(`Página ${pg} de ${total}`, pageW / 2, pageH - 8, {
        align: "center",
      });

      doc.setDrawColor(...SLATE_200);
      doc.setLineWidth(0.2);

      doc.line(14, pageH - 12, pageW - 14, pageH - 12);

      doc.setTextColor(...SLATE_500);
      doc.text("Sistema de Administración", 14, pageH - 8);

      doc.text("Reporte de Gastos", pageW - 14, pageH - 8, {
        align: "right",
      });
    },
  });

  const filename = `gastos_${sucursalNombre.replace(
    /\s+/g,
    "_"
  )}_${fechaInicio}_${fechaFin}.pdf`;

  doc.save(filename);
};

// ─── Spinner ─────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="flex min-h-40 flex-col items-center justify-center gap-3">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 dark:border-brand-900/50 dark:border-t-brand-400" />

    <p className="text-sm text-muted">
      Consultando gastos...
    </p>
  </div>
);

// ─── Empty State ─────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-muted">
      <IconDoc />
    </div>

    <p className="text-base font-bold text-ink">
      Sin resultados
    </p>

    <p className="mt-1 max-w-sm text-sm text-muted">
      No se encontraron gastos para el período y sucursal seleccionados.
    </p>
  </div>
);

// ─── Summary Card ─────────────────────────────────────────────────────────────

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  tone = "brand",
  wide = false,
}) => {
  const tones = {
    brand:
      "bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400",

    accent:
      "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300",

    neutral:
      "bg-surface-2 text-muted",

    danger:
      "bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400",
  };

  return (
    <div
      className={`rounded-2xl border border-line bg-surface p-4 shadow-card ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            tones[tone] || tones.brand
          }`}
        >
          <Icon />
        </div>

        <div className="min-w-0">
          <p className="text-2xs font-bold uppercase tracking-wide text-muted">
            {label}
          </p>

          <p
            className={`mt-1 truncate text-sm font-bold ${
              tone === "brand"
                ? "text-brand-600 dark:text-brand-400"
                : "text-ink"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Gasto Card ──────────────────────────────────────────────────────────────

const GastoCard = ({ gasto, index }) => (
  <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-ink">
          {gasto.detalleGasto}
        </p>

        <p className="mt-1 text-xs text-muted">
          {gasto.fechaIngreso}
        </p>
      </div>

      <span className="shrink-0 rounded-lg bg-surface-2 px-2.5 py-1 text-2xs font-bold text-muted">
        #{index + 1}
      </span>
    </div>

    <div className="mt-4 border-t border-line pt-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">
          Monto
        </span>

        <span className="text-base font-bold text-brand-600 dark:text-brand-400">
          {formatQ(gasto.montoGasto)}
        </span>
      </div>
    </div>
  </div>
);

// ─── Gasto Row ───────────────────────────────────────────────────────────────

const GastoRow = ({ gasto, index }) => (
  <tr className="border-t border-line text-sm">
    <td className="px-4 py-4 text-center text-xs font-semibold text-muted">
      {index + 1}
    </td>

    <td className="px-4 py-4 font-semibold text-ink">
      {gasto.detalleGasto}
    </td>

    <td className="px-4 py-4 text-muted">
      {gasto.fechaIngreso}
    </td>

    <td className="px-4 py-4 text-right font-bold text-brand-600 dark:text-brand-400">
      {formatQ(gasto.montoGasto)}
    </td>
  </tr>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const Gastos = () => {
  const navigate = useNavigate();

  const {
    sucursales,
    loadingSucursales,
  } = useGetSucursales();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [idSucursal, setIdSucursal] = useState("");

  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const isFormValid =
    fechaInicio &&
    fechaFin &&
    idSucursal;

  const totalGastos = gastos.reduce(
    (acc, g) => acc + parseFloat(g.montoGasto || 0),
    0
  );

  const sucursalNombre =
    sucursales?.find(
      (s) => s.idSucursal === Number(idSucursal)
    )?.nombreSucursal || "";

  // Reset cuando cambian filtros
  useEffect(() => {
    if (hasSearched) {
      setHasSearched(false);
      setGastos([]);
      setError(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaInicio, fechaFin, idSucursal]);

  const handleDescargarPDF = async () => {
    if (!gastos.length) return;

    setGenerandoPDF(true);

    try {
      await generarPDF({
        gastos,
        totalGastos,
        sucursalNombre,
        fechaInicio,
        fechaFin,
      });
    } finally {
      setGenerandoPDF(false);
    }
  };

  const ejecutarConsulta = () => {
    handleConsultar(
      isFormValid,
      loading,
      setLoading,
      setError,
      setHasSearched,
      setGastos,
      consultarGastosService,
      fechaInicio,
      fechaFin,
      idSucursal
    );
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20"
            onClick={() => navigate("/reportes")}
            aria-label="Volver a reportes"
          >
            <IconArrowLeft />
          </button>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <IconMoney />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-bold text-ink sm:text-2xl">
              Gastos
            </h1>

            <p className="mt-0.5 text-sm text-muted">
              Consulta y análisis de gastos por sucursal
            </p>
          </div>

        </div>

        {/* PDF */}
        {gastos.length > 0 && (
          <button
            className="flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-danger-200 bg-danger-50 px-3 text-sm font-semibold text-danger-700 transition hover:bg-danger-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-danger-900/50 dark:bg-danger-900/20 dark:text-danger-300 dark:hover:bg-danger-900/30 sm:self-auto"
            onClick={handleDescargarPDF}
            disabled={generandoPDF}
            aria-label="Descargar PDF"
          >
            {generandoPDF ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-danger-200 border-t-danger-600 dark:border-danger-800 dark:border-t-danger-300" />

                <span>
                  Generando...
                </span>
              </>
            ) : (
              <>
                <IconPDF />

                <span>
                  Descargar PDF
                </span>
              </>
            )}
          </button>
        )}

      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">

        <div className="mb-4 flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <IconSearch />
          </div>

          <div>
            <p className="text-sm font-bold text-ink">
              Filtros de búsqueda
            </p>

            <p className="text-xs text-muted">
              Selecciona el período y la sucursal
            </p>
          </div>

        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* Fecha inicio */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Fecha inicio
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <IconCalendar />
              </span>

              <input
                type="date"
                className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 pl-10 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                value={fechaInicio}
                max={fechaFin || undefined}
                onFocus={(e) => e.target.showPicker?.()}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
          </div>

          {/* Fecha fin */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Fecha fin
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <IconCalendar />
              </span>

              <input
                type="date"
                className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 pl-10 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                value={fechaFin}
                min={fechaInicio || undefined}
                onFocus={(e) => e.target.showPicker?.()}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>

          {/* Sucursal */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Sucursal
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted">
                <IconBuilding />
              </span>

              <select
                className="h-11 w-full appearance-none rounded-xl border border-line bg-surface-2 px-3 pl-10 pr-10 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                value={idSucursal}
                disabled={loadingSucursales}
                onChange={(e) => setIdSucursal(e.target.value)}
              >
                <option value="">
                  {loadingSucursales
                    ? "Cargando sucursales..."
                    : "Seleccionar sucursal"}
                </option>

                {sucursales?.map((s) => (
                  <option
                    key={s.idSucursal}
                    value={s.idSucursal}
                  >
                    {s.nombreSucursal}
                    {s.municipioSucursal
                      ? ` — ${s.municipioSucursal}`
                      : ""}
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                <IconChevron />
              </span>
            </div>
          </div>

          {/* Consultar */}
          <div className="flex items-end">
            <button
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white shadow-brand transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={ejecutarConsulta}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Consultando...
                </>
              ) : (
                <>
                  <IconSearch />
                  Consultar
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 dark:border-danger-900/50 dark:bg-danger-900/20 dark:text-danger-300">
          <div className="mt-0.5 shrink-0">
            <IconAlert />
          </div>

          <p>
            {error}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-line bg-surface shadow-card">
          <Spinner />
        </div>
      )}

      {/* Resultados */}
      {!loading && hasSearched && (
        <>
          {gastos.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <SummaryCard
                  icon={IconMoney}
                  label="Total gastos"
                  value={formatQ(totalGastos)}
                  tone="brand"
                />

                <SummaryCard
                  icon={IconDoc}
                  label="Registros"
                  value={gastos.length}
                  tone="neutral"
                />

                <SummaryCard
                  icon={IconBuilding}
                  label="Sucursal"
                  value={sucursalNombre}
                  tone="accent"
                />

                <SummaryCard
                  icon={IconCalendar}
                  label="Período"
                  value={formatPeriodo(fechaInicio, fechaFin)}
                  tone="neutral"
                />

              </div>

              {/* Título resultados */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-ink">
                    Detalle de gastos
                  </h2>

                  <p className="text-sm text-muted">
                    {gastos.length}{" "}
                    {gastos.length === 1
                      ? "registro encontrado"
                      : "registros encontrados"}
                  </p>
                </div>

                <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                  Total: {formatQ(totalGastos)}
                </p>
              </div>
            </>
          )}

          {/* Sin resultados */}
          {gastos.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface shadow-card">
              <EmptyState />
            </div>
          ) : (
            <>
              {/* Mobile / Tablet */}
              <div className="flex flex-col gap-3 lg:hidden">
                {gastos.map((g, i) => (
                  <GastoCard
                    key={i}
                    gasto={g}
                    index={i}
                  />
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card lg:block">

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] border-collapse">

                    <thead className="bg-surface-2">
                      <tr>
                        <th className="w-16 px-4 py-3 text-center text-2xs font-bold uppercase tracking-wide text-muted">
                          #
                        </th>

                        <th className="px-4 py-3 text-left text-2xs font-bold uppercase tracking-wide text-muted">
                          Descripción
                        </th>

                        <th className="w-40 px-4 py-3 text-left text-2xs font-bold uppercase tracking-wide text-muted">
                          Fecha
                        </th>

                        <th className="w-40 px-4 py-3 text-right text-2xs font-bold uppercase tracking-wide text-muted">
                          Monto
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {gastos.map((g, i) => (
                        <GastoRow
                          key={i}
                          gasto={g}
                          index={i}
                        />
                      ))}
                    </tbody>

                    <tfoot>
                      <tr className="border-t-2 border-line bg-surface-2">
                        <td
                          colSpan={3}
                          className="px-4 py-4 text-right text-sm font-bold text-ink"
                        >
                          Total
                        </td>

                        <td className="px-4 py-4 text-right text-base font-bold text-brand-600 dark:text-brand-400">
                          {formatQ(totalGastos)}
                        </td>
                      </tr>
                    </tfoot>

                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

    </div>
  );
};

export default Gastos;