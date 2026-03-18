import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { consultarProductosVendidosService } from "../../../services/reportes/reportes.service";
import "./ProductosVendidos.styles.css"; 
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconArrowLeft = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);
const IconBox = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
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
const IconChevronUp = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
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
const IconXLS = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
  </svg>
);
const IconTag = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);
const IconX = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatQ = (val) =>
  `Q ${parseFloat(val || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
const formatNum = (val) => parseInt(val || 0).toLocaleString("es-GT");
const formatPeriodo = (inicio, fin) => `${inicio}\n${fin}`;

// ─── Badge turno ──────────────────────────────────────────────────────────────
const BadgeTurno = ({ turno }) => (
  <span className={`pv-badge pv-badge--${turno === "AM" ? "am" : "pm"}`}>{turno}</span>
);

// ─── Searchable Product Dropdown ──────────────────────────────────────────────
const ProductoSelect = ({ productos, loading, value, onChange }) => {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState("");
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  const selected = productos?.find(p => p.idProducto === Number(value));
  const filtered = (productos || []).filter(p =>
    p.nombreProducto.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false); setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleSelect = (producto) => { onChange(producto.idProducto); setOpen(false); setQuery(""); };
  const handleClear  = (e) => { e.stopPropagation(); onChange(""); setQuery(""); };

  return (
    <div className="pv-pselect" ref={wrapRef}>
      <button
        type="button"
        className={`pv-pselect__trigger ${open ? "pv-pselect__trigger--open" : ""} ${value ? "pv-pselect__trigger--filled" : ""}`}
        onClick={() => { if (!loading) setOpen(o => !o); }}
        disabled={loading}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="pv-pselect__trigger-icon"><IconTag /></span>
        <span className="pv-pselect__trigger-text">
          {loading ? "Cargando productos..." : selected ? selected.nombreProducto : "Seleccionar producto"}
        </span>
        {value && !loading ? (
          <button type="button" className="pv-pselect__clear" onClick={handleClear} tabIndex={-1} aria-label="Limpiar">
            <IconX />
          </button>
        ) : (
          <span className={`pv-pselect__chevron ${open ? "pv-pselect__chevron--up" : ""}`}>
            <IconChevron />
          </span>
        )}
      </button>

      {open && (
        <div className="pv-pselect__dropdown" role="listbox">
          <div className="pv-pselect__search-wrap">
            <span className="pv-pselect__search-icon"><IconSearch /></span>
            <input
              ref={inputRef}
              type="text"
              className="pv-pselect__search"
              placeholder="Buscar producto..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button type="button" className="pv-pselect__search-clear" onClick={() => setQuery("")}>
                <IconX />
              </button>
            )}
          </div>
          <ul className="pv-pselect__list">
            {filtered.length === 0 ? (
              <li className="pv-pselect__empty">Sin resultados para "{query}"</li>
            ) : (
              filtered.map(p => (
                <li
                  key={p.idProducto}
                  className={`pv-pselect__option ${p.idProducto === Number(value) ? "pv-pselect__option--active" : ""}`}
                  onClick={() => handleSelect(p)}
                  role="option"
                  aria-selected={p.idProducto === Number(value)}
                >
                  <span className="pv-pselect__option-name">{p.nombreProducto}</span>
                  {p.idProducto === Number(value) && (
                    <svg className="pv-pselect__option-check" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </li>
              ))
            )}
          </ul>
          <div className="pv-pselect__footer">
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
            {query ? ` encontrado${filtered.length !== 1 ? "s" : ""}` : " en total"}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Scroll To Top Button ─────────────────────────────────────────────────────
const ScrollToTopBtn = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      className={`pv-scroll-top ${visible ? "pv-scroll-top--visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver al inicio"
    >
      <IconChevronUp />
    </button>
  );
};

// ─── PDF Generator ────────────────────────────────────────────────────────────
const generarPDF = async ({ reporte, totalUnidades, totalVentas, productoNombre, sucursalNombre, fechaInicio, fechaFin }) => {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const BLUE       = [59, 130, 246];
  const BLUE_DARK  = [29, 78, 216];
  const BLUE_LIGHT = [239, 246, 255];
  const SLATE_800  = [30, 41, 59];
  const SLATE_500  = [100, 116, 139];
  const SLATE_200  = [226, 232, 240];
  const WHITE      = [255, 255, 255];

  doc.setFillColor(...BLUE_DARK); doc.rect(0, 0, pageW, 38, "F");
  doc.setFillColor(...BLUE);      doc.circle(pageW - 10, -5, 28, "F");
  doc.setFillColor(...WHITE);     doc.roundedRect(12, 8, 22, 22, 3, 3, "F");
  doc.setTextColor(...BLUE_DARK); doc.setFontSize(13); doc.setFont("helvetica", "bold");
  doc.text("PV", 23, 22, { align: "center" });
  doc.setTextColor(...WHITE); doc.setFontSize(17); doc.setFont("helvetica", "bold");
  doc.text("Reporte de Productos Vendidos", 40, 18);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(219, 234, 254);
  doc.text("Detalle de ventas por producto, turno y período", 40, 26);
  doc.setFontSize(7.5); doc.setTextColor(191, 219, 254);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-GT", { day: "2-digit", month: "long", year: "numeric" })}`, pageW - 12, 33, { align: "right" });

  let y = 46;
  const cards = [
    { label: "Producto",       value: productoNombre },
    { label: "Sucursal",       value: sucursalNombre },
    { label: "Total unidades", value: formatNum(totalUnidades), highlight: true },
    { label: "Total ventas",   value: formatQ(totalVentas),    highlight2: true },
    { label: "Período",        value: `${fechaInicio} → ${fechaFin}` },
    { label: "Registros",      value: `${reporte.length} registros` },
  ];
  const cardW = (pageW - 28) / 2;
  cards.forEach((card, i) => {
    const cx = 14 + (i % 2) * (cardW + 4);
    const cy = y + Math.floor(i / 2) * 20;
    if (card.highlight) {
      doc.setFillColor(...BLUE_LIGHT); doc.roundedRect(cx, cy, cardW, 16, 2, 2, "F");
      doc.setDrawColor(...BLUE); doc.setLineWidth(0.4); doc.roundedRect(cx, cy, cardW, 16, 2, 2, "S");
      doc.setTextColor(...BLUE_DARK);
    } else if (card.highlight2) {
      doc.setFillColor(240, 253, 244); doc.roundedRect(cx, cy, cardW, 16, 2, 2, "F");
      doc.setDrawColor(34, 197, 94); doc.setLineWidth(0.4); doc.roundedRect(cx, cy, cardW, 16, 2, 2, "S");
      doc.setTextColor(21, 128, 61);
    } else {
      doc.setFillColor(248, 250, 252); doc.roundedRect(cx, cy, cardW, 16, 2, 2, "F");
      doc.setDrawColor(...SLATE_200); doc.setLineWidth(0.3); doc.roundedRect(cx, cy, cardW, 16, 2, 2, "S");
      doc.setTextColor(...SLATE_500);
    }
    doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.text(card.label.toUpperCase(), cx + 5, cy + 6);
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text(String(card.value), cx + 5, cy + 13);
  });
  y += 68;
  doc.setDrawColor(...SLATE_200); doc.setLineWidth(0.3); doc.line(14, y, pageW - 14, y); y += 6;
  doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...SLATE_800);
  doc.text("Detalle de Ventas por Turno", 14, y); y += 5;

  autoTable(doc, {
    startY: y,
    head: [["#", "Producto", "Turno", "Fecha", "Unidades", "P. Unit.", "Total"]],
    body: reporte.map(r => [r.correlativo, r.nombreProducto, r.ventaTurno, r.fechaVenta, formatNum(r.unidadesVendidas), formatQ(r.precioUnitario), formatQ(r.totalEnQuetzales)]),
    foot: [["", "", "", "TOTAL", formatNum(totalUnidades), "", formatQ(totalVentas)]],
    margin: { left: 14, right: 14 },
    styles: { font: "helvetica", fontSize: 8, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 }, textColor: SLATE_800, lineColor: SLATE_200, lineWidth: 0.2 },
    headStyles: { fillColor: BLUE_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    footStyles: { fillColor: BLUE_LIGHT, textColor: BLUE_DARK, fontStyle: "bold", fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 20,  halign: "center", textColor: SLATE_500 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 14, halign: "center" },
      3: { cellWidth: 24, halign: "center" },
      4: { cellWidth: 20, halign: "right" },
      5: { cellWidth: 18, halign: "right" },
      6: { cellWidth: 22, halign: "right", fontStyle: "bold" },
    },
    didDrawPage: () => {
      const pg = doc.internal.getCurrentPageInfo().pageNumber;
      const total = doc.internal.getNumberOfPages();
      doc.setFontSize(7.5); doc.setTextColor(...SLATE_500);
      doc.text(`Página ${pg} de ${total}`, pageW / 2, pageH - 8, { align: "center" });
      doc.setDrawColor(...SLATE_200); doc.setLineWidth(0.2);
      doc.line(14, pageH - 12, pageW - 14, pageH - 12);
      doc.text("Sistema de Administración", 14, pageH - 8);
      doc.text("Reporte de Productos Vendidos", pageW - 14, pageH - 8, { align: "right" });
    },
  });

  doc.save(`productos_vendidos_${productoNombre.replace(/\s+/g, "_")}_${fechaInicio}_${fechaFin}.pdf`);
};

// ─── XLS Generator ────────────────────────────────────────────────────────────
const generarXLS = async ({ reporte, totalUnidades, totalVentas, productoNombre, sucursalNombre, fechaInicio, fechaFin }) => {
  const XLSX = await import("xlsx");

  const wb = XLSX.utils.book_new();

  // ── Hoja 1: Detalle ──
  const headerInfo = [
    ["REPORTE DE PRODUCTOS VENDIDOS"],
    [],
    ["Producto:",   productoNombre,  "Sucursal:",     sucursalNombre],
    ["Fecha inicio:", fechaInicio,   "Fecha fin:",    fechaFin],
    ["Total unidades:", totalUnidades, "Total ventas:", parseFloat(totalVentas.toFixed(2))],
    [],
    ["#", "Producto", "Turno", "Fecha", "Unidades vendidas", "Precio unitario", "Total (Q)"],
  ];

  const dataRows = reporte.map(r => [
    r.correlativo,
    r.nombreProducto,
    r.ventaTurno,
    r.fechaVenta,
    parseInt(r.unidadesVendidas || 0),
    parseFloat(parseFloat(r.precioUnitario || 0).toFixed(4)),
    parseFloat(parseFloat(r.totalEnQuetzales || 0).toFixed(2)),
  ]);

  const totalRow = ["", "", "", "TOTAL", totalUnidades, "", parseFloat(totalVentas.toFixed(2))];

  const wsData = [...headerInfo, ...dataRows, [], totalRow];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Anchos de columna
  ws["!cols"] = [
    { wch: 6 },   // #
    { wch: 28 },  // Producto
    { wch: 8 },   // Turno
    { wch: 14 },  // Fecha
    { wch: 18 },  // Unidades
    { wch: 16 },  // P. Unit.
    { wch: 14 },  // Total
  ];

  // Merge del título
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];

  XLSX.utils.book_append_sheet(wb, ws, "Detalle");

  // ── Hoja 2: Resumen por fecha ──
  const porFecha = {};
  reporte.forEach(r => {
    if (!porFecha[r.fechaVenta]) porFecha[r.fechaVenta] = { unidades: 0, total: 0, am: 0, pm: 0 };
    porFecha[r.fechaVenta].unidades += parseInt(r.unidadesVendidas || 0);
    porFecha[r.fechaVenta].total    += parseFloat(r.totalEnQuetzales || 0);
    if (r.ventaTurno === "AM") porFecha[r.fechaVenta].am += parseInt(r.unidadesVendidas || 0);
    else                       porFecha[r.fechaVenta].pm += parseInt(r.unidadesVendidas || 0);
  });

  const resumenHeader = [["Fecha", "Unidades AM", "Unidades PM", "Total unidades", "Total (Q)"]];
  const resumenRows   = Object.entries(porFecha).map(([fecha, d]) => [
    fecha,
    d.am,
    d.pm,
    d.unidades,
    parseFloat(d.total.toFixed(2)),
  ]);
  const resumenTotal = ["TOTAL", "", "", totalUnidades, parseFloat(totalVentas.toFixed(2))];

  const ws2 = XLSX.utils.aoa_to_sheet([...resumenHeader, ...resumenRows, [], resumenTotal]);
  ws2["!cols"] = [{ wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Resumen por fecha");

  // Descargar
  XLSX.writeFile(wb, `productos_vendidos_${productoNombre.replace(/\s+/g, "_")}_${fechaInicio}_${fechaFin}.xlsx`);
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="pv-spinner-wrap">
    <div className="pv-spinner">
      <div className="pv-spinner__track" />
      <div className="pv-spinner__outer" />
      <div className="pv-spinner__inner" />
    </div>
    <p className="pv-spinner__text">Consultando productos vendidos...</p>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="pv-empty">
    <div className="pv-empty__icon"><IconDoc /></div>
    <p className="pv-empty__title">Sin resultados</p>
    <p className="pv-empty__sub">No se encontraron ventas para los filtros seleccionados.</p>
  </div>
);

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ emoji, label, value, color, wide }) => (
  <div className={`pv-summary-card pv-summary-card--${color}${wide ? " pv-summary-card--wide" : ""}`}>
    <div className="pv-summary-card__emoji">{emoji}</div>
    <div style={{ minWidth: 0 }}>
      <div className="pv-summary-card__label">{label}</div>
      <div className="pv-summary-card__value">{value}</div>
    </div>
  </div>
);

// ─── Venta Card (móvil / tablet) ──────────────────────────────────────────────
const VentaCard = ({ venta, index }) => (
  <div className="pv-card" style={{ animationDelay: `${index * 40}ms` }}>
    <div className="pv-card__top">
      <div style={{ minWidth: 0 }}>
        <p className="pv-card__name">{venta.nombreProducto}</p>
        <p className="pv-card__date">{venta.fechaVenta}</p>
      </div>
      <BadgeTurno turno={venta.ventaTurno} />
    </div>
    <div className="pv-card__bottom">
      <div className="pv-card__stat">
        <span className="pv-card__stat-label">Unidades</span>
        <span className="pv-card__stat-value">{formatNum(venta.unidadesVendidas)}</span>
      </div>
      <div className="pv-card__stat pv-card__stat--right">
        <span className="pv-card__stat-label">Total</span>
        <span className="pv-card__stat-value pv-card__stat-value--green">{formatQ(venta.totalEnQuetzales)}</span>
      </div>
    </div>
  </div>
);

// ─── Venta Row (desktop) ──────────────────────────────────────────────────────
const VentaRow = ({ venta }) => (
  <tr>
    <td className="pv-td--id">{venta.correlativo}</td>
    <td className="pv-td--name">{venta.nombreProducto}</td>
    <td><BadgeTurno turno={venta.ventaTurno} /></td>
    <td>{venta.fechaVenta}</td>
    <td className="pv-td--num">{formatNum(venta.unidadesVendidas)}</td>
    <td className="pv-td--num">{formatQ(venta.precioUnitario)}</td>
    <td className="pv-td--total">{formatQ(venta.totalEnQuetzales)}</td>
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductosVendidos = () => {
  const navigate = useNavigate();
  const { sucursales, loadingSucursales } = useGetSucursales();
  const { productos, loadigProducts }     = useGetProductosYPrecios();

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  const [fechaInicio,   setFechaInicio]   = useState("");
  const [fechaFin,      setFechaFin]      = useState("");
  const [idSucursal,    setIdSucursal]    = useState("");
  const [idProducto,    setIdProducto]    = useState("");
  const [reporte,       setReporte]       = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [hasSearched,   setHasSearched]   = useState(false);
  const [error,         setError]         = useState(null);
  const [generandoPDF,  setGenerandoPDF]  = useState(false);
  const [generandoXLS,  setGenerandoXLS]  = useState(false);

  const isFormValid    = fechaInicio && fechaFin && idSucursal && idProducto;
  const totalUnidades  = reporte.reduce((acc, r) => acc + parseInt(r.unidadesVendidas || 0), 0);
  const totalVentas    = reporte.reduce((acc, r) => acc + parseFloat(r.totalEnQuetzales || 0), 0);
  const sucursalNombre = sucursales?.find(s => s.idSucursal === Number(idSucursal))?.nombreSucursal || "";
  const productoNombre = productos?.find(p => p.idProducto === Number(idProducto))?.nombreProducto  || "";

  useEffect(() => {
    if (hasSearched) { setHasSearched(false); setReporte([]); setError(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaInicio, fechaFin, idSucursal, idProducto]);

  const handleConsultar = async () => {
    if (!isFormValid || loading) return;
    setLoading(true); setError(null); setHasSearched(false);
    try {
      const result = await consultarProductosVendidosService(idProducto, idSucursal, fechaInicio, fechaFin);
      setReporte(Array.isArray(result) ? result : result?.reporte || []);
      setHasSearched(true);
    } catch {
      setError("No se pudo obtener la información. Intente nuevamente.");
      setReporte([]); setHasSearched(true);
    } finally { setLoading(false); }
  };

  const handleDescargarPDF = async () => {
    if (!reporte.length) return;
    setGenerandoPDF(true);
    try { await generarPDF({ reporte, totalUnidades, totalVentas, productoNombre, sucursalNombre, fechaInicio, fechaFin }); }
    finally { setGenerandoPDF(false); }
  };

  const handleDescargarXLS = async () => {
    if (!reporte.length) return;
    setGenerandoXLS(true);
    try { await generarXLS({ reporte, totalUnidades, totalVentas, productoNombre, sucursalNombre, fechaInicio, fechaFin }); }
    finally { setGenerandoXLS(false); }
  };

  const pdfXlsProps = { reporte, totalUnidades, totalVentas, productoNombre, sucursalNombre, fechaInicio, fechaFin };

  return (
    <div className="pv-page">

      {/* ── Header ── */}
      <header className="pv-header">
        <div className="pv-header__inner">
          <button className="pv-btn-back" onClick={() => navigate("/reportes")} aria-label="Volver">
            <IconArrowLeft />
          </button>
          <div className="pv-header__icon"><IconBox /></div>
          <div className="pv-header__text">
            <h1 className="pv-header__title">Productos Vendidos</h1>
            <p className="pv-header__subtitle">Detalle de ventas por producto, turno y período</p>
          </div>

          {/* Botones de exportación — visibles solo con resultados */}
          {reporte.length > 0 && (
            <div className="pv-export-btns">
              {/* XLS */}
              <button
                className={`pv-btn-xls ${generandoXLS ? "pv-btn-xls--loading" : ""}`}
                onClick={handleDescargarXLS}
                disabled={generandoXLS}
                aria-label="Descargar Excel"
              >
                {generandoXLS
                  ? <><div className="pv-btn-xls__spinner" /><span className="pv-export-label">Generando...</span></>
                  : <><IconXLS /><span className="pv-export-label">Excel</span></>}
              </button>
              {/* PDF */}
              <button
                className={`pv-btn-pdf ${generandoPDF ? "pv-btn-pdf--loading" : ""}`}
                onClick={handleDescargarPDF}
                disabled={generandoPDF}
                aria-label="Descargar PDF"
              >
                {generandoPDF
                  ? <><div className="pv-btn-pdf__spinner" /><span className="pv-export-label">Generando...</span></>
                  : <><IconPDF /><span className="pv-export-label">PDF</span></>}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="pv-content">

        {/* ── Filtros ── */}
        <div className="pv-card-wrap pv-filter-card">
          <p className="pv-filter-card__label">Filtros de búsqueda</p>
          <div className="pv-filter-grid">

            <div className="pv-field">
              <label className="pv-field__label">Fecha inicio</label>
              <div className="pv-field__wrap">
                <span className="pv-field__icon"><IconCalendar /></span>
                <input type="date" className="pv-field__input" value={fechaInicio}
                  max={fechaFin || undefined} onChange={e => setFechaInicio(e.target.value)} />
              </div>
            </div>

            <div className="pv-field">
              <label className="pv-field__label">Fecha fin</label>
              <div className="pv-field__wrap">
                <span className="pv-field__icon"><IconCalendar /></span>
                <input type="date" className="pv-field__input" value={fechaFin}
                  min={fechaInicio || undefined} onChange={e => setFechaFin(e.target.value)} />
              </div>
            </div>

            <div className="pv-field">
              <label className="pv-field__label">Sucursal</label>
              <div className="pv-field__wrap">
                <span className="pv-field__icon"><IconBuilding /></span>
                <select className="pv-field__select" value={idSucursal}
                  disabled={loadingSucursales} onChange={e => setIdSucursal(e.target.value)}>
                  <option value="">{loadingSucursales ? "Cargando sucursales..." : "Seleccionar sucursal"}</option>
                  {sucursales?.map(s => (
                    <option key={s.idSucursal} value={s.idSucursal}>
                      {s.nombreSucursal}{s.municipioSucursal ? ` — ${s.municipioSucursal}` : ""}
                    </option>
                  ))}
                </select>
                <span className="pv-field__chevron"><IconChevron /></span>
              </div>
            </div>

            <div className="pv-field">
              <label className="pv-field__label">Producto</label>
              <ProductoSelect productos={productos} loading={loadigProducts} value={idProducto} onChange={setIdProducto} />
            </div>

            <div className="pv-field pv-field--btn">
              <label className="pv-field__label" style={{ visibility: "hidden" }}>Buscar</label>
              <button
                className={`pv-btn-consult ${isFormValid && !loading ? "pv-btn-consult--active" : "pv-btn-consult--disabled"}`}
                onClick={handleConsultar} disabled={!isFormValid || loading}
              >
                {loading
                  ? <><div className="pv-btn-consult__spinner" /> Consultando...</>
                  : <><IconSearch /> Consultar</>}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="pv-error-banner"><IconAlert /><p>{error}</p></div>}
        {loading && <div className="pv-card-wrap"><Spinner /></div>}

        {!loading && hasSearched && (
          <>
            {reporte.length > 0 && (
              <div className="pv-summary-grid">
                <SummaryCard emoji="📦" label="Total unidades" value={formatNum(totalUnidades)} color="blue" />
                <SummaryCard emoji="💰" label="Total ventas"   value={formatQ(totalVentas)}     color="green" />
                <SummaryCard emoji="📋" label="Registros"      value={reporte.length}            color="dark" />
                <SummaryCard emoji="🏷️" label="Producto"       value={productoNombre}            color="orange" wide />
                <SummaryCard emoji="🏢" label="Sucursal"       value={sucursalNombre}            color="sky"    wide />
                <SummaryCard emoji="📅" label="Período"        value={formatPeriodo(fechaInicio, fechaFin)} color="violet" wide />
              </div>
            )}

            {reporte.length === 0 ? (
              <div className="pv-card-wrap"><EmptyState /></div>
            ) : (
              <>
                <div className="pv-cards-list">
                  {reporte.map((v, i) => <VentaCard key={v.correlativo ?? i} venta={v} index={i} />)}
                </div>
                <div className="pv-table-wrap">
                  <div className="pv-table-scroll">
                    <table className="pv-table">
                      <thead>
                        <tr>
                          <th>#</th><th>Producto</th><th>Turno</th><th>Fecha</th>
                          <th className="pv-th--right">Unidades</th>
                          <th className="pv-th--right">P. Unit.</th>
                          <th className="pv-th--right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporte.map((v, i) => <VentaRow key={v.correlativo ?? i} venta={v} />)}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4}>Total</td>
                          <td className="pv-td--num">{formatNum(totalUnidades)}</td>
                          <td />
                          <td className="pv-td--total">{formatQ(totalVentas)}</td>
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

      {/* ── Scroll to top ── */}
      <ScrollToTopBtn />
    </div>
  );
};

export default ProductosVendidos;