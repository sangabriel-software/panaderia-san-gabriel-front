import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  FiArrowLeft,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiCalendar,
  FiChevronDown,
  FiSearch,
  FiX,
  FiTrendingUp,
  FiTrendingDown,
  FiUser,
  FiFileText,
  FiInbox,
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { generarReporteHistorialStockService } from "../../../services/reportes/reportes.service";
import { getUserData } from "../../../utils/Auth/decodedata";
import Alert from "../../../components/Alerts/Alert";

const selectClass =
  "w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted";

function HistorialStock() {
  const navigate = useNavigate();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const userData = getUserData();

  const [selectedProducto, setSelectedProducto] = useState(null);
  const [selectedSucursal, setSelectedSucursal] = useState("");
  const [reporteData, setReporteData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [yaGenero, setYaGenero] = useState(false);

  useEffect(() => {
    if (!loadingSucursales && sucursales.length > 0 && userData?.idRol !== 1) {
      const sucursalUsuario = sucursales.find((s) => s.idSucursal === userData.idSucursal);
      if (sucursalUsuario) setSelectedSucursal(sucursalUsuario.idSucursal);
    }
  }, [loadingSucursales, sucursales, userData]);

  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map((p) => p.nombreCategoria))];
    return ["Todas", ...cats];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    if (categoriaActiva === "Todas") return productos;
    return productos.filter((p) => p.nombreCategoria === categoriaActiva);
  }, [productos, categoriaActiva]);

  const handleGenerarReporte = async () => {
    if (!selectedProducto || !selectedSucursal || !fechaInicio || !fechaFin) {
      setError("Debes completar todos los campos obligatorios");
      return;
    }

    const inicio = dayjs(fechaInicio).startOf("day");
    const fin = dayjs(fechaFin).endOf("day");

    if (inicio.isAfter(fin)) {
      setError("La fecha de inicio no puede ser mayor a la fecha final");
      return;
    }

    setError(null);
    setLoadingReporte(true);
    setYaGenero(true);

    try {
      const data = await generarReporteHistorialStockService(selectedProducto.value, selectedSucursal, fechaInicio, fechaFin);
      setReporteData(data.reporte || []);
      setFilteredData(data.reporte || []);
    } catch (err) {
      setError("Error al generar el reporte: " + err.message);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleReset = () => {
    setSelectedProducto(null);
    setSelectedSucursal(userData?.idRol === 1 ? "" : userData?.idSucursal || "");
    setReporteData([]);
    setFilteredData([]);
    setFechaInicio("");
    setFechaFin("");
    setError(null);
    setCategoriaActiva("Todas");
    setYaGenero(false);
  };

  const formatFecha = (fecha) => dayjs(fecha).format("DD/MM/YYYY HH:mm");

  const generatePDF = () => {
    if (filteredData.length === 0 && reporteData.length === 0) {
      setError("No hay datos para generar el reporte");
      return;
    }

    setGeneratingPDF(true);
    setError(null);

    try {
      const doc = new jsPDF("portrait", "pt", "a4");
      const dataToExport = filteredData.length > 0 ? filteredData : reporteData;
      const sucursalNombre = sucursales.find((s) => s.idSucursal === selectedSucursal)?.nombreSucursal || selectedSucursal;
      const today = new Date();
      const dateStr = today.toLocaleDateString("es-GT") + " " + today.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });

      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text("REPORTE DE HISTORIAL DE STOCK", doc.internal.pageSize.getWidth() / 2, 40, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${dateStr}`, doc.internal.pageSize.getWidth() / 2, 60, { align: "center" });

      doc.setFontSize(12);
      doc.text(`Producto: ${selectedProducto?.label || "No especificado"}`, 40, 80);
      doc.text(`Sucursal: ${sucursalNombre}`, 40, 95);

      if (fechaInicio || fechaFin) {
        doc.text(
          `Rango de fechas: ${fechaInicio ? dayjs(fechaInicio).format("DD/MM/YYYY") : "Inicio no especificado"} - ${
            fechaFin ? dayjs(fechaFin).format("DD/MM/YYYY") : "Fin no especificado"
          }`,
          40,
          110
        );
      }

      const tableData = dataToExport.map((item) => [
        dayjs(item.fechaMovimiento).format("DD/MM/YYYY HH:mm"),
        item.tipoMovimiento,
        item.cantidad,
        `Ant: ${item.stockAnterior}\nMov: ${item.tipoMovimiento === "INGRESO" ? "+" : "-"}${item.cantidad}\nNvo: ${item.stockNuevo}`,
        item.nombreUsuario,
        item.observaciones || "N/A",
      ]);

      autoTable(doc, {
        startY: 130,
        head: [["Fecha", "Movimiento", "Cantidad", "Stock", "Usuario", "Observaciones"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [246, 253, 245] },
        styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
        columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 60 }, 2: { cellWidth: 40 }, 3: { cellWidth: 60 }, 4: { cellWidth: 60 }, 5: { cellWidth: "auto" } },
        margin: { horizontal: 20 },
        didDrawPage: function () {
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text(`Página ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 20, {
            align: "center",
          });
        },
      });

      doc.save(`historial-stock-${dateStr.replace(/\//g, "-").replace(/:/g, "-").replace(" ", "_")}.pdf`);
    } catch (err) {
      setError("Error al generar el PDF: " + err.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const generateExcel = () => {
    if (filteredData.length === 0 && reporteData.length === 0) {
      setError("No hay datos para generar el reporte");
      return;
    }

    setGeneratingExcel(true);
    setError(null);

    try {
      const dataToExport = filteredData.length > 0 ? filteredData : reporteData;
      const sucursalNombre = sucursales.find((s) => s.idSucursal === selectedSucursal)?.nombreSucursal || selectedSucursal;
      const today = new Date();
      const dateStr = today.toLocaleDateString("es-GT") + " " + today.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });

      const excelData = dataToExport.map((item) => ({
        Fecha: dayjs(item.fechaMovimiento).format("DD/MM/YYYY HH:mm"),
        "Tipo Movimiento": item.tipoMovimiento,
        Cantidad: item.cantidad,
        "Stock Anterior": item.stockAnterior,
        Movimiento: item.tipoMovimiento === "INGRESO" ? `+${item.cantidad}` : `-${item.cantidad}`,
        "Stock Nuevo": item.stockNuevo,
        Usuario: item.nombreUsuario,
        Observaciones: item.observaciones || "N/A",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([]);

      ws["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 30 }];

      const reportInfo = [
        ["REPORTE DE HISTORIAL DE STOCK"],
        [`Generado el: ${dateStr}`],
        [`Producto: ${selectedProducto?.label || "No especificado"}`],
        [`Sucursal: ${sucursalNombre}`],
        [],
      ];

      if (fechaInicio || fechaFin) {
        reportInfo.push([
          `Rango de fechas: ${fechaInicio ? dayjs(fechaInicio).format("DD/MM/YYYY") : "Inicio no especificado"} - ${
            fechaFin ? dayjs(fechaFin).format("DD/MM/YYYY") : "Fin no especificado"
          }`,
        ]);
        reportInfo.push([]);
      }

      XLSX.utils.sheet_add_aoa(ws, reportInfo, { origin: "A1" });

      const merges = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } },
      ];

      if (fechaInicio || fechaFin) {
        merges.push({ s: { r: 4, c: 0 }, e: { r: 4, c: 7 } });
        merges.push({ s: { r: 5, c: 0 }, e: { r: 5, c: 7 } });
      }
      ws["!merges"] = merges;

      const headers = Object.keys(excelData[0] || {});
      const headerRow = reportInfo.length;
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: XLSX.utils.encode_row(headerRow) });

      headers.forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: colIndex });
        ws[cellRef] = ws[cellRef] || { t: "s" };
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "10B981" } },
          alignment: { horizontal: "center" },
        };
      });

      XLSX.utils.sheet_add_json(ws, excelData, { header: headers, skipHeader: true, origin: XLSX.utils.encode_row(headerRow + 1) });

      excelData.forEach((row, rowIndex) => {
        const dataRow = headerRow + 1 + rowIndex;

        const tipoCell = XLSX.utils.encode_cell({ r: dataRow, c: 1 });
        ws[tipoCell] = ws[tipoCell] || { t: "s" };
        ws[tipoCell].s = {
          font: { bold: true, color: { rgb: row["Tipo Movimiento"] === "INGRESO" ? "007F00" : "FF0000" } },
          fill: { fgColor: { rgb: row["Tipo Movimiento"] === "INGRESO" ? "C6EFCE" : "FFC7CE" } },
        };

        const movCell = XLSX.utils.encode_cell({ r: dataRow, c: 4 });
        ws[movCell] = ws[movCell] || { t: "s" };
        ws[movCell].s = { font: { bold: true, color: { rgb: row["Tipo Movimiento"] === "INGRESO" ? "007F00" : "FF0000" } } };
      });

      XLSX.utils.book_append_sheet(wb, ws, "Historial Stock");

      const fileName = `Historial_Stock_${selectedProducto?.label || "Producto"}_${dateStr.replace(/\//g, "-").replace(/:/g, "-").replace(" ", "_")}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      setError("Error al generar el Excel: " + err.message);
    } finally {
      setGeneratingExcel(false);
    }
  };

  const isFormValid = selectedProducto && selectedSucursal && fechaInicio && fechaFin;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/reportes")}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiFileText size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Historial de Stock</h1>
          <p className="text-sm text-muted">Consulta los movimientos de inventario</p>
        </div>
      </header>

      {error && <Alert type="danger" title="No se pudo completar" message={error} onDismiss={() => setError(null)} />}
      {showErrorProductos && <Alert type="danger" title="No se pudieron cargar los productos" />}
      {showErrorSucursales && <Alert type="danger" title="No se pudieron cargar las sucursales" />}

      {/* ── Filtros ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-ink">Filtros de búsqueda</h2>

        {/* Categorías como chips */}
        <div className="mb-4 flex flex-wrap gap-2">
          {categorias.map((categoria) => (
            <button
              key={categoria}
              type="button"
              onClick={() => {
                setCategoriaActiva(categoria);
                setSelectedProducto(null);
              }}
              className={`shrink-0 rounded-full border-0 px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                categoriaActiva === categoria
                  ? "bg-brand-600 text-white shadow-brand"
                  : "bg-surface-2 text-muted hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {categoria}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Producto */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Producto *</label>
            <div className="relative">
              <FiSearch size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <select
                value={selectedProducto?.value || ""}
                disabled={loadigProducts || productosFiltrados.length === 0}
                onChange={(e) => {
                  const producto = productosFiltrados.find((p) => p.idProducto === Number(e.target.value));
                  setSelectedProducto(producto ? { value: producto.idProducto, label: producto.nombreProducto } : null);
                }}
                className={selectClass}
              >
                <option value="">Seleccionar producto</option>
                {productosFiltrados.map((producto) => (
                  <option key={producto.idProducto} value={producto.idProducto}>
                    {producto.nombreProducto}
                  </option>
                ))}
              </select>
              <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
            {loadigProducts && <p className="mt-1 text-2xs text-muted">Cargando productos...</p>}
            {productosFiltrados.length === 0 && !loadigProducts && <p className="mt-1 text-2xs text-muted">No hay productos en esta categoría</p>}
          </div>

          {/* Sucursal */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Sucursal *</label>
            {userData?.idRol === 1 ? (
              <div className="relative">
                <FiFilter size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <select
                  value={selectedSucursal}
                  onChange={(e) => setSelectedSucursal(e.target.value)}
                  disabled={loadingSucursales}
                  className={selectClass}
                >
                  <option value="">Seleccionar sucursal</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.idSucursal} value={sucursal.idSucursal}>
                      {sucursal.nombreSucursal}
                    </option>
                  ))}
                </select>
                <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            ) : (
              <div className="flex items-center rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-muted">
                {sucursales.find((s) => s.idSucursal === userData?.idSucursal)?.nombreSucursal || "Tu sucursal"}
              </div>
            )}
            {loadingSucursales && <p className="mt-1 text-2xs text-muted">Cargando sucursales...</p>}
          </div>

          {/* Fecha inicio */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Fecha inicio *</label>
            <div className="relative">
              <FiCalendar size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="date"
                value={fechaInicio}
                max={fechaFin || dayjs().format("YYYY-MM-DD")}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-sm text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </div>
          </div>

          {/* Fecha fin */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Fecha fin *</label>
            <div className="relative">
              <FiCalendar size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="date"
                value={fechaFin}
                min={fechaInicio}
                max={dayjs().format("YYYY-MM-DD")}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-sm text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:bg-surface-2"
            aria-label="Limpiar filtros"
            title="Limpiar filtros"
          >
            <FiRefreshCw size={16} />
          </button>
          <button
            type="button"
            onClick={handleGenerarReporte}
            disabled={!isFormValid || loadingReporte}
            className={`flex items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold transition-colors ${
              !isFormValid || loadingReporte
                ? "cursor-not-allowed bg-surface-2 text-muted"
                : "bg-brand-600 text-white shadow-brand hover:bg-brand-500"
            }`}
          >
            {loadingReporte ? (
              <>
                <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                Generando...
              </>
            ) : (
              <>
                <FiFilter size={15} /> Generar reporte
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Botones de exportación ───────────────────────────────────── */}
      {filteredData.length > 0 && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={generateExcel}
            disabled={generatingExcel}
            className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-card transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generatingExcel ? (
              <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-brand-300 border-t-brand-600" />
            ) : (
              <FiDownload size={14} />
            )}
            Excel
          </button>
          <button
            type="button"
            onClick={generatePDF}
            disabled={generatingPDF}
            className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-card transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generatingPDF ? (
              <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-danger-300 border-t-danger-600" />
            ) : (
              <FiDownload size={14} />
            )}
            PDF
          </button>
        </div>
      )}

      {/* ── Resultados ───────────────────────────────────────────────── */}
      {filteredData.length > 0 ? (
        <>
          {/* Desktop: tabla */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-surface-2/95">
                  <tr>
                    <th className="whitespace-nowrap border-b border-line px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Fecha</th>
                    <th className="whitespace-nowrap border-b border-line px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">Movimiento</th>
                    <th className="whitespace-nowrap border-b border-line px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">Stock</th>
                    <th className="whitespace-nowrap border-b border-line px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Usuario</th>
                    <th className="whitespace-nowrap border-b border-line px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, i) => {
                    const esIngreso = item.tipoMovimiento === "INGRESO";
                    return (
                      <tr
                        key={item.idHistorial}
                        className={`border-b border-line last:border-0 transition-colors hover:bg-brand-50/50 ${i % 2 === 1 ? "bg-surface-2/30" : ""}`}
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-ink">{formatFecha(item.fechaMovimiento)}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              esIngreso ? "bg-brand-50 text-brand-700" : "bg-danger-50 text-danger-700"
                            }`}
                          >
                            {esIngreso ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                            {item.tipoMovimiento}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center text-xs text-ink">
                          <span className="text-muted">{item.stockAnterior}</span>
                          <span className={`mx-1 font-semibold ${esIngreso ? "text-brand-700" : "text-danger-700"}`}>
                            {esIngreso ? "+" : "-"}
                            {item.cantidad}
                          </span>
                          <FiChevronDown size={10} className="-rotate-90 inline text-muted" />
                          <span className="ml-1 font-bold">{item.stockNuevo}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-ink">
                          <span className="flex items-center gap-1.5">
                            <FiUser size={12} className="text-muted" /> {item.nombreUsuario}
                          </span>
                        </td>
                        <td className="max-w-xs px-4 py-3 text-muted">{item.observaciones || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Móvil: lista */}
          <ul className="flex flex-col gap-3 sm:hidden">
            {filteredData.map((item) => {
              const esIngreso = item.tipoMovimiento === "INGRESO";
              return (
                <li key={item.idHistorial} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          esIngreso ? "bg-brand-50 text-brand-600" : "bg-danger-50 text-danger-600"
                        }`}
                      >
                        {esIngreso ? <FiTrendingUp size={17} /> : <FiTrendingDown size={17} />}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${esIngreso ? "text-brand-700" : "text-danger-700"}`}>
                          {item.tipoMovimiento} {esIngreso ? "+" : "-"}
                          {item.cantidad}
                        </p>
                        <p className="text-xs text-muted">{formatFecha(item.fechaMovimiento)}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-right text-xs text-muted">
                      {item.stockAnterior} → <span className="font-bold text-ink">{item.stockNuevo}</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-line bg-surface-2/40 px-4 py-3 text-xs">
                    <p className="flex items-center gap-1.5 text-ink">
                      <FiUser size={12} className="text-muted" /> {item.nombreUsuario}
                    </p>
                    {item.observaciones && <p className="text-muted">{item.observaciones}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : yaGenero && !loadingReporte ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiCalendar size={20} />
          </span>
          <p className="text-sm font-medium text-ink">No hay datos para el rango de fechas seleccionado</p>
          <p className="text-xs text-muted">Ajusta las fechas o limpia los filtros para ver otros datos.</p>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500"
          >
            <FiRefreshCw size={14} /> Limpiar filtros
          </button>
        </div>
      ) : (
        !showErrorProductos &&
        !showErrorSucursales && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
            {loadingReporte ? (
              <>
                <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
                <p className="text-sm text-muted">Generando reporte...</p>
              </>
            ) : (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
                  <FiInbox size={20} />
                </span>
                <p className="text-sm font-medium text-ink">No hay datos para mostrar</p>
                <p className="text-xs text-muted">Completa todos los campos para generar el reporte.</p>
              </>
            )}
          </div>
        )
      )}
    </div>
  );
}

export default HistorialStock;