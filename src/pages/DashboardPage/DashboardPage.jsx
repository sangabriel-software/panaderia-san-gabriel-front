import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  FiDownload,
  FiCalendar,
  FiDollarSign,
  FiHome,
  FiUsers,
  FiTrendingUp,
  FiAward,
} from "react-icons/fi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import useGetDashboardData from "../../hooks/DashboardData/useGetDashboardData";
import { formatoQuetzalesSimple } from "../../utils/utils";

const MONTH_LABELS = {
  ene: "Ene", feb: "Feb", mar: "Mar", abr: "Abr", may: "May", jun: "Jun",
  jul: "Jul", ago: "Ago", sep: "Sep", oct: "Oct", nov: "Nov", dic: "Dic",
};

const BAR_COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

// ── Tarjeta KPI reutilizable ─────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, tone }) {
  const toneClasses = {
    brand: "bg-brand-600 shadow-brand",
    accent: "bg-accent-600 shadow-accent",
    warning: "bg-warning-500",
    danger: "bg-danger-600 shadow-danger",
  };
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${toneClasses[tone]}`}>
        <Icon size={18} />
      </span>
      <p className="mt-3 text-2xl font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
    </div>
  );
}

// ── Tooltip custom para las gráficas, con look del sistema de diseño ────
function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-modal">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="text-sm font-semibold text-brand-700">
        {formatter ? formatter(payload[0].value) : payload[0].value}
      </p>
    </div>
  );
}

function DashboardPage() {
  const {
    loadingDashboardData,
    cantidadEmpleados,
    cantidadSucursales,
    ingresosMensuales,
    resumenMensual,
    topVentas,
  } = useGetDashboardData();

  const calcularTotalIngresosMensuales = () => {
    if (!ingresosMensuales || ingresosMensuales.length === 0) return "0.00";
    return ingresosMensuales.reduce((sum, s) => sum + (parseFloat(s.ingresoMensual) || 0), 0).toFixed(2);
  };

  const calcularTotalIngresosAnuales = () => {
    if (!ingresosMensuales || ingresosMensuales.length === 0) return "0.00";
    // Nota: si tu API ya separa ingresosAnuales, reemplaza este cálculo por ese arreglo.
    return ingresosMensuales.reduce((sum, s) => sum + (parseFloat(s.ingresoMensual) || 0), 0).toFixed(2);
  };

  const resumenChartData = (resumenMensual || []).map((item) => ({
    mes: MONTH_LABELS[item.mes] || item.mes,
    ingresos: parseFloat(item.total_ingresos) || 0,
  }));

  const topProductosData = (topVentas || [])
    .slice(0, 5)
    .map((p) => ({ nombre: p.nombreProducto, unidades: p.cantidad_total_vendida }));

  const maxIngresoSucursal = Math.max(
    ...(ingresosMensuales || []).map((s) => parseFloat(s.ingresoMensual) || 0),
    1
  );

  const generatePDF = () => {
    const input = document.getElementById("dashboard-content");
    const pdf = new jsPDF("landscape", "pt", "a4");
    const today = new Date();
    const date = today.toLocaleDateString("es-GT");
    const time = today.toLocaleTimeString("es-GT");

    const loadingMessage = document.createElement("div");
    loadingMessage.style.cssText =
      "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(2,6,23,0.85);color:white;padding:16px 24px;border-radius:12px;z-index:9999;font-family:sans-serif;font-size:14px;";
    loadingMessage.textContent = "Generando reporte...";
    document.body.appendChild(loadingMessage);

    html2canvas(input, { scale: 2, logging: false, useCORS: true, allowTaint: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pdf.internal.pageSize.getWidth() - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.setFontSize(18);
        pdf.setTextColor(40);
        pdf.setFont("helvetica", "bold");
        pdf.text("REPORTE DE DASHBOARD", pdf.internal.pageSize.getWidth() / 2, 30, { align: "center" });

        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Generado el: ${date} a las ${time}`, pdf.internal.pageSize.getWidth() / 2, 45, { align: "center" });

        pdf.addImage(imgData, "PNG", 20, 60, imgWidth, imgHeight);
        pdf.addPage("landscape");

        pdf.setFontSize(18);
        pdf.text("DETALLE DE DATOS", pdf.internal.pageSize.getWidth() / 2, 30, { align: "center" });

        const tableConfig = {
          theme: "grid",
          tableWidth: "wrap",
          margin: { horizontal: 10 },
          styles: { cellPadding: 5, fontSize: 10, valign: "middle", halign: "center" },
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold", halign: "center" },
          bodyStyles: { halign: "center" },
          alternateRowStyles: { fillColor: [246, 253, 245] },
        };

        pdf.setFontSize(12);
        pdf.setTextColor(40);
        pdf.text("Ingresos Mensuales por Sucursal", pdf.internal.pageSize.getWidth() / 2, 60, { align: "center" });

        const ingresosMensualesData =
          ingresosMensuales?.map((item) => [
            item.nombreSucursal || "N/A",
            `Q ${parseFloat(item.ingresoMensual || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          ]) || [];

        autoTable(pdf, {
          ...tableConfig,
          startY: 70,
          head: [["Sucursal", "Ingreso Mensual"]],
          body: ingresosMensualesData,
          tableWidth: pdf.internal.pageSize.getWidth() - 40,
        });

        const startYParallel = pdf.lastAutoTable.finalY + 20;
        const tableWidth = (pdf.internal.pageSize.getWidth() - 60) / 2;

        pdf.text("Productos Más Vendidos", pdf.internal.pageSize.getWidth() / 4, startYParallel, { align: "center" });
        const topProductosPdfData =
          topVentas?.map((item) => [
            item.nombreProducto || "N/A",
            item.cantidad_total_vendida ? item.cantidad_total_vendida.toLocaleString("es-GT") : "0",
          ]) || [];

        autoTable(pdf, {
          ...tableConfig,
          startY: startYParallel + 10,
          head: [["Producto", "Unidades Vendidas"]],
          body: topProductosPdfData,
          headStyles: { ...tableConfig.headStyles, fillColor: [124, 58, 237] },
          tableWidth,
          margin: { left: 20 },
        });

        pdf.text("Resumen Mensual de Ingresos", (pdf.internal.pageSize.getWidth() / 4) * 3, startYParallel, { align: "center" });
        const resumenMensualPdfData =
          resumenMensual?.map((item) => [
            item.mes.toUpperCase() || "N/A",
            `Q ${parseFloat(item.total_ingresos || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          ]) || [];

        autoTable(pdf, {
          ...tableConfig,
          startY: startYParallel + 10,
          head: [["Mes", "Total Ingresos"]],
          body: resumenMensualPdfData,
          headStyles: { ...tableConfig.headStyles, fillColor: [217, 119, 6] },
          tableWidth,
          margin: { left: pdf.internal.pageSize.getWidth() / 2 - 10 },
        });

        document.body.removeChild(loadingMessage);
        pdf.save(`reporte-dashboard-${date.replace(/\//g, "-")}.pdf`);
      })
      .catch((error) => {
        console.error("Error al generar el PDF:", error);
        document.body.removeChild(loadingMessage);
        alert("Error al generar el reporte. Por favor intente nuevamente.");
      });
  };

  return (
    <div id="dashboard-content" className="flex flex-col gap-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-muted">Resumen general del negocio</p>
        </div>
        <button
          type="button"
          onClick={generatePDF}
          disabled={loadingDashboardData}
          className="flex items-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiDownload size={15} />
          {loadingDashboardData ? "Generando..." : "Generar reporte"}
        </button>
      </header>

      {loadingDashboardData ? (
        <div className="flex items-center justify-center py-24">
          <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : (
        <>
          {/* ── KPIs ───────────────────────────────────────────────────── */}
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              label="Ingreso mes en curso"
              value={formatoQuetzalesSimple(calcularTotalIngresosMensuales())}
              icon={FiCalendar}
              tone="brand"
            />
            <KpiCard
              label="Ingreso año en curso"
              value={formatoQuetzalesSimple(calcularTotalIngresosAnuales())}
              icon={FiDollarSign}
              tone="accent"
            />
            <KpiCard label="Sucursales" value={cantidadSucursales ?? 0} icon={FiHome} tone="warning" />
            <KpiCard label="Empleados" value={cantidadEmpleados ?? 0} icon={FiUsers} tone="danger" />
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* ── Ingresos del año — gráfica de área ─────────────────────── */}
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-card lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <FiTrendingUp size={17} className="text-brand-600" />
                <h2 className="text-sm font-semibold text-ink">Ingresos del año</h2>
              </div>
              <div className="h-64">
                {resumenChartData.every((d) => d.ingresos === 0) ? (
                  <EmptyState text="Aún no hay ingresos registrados este año." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={resumenChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ingresosFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(226 226 230)" />
                      <XAxis
                        dataKey="mes"
                        tick={{ fontSize: 11, fill: "rgb(100 116 139)" }}
                        axisLine={{ stroke: "rgb(226 226 230)" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "rgb(100 116 139)" }}
                        axisLine={false}
                        tickLine={false}
                        width={50}
                      />
                      <Tooltip content={<ChartTooltip formatter={(v) => formatoQuetzalesSimple(v)} />} />
                      <Area
                        type="monotone"
                        dataKey="ingresos"
                        stroke="#059669"
                        strokeWidth={2.5}
                        fill="url(#ingresosFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* ── Top productos — barras horizontales ────────────────────── */}
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
              <div className="mb-4 flex items-center gap-2">
                <FiAward size={17} className="text-brand-600" />
                <h2 className="text-sm font-semibold text-ink">Productos más vendidos</h2>
              </div>
              <div className="h-64">
                {topProductosData.length === 0 ? (
                  <EmptyState text="Sin ventas registradas aún." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProductosData}
                      layout="vertical"
                      margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="nombre"
                        tick={{ fontSize: 11, fill: "rgb(100 116 139)" }}
                        axisLine={false}
                        tickLine={false}
                        width={110}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(16,185,129,0.06)" }}
                        content={<ChartTooltip formatter={(v) => `${v} unidades`} />}
                      />
                      <Bar dataKey="unidades" radius={[0, 6, 6, 0]} barSize={16}>
                        {topProductosData.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* ── Ingresos por sucursal — comparativa custom ─────────────────── */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <FiHome size={17} className="text-brand-600" />
              <h2 className="text-sm font-semibold text-ink">Ingresos por sucursal (mes en curso)</h2>
            </div>

            {!ingresosMensuales || ingresosMensuales.length === 0 ? (
              <EmptyState text="No hay datos de sucursales aún." />
            ) : (
              <div className="flex flex-col gap-4">
                {ingresosMensuales.map((s, i) => {
                  const valor = parseFloat(s.ingresoMensual) || 0;
                  const pct = Math.max((valor / maxIngresoSucursal) * 100, 3);
                  return (
                    <div key={s.idSucursal}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-ink">{s.nombreSucursal}</span>
                        <span className="font-semibold text-brand-700">{formatoQuetzalesSimple(valor)}</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full bg-brand-600 transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-muted">
        <FiTrendingUp size={16} />
      </span>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}

export default DashboardPage;