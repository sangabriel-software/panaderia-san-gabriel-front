import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiBox,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiAlertCircle,
  FiFileText,
  FiDownload,
  FiX,
  FiTag,
  FiRefreshCw,
  FiHome,
} from "react-icons/fi";

import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import {
  consultarProductosVendidosService,
} from "../../../services/reportes/reportes.service";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTERS
// ─────────────────────────────────────────────────────────────────────────────

const formatQ = (val) =>
  `Q ${parseFloat(val || 0).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatNum = (val) =>
  parseInt(val || 0).toLocaleString("es-GT");

const formatPeriodo = (inicio, fin) => `${inicio} → ${fin}`;

// ─────────────────────────────────────────────────────────────────────────────
// BADGE TURNO
// ─────────────────────────────────────────────────────────────────────────────

const BadgeTurno = ({ turno }) => {
  const isAM = turno === "AM";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-2xs font-bold ${
        isAM
          ? "border-accent-200 bg-accent-50 text-accent-700 dark:border-accent-900/50 dark:bg-accent-900/20 dark:text-accent-300"
          : "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-300"
      }`}
    >
      {turno}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SEARCHABLE PRODUCT SELECT
// ─────────────────────────────────────────────────────────────────────────────

const ProductoSelect = ({
  productos,
  loading,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const selected = productos?.find(
    (p) => p.idProducto === Number(value)
  );

  const filtered = (productos || []).filter((p) =>
    p.nombreProducto
      ?.toLowerCase()
      .includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target)
      ) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handler);

    return () =>
      document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = (producto) => {
    onChange(producto.idProducto);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
    >
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          if (!loading) {
            setOpen((prev) => !prev);
          }
        }}
        className={`flex h-11 w-full items-center gap-3 rounded-xl border px-3 text-left text-sm outline-none transition ${
          open
            ? "border-brand-400 ring-2 ring-brand-500/20"
            : "border-line"
        } ${
          value
            ? "bg-surface text-ink"
            : "bg-surface-2 text-muted"
        } ${
          loading
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer"
        }`}
      >
        <FiTag className="h-4 w-4 shrink-0 text-muted" />

        <span className="min-w-0 flex-1 truncate">
          {loading
            ? "Cargando productos..."
            : selected
            ? selected.nombreProducto
            : "Seleccionar producto"}
        </span>

        {value && !loading ? (
          <span
            role="button"
            tabIndex={-1}
            onClick={handleClear}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <FiX className="h-4 w-4" />
          </span>
        ) : (
          <FiChevronDown
            className={`h-4 w-4 shrink-0 text-muted transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
          <div className="border-b border-line p-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar producto..."
                className="h-10 w-full rounded-xl border border-line bg-surface-2 pl-9 pr-9 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-ink"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <FiSearch className="mx-auto mb-2 h-5 w-5 text-muted" />
                <p className="text-sm font-medium text-ink">
                  Sin resultados
                </p>
                <p className="mt-1 text-xs text-muted">
                  No encontramos productos con "{query}"
                </p>
              </div>
            ) : (
              filtered.map((producto) => {
                const active =
                  producto.idProducto === Number(value);

                return (
                  <button
                    key={producto.idProducto}
                    type="button"
                    onClick={() => handleSelect(producto)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                        : "text-ink"
                    }`}
                  >
                    <span className="min-w-0 truncate">
                      {producto.nombreProducto}
                    </span>

                    {active && (
                      <span className="shrink-0 font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-line bg-surface-2 px-3 py-2 text-2xs font-medium text-muted">
            {filtered.length} producto
            {filtered.length !== 1 ? "s" : ""}
            {query ? " encontrado" + (filtered.length !== 1 ? "s" : "") : " en total"}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="flex flex-col items-center justify-center px-4 py-14">
    <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 dark:border-brand-900/50 dark:border-t-brand-400" />

    <p className="mt-4 text-sm font-medium text-muted">
      Consultando productos vendidos...
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-muted">
      <FiFileText className="h-6 w-6" />
    </div>

    <p className="mt-4 text-base font-bold text-ink">
      Sin resultados
    </p>

    <p className="mt-1 max-w-sm text-sm text-muted">
      No se encontraron ventas para los filtros seleccionados.
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY CARD
// ─────────────────────────────────────────────────────────────────────────────

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  accent = "brand",
}) => {
  const accentClasses = {
    brand:
      "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400",
    accent:
      "bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400",
    muted:
      "bg-surface-2 text-muted",
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          accentClasses[accent] || accentClasses.brand
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-3 text-2xs font-bold uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-1 truncate text-lg font-bold text-ink">
        {value}
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF
// ─────────────────────────────────────────────────────────────────────────────

const generarPDF = async ({
  reporte,
  totalUnidades,
  totalVentas,
  productoNombre,
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

  const BLUE = [59, 130, 246];
  const BLUE_DARK = [29, 78, 216];
  const BLUE_LIGHT = [239, 246, 255];
  const SLATE_800 = [30, 41, 59];
  const SLATE_500 = [100, 116, 139];
  const SLATE_200 = [226, 232, 240];
  const WHITE = [255, 255, 255];

  doc.setFillColor(...BLUE_DARK);
  doc.rect(0, 0, pageW, 38, "F");

  doc.setFillColor(...BLUE);
  doc.circle(pageW - 10, -5, 28, "F");

  doc.setFillColor(...WHITE);
  doc.roundedRect(12, 8, 22, 22, 3, 3, "F");

  doc.setTextColor(...BLUE_DARK);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("PV", 23, 22, { align: "center" });

  doc.setTextColor(...WHITE);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Productos Vendidos", 40, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(219, 234, 254);
  doc.text(
    "Detalle de ventas por producto, turno y período",
    40,
    26
  );

  doc.setFontSize(7.5);
  doc.setTextColor(191, 219, 254);
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-GT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    pageW - 12,
    33,
    { align: "right" }
  );

  let y = 46;

  const cards = [
    {
      label: "Producto",
      value: productoNombre,
    },
    {
      label: "Sucursal",
      value: sucursalNombre,
    },
    {
      label: "Total unidades",
      value: formatNum(totalUnidades),
      highlight: true,
    },
    {
      label: "Total ventas",
      value: formatQ(totalVentas),
      highlight2: true,
    },
    {
      label: "Período",
      value: `${fechaInicio} → ${fechaFin}`,
    },
    {
      label: "Registros",
      value: `${reporte.length} registros`,
    },
  ];

  const cardW = (pageW - 28) / 2;

  cards.forEach((card, i) => {
    const cx = 14 + (i % 2) * (cardW + 4);
    const cy = y + Math.floor(i / 2) * 20;

    if (card.highlight) {
      doc.setFillColor(...BLUE_LIGHT);
      doc.roundedRect(cx, cy, cardW, 16, 2, 2, "F");

      doc.setDrawColor(...BLUE);
      doc.setLineWidth(0.4);
      doc.roundedRect(cx, cy, cardW, 16, 2, 2, "S");

      doc.setTextColor(...BLUE_DARK);
    } else if (card.highlight2) {
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(cx, cy, cardW, 16, 2, 2, "F");

      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.4);
      doc.roundedRect(cx, cy, cardW, 16, 2, 2, "S");

      doc.setTextColor(21, 128, 61);
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
    doc.text(String(card.value), cx + 5, cy + 13);
  });

  y += 68;

  doc.setDrawColor(...SLATE_200);
  doc.setLineWidth(0.3);
  doc.line(14, y, pageW - 14, y);

  y += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_800);
  doc.text("Detalle de Ventas por Turno", 14, y);

  y += 5;

  autoTable(doc, {
    startY: y,

    head: [[
      "#",
      "Producto",
      "Turno",
      "Fecha",
      "Unidades",
      "P. Unit.",
      "Total",
    ]],

    body: reporte.map((r) => [
      r.correlativo,
      r.nombreProducto,
      r.ventaTurno,
      r.fechaVenta,
      formatNum(r.unidadesVendidas),
      formatQ(r.precioUnitario),
      formatQ(r.totalEnQuetzales),
    ]),

    foot: [[
      "",
      "",
      "",
      "TOTAL",
      formatNum(totalUnidades),
      "",
      formatQ(totalVentas),
    ]],

    margin: {
      left: 14,
      right: 14,
    },

    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: {
        top: 3,
        bottom: 3,
        left: 3,
        right: 3,
      },
      textColor: SLATE_800,
      lineColor: SLATE_200,
      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: BLUE_DARK,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 8,
    },

    footStyles: {
      fillColor: BLUE_LIGHT,
      textColor: BLUE_DARK,
      fontStyle: "bold",
      fontSize: 9,
    },

    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },

    columnStyles: {
      0: {
        cellWidth: 20,
        halign: "center",
        textColor: SLATE_500,
      },
      1: {
        cellWidth: "auto",
      },
      2: {
        cellWidth: 14,
        halign: "center",
      },
      3: {
        cellWidth: 24,
        halign: "center",
      },
      4: {
        cellWidth: 20,
        halign: "right",
      },
      5: {
        cellWidth: 18,
        halign: "right",
      },
      6: {
        cellWidth: 22,
        halign: "right",
        fontStyle: "bold",
      },
    },

    didDrawPage: () => {
      const pg =
        doc.internal.getCurrentPageInfo().pageNumber;

      const total =
        doc.internal.getNumberOfPages();

      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE_500);

      doc.text(
        `Página ${pg} de ${total}`,
        pageW / 2,
        pageH - 8,
        { align: "center" }
      );

      doc.setDrawColor(...SLATE_200);
      doc.setLineWidth(0.2);

      doc.line(
        14,
        pageH - 12,
        pageW - 14,
        pageH - 12
      );

      doc.text(
        "Sistema de Administración",
        14,
        pageH - 8
      );

      doc.text(
        "Reporte de Productos Vendidos",
        pageW - 14,
        pageH - 8,
        { align: "right" }
      );
    },
  });

  doc.save(
    `productos_vendidos_${productoNombre.replace(
      /\s+/g,
      "_"
    )}_${fechaInicio}_${fechaFin}.pdf`
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXCEL
// ─────────────────────────────────────────────────────────────────────────────

const generarXLS = async ({
  reporte,
  totalUnidades,
  totalVentas,
  productoNombre,
  sucursalNombre,
  fechaInicio,
  fechaFin,
}) => {
  const XLSX = await import("xlsx");

  const wb = XLSX.utils.book_new();

  const headerInfo = [
    ["REPORTE DE PRODUCTOS VENDIDOS"],
    [],
    [
      "Producto:",
      productoNombre,
      "Sucursal:",
      sucursalNombre,
    ],
    [
      "Fecha inicio:",
      fechaInicio,
      "Fecha fin:",
      fechaFin,
    ],
    [
      "Total unidades:",
      totalUnidades,
      "Total ventas:",
      parseFloat(totalVentas.toFixed(2)),
    ],
    [],
    [
      "#",
      "Producto",
      "Turno",
      "Fecha",
      "Unidades vendidas",
      "Precio unitario",
      "Total (Q)",
    ],
  ];

  const dataRows = reporte.map((r) => [
    r.correlativo,
    r.nombreProducto,
    r.ventaTurno,
    r.fechaVenta,
    parseInt(r.unidadesVendidas || 0),
    parseFloat(
      parseFloat(r.precioUnitario || 0).toFixed(4)
    ),
    parseFloat(
      parseFloat(r.totalEnQuetzales || 0).toFixed(2)
    ),
  ]);

  const totalRow = [
    "",
    "",
    "",
    "TOTAL",
    totalUnidades,
    "",
    parseFloat(totalVentas.toFixed(2)),
  ];

  const wsData = [
    ...headerInfo,
    ...dataRows,
    [],
    totalRow,
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws["!cols"] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 8 },
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
  ];

  ws["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 6 },
    },
  ];

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Detalle"
  );

  const porFecha = {};

  reporte.forEach((r) => {
    if (!porFecha[r.fechaVenta]) {
      porFecha[r.fechaVenta] = {
        unidades: 0,
        total: 0,
        am: 0,
        pm: 0,
      };
    }

    porFecha[r.fechaVenta].unidades += parseInt(
      r.unidadesVendidas || 0
    );

    porFecha[r.fechaVenta].total += parseFloat(
      r.totalEnQuetzales || 0
    );

    if (r.ventaTurno === "AM") {
      porFecha[r.fechaVenta].am += parseInt(
        r.unidadesVendidas || 0
      );
    } else {
      porFecha[r.fechaVenta].pm += parseInt(
        r.unidadesVendidas || 0
      );
    }
  });

  const resumenHeader = [[
    "Fecha",
    "Unidades AM",
    "Unidades PM",
    "Total unidades",
    "Total (Q)",
  ]];

  const resumenRows = Object.entries(porFecha).map(
    ([fecha, d]) => [
      fecha,
      d.am,
      d.pm,
      d.unidades,
      parseFloat(d.total.toFixed(2)),
    ]
  );

  const resumenTotal = [
    "TOTAL",
    "",
    "",
    totalUnidades,
    parseFloat(totalVentas.toFixed(2)),
  ];

  const ws2 = XLSX.utils.aoa_to_sheet([
    ...resumenHeader,
    ...resumenRows,
    [],
    resumenTotal,
  ]);

  ws2["!cols"] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
  ];

  XLSX.utils.book_append_sheet(
    wb,
    ws2,
    "Resumen por fecha"
  );

  XLSX.writeFile(
    wb,
    `productos_vendidos_${productoNombre.replace(
      /\s+/g,
      "_"
    )}_${fechaInicio}_${fechaFin}.xlsx`
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL TO TOP
// ─────────────────────────────────────────────────────────────────────────────

const ScrollToTopBtn = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      aria-label="Volver al inicio"
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-muted shadow-lg transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20"
    >
      <FiChevronUp className="h-5 w-5" />
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const ProductosVendidos = () => {
  const navigate = useNavigate();

  const {
    sucursales,
    loadingSucursales,
  } = useGetSucursales();

  const {
    productos,
    loadigProducts,
  } = useGetProductosYPrecios();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  const [fechaInicio, setFechaInicio] =
    useState("");

  const [fechaFin, setFechaFin] =
    useState("");

  const [idSucursal, setIdSucursal] =
    useState("");

  const [idProducto, setIdProducto] =
    useState("");

  const [reporte, setReporte] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [hasSearched, setHasSearched] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [generandoPDF, setGenerandoPDF] =
    useState(false);

  const [generandoXLS, setGenerandoXLS] =
    useState(false);

  const isFormValid =
    fechaInicio &&
    fechaFin &&
    idSucursal &&
    idProducto;

  const totalUnidades = reporte.reduce(
    (acc, r) =>
      acc + parseInt(r.unidadesVendidas || 0),
    0
  );

  const totalVentas = reporte.reduce(
    (acc, r) =>
      acc + parseFloat(r.totalEnQuetzales || 0),
    0
  );

  const sucursalNombre =
    sucursales?.find(
      (s) =>
        s.idSucursal === Number(idSucursal)
    )?.nombreSucursal || "";

  const productoNombre =
    productos?.find(
      (p) =>
        p.idProducto === Number(idProducto)
    )?.nombreProducto || "";

  useEffect(() => {
    if (hasSearched) {
      setHasSearched(false);
      setReporte([]);
      setError(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fechaInicio,
    fechaFin,
    idSucursal,
    idProducto,
  ]);

  const handleConsultar = async () => {
    if (!isFormValid || loading) return;

    setLoading(true);
    setError(null);
    setHasSearched(false);

    try {
      const result =
        await consultarProductosVendidosService(
          idProducto,
          idSucursal,
          fechaInicio,
          fechaFin
        );

      setReporte(
        Array.isArray(result)
          ? result
          : result?.reporte || []
      );

      setHasSearched(true);
    } catch {
      setError(
        "No se pudo obtener la información. Intente nuevamente."
      );

      setReporte([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = async () => {
    if (!reporte.length) return;

    setGenerandoPDF(true);

    try {
      await generarPDF({
        reporte,
        totalUnidades,
        totalVentas,
        productoNombre,
        sucursalNombre,
        fechaInicio,
        fechaFin,
      });
    } finally {
      setGenerandoPDF(false);
    }
  };

  const handleDescargarXLS = async () => {
    if (!reporte.length) return;

    setGenerandoXLS(true);

    try {
      await generarXLS({
        reporte,
        totalUnidades,
        totalVentas,
        productoNombre,
        sucursalNombre,
        fechaInicio,
        fechaFin,
      });
    } finally {
      setGenerandoXLS(false);
    }
  };

  const handleReset = () => {
    setFechaInicio("");
    setFechaFin("");
    setIdSucursal("");
    setIdProducto("");
    setReporte([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ───────────────── HEADER ───────────────── */}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex min-w-0 items-center gap-3">

          <button
            type="button"
            onClick={() => navigate("/reportes")}
            aria-label="Volver"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <FiBox className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">
              Productos Vendidos
            </h1>

            <p className="mt-0.5 truncate text-sm text-muted">
              Detalle de ventas por producto, turno y período
            </p>
          </div>
        </div>

        {/* EXPORTACIONES */}

        {reporte.length > 0 && (
          <div className="flex shrink-0 gap-2">

            <button
              type="button"
              onClick={handleDescargarXLS}
              disabled={generandoXLS}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-ink transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
            >
              {generandoXLS ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted/30 border-t-muted" />
                  <span className="hidden sm:inline">
                    Generando...
                  </span>
                </>
              ) : (
                <>
                  <FiDownload className="h-4 w-4" />
                  <span>Excel</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDescargarPDF}
              disabled={generandoPDF}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-3 text-sm font-semibold text-danger-700 transition hover:bg-danger-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-danger-900/50 dark:bg-danger-900/20 dark:text-danger-300 dark:hover:bg-danger-900/30 sm:px-4"
            >
              {generandoPDF ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-danger-300/30 border-t-danger-600 dark:border-danger-700/30 dark:border-t-danger-300" />
                  <span className="hidden sm:inline">
                    Generando...
                  </span>
                </>
              ) : (
                <>
                  <FiDownload className="h-4 w-4" />
                  <span>PDF</span>
                </>
              )}
            </button>
          </div>
        )}
      </header>

      {/* ───────────────── FILTROS ───────────────── */}

      <section className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">

        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <FiSearch className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-ink">
              Filtros de búsqueda
            </h2>

            <p className="text-xs text-muted">
              Selecciona el período y producto que deseas consultar
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

          {/* FECHA INICIO */}

          <div>
            <label className="mb-1.5 block text-2xs font-bold uppercase tracking-wide text-muted">
              Fecha inicio
            </label>

            <div className="relative">
              <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

              <input
                type="date"
                value={fechaInicio}
                max={fechaFin || undefined}
                onFocus={(e) =>
                  e.target.showPicker?.()
                }
                onChange={(e) =>
                  setFechaInicio(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-line bg-surface-2 pl-10 pr-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* FECHA FIN */}

          <div>
            <label className="mb-1.5 block text-2xs font-bold uppercase tracking-wide text-muted">
              Fecha fin
            </label>

            <div className="relative">
              <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

              <input
                type="date"
                value={fechaFin}
                min={fechaInicio || undefined}
                onFocus={(e) =>
                  e.target.showPicker?.()
                }
                onChange={(e) =>
                  setFechaFin(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-line bg-surface-2 pl-10 pr-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* SUCURSAL */}

          <div>
            <label className="mb-1.5 block text-2xs font-bold uppercase tracking-wide text-muted">
              Sucursal
            </label>

            <div className="relative">
              <FiHome className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted" />

              <select
                value={idSucursal}
                disabled={loadingSucursales}
                onChange={(e) =>
                  setIdSucursal(e.target.value)
                }
                className="h-11 w-full appearance-none rounded-xl border border-line bg-surface-2 pl-10 pr-9 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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

              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
          </div>

          {/* PRODUCTO */}

          <div>
            <label className="mb-1.5 block text-2xs font-bold uppercase tracking-wide text-muted">
              Producto
            </label>

            <ProductoSelect
              productos={productos}
              loading={loadigProducts}
              value={idProducto}
              onChange={setIdProducto}
            />
          </div>

          {/* BOTONES */}

          <div className="flex items-end gap-2">

            <button
              type="button"
              onClick={handleConsultar}
              disabled={!isFormValid || loading}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <FiSearch className="h-4 w-4" />
                  <span>Consultar</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              title="Limpiar filtros"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <FiRefreshCw className="h-4 w-4" />
            </button>

          </div>
        </div>
      </section>

      {/* ───────────────── ERROR ───────────────── */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 dark:border-danger-900/50 dark:bg-danger-900/20 dark:text-danger-300">
          <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <p>{error}</p>
        </div>
      )}

      {/* ───────────────── LOADING ───────────────── */}

      {loading && (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <Spinner />
        </div>
      )}

      {/* ───────────────── RESULTADOS ───────────────── */}

      {!loading && hasSearched && (
        <>
          {reporte.length > 0 && (
            <>
              {/* RESUMEN */}

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-ink">
                      Resumen
                    </h2>

                    <p className="text-xs text-muted">
                      Información general de la consulta
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  <SummaryCard
                    icon={FiBox}
                    label="Total unidades"
                    value={formatNum(totalUnidades)}
                    accent="brand"
                  />

                  <SummaryCard
                    icon={FiDownload}
                    label="Total ventas"
                    value={formatQ(totalVentas)}
                    accent="accent"
                  />

                  <SummaryCard
                    icon={FiFileText}
                    label="Registros"
                    value={reporte.length}
                    accent="muted"
                  />

                  <SummaryCard
                    icon={FiTag}
                    label="Producto"
                    value={productoNombre}
                    accent="brand"
                  />

                  <SummaryCard
                    icon={FiHome}
                    label="Sucursal"
                    value={sucursalNombre}
                    accent="muted"
                  />

                  <SummaryCard
                    icon={FiCalendar}
                    label="Período"
                    value={formatPeriodo(
                      fechaInicio,
                      fechaFin
                    )}
                    accent="brand"
                  />
                </div>
              </div>

              {/* TABLA DESKTOP */}

              <section className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:block">

                <div className="flex items-center justify-between border-b border-line px-4 py-4">
                  <div>
                    <h2 className="text-base font-bold text-ink">
                      Detalle de productos vendidos
                    </h2>

                    <p className="mt-0.5 text-xs text-muted">
                      {reporte.length} registros encontrados
                    </p>
                  </div>

                  <span className="rounded-full bg-brand-50 px-3 py-1 text-2xs font-bold text-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
                    {formatNum(totalUnidades)} unidades
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">

                    <thead className="bg-surface-2">
                      <tr>
                        <th className="px-4 py-3 text-2xs font-bold uppercase tracking-wide text-muted">
                          #
                        </th>

                        <th className="px-4 py-3 text-2xs font-bold uppercase tracking-wide text-muted">
                          Producto
                        </th>

                        <th className="px-4 py-3 text-2xs font-bold uppercase tracking-wide text-muted">
                          Turno
                        </th>

                        <th className="px-4 py-3 text-2xs font-bold uppercase tracking-wide text-muted">
                          Fecha
                        </th>

                        <th className="px-4 py-3 text-right text-2xs font-bold uppercase tracking-wide text-muted">
                          Unidades
                        </th>

                        <th className="px-4 py-3 text-right text-2xs font-bold uppercase tracking-wide text-muted">
                          P. Unit.
                        </th>

                        <th className="px-4 py-3 text-right text-2xs font-bold uppercase tracking-wide text-muted">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {reporte.map((venta, index) => (
                        <tr
                          key={
                            venta.correlativo ??
                            index
                          }
                          className="border-t border-line text-sm"
                        >
                          <td className="px-4 py-4 align-middle font-medium text-muted">
                            {venta.correlativo}
                          </td>

                          <td className="max-w-[280px] px-4 py-4 align-middle">
                            <span className="block truncate font-semibold text-ink">
                              {venta.nombreProducto}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-middle">
                            <BadgeTurno
                              turno={venta.ventaTurno}
                            />
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 align-middle text-muted">
                            {venta.fechaVenta}
                          </td>

                          <td className="px-4 py-4 text-right align-middle font-semibold text-ink">
                            {formatNum(
                              venta.unidadesVendidas
                            )}
                          </td>

                          <td className="px-4 py-4 text-right align-middle text-muted">
                            {formatQ(
                              venta.precioUnitario
                            )}
                          </td>

                          <td className="px-4 py-4 text-right align-middle font-bold text-brand-600 dark:text-brand-400">
                            {formatQ(
                              venta.totalEnQuetzales
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr className="border-t border-line bg-surface-2">
                        <td
                          colSpan={4}
                          className="px-4 py-4 text-right text-sm font-bold text-ink"
                        >
                          Total
                        </td>

                        <td className="px-4 py-4 text-right text-sm font-bold text-ink">
                          {formatNum(
                            totalUnidades
                          )}
                        </td>

                        <td />

                        <td className="px-4 py-4 text-right text-sm font-bold text-brand-600 dark:text-brand-400">
                          {formatQ(totalVentas)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>

              {/* CARDS MOBILE */}

              <div className="space-y-3 sm:hidden">

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-ink">
                      Detalle de ventas
                    </h2>

                    <p className="text-xs text-muted">
                      {reporte.length} registros
                    </p>
                  </div>
                </div>

                {reporte.map((venta, index) => (
                  <div
                    key={
                      venta.correlativo ??
                      index
                    }
                    className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
                  >
                    <div className="p-4">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-ink">
                            {venta.nombreProducto}
                          </p>

                          <p className="mt-1 text-xs text-muted">
                            #{venta.correlativo} ·{" "}
                            {venta.fechaVenta}
                          </p>
                        </div>

                        <BadgeTurno
                          turno={venta.ventaTurno}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div className="rounded-xl bg-surface-2 p-3">
                          <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                            Unidades
                          </p>

                          <p className="mt-1 text-base font-bold text-ink">
                            {formatNum(
                              venta.unidadesVendidas
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-900/20">
                          <p className="text-2xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                            Total
                          </p>

                          <p className="mt-1 text-base font-bold text-brand-700 dark:text-brand-300">
                            {formatQ(
                              venta.totalEnQuetzales
                            )}
                          </p>
                        </div>

                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                        <span className="text-xs text-muted">
                          Precio unitario
                        </span>

                        <span className="text-sm font-semibold text-ink">
                          {formatQ(
                            venta.precioUnitario
                          )}
                        </span>
                      </div>

                    </div>
                  </div>
                ))}

                {/* TOTAL MOBILE */}

                <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4 dark:border-brand-900/50 dark:bg-brand-900/10">

                  <div className="flex items-center justify-between gap-4">

                    <div>
                      <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                        Total unidades
                      </p>

                      <p className="mt-1 text-lg font-bold text-ink">
                        {formatNum(totalUnidades)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                        Total ventas
                      </p>

                      <p className="mt-1 text-lg font-bold text-brand-600 dark:text-brand-400">
                        {formatQ(totalVentas)}
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </>
          )}

          {/* EMPTY */}

          {reporte.length === 0 && (
            <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
              <EmptyState />
            </div>
          )}
        </>
      )}

      <ScrollToTopBtn />
    </div>
  );
};

export default ProductosVendidos;