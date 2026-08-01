import React from "react";
import { useNavigate, useParams } from "react-router";
import useGetDetalleVenta from "../../../hooks/ventas/useGetDetalleVenta";
import { decryptId } from "../../../utils/CryptoParams";
import DesktopVentaDetalle from "../../../components/ventas/DesktopVentasDetalle/DesktopVentasDetalle";
import MobileVentaDetalle from "../../../components/ventas/MobileVentaDetalle/MobileVentaDetalle";
import { Container } from "react-bootstrap";
import { BsArrowLeft } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { useMediaQuery } from "react-responsive";
import DotsMove from "../../../components/Spinners/DotsMove";

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatQ = (val) =>
  `Q ${parseFloat(val || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
const formatNum = (val) =>
  parseInt(val || 0).toLocaleString("es-GT");

// ─── PDF Generator ────────────────────────────────────────────────────────────
const generarPDF = async (venta) => {
  const { jsPDF }           = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const enc     = venta.encabezadoVenta;
  const detalle = venta.detalleVenta      || [];
  const ingreso = venta.detalleIngresos   || {};
  const gastos  = venta.detalleGastos     || [];

  const doc   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const BLUE       = [59, 130, 246];
  const BLUE_DARK  = [29, 78, 216];
  const BLUE_LIGHT = [239, 246, 255];
  const SLATE_800  = [30, 41, 59];
  const SLATE_500  = [100, 116, 139];
  const SLATE_200  = [226, 232, 240];
  const GREEN_DARK = [21, 128, 61];
  const WHITE      = [255, 255, 255];

  // ── Header ──
  doc.setFillColor(...BLUE_DARK);
  doc.rect(0, 0, pageW, 38, "F");
  doc.setFillColor(...BLUE);
  doc.circle(pageW - 10, -5, 28, "F");
  doc.setFillColor(...WHITE);
  doc.roundedRect(12, 8, 22, 22, 3, 3, "F");
  doc.setTextColor(...BLUE_DARK);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("DV", 23, 22, { align: "center" });

  doc.setTextColor(...WHITE);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.text(`Detalle de Venta #${enc.idVenta}`, 40, 18);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(219, 234, 254);
  doc.text(`${enc.nombreSucursal} · Turno ${enc.ventaTurno} · ${enc.fechaVenta}`, 40, 26);
  doc.setFontSize(7.5);
  doc.setTextColor(191, 219, 254);
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-GT", { day: "2-digit", month: "long", year: "numeric" })}`,
    pageW - 12, 33, { align: "right" }
  );

  // ── Info cards ──
  let y = 46;
  const cards = [
    { label: "Sucursal",       value: enc.nombreSucursal },
    { label: "Turno",          value: enc.ventaTurno },
    { label: "Fecha",          value: enc.fechaVenta },
    { label: "Vendedor/a",     value: enc.nombreUsuario },
    { label: "Total ingresado",value: formatQ(ingreso.montoTotalIngresado), highlight2: true },
    { label: "Total esperado", value: formatQ(ingreso.montoEsperado) },
    { label: "Total gastos",   value: formatQ(ingreso.montoTotalGastos) },
    { label: "Diferencia",     value: formatQ(ingreso.diferencia),
      highlight: ingreso.diferencia >= 0, danger: ingreso.diferencia < 0 },
  ];

  const cardW = (pageW - 28) / 2;
  cards.forEach((card, i) => {
    const cx = 14 + (i % 2) * (cardW + 4);
    const cy = y + Math.floor(i / 2) * 20;

    if (card.highlight2) {
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(cx, cy, cardW, 16, 2, 2, "F");
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.4);
      doc.roundedRect(cx, cy, cardW, 16, 2, 2, "S");
      doc.setTextColor(...GREEN_DARK);
    } else if (card.danger) {
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(cx, cy, cardW, 16, 2, 2, "F");
      doc.setDrawColor(239, 68, 68);
      doc.setLineWidth(0.4);
      doc.roundedRect(cx, cy, cardW, 16, 2, 2, "S");
      doc.setTextColor(185, 28, 28);
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

  y += Math.ceil(cards.length / 2) * 20 + 6;

  // ── Separador ──
  doc.setDrawColor(...SLATE_200);
  doc.setLineWidth(0.3);
  doc.line(14, y, pageW - 14, y);
  y += 6;

  // ── Tabla detalle productos ──
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_800);
  doc.text("Detalle de Productos", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["#", "Producto", "Cantidad", "P. Unit.", "Descuento", "Subtotal"]],
    body: detalle.map((d, i) => [
      i + 1,
      d.nombreProducto,
      formatNum(d.cantidadVendida),
      formatQ(d.precioUnitario),
      formatQ(d.descuento),
      formatQ(d.subtotal),
    ]),
    foot: [["", "", "", "", "Total", formatQ(detalle.reduce((a, d) => a + d.subtotal, 0))]],
    margin: { left: 14, right: 14 },
    styles: {
      font: "helvetica", fontSize: 8,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      textColor: SLATE_800, lineColor: SLATE_200, lineWidth: 0.2,
    },
    headStyles: { fillColor: BLUE_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    footStyles: { fillColor: BLUE_LIGHT, textColor: BLUE_DARK, fontStyle: "bold", fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center", textColor: SLATE_500 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 20, halign: "right" },
      3: { cellWidth: 24, halign: "right" },
      4: { cellWidth: 24, halign: "right" },
      5: { cellWidth: 24, halign: "right", fontStyle: "bold" },
    },
    didDrawPage: () => {
      const pg    = doc.internal.getCurrentPageInfo().pageNumber;
      const total = doc.internal.getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE_500);
      doc.text(`Página ${pg} de ${total}`, pageW / 2, pageH - 8, { align: "center" });
      doc.setDrawColor(...SLATE_200);
      doc.setLineWidth(0.2);
      doc.line(14, pageH - 12, pageW - 14, pageH - 12);
      doc.text("Sistema de Administración", 14, pageH - 8);
      doc.text(`Venta #${enc.idVenta}`, pageW - 14, pageH - 8, { align: "right" });
    },
  });

  // ── Tabla gastos (si hay) ──
  if (gastos.length > 0) {
    const afterProductos = doc.lastAutoTable.finalY + 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...SLATE_800);
    doc.text("Gastos del Turno", 14, afterProductos);

    autoTable(doc, {
      startY: afterProductos + 4,
      head: [["#", "Detalle del gasto", "Subtotal"]],
      body: gastos.map((g, i) => [i + 1, g.detalleGasto, formatQ(g.subtotal)]),
      foot: [["", "Total gastos", formatQ(gastos.reduce((a, g) => a + g.subtotal, 0))]],
      margin: { left: 14, right: 14 },
      styles: {
        font: "helvetica", fontSize: 8,
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
        textColor: SLATE_800, lineColor: SLATE_200, lineWidth: 0.2,
      },
      headStyles: { fillColor: [100, 116, 139], textColor: WHITE, fontStyle: "bold", fontSize: 8 },
      footStyles: { fillColor: [241, 245, 249], textColor: SLATE_800, fontStyle: "bold", fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 10, halign: "center", textColor: SLATE_500 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 30, halign: "right", fontStyle: "bold" },
      },
    });
  }

  doc.save(`venta_${enc.idVenta}_${enc.fechaVenta}.pdf`);
};

// ─── XLS Generator ────────────────────────────────────────────────────────────
const generarXLS = async (venta) => {
  const XLSX = await import("xlsx");

  const enc     = venta.encabezadoVenta;
  const detalle = venta.detalleVenta    || [];
  const ingreso = venta.detalleIngresos || {};
  const gastos  = venta.detalleGastos   || [];

  const wb = XLSX.utils.book_new();

  // ── Hoja 1: Resumen ──
  const resumenData = [
    ["DETALLE DE VENTA"],
    [],
    ["ID Venta",          enc.idVenta],
    ["Sucursal",          enc.nombreSucursal],
    ["Turno",             enc.ventaTurno],
    ["Fecha",             enc.fechaVenta],
    ["Vendedor/a",        enc.nombreUsuario],
    [],
    ["RESUMEN FINANCIERO"],
    ["Total ingresado",   parseFloat((ingreso.montoTotalIngresado || 0).toFixed(2))],
    ["Total esperado",    parseFloat((ingreso.montoEsperado       || 0).toFixed(2))],
    ["Total gastos",      parseFloat((ingreso.montoTotalGastos    || 0).toFixed(2))],
    ["Diferencia",        parseFloat((ingreso.diferencia          || 0).toFixed(2))],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(resumenData);
  ws1["!cols"] = [{ wch: 22 }, { wch: 28 }];
  ws1["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 8, c: 0 }, e: { r: 8, c: 1 } },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "Resumen");

  // ── Hoja 2: Productos ──
  const productosHeader = [["#", "Producto", "Cantidad", "Precio unitario", "Descuento", "Subtotal"]];
  const productosRows   = detalle.map((d, i) => [
    i + 1,
    d.nombreProducto,
    parseInt(d.cantidadVendida || 0),
    parseFloat((d.precioUnitario || 0).toFixed(2)),
    parseFloat((d.descuento     || 0).toFixed(2)),
    parseFloat((d.subtotal      || 0).toFixed(2)),
  ]);
  const productosTotal = [
    "", "", "", "", "Total",
    parseFloat(detalle.reduce((a, d) => a + (d.subtotal || 0), 0).toFixed(2)),
  ];

  const ws2 = XLSX.utils.aoa_to_sheet([...productosHeader, ...productosRows, [], productosTotal]);
  ws2["!cols"] = [
    { wch: 6 }, { wch: 28 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, "Productos");

  // ── Hoja 3: Gastos (si hay) ──
  if (gastos.length > 0) {
    const gastosHeader = [["#", "Detalle del gasto", "Subtotal"]];
    const gastosRows   = gastos.map((g, i) => [
      i + 1,
      g.detalleGasto,
      parseFloat((g.subtotal || 0).toFixed(2)),
    ]);
    const gastosTotal  = [
      "", "Total gastos",
      parseFloat(gastos.reduce((a, g) => a + (g.subtotal || 0), 0).toFixed(2)),
    ];

    const ws3 = XLSX.utils.aoa_to_sheet([...gastosHeader, ...gastosRows, [], gastosTotal]);
    ws3["!cols"] = [{ wch: 6 }, { wch: 32 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Gastos");
  }

  XLSX.writeFile(wb, `venta_${enc.idVenta}_${enc.fechaVenta}.xlsx`);
};

// ─── Page Component ───────────────────────────────────────────────────────────
const DetalleVentaPage = () => {
  const { idVenta }         = useParams();
  const decryptedIdVenta    = decryptId(decodeURIComponent(idVenta));
  const { detalleVenta, loadingDetalleVenta, showErrorDetalleVenta } =
    useGetDetalleVenta(decryptedIdVenta);
  const navigate  = useNavigate();
  const isMobile  = useMediaQuery({ maxWidth: 767 });

  const [generandoPDF, setGenerandoPDF] = React.useState(false);
  const [generandoXLS, setGenerandoXLS] = React.useState(false);

  if (loadingDetalleVenta) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <DotsMove />
      </Container>
    );
  }

  if (showErrorDetalleVenta) return <div>Error al cargar los detalles de la venta.</div>;
  if (!detalleVenta)         return <div>No se encontraron detalles para esta venta.</div>;

  const ventaData = detalleVenta.venta ?? detalleVenta;

  const handleDownloadPDF = async () => {
    setGenerandoPDF(true);
    try   { await generarPDF(ventaData); }
    catch { console.error("Error generando PDF"); }
    finally { setGenerandoPDF(false); }
  };

  const handleDownloadXLS = async () => {
    setGenerandoXLS(true);
    try   { await generarXLS(ventaData); }
    catch { console.error("Error generando XLS"); }
    finally { setGenerandoXLS(false); }
  };

  return (
    <Container className="mt-4">
      <div className="text-center">
        <div className="row align-items-center">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/ventas")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-6 col-md-8">
            <Title title="Detalle de venta" />
          </div>
        </div>
      </div>

      <div>
        {isMobile ? (
          <MobileVentaDetalle
            venta={detalleVenta}
            onDownloadXLS={handleDownloadXLS}
            onDownloadPDF={handleDownloadPDF}
          />
        ) : (
          <DesktopVentaDetalle
            venta={detalleVenta}
            onDownloadXLS={handleDownloadXLS}
            onDownloadPDF={handleDownloadPDF}
          />
        )}
      </div>
    </Container>
  );
};

export default DetalleVentaPage;