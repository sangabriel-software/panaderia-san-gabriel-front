import React, { useEffect, useState } from "react";
import {
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiPackage,
  FiUser,
  FiClock,
  FiLayers,
  FiHash,
} from "react-icons/fi";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { generarReporteSobranteStockService } from "../../../services/reportes/reportes.service";
import { getUserData } from "../../../utils/Auth/decodedata";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const SobrantesReport = () => {
  const navigate = useNavigate();

  const {
    sucursales,
    loadingSucursales,
    showErrorSucursales,
  } = useGetSucursales();

  const userData = getUserData();

  const [selectedSucursal, setSelectedSucursal] = useState("");
  const [sobrantesData, setSobrantesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState(null);
  const [fecha, setFecha] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [activeVenta, setActiveVenta] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState("Todos");

  useEffect(() => {
    if (!loadingSucursales && sucursales.length > 0) {
      if (userData?.idRol !== 1) {
        const sucursalUsuario = sucursales.find(
          (s) => s.idSucursal === userData?.idSucursal
        );

        if (sucursalUsuario) {
          setSelectedSucursal(sucursalUsuario.idSucursal);
        }
      }
    }
  }, [loadingSucursales, sucursales, userData]);

  useEffect(() => {
    if (selectedTurno === "Todos") {
      setFilteredData(sobrantesData);
    } else {
      const filtered = sobrantesData.filter(
        (venta) => venta.ventaTurno === selectedTurno
      );

      setFilteredData(filtered);
    }
  }, [selectedTurno, sobrantesData]);

  const handleGenerarReporte = async () => {
    if (!fecha) {
      setError("Debes seleccionar una fecha");
      return;
    }

    if (!selectedSucursal) {
      setError("Debes seleccionar una sucursal");
      return;
    }

    setError(null);
    setLoadingReporte(true);
    setSelectedTurno("Todos");
    setActiveVenta(null);

    try {
      const data = await generarReporteSobranteStockService(
        fecha,
        selectedSucursal
      );

      const reporte = data?.reporte || [];

      setSobrantesData(reporte);
      setFilteredData(reporte);
    } catch (err) {
      setError(
        "Error al generar el reporte: " +
          (err?.message || "Error desconocido")
      );
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleReset = () => {
    setFecha(dayjs().format("YYYY-MM-DD"));

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

    setSobrantesData([]);
    setFilteredData([]);
    setError(null);
    setActiveVenta(null);
    setSelectedTurno("Todos");
  };

  const formatFecha = (fechaVenta) => {
    return dayjs(fechaVenta).format("DD/MM/YYYY");
  };

  const toggleVenta = (idVenta) => {
    setActiveVenta((current) =>
      current === idVenta ? null : idVenta
    );
  };

  const calcularTotales = () => {
    const totalVentas = filteredData.length;

    const totalProductos = filteredData.reduce(
      (sum, venta) =>
        sum + (venta?.ventaDetalle?.length || 0),
      0
    );

    const totalUnidadesSobrantes = filteredData.reduce(
      (sum, venta) =>
        sum +
        (venta?.ventaDetalle || []).reduce(
          (prodSum, producto) =>
            prodSum + Number(producto.unidadesSobrantes || 0),
          0
        ),
      0
    );

    return {
      totalVentas,
      totalProductos,
      totalUnidadesSobrantes,
    };
  };

  const getSucursalNombre = () => {
    return (
      sucursales.find(
        (s) => s.idSucursal == selectedSucursal
      )?.nombreSucursal || "Sucursal no especificada"
    );
  };

  const generatePDF = () => {
    const dataToExport = filteredData;

    if (dataToExport.length === 0) {
      setError("No hay datos para generar el reporte");
      return;
    }

    setGeneratingPDF(true);
    setError(null);

    try {
      const doc = new jsPDF("portrait", "pt", "a4");

      const sucursalNombre = getSucursalNombre();

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
        "REPORTE DE PRODUCTOS SOBRANTES",
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

      doc.setFontSize(12);

      doc.text(
        `Sucursal: ${sucursalNombre}`,
        40,
        80
      );

      doc.text(
        `Fecha del reporte: ${dayjs(fecha).format(
          "DD/MM/YYYY"
        )}`,
        40,
        95
      );

      if (selectedTurno !== "Todos") {
        doc.text(
          `Turno: ${selectedTurno}`,
          40,
          110
        );
      }

      let currentY = 130;

      dataToExport.forEach((venta, index) => {
        if (index > 0) {
          doc.addPage();
          currentY = 40;
        }

        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.setFont("helvetica", "bold");

        doc.text(
          `VENTA #${venta.idVenta}`,
          doc.internal.pageSize.getWidth() / 2,
          currentY,
          {
            align: "center",
          }
        );

        currentY += 25;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        doc.text(
          `Sucursal: ${venta.nombreSucursal}`,
          40,
          currentY
        );

        doc.text(
          `Fecha Venta: ${formatFecha(
            venta.fechaVenta
          )}`,
          200,
          currentY
        );

        currentY += 15;

        doc.text(
          `Usuario: ${venta.usuario}`,
          40,
          currentY
        );

        doc.text(
          `Turno: ${venta.ventaTurno}`,
          200,
          currentY
        );

        currentY += 20;

        if (venta.ventaDetalle?.length > 0) {
          doc.setFont("helvetica", "bold");

          doc.text(
            "PRODUCTOS SOBRANTES:",
            40,
            currentY
          );

          currentY += 15;

          const productosData =
            venta.ventaDetalle.map((producto) => [
              producto.nombreProducto ||
                `Producto #${producto.idProducto}`,
              String(producto.unidadesSobrantes),
            ]);

          autoTable(doc, {
            startY: currentY,
            head: [["Producto", "Unidades Sobrantes"]],
            body: productosData,
            theme: "grid",
            headStyles: {
              fillColor: [52, 152, 219],
              textColor: 255,
              fontStyle: "bold",
              fontSize: 9,
            },
            alternateRowStyles: {
              fillColor: [250, 250, 250],
            },
            styles: {
              fontSize: 8,
              cellPadding: 4,
              overflow: "linebreak",
            },
            margin: {
              horizontal: 40,
            },
            tableWidth: "auto",
            pageBreak: "auto",
          });

          currentY =
            doc.lastAutoTable.finalY + 15;

          const totalUnidades =
            venta.ventaDetalle.reduce(
              (sum, prod) =>
                sum +
                Number(
                  prod.unidadesSobrantes || 0
                ),
              0
            );

          doc.setFontSize(9);
          doc.setTextColor(100);

          doc.text(
            `Total productos: ${venta.ventaDetalle.length}`,
            40,
            currentY
          );

          doc.text(
            `Total unidades sobrantes: ${totalUnidades}`,
            200,
            currentY
          );

          currentY += 20;
        }

        doc.setFontSize(8);
        doc.setTextColor(150);

        doc.text(
          `Página ${doc.internal.getNumberOfPages()} - Venta ${
            index + 1
          } de ${dataToExport.length}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 20,
          {
            align: "center",
          }
        );
      });

      doc.save(
        `reporte-productos-sobrantes-${sucursalNombre
          .replace(/\s+/g, "_")
          .replace(/[^\w-]/g, "")}-${dateStr
          .replace(/\//g, "-")
          .replace(/:/g, "-")
          .replace(" ", "_")}.pdf`
      );
    } catch (err) {
      setError(
        "Error al generar el PDF: " +
          (err?.message || "Error desconocido")
      );
    } finally {
      setGeneratingPDF(false);
    }
  };

  const generateExcel = () => {
    const dataToExport = filteredData;

    if (dataToExport.length === 0) {
      setError("No hay datos para generar el reporte");
      return;
    }

    setGeneratingExcel(true);
    setError(null);

    try {
      const sucursalNombre = getSucursalNombre();

      const today = new Date();

      const dateStr =
        today.toLocaleDateString("es-GT") +
        " " +
        today.toLocaleTimeString("es-GT", {
          hour: "2-digit",
          minute: "2-digit",
        });

      const wb = XLSX.utils.book_new();

      dataToExport.forEach((venta) => {
        const ventaData = [
          ["REPORTE DE PRODUCTOS SOBRANTES"],
          [`Generado el: ${dateStr}`],
          [`Sucursal: ${sucursalNombre}`],
          [
            `Fecha del reporte: ${dayjs(fecha).format(
              "DD/MM/YYYY"
            )}`,
          ],
          selectedTurno !== "Todos"
            ? [`Turno: ${selectedTurno}`]
            : [],
          [],
          ["DETALLE DE VENTA"],
          [`Venta #${venta.idVenta}`],
          [],
          ["INFORMACIÓN GENERAL"],
          [`ID Venta: ${venta.idVenta}`],
          [`Sucursal: ${venta.nombreSucursal}`],
          [
            `Fecha Venta: ${formatFecha(
              venta.fechaVenta
            )}`,
          ],
          [`Usuario: ${venta.usuario}`],
          [`Turno: ${venta.ventaTurno}`],
          [],
          ["PRODUCTOS SOBRANTES"],
          ["Producto", "Unidades Sobrantes"],
        ];

        venta.ventaDetalle.forEach((producto) => {
          ventaData.push([
            producto.nombreProducto ||
              `Producto #${producto.idProducto}`,
            producto.unidadesSobrantes,
          ]);
        });

        const totalUnidades =
          venta.ventaDetalle.reduce(
            (sum, prod) =>
              sum +
              Number(
                prod.unidadesSobrantes || 0
              ),
            0
          );

        ventaData.push([]);
        ventaData.push([
          "",
          "TOTAL UNIDADES:",
          totalUnidades,
        ]);

        ventaData.push([
          `Total productos: ${venta.ventaDetalle.length}`,
        ]);

        const wsVenta =
          XLSX.utils.aoa_to_sheet(ventaData);

        wsVenta["!cols"] = [
          { wch: 35 },
          { wch: 20 },
          { wch: 20 },
        ];

        ["A1", "A7", "A10", "A17"].forEach(
          (cell) => {
            if (wsVenta[cell]) {
              wsVenta[cell].s = {
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
          }
        );

        ["A17", "B17"].forEach((cell) => {
          if (wsVenta[cell]) {
            wsVenta[cell].s = {
              font: {
                bold: true,
                color: {
                  rgb: "FFFFFF",
                },
              },
              fill: {
                fgColor: {
                  rgb: "27AE60",
                },
              },
            };
          }
        });

        XLSX.utils.book_append_sheet(
          wb,
          wsVenta,
          `Venta ${venta.idVenta}`
        );
      });

      const fileName = `Reporte_Productos_Sobrantes_${sucursalNombre
        .replace(/\s+/g, "_")}_${dateStr
        .replace(/\//g, "-")
        .replace(/:/g, "-")
        .replace(" ", "_")}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (err) {
      setError(
        "Error al generar el Excel: " +
          (err?.message || "Error desconocido")
      );

      console.error("Error detallado:", err);
    } finally {
      setGeneratingExcel(false);
    }
  };

  const {
    totalVentas,
    totalProductos,
    totalUnidadesSobrantes,
  } = calcularTotales();

  const renderTurnoBadge = (turno) => {
    if (turno === "AM") {
      return (
        <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:border-sky-900/60 dark:bg-sky-900/30 dark:text-sky-400">
          AM
        </span>
      );
    }

    if (turno === "PM") {
      return (
        <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:border-violet-900/60 dark:bg-violet-900/30 dark:text-violet-400">
          PM
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
        {turno || "—"}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate("/reportes")}
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:border-brand-800 dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
          aria-label="Regresar"
        >
          <FiArrowLeft size={19} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              <FiPackage size={20} />
            </span>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Productos Sobrantes
              </h1>

              <p className="mt-0.5 text-sm text-muted">
                Consulta los productos sobrantes por sucursal,
                fecha y turno.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RESUMEN */}
      {sobrantesData.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <FiPackage size={19} />
              </div>

              <div>
                <p className="text-xs font-medium text-muted">
                  Ventas reportadas
                </p>

                <p className="mt-0.5 text-2xl font-bold text-ink">
                  {totalVentas}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400">
                <FiLayers size={19} />
              </div>

              <div>
                <p className="text-xs font-medium text-muted">
                  Total productos
                </p>

                <p className="mt-0.5 text-2xl font-bold text-ink">
                  {totalProductos}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <FiHash size={19} />
              </div>

              <div>
                <p className="text-xs font-medium text-muted">
                  Unidades sobrantes
                </p>

                <p className="mt-0.5 text-2xl font-bold text-ink">
                  {totalUnidadesSobrantes}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTROS */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <FiFilter size={15} />
          </span>

          <div>
            <h2 className="text-sm font-semibold text-ink">
              Filtros del reporte
            </h2>

            <p className="text-xs text-muted">
              Selecciona los parámetros para consultar la información.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* FECHA */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Fecha
            </label>

            <div className="relative">
              <FiCalendar
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                type="date"
                value={fecha}
                max={dayjs().format("YYYY-MM-DD")}
                onChange={(e) =>
                  setFecha(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm text-ink outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                onFocus={(e) => {
                  if (typeof e.target.showPicker === "function") {
                    e.target.showPicker();
                  }
                }}
              />
            </div>
          </div>

          {/* SUCURSAL */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Sucursal
            </label>

            {userData?.idRol === 1 ? (
              <select
                value={selectedSucursal}
                onChange={(e) =>
                  setSelectedSucursal(e.target.value)
                }
                disabled={
                  loadingSucursales ||
                  sucursales.length === 0
                }
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
              <input
                type="text"
                readOnly
                value={
                  sucursales.find(
                    (s) =>
                      s.idSucursal ===
                      userData?.idSucursal
                  )?.nombreSucursal ||
                  "Tu sucursal"
                }
                className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none"
              />
            )}

            {loadingSucursales && (
              <p className="mt-1.5 text-xs text-muted">
                Cargando sucursales...
              </p>
            )}

            {!loadingSucursales &&
              sucursales.length === 0 && (
                <p className="mt-1.5 text-xs text-danger-600 dark:text-danger-400">
                  No hay sucursales disponibles.
                </p>
              )}
          </div>

          {/* TURNO */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Turno
            </label>

            <select
              value={selectedTurno}
              onChange={(e) =>
                setSelectedTurno(e.target.value)
              }
              disabled={sobrantesData.length === 0}
              className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="Todos">
                Todos los turnos
              </option>

              <option value="AM">
                Turno AM
              </option>

              <option value="PM">
                Turno PM
              </option>
            </select>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="mt-4 flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-muted transition-all hover:bg-surface-2 hover:text-ink"
          >
            <FiRefreshCw size={16} />
            Restablecer
          </button>

          <button
            type="button"
            onClick={handleGenerarReporte}
            disabled={
              !fecha ||
              !selectedSucursal ||
              loadingReporte
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-brand transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingReporte ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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

      {/* ERRORES */}
      {(error || showErrorSucursales) && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 dark:border-danger-900/50 dark:bg-danger-900/20">
          <p className="text-sm font-medium text-danger-700 dark:text-danger-400">
            {error ||
              "Error al cargar las sucursales."}
          </p>
        </div>
      )}

      {/* EXPORTACIONES */}
      {sobrantesData.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={generateExcel}
            disabled={
              generatingExcel ||
              filteredData.length === 0
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
          >
            {generatingExcel ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600/30 border-t-emerald-600 dark:border-emerald-400/30 dark:border-t-emerald-400" />
                Generando...
              </>
            ) : (
              <>
                <FiDownload size={16} />
                Excel
              </>
            )}
          </button>

          <button
            type="button"
            onClick={generatePDF}
            disabled={
              generatingPDF ||
              filteredData.length === 0
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 text-sm font-semibold text-danger-700 transition-all hover:bg-danger-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-danger-900/50 dark:bg-danger-900/20 dark:text-danger-400 dark:hover:bg-danger-900/30"
          >
            {generatingPDF ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-danger-600/30 border-t-danger-600 dark:border-danger-400/30 dark:border-t-danger-400" />
                Generando...
              </>
            ) : (
              <>
                <FiDownload size={16} />
                PDF
              </>
            )}
          </button>
        </div>
      )}

      {/* RESULTADOS */}
      {filteredData.length > 0 ? (
        <>
          {/* DESKTOP */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-2">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                      Fecha
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                      Venta
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                      Sucursal
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                      Usuario
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                      Turno
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                      Productos
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                      Unidades
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                      Detalle
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {filteredData.map((venta) => {
                    const totalUnidades =
                      venta.ventaDetalle.reduce(
                        (sum, prod) =>
                          sum +
                          Number(
                            prod.unidadesSobrantes || 0
                          ),
                        0
                      );

                    const isOpen =
                      activeVenta === venta.idVenta;

                    return (
                      <React.Fragment key={venta.idVenta}>
                        <tr
                          onClick={() =>
                            toggleVenta(venta.idVenta)
                          }
                          className={`cursor-pointer transition-colors ${
                            isOpen
                              ? "bg-brand-50/60 dark:bg-brand-900/10"
                              : "hover:bg-surface-2"
                          }`}
                        >
                          <td className="px-4 py-4 text-ink">
                            {formatFecha(
                              venta.fechaVenta
                            )}
                          </td>

                          <td className="px-4 py-4 text-center font-semibold text-ink">
                            #{venta.idVenta}
                          </td>

                          <td className="px-4 py-4 text-ink">
                            {venta.nombreSucursal}
                          </td>

                          <td className="px-4 py-4 text-ink">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-muted">
                                <FiUser size={13} />
                              </span>

                              <span>
                                {venta.usuario || "—"}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-center">
                            {renderTurnoBadge(
                              venta.ventaTurno
                            )}
                          </td>

                          <td className="px-4 py-4 text-center font-medium text-ink">
                            {venta.ventaDetalle.length}
                          </td>

                          <td className="px-4 py-4 text-center font-bold text-brand-600 dark:text-brand-400">
                            {totalUnidades}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                                isOpen
                                  ? "bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                                  : "bg-surface-2 text-muted"
                              }`}
                            >
                              {isOpen ? (
                                <FiChevronUp size={17} />
                              ) : (
                                <FiChevronDown size={17} />
                              )}
                            </span>
                          </td>
                        </tr>

                        {/* DETALLE DESKTOP */}
                        {isOpen && (
                          <tr>
                            <td
                              colSpan={8}
                              className="p-0"
                            >
                              <div className="border-y border-brand-200 bg-brand-50 p-4 dark:border-brand-900/50 dark:bg-brand-950/20">
                                <div className="overflow-hidden rounded-2xl border border-brand-200 bg-surface shadow-sm dark:border-brand-900/60">
                                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-200 bg-brand-100/70 px-4 py-3 dark:border-brand-900/60 dark:bg-brand-900/30">
                                    <div className="flex items-center gap-3">
                                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                                        <FiPackage size={17} />
                                      </span>

                                      <div>
                                        <h3 className="text-sm font-semibold text-ink">
                                          Productos sobrantes
                                        </h3>

                                        <p className="text-xs text-muted">
                                          Venta #
                                          {venta.idVenta}{" "}
                                          ·{" "}
                                          {venta.nombreSucursal}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {renderTurnoBadge(
                                        venta.ventaTurno
                                      )}

                                      <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink">
                                        {
                                          venta.ventaDetalle
                                            .length
                                        }{" "}
                                        productos
                                      </span>
                                    </div>
                                  </div>

                                  <div className="divide-y divide-line">
                                    {venta.ventaDetalle.map(
                                      (
                                        producto,
                                        index
                                      ) => (
                                        <div
                                          key={
                                            producto.idSobrante ??
                                            `${venta.idVenta}-${index}`
                                          }
                                          className="grid grid-cols-1 gap-4 bg-surface px-4 py-4 transition-colors hover:bg-surface-2 sm:grid-cols-[1fr_auto]"
                                        >
                                          <div>
                                            <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
                                              Producto
                                            </p>

                                            <div className="mt-1 flex items-center gap-2">
                                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-brand-600 dark:text-brand-400">
                                                <FiPackage size={14} />
                                              </span>

                                              <p className="text-sm font-semibold text-ink">
                                                {producto.nombreProducto ||
                                                  `Producto #${producto.idProducto}`}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="sm:min-w-[180px] sm:text-right">
                                            <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
                                              Unidades sobrantes
                                            </p>

                                            <p className="mt-1 text-lg font-bold text-brand-600 dark:text-brand-400">
                                              {
                                                producto.unidadesSobrantes
                                              }
                                            </p>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between border-t border-line bg-surface-2 px-4 py-3">
                                    <span className="text-xs font-semibold text-muted">
                                      Total de unidades sobrantes
                                    </span>

                                    <span className="text-sm font-bold text-ink">
                                      {totalUnidades}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE */}
          <div className="flex flex-col gap-3 md:hidden">
            {filteredData.map((venta) => {
              const totalUnidades =
                venta.ventaDetalle.reduce(
                  (sum, prod) =>
                    sum +
                    Number(
                      prod.unidadesSobrantes || 0
                    ),
                  0
                );

              const isOpen =
                activeVenta === venta.idVenta;

              return (
                <div
                  key={venta.idVenta}
                  className={`overflow-hidden rounded-2xl border bg-surface shadow-card transition-all ${
                    isOpen
                      ? "border-brand-300 dark:border-brand-800"
                      : "border-line"
                  }`}
                >
                  {/* CABECERA */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleVenta(venta.idVenta)
                    }
                    className="w-full text-left"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                              <FiPackage size={17} />
                            </span>

                            <div className="min-w-0">
                              <p className="text-sm font-bold text-ink">
                                Venta #{venta.idVenta}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-muted">
                                {venta.nombreSucursal}
                              </p>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isOpen
                              ? "bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                              : "bg-surface-2 text-muted"
                          }`}
                        >
                          {isOpen ? (
                            <FiChevronUp size={17} />
                          ) : (
                            <FiChevronDown size={17} />
                          )}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-surface-2 p-3">
                          <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
                            Fecha
                          </p>

                          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-ink">
                            <FiCalendar
                              size={13}
                              className="text-muted"
                            />

                            {formatFecha(
                              venta.fechaVenta
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-surface-2 p-3">
                          <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
                            Unidades
                          </p>

                          <p className="mt-1 text-sm font-bold text-brand-600 dark:text-brand-400">
                            {totalUnidades}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {renderTurnoBadge(
                            venta.ventaTurno
                          )}

                          <span className="text-xs text-muted">
                            {venta.ventaDetalle.length}{" "}
                            productos
                          </span>
                        </div>

                        <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                          {isOpen
                            ? "Ocultar detalle"
                            : "Ver detalle"}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* DETALLE MOBILE */}
                  {isOpen && (
                    <div className="border-t border-brand-200 bg-brand-50 p-3 dark:border-brand-900/60 dark:bg-brand-950/20">
                      <div className="overflow-hidden rounded-xl border border-brand-200 bg-surface dark:border-brand-900/60">
                        <div className="border-b border-brand-200 bg-brand-100/70 px-4 py-3 dark:border-brand-900/60 dark:bg-brand-900/30">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
                              <FiPackage size={15} />
                            </span>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink">
                                Productos sobrantes
                              </p>

                              <p className="mt-0.5 truncate text-xs text-muted">
                                Venta #{venta.idVenta}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="divide-y divide-line">
                          {venta.ventaDetalle.map(
                            (producto, index) => (
                              <div
                                key={
                                  producto.idSobrante ??
                                  `${venta.idVenta}-${index}`
                                }
                                className="p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
                                      Producto
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-ink">
                                      {producto.nombreProducto ||
                                        `Producto #${producto.idProducto}`}
                                    </p>
                                  </div>

                                  <div className="shrink-0 rounded-xl bg-brand-50 px-3 py-2 text-right dark:bg-brand-900/20">
                                    <p className="text-2xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                                      Unidades
                                    </p>

                                    <p className="mt-0.5 text-base font-bold text-brand-700 dark:text-brand-400">
                                      {
                                        producto.unidadesSobrantes
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-line bg-surface-2 px-4 py-3">
                          <span className="text-xs font-semibold text-muted">
                            Total sobrante
                          </span>

                          <span className="text-sm font-bold text-ink">
                            {totalUnidades} unidades
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : sobrantesData.length > 0 &&
        filteredData.length === 0 ? (
        /* SIN RESULTADOS DEL FILTRO */
        <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-muted">
            <FiFilter size={25} />
          </div>

          <h3 className="mt-4 text-base font-semibold text-ink">
            No hay resultados
          </h3>

          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            No se encontraron ventas para el turno
            seleccionado.
          </p>
        </div>
      ) : (
        /* ESTADO INICIAL */
        !showErrorSucursales && (
          <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center shadow-card">
            {loadingReporte ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600/30 border-t-brand-600 dark:border-brand-400/30 dark:border-t-brand-400" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-ink">
                  Generando reporte...
                </h3>

                <p className="mt-1 text-sm text-muted">
                  Estamos consultando los productos
                  sobrantes.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <FiPackage size={26} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-ink">
                  No hay datos para mostrar
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                  Selecciona una fecha y una sucursal
                  para generar el reporte de productos
                  sobrantes.
                </p>
              </>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default SobrantesReport;