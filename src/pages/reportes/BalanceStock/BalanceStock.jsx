import React, { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiFilter,
  FiMinus,
  FiPackage,
  FiRefreshCw,
  FiTrendingDown,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { generarReporteBalanceStockService } from "../../../services/reportes/reportes.service";
import { getUserData } from "../../../utils/Auth/decodedata";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const BalanceStockPage = () => {
  const navigate = useNavigate();
  const { sucursales, loadingSucursales, showErrorSucursales } =
    useGetSucursales();

  const userData = getUserData();

  const [selectedSucursal, setSelectedSucursal] = useState("");
  const [balanceStock, setBalanceStock] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState(null);

  const [fecha, setFecha] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedTurno, setSelectedTurno] = useState("TODOS");

  const [activeProducto, setActiveProducto] = useState(null);

  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);

  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // ---------------------------------------------------------
  // Sucursal automática para usuarios no administradores
  // ---------------------------------------------------------
  useEffect(() => {
    if (!loadingSucursales && sucursales.length > 0) {
      if (userData?.idRol !== 1) {
        const sucursalUsuario = sucursales.find(
          (s) => s.idSucursal === userData.idSucursal
        );

        if (sucursalUsuario) {
          setSelectedSucursal(sucursalUsuario.idSucursal);
        }
      }
    }
  }, [loadingSucursales, sucursales, userData]);

  // ---------------------------------------------------------
  // Filtrado por turno
  // ---------------------------------------------------------
  useEffect(() => {
    if (selectedTurno === "TODOS") {
      setFilteredData(balanceStock);
    } else {
      setFilteredData(
        balanceStock.filter(
          (producto) => producto.turno === selectedTurno
        )
      );
    }
  }, [selectedTurno, balanceStock]);

  // ---------------------------------------------------------
  // Generar reporte
  // ---------------------------------------------------------
  const handleGenerarReporte = async () => {
    if (!fecha) {
      setError("Debes seleccionar una fecha.");
      return;
    }

    if (!selectedSucursal) {
      setError("Debes seleccionar una sucursal.");
      return;
    }

    if (!selectedTurno) {
      setError("Debes seleccionar un turno.");
      return;
    }

    setError(null);
    setLoadingReporte(true);

    try {
      const data = await generarReporteBalanceStockService(
        fecha,
        selectedSucursal,
        selectedTurno === "TODOS" ? "" : selectedTurno
      );

      const reporte = data?.reporte || [];

      setBalanceStock(reporte);
      setFilteredData(reporte);
      setActiveProducto(null);
    } catch (err) {
      setError(
        "No fue posible generar el reporte. " +
          (err?.message || "Intenta nuevamente.")
      );
    } finally {
      setLoadingReporte(false);
    }
  };

  // ---------------------------------------------------------
  // Reset
  // ---------------------------------------------------------
  const handleReset = () => {
    setFecha(dayjs().format("YYYY-MM-DD"));
    setSelectedTurno("TODOS");

    if (!loadingSucursales && sucursales.length > 0) {
      if (userData?.idRol !== 1) {
        const sucursalUsuario = sucursales.find(
          (s) => s.idSucursal === userData?.idSucursal
        );

        if (sucursalUsuario) {
          setSelectedSucursal(sucursalUsuario.idSucursal);
        }
      } else {
        setSelectedSucursal("");
      }
    }

    setBalanceStock([]);
    setFilteredData([]);
    setError(null);
    setActiveProducto(null);
  };

  // ---------------------------------------------------------
  // Totales
  // ---------------------------------------------------------
  const totals = useMemo(() => {
    return {
      productos: filteredData.length,

      producidas: filteredData.reduce(
        (sum, producto) =>
          sum + Number(producto.unidadesProducidas || 0),
        0
      ),

      vendidas: filteredData.reduce(
        (sum, producto) =>
          sum + Number(producto.unidadesVendidas || 0),
        0
      ),

      descontadas: filteredData.reduce(
        (sum, producto) =>
          sum + Number(producto.unidadesDescontadas || 0),
        0
      ),

      stock: filteredData.reduce(
        (sum, producto) =>
          sum + Number(producto.stockDisponible || 0),
        0
      ),
    };
  }, [filteredData]);

  // ---------------------------------------------------------
  // Stock helpers
  // ---------------------------------------------------------
  const getStockState = (stock) => {
    const value = Number(stock || 0);

    if (value > 0) {
      return {
        text: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        border: "border-emerald-100 dark:border-emerald-500/20",
        icon: <FiTrendingUp />,
        label: "Disponible",
      };
    }

    if (value < 0) {
      return {
        text: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-500/10",
        border: "border-red-100 dark:border-red-500/20",
        icon: <FiTrendingDown />,
        label: "Stock negativo",
      };
    }

    return {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-100 dark:border-amber-500/20",
      icon: <FiMinus />,
      label: "Sin stock",
    };
  };

  // ---------------------------------------------------------
  // Turno
  // ---------------------------------------------------------
  const renderTurno = (turno) => {
    const styles =
      turno === "AM"
        ? "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20"
        : "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20";

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles}`}
      >
        {turno}
      </span>
    );
  };

  // ---------------------------------------------------------
  // Producto
  // ---------------------------------------------------------
  const getProductKey = (producto) =>
    `${producto.idProducto}-${producto.turno}`;

  const toggleProducto = (producto) => {
    const key = getProductKey(producto);

    setActiveProducto((current) =>
      current === key ? null : key
    );
  };

  // ---------------------------------------------------------
  // Modal
  // ---------------------------------------------------------
  const handleVerDetalle = (producto) => {
    setProductoSeleccionado(producto);
    setShowDetalleModal(true);
  };

  const handleCloseDetalleModal = () => {
    setShowDetalleModal(false);
    setProductoSeleccionado(null);
  };

  // ---------------------------------------------------------
  // Export PDF
  // ---------------------------------------------------------
  const generatePDF = () => {
    if (filteredData.length === 0) {
      setError("No hay datos para generar el reporte.");
      return;
    }

    setGeneratingPDF(true);
    setError(null);

    try {
      const doc = new jsPDF("portrait", "pt", "a4");

      const sucursalNombre =
        sucursales.find(
          (s) => s.idSucursal == selectedSucursal
        )?.nombreSucursal || "Sucursal no especificada";

      const today = new Date();

      const dateStr =
        today.toLocaleDateString("es-GT") +
        " " +
        today.toLocaleTimeString("es-GT", {
          hour: "2-digit",
          minute: "2-digit",
        });

      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");

      doc.text(
        "REPORTE DE BALANCE DE STOCK",
        doc.internal.pageSize.getWidth() / 2,
        40,
        {
          align: "center",
        }
      );

      doc.setFontSize(10);
      doc.setTextColor(100);

      doc.text(
        `Generado el: ${dateStr}`,
        doc.internal.pageSize.getWidth() / 2,
        60,
        {
          align: "center",
        }
      );

      doc.setFontSize(11);

      doc.text(`Sucursal: ${sucursalNombre}`, 40, 82);
      doc.text(
        `Fecha: ${dayjs(fecha).format("DD/MM/YYYY")}`,
        40,
        98
      );
      doc.text(`Turno: ${selectedTurno}`, 40, 114);

      const tableData = filteredData.map((producto) => [
        producto.nombreProducto,
        producto.turno,
        String(producto.unidadesProducidas),
        String(producto.unidadesVendidas),
        String(producto.unidadesDescontadas),
        String(producto.stockDisponible),
      ]);

      autoTable(doc, {
        startY: 135,

        head: [
          [
            "Producto",
            "Turno",
            "Producidas",
            "Vendidas",
            "Descontadas",
            "Stock",
          ],
        ],

        body: tableData,

        theme: "grid",

        headStyles: {
          fillColor: [52, 152, 219],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },

        styles: {
          fontSize: 8,
          cellPadding: 4,
          overflow: "linebreak",
        },

        margin: {
          horizontal: 40,
        },
      });

      const finalY = doc.lastAutoTable.finalY + 25;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");

      doc.text("TOTALES", 40, finalY);

      doc.setFont("helvetica", "normal");

      doc.text(`Productos: ${totals.productos}`, 40, finalY + 18);
      doc.text(`Producidas: ${totals.producidas}`, 150, finalY + 18);
      doc.text(`Vendidas: ${totals.vendidas}`, 260, finalY + 18);
      doc.text(`Descontadas: ${totals.descontadas}`, 360, finalY + 18);
      doc.text(`Stock: ${totals.stock}`, 490, finalY + 18);

      const safeSucursal = sucursalNombre.replace(/\s+/g, "_");

      const safeDate = dateStr
        .replace(/\//g, "-")
        .replace(/:/g, "-")
        .replace(" ", "_");

      doc.save(
        `reporte-balance-stock-${safeSucursal}-${safeDate}.pdf`
      );
    } catch (err) {
      setError(
        "Error al generar el PDF: " +
          (err?.message || "Error desconocido.")
      );
    } finally {
      setGeneratingPDF(false);
    }
  };

  // ---------------------------------------------------------
  // Export Excel
  // ---------------------------------------------------------
  const generateExcel = () => {
    if (filteredData.length === 0) {
      setError("No hay datos para generar el reporte.");
      return;
    }

    setGeneratingExcel(true);
    setError(null);

    try {
      const sucursalNombre =
        sucursales.find(
          (s) => s.idSucursal == selectedSucursal
        )?.nombreSucursal || "Sucursal no especificada";

      const today = new Date();

      const dateStr =
        today.toLocaleDateString("es-GT") +
        " " +
        today.toLocaleTimeString("es-GT", {
          hour: "2-digit",
          minute: "2-digit",
        });

      const wb = XLSX.utils.book_new();

      const mainData = [
        ["REPORTE DE BALANCE DE STOCK"],
        [`Generado el: ${dateStr}`],
        [`Sucursal: ${sucursalNombre}`],
        [`Fecha: ${dayjs(fecha).format("DD/MM/YYYY")}`],
        [`Turno: ${selectedTurno}`],
        [],
        [
          "Producto",
          "Turno",
          "Unidades Producidas",
          "Unidades Vendidas",
          "Unidades Descontadas",
          "Stock Disponible",
        ],
      ];

      filteredData.forEach((producto) => {
        mainData.push([
          producto.nombreProducto,
          producto.turno,
          producto.unidadesProducidas,
          producto.unidadesVendidas,
          producto.unidadesDescontadas,
          producto.stockDisponible,
        ]);
      });

      mainData.push([]);

      mainData.push([
        "TOTALES",
        "",
        totals.producidas,
        totals.vendidas,
        totals.descontadas,
        totals.stock,
      ]);

      mainData.push([
        `Total productos: ${totals.productos}`,
      ]);

      const ws = XLSX.utils.aoa_to_sheet(mainData);

      ws["!cols"] = [
        { wch: 35 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 22 },
        { wch: 18 },
      ];

      ["A1", "A7"].forEach((cell) => {
        if (ws[cell]) {
          ws[cell].s = {
            font: {
              bold: true,
              color: {
                rgb: "FFFFFF",
              },
            },
            fill: {
              fgColor: {
                rgb: "3498DB",
              },
            },
          };
        }
      });

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Balance Stock"
      );

      const safeSucursal = sucursalNombre.replace(/\s+/g, "_");

      const safeDate = dateStr
        .replace(/\//g, "-")
        .replace(/:/g, "-")
        .replace(" ", "_");

      XLSX.writeFile(
        wb,
        `Reporte_Balance_Stock_${safeSucursal}_${safeDate}.xlsx`
      );
    } catch (err) {
      setError(
        "Error al generar el Excel: " +
          (err?.message || "Error desconocido.")
      );

      console.error("Error detallado:", err);
    } finally {
      setGeneratingExcel(false);
    }
  };

  const sucursalNombre =
    sucursales.find(
      (s) => s.idSucursal == selectedSucursal
    )?.nombreSucursal || "Tu sucursal";

  return (
    <div className="min-h-screen bg-bg px-4 py-5 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <header className="mb-7">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate("/reportes")}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted shadow-card transition hover:border-brand-300 hover:text-brand-600"
              aria-label="Volver a reportes"
            >
              <FiArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Balance de Stock
                </h1>

                {balanceStock.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    Reporte generado
                  </span>
                )}
              </div>

              <p className="mt-1 max-w-2xl text-sm text-muted">
                Consulta la producción, ventas, descuentos y
                disponibilidad de inventario.
              </p>
            </div>
          </div>
        </header>

        {/* =====================================================
            FILTROS
        ====================================================== */}
        <section className="mb-6 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <FiFilter size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Configurar reporte
                </h2>

                <p className="text-xs text-muted">
                  Selecciona los parámetros de consulta
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-xs font-medium text-muted transition hover:border-brand-300 hover:text-brand-600"
            >
              <FiRefreshCw size={14} />
              <span className="hidden sm:inline">
                Restablecer
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {/* Fecha */}
            <div>
              <label
                htmlFor="fecha"
                className="mb-1.5 block text-xs font-semibold text-muted"
              >
                Fecha
              </label>

              <div className="relative">
                <FiCalendar
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  id="fecha"
                  type="date"
                  value={fecha}
                  max={dayjs().format("YYYY-MM-DD")}
                  onChange={(e) => setFecha(e.target.value)}
                  className="h-11 w-full rounded-xl border border-line bg-bg pl-10 pr-3 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Sucursal */}
            <div>
              <label
                htmlFor="sucursal"
                className="mb-1.5 block text-xs font-semibold text-muted"
              >
                Sucursal
              </label>

              {userData?.idRol === 1 ? (
                <select
                  id="sucursal"
                  value={selectedSucursal}
                  onChange={(e) =>
                    setSelectedSucursal(e.target.value)
                  }
                  disabled={
                    loadingSucursales ||
                    sucursales.length === 0
                  }
                  className="h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    Seleccionar sucursal
                  </option>

                  {sucursales.map((sucursal) => (
                    <option
                      key={sucursal.idSucursal}
                      value={sucursal.idSucursal}
                    >
                      {sucursal.nombreSucursal}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex h-11 items-center rounded-xl border border-line bg-bg px-3 text-sm text-ink">
                  {sucursalNombre}
                </div>
              )}

              {loadingSucursales && (
                <p className="mt-1.5 text-[11px] text-muted">
                  Cargando sucursales...
                </p>
              )}
            </div>

            {/* Turno */}
            <div>
              <label
                htmlFor="turno"
                className="mb-1.5 block text-xs font-semibold text-muted"
              >
                Turno
              </label>

              <select
                id="turno"
                value={selectedTurno}
                onChange={(e) =>
                  setSelectedTurno(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="TODOS">
                  Todos los turnos
                </option>
                <option value="AM">Turno AM</option>
                <option value="PM">Turno PM</option>
              </select>
            </div>

            {/* Generar */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleGenerarReporte}
                disabled={
                  !fecha ||
                  !selectedSucursal ||
                  !selectedTurno ||
                  loadingReporte
                }
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-500 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingReporte ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FiFilter size={16} />
                    Generar reporte
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            ERRORES
        ====================================================== */}
        {(error || showErrorSucursales) && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            <FiX className="mt-0.5 shrink-0" size={16} />

            <span>
              {error ||
                "No fue posible cargar las sucursales."}
            </span>
          </div>
        )}

        {/* =====================================================
            RESUMEN
        ====================================================== */}
        {balanceStock.length > 0 && (
          <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {/* Productos */}
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-muted">
                  Productos
                </span>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <FiPackage size={16} />
                </div>
              </div>

              <p className="text-2xl font-bold text-ink">
                {totals.productos}
              </p>

              <p className="mt-1 text-[11px] text-muted">
                Productos registrados
              </p>
            </div>

            {/* Producción */}
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-muted">
                  Producidas
                </span>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <FiTrendingUp size={16} />
                </div>
              </div>

              <p className="text-2xl font-bold text-ink">
                {totals.producidas}
              </p>

              <p className="mt-1 text-[11px] text-muted">
                Unidades producidas
              </p>
            </div>

            {/* Ventas */}
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-muted">
                  Vendidas
                </span>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                  <FiTrendingDown size={16} />
                </div>
              </div>

              <p className="text-2xl font-bold text-ink">
                {totals.vendidas}
              </p>

              <p className="mt-1 text-[11px] text-muted">
                Unidades vendidas
              </p>
            </div>

            {/* Stock */}
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-muted">
                  Stock
                </span>

                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    getStockState(totals.stock).bg
                  } ${getStockState(totals.stock).text}`}
                >
                  {getStockState(totals.stock).icon}
                </div>
              </div>

              <p
                className={`text-2xl font-bold ${
                  getStockState(totals.stock).text
                }`}
              >
                {totals.stock}
              </p>

              <p className="mt-1 text-[11px] text-muted">
                Unidades disponibles
              </p>
            </div>
          </section>
        )}

        {/* =====================================================
            EXPORTACIONES
        ====================================================== */}
        {balanceStock.length > 0 && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div className="px-1">
              <p className="text-sm font-semibold text-ink">
                Exportar reporte
              </p>

              <p className="text-xs text-muted">
                Descarga los datos actuales.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={generateExcel}
                disabled={
                  generatingExcel ||
                  filteredData.length === 0
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-bg px-3 text-xs font-semibold text-ink transition hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatingExcel ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
                ) : (
                  <FiDownload size={15} />
                )}

                Excel
              </button>

              <button
                type="button"
                onClick={generatePDF}
                disabled={
                  generatingPDF ||
                  filteredData.length === 0
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-bg px-3 text-xs font-semibold text-ink transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatingPDF ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                ) : (
                  <FiDownload size={15} />
                )}

                PDF
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            TABLA / PRODUCTOS
        ====================================================== */}
        <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          {filteredData.length > 0 ? (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-bg/60">
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                        Producto
                      </th>

                      <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
                        Turno
                      </th>

                      <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
                        Producidas
                      </th>

                      <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
                        Vendidas
                      </th>

                      <th className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
                        Descontadas
                      </th>

                      <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
                        Stock
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line">
                    {filteredData.map((producto) => {
                      const stockState = getStockState(
                        producto.stockDisponible
                      );

                      return (
                        <tr
                          key={getProductKey(producto)}
                          className="transition hover:bg-bg/50"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-sm font-semibold text-ink">
                                {producto.nombreProducto}
                              </p>

                              <p className="mt-0.5 text-[11px] text-muted">
                                ID #{producto.idProducto}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-center">
                            {renderTurno(producto.turno)}
                          </td>

                          <td className="px-4 py-4 text-center text-sm font-medium text-ink">
                            {producto.unidadesProducidas}
                          </td>

                          <td className="px-4 py-4 text-center text-sm font-medium text-ink">
                            {producto.unidadesVendidas}
                          </td>

                          <td className="px-4 py-4 text-center text-sm font-medium text-ink">
                            {producto.unidadesDescontadas}
                          </td>

                          <td className="px-5 py-4">
                            <div
                              className={`mx-auto flex w-fit items-center gap-2 rounded-lg border px-3 py-1.5 ${stockState.bg} ${stockState.border} ${stockState.text}`}
                            >
                              {React.cloneElement(
                                stockState.icon,
                                { size: 14 }
                              )}

                              <span className="text-sm font-bold">
                                {producto.stockDisponible}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-line md:hidden">
                {filteredData.map((producto) => {
                  const key = getProductKey(producto);
                  const isOpen = activeProducto === key;
                  const stockState = getStockState(
                    producto.stockDisponible
                  );

                  return (
                    <div key={key}>
                      <button
                        type="button"
                        onClick={() =>
                          toggleProducto(producto)
                        }
                        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition active:bg-bg"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-ink">
                              {producto.nombreProducto}
                            </span>

                            {renderTurno(producto.turno)}
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${stockState.bg} ${stockState.text}`}
                            >
                              {React.cloneElement(
                                stockState.icon,
                                { size: 12 }
                              )}

                              {producto.stockDisponible}
                            </span>

                            <span className="text-[11px] text-muted">
                              Stock disponible
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 text-muted">
                          {isOpen ? (
                            <FiChevronUp size={18} />
                          ) : (
                            <FiChevronDown size={18} />
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-line bg-bg/40 px-4 pb-4 pt-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-line bg-surface p-3">
                              <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted">
                                Producidas
                              </span>

                              <span className="mt-1 block text-lg font-bold text-ink">
                                {producto.unidadesProducidas}
                              </span>
                            </div>

                            <div className="rounded-xl border border-line bg-surface p-3">
                              <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted">
                                Vendidas
                              </span>

                              <span className="mt-1 block text-lg font-bold text-ink">
                                {producto.unidadesVendidas}
                              </span>
                            </div>

                            <div className="rounded-xl border border-line bg-surface p-3">
                              <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted">
                                Descontadas
                              </span>

                              <span className="mt-1 block text-lg font-bold text-ink">
                                {producto.unidadesDescontadas}
                              </span>
                            </div>

                            <div
                              className={`rounded-xl border p-3 ${stockState.bg} ${stockState.border}`}
                            >
                              <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-70">
                                Stock
                              </span>

                              <span
                                className={`mt-1 block text-lg font-bold ${stockState.text}`}
                              >
                                {producto.stockDisponible}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleVerDetalle(producto)
                            }
                            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface text-xs font-semibold text-muted transition hover:border-brand-300 hover:text-brand-600"
                          >
                            <FiPackage size={14} />
                            Ver detalle
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : balanceStock.length > 0 &&
            filteredData.length === 0 ? (
            /* Sin resultados */
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <FiFilter size={24} />
              </div>

              <h3 className="text-sm font-semibold text-ink">
                No hay resultados
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">
                No encontramos productos para el turno
                seleccionado.
              </p>
            </div>
          ) : (
            /* Estado inicial */
            <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
              {loadingReporte ? (
                <>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
                  </div>

                  <h3 className="text-sm font-semibold text-ink">
                    Generando reporte
                  </h3>

                  <p className="mt-1 text-xs text-muted">
                    Estamos preparando la información...
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <FiPackage size={24} />
                  </div>

                  <h3 className="text-sm font-semibold text-ink">
                    Sin reporte todavía
                  </h3>

                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">
                    Selecciona una fecha, sucursal y turno para
                    consultar el balance de stock.
                  </p>

                  <button
                    type="button"
                    onClick={handleGenerarReporte}
                    disabled={
                      !fecha ||
                      !selectedSucursal ||
                      loadingReporte
                    }
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-xs font-semibold text-white shadow-brand transition hover:bg-brand-500 disabled:opacity-50"
                  >
                    <FiFilter size={14} />
                    Generar reporte
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* =====================================================
            FOOTER DEL REPORTE
        ====================================================== */}
        {filteredData.length > 0 && (
          <div className="mt-3 flex flex-col gap-1 px-1 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>
              Mostrando {filteredData.length} producto
              {filteredData.length !== 1 ? "s" : ""}
            </span>

            <span>
              {dayjs(fecha).format("DD/MM/YYYY")} ·{" "}
              {sucursalNombre}
            </span>
          </div>
        )}
      </div>

      {/* =====================================================
          MODAL DETALLE
      ====================================================== */}
      {showDetalleModal && productoSeleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseDetalleModal();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-surface shadow-modal">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <FiPackage size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink">
                    Detalle de producto
                  </h2>

                  <p className="text-xs text-muted">
                    {productoSeleccionado.nombreProducto}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDetalleModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-bg hover:text-ink"
                aria-label="Cerrar"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-5">
              {/* Información principal */}
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-bg p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    Producto
                  </span>

                  <p className="mt-1 text-sm font-semibold text-ink">
                    {productoSeleccionado.nombreProducto}
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-bg p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    Turno
                  </span>

                  <div className="mt-2">
                    {renderTurno(
                      productoSeleccionado.turno
                    )}
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-line bg-bg p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    Producidas
                  </span>

                  <p className="mt-2 text-xl font-bold text-ink">
                    {
                      productoSeleccionado.unidadesProducidas
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-bg p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    Vendidas
                  </span>

                  <p className="mt-2 text-xl font-bold text-ink">
                    {productoSeleccionado.unidadesVendidas}
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-bg p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    Descontadas
                  </span>

                  <p className="mt-2 text-xl font-bold text-ink">
                    {
                      productoSeleccionado.unidadesDescontadas
                    }
                  </p>
                </div>

                <div
                  className={`rounded-xl border p-4 ${
                    getStockState(
                      productoSeleccionado.stockDisponible
                    ).bg
                  } ${
                    getStockState(
                      productoSeleccionado.stockDisponible
                    ).border
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                    Stock
                  </span>

                  <p
                    className={`mt-2 text-xl font-bold ${
                      getStockState(
                        productoSeleccionado.stockDisponible
                      ).text
                    }`}
                  >
                    {productoSeleccionado.stockDisponible}
                  </p>
                </div>
              </div>

              {/* Resumen de movimientos */}
              <div className="mt-5 overflow-hidden rounded-xl border border-line">
                <div className="border-b border-line bg-bg px-4 py-3">
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-ink">
                    <FiTrendingUp
                      className="text-brand-600"
                      size={15}
                    />
                    Resumen de movimientos
                  </h3>
                </div>

                <div className="divide-y divide-line">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-muted">
                      Entradas · Producción
                    </span>

                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +
                      {
                        productoSeleccionado.unidadesProducidas
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-muted">
                      Salidas · Ventas
                    </span>

                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      -
                      {
                        productoSeleccionado.unidadesVendidas
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-muted">
                      Descuentos
                    </span>

                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      -
                      {
                        productoSeleccionado.unidadesDescontadas
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-bg px-4 py-4">
                    <span className="text-xs font-semibold text-ink">
                      Stock final
                    </span>

                    <span
                      className={`text-lg font-bold ${
                        getStockState(
                          productoSeleccionado.stockDisponible
                        ).text
                      }`}
                    >
                      {productoSeleccionado.stockDisponible}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-line px-5 py-4">
              <button
                type="button"
                onClick={handleCloseDetalleModal}
                className="h-10 rounded-xl border border-line bg-bg px-4 text-xs font-semibold text-muted transition hover:border-brand-300 hover:text-brand-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceStockPage;