import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { consultarGastosService } from "../../../services/reportes/reportes.service";
import { handleConsultar } from "./Gastos.utils";
import "./Gastos.styles.css";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconMoney = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconArrowLeft = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const IconCalendar = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconBuilding = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const IconSearch = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconChevron = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const IconAlert = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconDoc = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconPDF = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatQ = (val) =>
  `Q ${parseFloat(val || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;

// ─── Period formatter — muestra las fechas en dos líneas para que quepan en móvil
const formatPeriodo = (inicio, fin) => `${inicio}\n${fin}`;

// ─── PDF Generator ────────────────────────────────────────────────────────────
const generarPDF = async ({ gastos, totalGastos, sucursalNombre, fechaInicio, fechaFin }) => {
  // Importación dinámica — jsPDF solo se carga cuando se necesita
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ── Paleta ──
  const GREEN      = [16, 185, 129];   // #10b981
  const GREEN_DARK = [5, 150, 105];    // #059669
  const GREEN_LIGHT= [236, 253, 245];  // #ecfdf5
  const SLATE_800  = [30, 41, 59];
  const SLATE_500  = [100, 116, 139];
  const SLATE_200  = [226, 232, 240];
  const WHITE      = [255, 255, 255];

  // ── Encabezado con fondo degradado ──
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, pageW, 38, "F");

  // Acento decorativo esquina
  doc.setFillColor(...GREEN);
  doc.circle(pageW - 10, -5, 28, "F");
  doc.setFillColor(255, 255, 255, 0.08);
  doc.circle(pageW - 22, 42, 18, "F");

  // Ícono cuadrado
  doc.setFillColor(...WHITE);
  doc.roundedRect(12, 8, 22, 22, 3, 3, "F");
  doc.setFontSize(14);
  doc.text("Q", 23, 23, { align: "center" });

  // Título
  doc.setTextColor(...WHITE);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Gastos", 40, 18);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(209, 250, 229);   // emerald-100
  doc.text("Consulta y análisis de gastos por sucursal", 40, 25);

  // Fecha de generación (esquina derecha)
  const ahora = new Date().toLocaleDateString("es-GT", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
  doc.setFontSize(7.5);
  doc.setTextColor(167, 243, 208);   // emerald-200
  doc.text(`Generado: ${ahora}`, pageW - 12, 33, { align: "right" });

  // ── Tarjetas de resumen ──
  let y = 46;
  const cards = [
    { label: "Sucursal",     value: sucursalNombre,       icon: "🏢" },
    { label: "Período",      value: `${fechaInicio}  →  ${fechaFin}`, icon: "📅" },
    { label: "Total gastos", value: formatQ(totalGastos), icon: "💰", highlight: true },
    { label: "Registros",    value: `${gastos.length} gastos`,        icon: "📋" },
  ];

  const cardW = (pageW - 28) / 2;
  cards.forEach((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx  = 14 + col * (cardW + 4);
    const cy  = y  + row * 20;

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
    doc.setTextColor(card.highlight ? GREEN_DARK[0] : SLATE_800[0], card.highlight ? GREEN_DARK[1] : SLATE_800[1], card.highlight ? GREEN_DARK[2] : SLATE_800[2]);
    doc.text(String(card.value), cx + 5, cy + 13);
  });

  y += 46;

  // ── Línea divisoria ──
  doc.setDrawColor(...SLATE_200);
  doc.setLineWidth(0.3);
  doc.line(14, y, pageW - 14, y);
  y += 6;

  // ── Título de tabla ──
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_800);
  doc.text("Detalle de Gastos", 14, y);
  y += 5;

  // ── Tabla con autoTable ──
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
    margin: { left: 14, right: 14 },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
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
      0: { cellWidth: 10, halign: "center", textColor: SLATE_500 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 28, halign: "center" },
      3: { cellWidth: 30, halign: "right", fontStyle: "bold" },
    },
    // Pie de página en cada página
    didDrawPage: (data) => {
      const pg    = doc.internal.getCurrentPageInfo().pageNumber;
      const total = doc.internal.getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE_500);
      doc.text(`Página ${pg} de ${total}`, pageW / 2, pageH - 8, { align: "center" });
      doc.setDrawColor(...SLATE_200);
      doc.setLineWidth(0.2);
      doc.line(14, pageH - 12, pageW - 14, pageH - 12);
      doc.setTextColor(...SLATE_500);
      doc.text("Sistema de Administración", 14, pageH - 8);
      doc.text("Reporte de Gastos", pageW - 14, pageH - 8, { align: "right" });
    },
  });

  // ── Descargar ──
  const filename = `gastos_${sucursalNombre.replace(/\s+/g, "_")}_${fechaInicio}_${fechaFin}.pdf`;
  doc.save(filename);
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="spinner-wrap">
    <div className="spinner">
      <div className="spinner__track" />
      <div className="spinner__outer" />
      <div className="spinner__inner" />
    </div>
    <p className="spinner__text">Consultando gastos...</p>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-state__icon"><IconDoc /></div>
    <p className="empty-state__title">Sin resultados</p>
    <p className="empty-state__sub">No se encontraron gastos para el período y sucursal seleccionados.</p>
  </div>
);

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ emoji, label, value, color, wide }) => (
  <div className={`summary-card summary-card--${color}${wide ? " summary-card--wide" : ""}`}>
    <div className="summary-card__emoji">{emoji}</div>
    <div style={{ minWidth: 0 }}>
      <div className="summary-card__label">{label}</div>
      <div className="summary-card__value">{value}</div>
    </div>
  </div>
);

// ─── Gasto Card (móvil / tablet) ──────────────────────────────────────────────
const GastoCard = ({ gasto, index }) => (
  <div className="gasto-card" style={{ animationDelay: `${index * 55}ms` }}>
    <div className="gasto-card__top">
      <div style={{ minWidth: 0 }}>
        <p className="gasto-card__name">{gasto.detalleGasto}</p>
        <p className="gasto-card__date">{gasto.fechaIngreso}</p>
      </div>
    </div>
    <div className="gasto-card__bottom">
      <span className="gasto-card__cat">Gasto #{index + 1}</span>
      <span className="gasto-card__amount">{formatQ(gasto.montoGasto)}</span>
    </div>
  </div>
);

// ─── Gasto Row (desktop) ──────────────────────────────────────────────────────
const GastoRow = ({ gasto, index }) => (
  <tr>
    <td className="id">{index + 1}</td>
    <td className="name">{gasto.detalleGasto}</td>
    <td>{gasto.fechaIngreso}</td>
    <td className="amt right">{formatQ(gasto.montoGasto)}</td>
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Gastos = () => {
  const navigate = useNavigate();
  const { sucursales, loadingSucursales } = useGetSucursales();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const [fechaInicio,   setFechaInicio]   = useState("");
  const [fechaFin,      setFechaFin]      = useState("");
  const [idSucursal,    setIdSucursal]    = useState("");
  const [gastos,        setGastos]        = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [hasSearched,   setHasSearched]   = useState(false);
  const [error,         setError]         = useState(null);
  const [generandoPDF,  setGenerandoPDF]  = useState(false);

  const isFormValid    = fechaInicio && fechaFin && idSucursal;
  const totalGastos    = gastos.reduce((acc, g) => acc + parseFloat(g.montoGasto || 0), 0);
  const sucursalNombre = sucursales?.find(s => s.idSucursal === Number(idSucursal))?.nombreSucursal || "";

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
      await generarPDF({ gastos, totalGastos, sucursalNombre, fechaInicio, fechaFin });
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div className="gastos-page">

      {/* ── Header ── */}
      <header className="gastos-header">
        <div className="gastos-header__inner">

          <button
            className="btn-back"
            onClick={() => navigate("/reportes")}
            aria-label="Volver a reportes"
          >
            <IconArrowLeft />
          </button>

          <div className="gastos-header__icon"><IconMoney /></div>

          <div className="gastos-header__text">
            <h1 className="gastos-header__title">Gastos</h1>
            <p className="gastos-header__subtitle">Consulta y análisis de gastos por sucursal</p>
          </div>

          {/* Botón PDF — visible solo cuando hay resultados */}
          {gastos.length > 0 && (
            <button
              className={`btn-pdf ${generandoPDF ? "btn-pdf--loading" : ""}`}
              onClick={handleDescargarPDF}
              disabled={generandoPDF}
              aria-label="Descargar PDF"
            >
              {generandoPDF ? (
                <><div className="btn-pdf__spinner" /> <span className="btn-pdf__label">Generando...</span></>
              ) : (
                <><IconPDF /> <span className="btn-pdf__label">Descargar PDF</span></>
              )}
            </button>
          )}

        </div>
      </header>

      <main className="gastos-content">

        {/* ── Filtros ── */}
        <div className="card filter-card">
          <p className="filter-card__label">Filtros de búsqueda</p>

          <div className="filter-grid">

            <div className="field">
              <label className="field__label">Fecha inicio</label>
              <div className="field__wrap">
                <span className="field__icon"><IconCalendar /></span>
                <input
                  type="date"
                  className="field__input"
                  value={fechaInicio}
                  max={fechaFin || undefined}
                  onChange={e => setFechaInicio(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label">Fecha fin</label>
              <div className="field__wrap">
                <span className="field__icon"><IconCalendar /></span>
                <input
                  type="date"
                  className="field__input"
                  value={fechaFin}
                  min={fechaInicio || undefined}
                  onChange={e => setFechaFin(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label">Sucursal</label>
              <div className="field__wrap">
                <span className="field__icon"><IconBuilding /></span>
                <select
                  className="field__select"
                  value={idSucursal}
                  disabled={loadingSucursales}
                  onChange={e => setIdSucursal(e.target.value)}
                >
                  <option value="">
                    {loadingSucursales ? "Cargando sucursales..." : "Seleccionar sucursal"}
                  </option>
                  {sucursales?.map(s => (
                    <option key={s.idSucursal} value={s.idSucursal}>
                      {s.nombreSucursal}{s.municipioSucursal ? ` — ${s.municipioSucursal}` : ""}
                    </option>
                  ))}
                </select>
                <span className="field__chevron"><IconChevron /></span>
              </div>
            </div>

            <div className="field" style={{ justifyContent: "flex-end" }}>
              <label className="field__label" style={{ visibility: "hidden" }}>Buscar</label>
              <button
                className={`btn-consult ${isFormValid && !loading ? "btn-consult--active" : "btn-consult--disabled"}`}
                onClick={handleConsultar.bind(null, isFormValid, loading, setLoading, setError, setHasSearched, setGastos, consultarGastosService, fechaInicio, fechaFin, idSucursal)}
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <><div className="btn-consult__spinner" /> Consultando...</>
                ) : (
                  <><IconSearch /> Consultar</>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="error-banner">
            <IconAlert />
            <p>{error}</p>
          </div>
        )}

        {/* ── Spinner ── */}
        {loading && (
          <div className="card">
            <Spinner />
          </div>
        )}

        {/* ── Resultados ── */}
        {!loading && hasSearched && (
          <>
            {gastos.length > 0 && (
              <div className="summary-grid">
                <SummaryCard emoji="💰" label="Total gastos" value={formatQ(totalGastos)}           color="green" />
                <SummaryCard emoji="📋" label="Registros"    value={gastos.length}                  color="dark" />
                <SummaryCard emoji="🏢" label="Sucursal"     value={sucursalNombre}                 color="sky"    wide />
                <SummaryCard emoji="📅" label="Período"      value={formatPeriodo(fechaInicio, fechaFin)} color="violet" wide />
              </div>
            )}

            {gastos.length === 0 ? (
              <div className="card"><EmptyState /></div>
            ) : (
              <>
                <div className="cards-list">
                  {gastos.map((g, i) => (
                    <GastoCard key={i} gasto={g} index={i} />
                  ))}
                </div>

                <div className="table-wrap">
                  <div className="table-scroll">
                    <table className="gastos-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Descripción</th>
                          <th>Fecha</th>
                          <th className="right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gastos.map((g, i) => (
                          <GastoRow key={i} gasto={g} index={i} />
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3}>Total</td>
                          <td className="right total-amt">{formatQ(totalGastos)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

      </main>
    </div>
  );
};

export default Gastos;