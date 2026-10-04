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
  FiTrendingDown,
  FiUser,
  FiFileText,
  FiInbox,
  FiPackage,
  FiDollarSign,
  FiClock,
  FiX,
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { getUserData } from "../../../utils/Auth/decodedata";
import Alert from "../../../components/Alerts/Alert";

// Mantén aquí el mismo servicio que ya utilizabas en tu ReportePerdidasPage.
// Si en tu proyecto tiene otro nombre/ruta, conserva tu import original.
import {
  generarReportePerdidasService,
} from "../../../services/reportes/reportes.service";

const selectClass =
  "w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted";

function ReportePerdidasPage() {
  const navigate = useNavigate();
  const userData = getUserData();

  const {
    sucursales,
    loadingSucursales,
    showErrorSucursales,
  } = useGetSucursales();

  const [selectedSucursal, setSelectedSucursal] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [reporteData, setReporteData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState(null);
  const [yaGenero, setYaGenero] = useState(false);

  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);

  // Nueva UX:
  // Guarda el producto/registro cuya fila está expandida.
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    if (
      !loadingSucursales &&
      sucursales?.length > 0 &&
      userData?.idRol !== 1
    ) {
      const sucursalUsuario = sucursales.find(
        (s) => s.idSucursal === userData.idSucursal
      );

      if (sucursalUsuario) {
        setSelectedSucursal(sucursalUsuario.idSucursal);
      }
    }
  }, [loadingSucursales, sucursales, userData]);

  const sucursalSeleccionada = useMemo(() => {
    return sucursales?.find(
      (s) => String(s.idSucursal) === String(selectedSucursal)
    );
  }, [sucursales, selectedSucursal]);

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    return dayjs(fecha).format("DD/MM/YYYY HH:mm");
  };

  const formatFechaCorta = (fecha) => {
    if (!fecha) return "—";
    return dayjs(fecha).format("DD/MM/YYYY");
  };

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 2,
    }).format(number);
  };

  const getDetalles = (item) => {
    return Array.isArray(item?.detalles) ? item.detalles : [];
  };

  const totalUnidades = useMemo(() => {
    return filteredData.reduce(
      (total, item) => total + Number(item.totalUnidadesPerdidas || 0),
      0
    );
  }, [filteredData]);

  const totalDinero = useMemo(() => {
    return filteredData.reduce(
      (total, item) => total + Number(item.totalDineroPerdido || 0),
      0
    );
  }, [filteredData]);

  const totalRegistros = useMemo(() => {
    return filteredData.reduce(
      (total, item) => total + getDetalles(item).length,
      0
    );
  }, [filteredData]);

  const handleGenerarReporte = async () => {
    if (!selectedSucursal || !fechaInicio || !fechaFin) {
      setError("Debes completar todos los campos obligatorios");
      return;
    }

    const inicio = dayjs(fechaInicio).startOf("day");
    const fin = dayjs(fechaFin).endOf("day");

    if (inicio.isAfter(fin)) {
      setError(
        "La fecha de inicio no puede ser mayor a la fecha final"
      );
      return;
    }

    setError(null);
    setLoadingReporte(true);
    setYaGenero(true);
    setExpandedRow(null);

    try {
      const data = await generarReportePerdidasService(
        fechaInicio,
        fechaFin,
        selectedSucursal,
      );

      console.log(data)
      const reporte = data?.reporte || data?.data || [];

      setReporteData(reporte);
      setFilteredData(reporte);
    } catch (err) {
      setReporteData([]);
      setFilteredData([]);
      setError(
        "Error al generar el reporte: " +
          (err?.message || "Error desconocido")
      );
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleReset = () => {
    setSelectedSucursal(
      userData?.idRol === 1
        ? ""
        : userData?.idSucursal || ""
    );

    setFechaInicio("");
    setFechaFin("");

    setReporteData([]);
    setFilteredData([]);

    setError(null);
    setYaGenero(false);
    setExpandedRow(null);
  };

  const toggleRow = (item, index) => {
    const rowId =
      item?.idProducto ??
      item?.idReporte ??
      item?.id ??
      `${item?.nombreProducto}-${item?.sucursal}-${index}`;

    setExpandedRow((current) =>
      current === rowId ? null : rowId
    );
  };

  const getRowId = (item, index) => {
    return (
      item?.idProducto ??
      item?.idReporte ??
      item?.id ??
      `${item?.nombreProducto}-${item?.sucursal}-${index}`
    );
  };

  const generatePDF = () => {
    if (
      filteredData.length === 0 &&
      reporteData.length === 0
    ) {
      setError("No hay datos para generar el reporte");
      return;
    }

    setGeneratingPDF(true);
    setError(null);

    try {
      const dataToExport =
        filteredData.length > 0
          ? filteredData
          : reporteData;

      const sucursalNombre =
        sucursalSeleccionada?.nombreSucursal ||
        selectedSucursal ||
        "Todas";

      const today = new Date();

      const dateStr =
        today.toLocaleDateString("es-GT") +
        " " +
        today.toLocaleTimeString("es-GT", {
          hour: "2-digit",
          minute: "2-digit",
        });

      const doc = new jsPDF("portrait", "pt", "a4");

      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");

      doc.text(
        "REPORTE DE PÉRDIDAS",
        doc.internal.pageSize.getWidth() / 2,
        40,
        { align: "center" }
      );

      doc.setFontSize(10);
      doc.setTextColor(100);

      doc.text(
        `Generado el: ${dateStr}`,
        doc.internal.pageSize.getWidth() / 2,
        60,
        { align: "center" }
      );

      doc.setFontSize(11);
      doc.setTextColor(50);

      doc.text(
        `Sucursal: ${sucursalNombre}`,
        40,
        85
      );

      doc.text(
        `Rango: ${
          fechaInicio
            ? dayjs(fechaInicio).format("DD/MM/YYYY")
            : "No especificado"
        } - ${
          fechaFin
            ? dayjs(fechaFin).format("DD/MM/YYYY")
            : "No especificado"
        }`,
        40,
        102
      );

      doc.text(
        `Total unidades perdidas: ${totalUnidades}`,
        40,
        119
      );

      doc.text(
        `Total pérdida: ${formatCurrency(totalDinero)}`,
        40,
        136
      );

      const tableData = [];

      dataToExport.forEach((item) => {
        const detalles = getDetalles(item);

        if (detalles.length > 0) {
          detalles.forEach((detalle) => {
            tableData.push([
              item.nombreProducto || "—",
              item.sucursal || sucursalNombre || "—",
              formatFecha(detalle.fechaDescuento),
              detalle.usuario || "—",
              detalle.turno || "—",
              detalle.unidadesPerdidas || 0,
              formatCurrency(detalle.dineroPerdida),
            ]);
          });
        } else {
          tableData.push([
            item.nombreProducto || "—",
            item.sucursal || sucursalNombre || "—",
            "—",
            "—",
            "—",
            item.totalUnidadesPerdidas || 0,
            formatCurrency(item.totalDineroPerdido),
          ]);
        }
      });

      autoTable(doc, {
        startY: 155,
        head: [[
          "Producto",
          "Sucursal",
          "Fecha",
          "Usuario",
          "Turno",
          "Unidades",
          "Pérdida",
        ]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [246, 253, 245],
        },
        styles: {
          fontSize: 8,
          cellPadding: 4,
          overflow: "linebreak",
        },
        margin: {
          horizontal: 20,
        },
        didDrawPage: function () {
          doc.setFontSize(9);
          doc.setTextColor(150);

          doc.text(
            `Página ${doc.internal.getNumberOfPages()}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 20,
            { align: "center" }
          );
        },
      });

      const fileName =
        `reporte-perdidas-${dateStr
          .replace(/\//g, "-")
          .replace(/:/g, "-")
          .replace(/ /g, "_")}.pdf`;

      doc.save(fileName);
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
    if (
      filteredData.length === 0 &&
      reporteData.length === 0
    ) {
      setError("No hay datos para generar el reporte");
      return;
    }

    setGeneratingExcel(true);
    setError(null);

    try {
      const dataToExport =
        filteredData.length > 0
          ? filteredData
          : reporteData;

      const sucursalNombre =
        sucursalSeleccionada?.nombreSucursal ||
        selectedSucursal ||
        "Todas";

      const today = new Date();

      const dateStr =
        today.toLocaleDateString("es-GT") +
        " " +
        today.toLocaleTimeString("es-GT", {
          hour: "2-digit",
          minute: "2-digit",
        });

      const excelData = [];

      dataToExport.forEach((item) => {
        const detalles = getDetalles(item);

        if (detalles.length > 0) {
          detalles.forEach((detalle) => {
            excelData.push({
              Producto: item.nombreProducto || "—",
              Sucursal:
                item.sucursal || sucursalNombre || "—",
              Fecha: formatFecha(
                detalle.fechaDescuento
              ),
              Usuario: detalle.usuario || "—",
              Turno: detalle.turno || "—",
              "Unidades Perdidas":
                detalle.unidadesPerdidas || 0,
              "Dinero Perdido":
                Number(detalle.dineroPerdida || 0),
            });
          });
        } else {
          excelData.push({
            Producto: item.nombreProducto || "—",
            Sucursal:
              item.sucursal || sucursalNombre || "—",
            Fecha: "—",
            Usuario: "—",
            Turno: "—",
            "Unidades Perdidas":
              Number(item.totalUnidadesPerdidas || 0),
            "Dinero Perdido":
              Number(item.totalDineroPerdido || 0),
          });
        }
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([]);

      ws["!cols"] = [
        { wch: 30 },
        { wch: 22 },
        { wch: 20 },
        { wch: 22 },
        { wch: 15 },
        { wch: 18 },
        { wch: 18 },
      ];

      const reportInfo = [
        ["REPORTE DE PÉRDIDAS"],
        [`Generado el: ${dateStr}`],
        [`Sucursal: ${sucursalNombre}`],
        [
          `Rango: ${
            fechaInicio
              ? dayjs(fechaInicio).format("DD/MM/YYYY")
              : "No especificado"
          } - ${
            fechaFin
              ? dayjs(fechaFin).format("DD/MM/YYYY")
              : "No especificado"
          }`,
        ],
        [`Total unidades perdidas: ${totalUnidades}`],
        [`Total pérdida: ${formatCurrency(totalDinero)}`],
        [],
      ];

      XLSX.utils.sheet_add_aoa(
        ws,
        reportInfo,
        { origin: "A1" }
      );

      const merges = [
        {
          s: { r: 0, c: 0 },
          e: { r: 0, c: 6 },
        },
        {
          s: { r: 1, c: 0 },
          e: { r: 1, c: 6 },
        },
        {
          s: { r: 2, c: 0 },
          e: { r: 2, c: 6 },
        },
        {
          s: { r: 3, c: 0 },
          e: { r: 3, c: 6 },
        },
        {
          s: { r: 4, c: 0 },
          e: { r: 4, c: 6 },
        },
        {
          s: { r: 5, c: 0 },
          e: { r: 5, c: 6 },
        },
      ];

      ws["!merges"] = merges;

      const headers = Object.keys(
        excelData[0] || {}
      );

      const headerRow = reportInfo.length;

      XLSX.utils.sheet_add_aoa(
        ws,
        [headers],
        {
          origin:
            XLSX.utils.encode_row(headerRow),
        }
      );

      headers.forEach((_, colIndex) => {
        const cellRef =
          XLSX.utils.encode_cell({
            r: headerRow,
            c: colIndex,
          });

        ws[cellRef] = ws[cellRef] || {
          t: "s",
        };

        ws[cellRef].s = {
          font: {
            bold: true,
            color: {
              rgb: "FFFFFF",
            },
          },
          fill: {
            fgColor: {
              rgb: "10B981",
            },
          },
          alignment: {
            horizontal: "center",
          },
        };
      });

      XLSX.utils.sheet_add_json(
        ws,
        excelData,
        {
          header: headers,
          skipHeader: true,
          origin:
            XLSX.utils.encode_row(
              headerRow + 1
            ),
        }
      );

      excelData.forEach(
        (row, rowIndex) => {
          const dataRow =
            headerRow + 1 + rowIndex;

          const unidadesCell =
            XLSX.utils.encode_cell({
              r: dataRow,
              c: 5,
            });

          ws[unidadesCell] =
            ws[unidadesCell] || {
              t: "n",
            };

          ws[unidadesCell].s = {
            font: {
              bold: true,
              color: "FF0000",
            },
          };

          const dineroCell =
            XLSX.utils.encode_cell({
              r: dataRow,
              c: 6,
            });

          ws[dineroCell] =
            ws[dineroCell] || {
              t: "n",
            };

          ws[dineroCell].s = {
            font: {
              bold: true,
              color: "FF0000",
            },
          };
        }
      );

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Reporte Perdidas"
      );

      const fileName =
        `Reporte_Perdidas_${dateStr
          .replace(/\//g, "-")
          .replace(/:/g, "-")
          .replace(/ /g, "_")}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (err) {
      setError(
        "Error al generar el Excel: " +
          (err?.message || "Error desconocido")
      );
    } finally {
      setGeneratingExcel(false);
    }
  };

  const isFormValid =
    selectedSucursal &&
    fechaInicio &&
    fechaFin;

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
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
          <FiTrendingDown size={19} />
        </span>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">
            Reporte de Pérdidas
          </h1>

          <p className="text-sm text-muted">
            Consulta las pérdidas registradas en el inventario
          </p>
        </div>
      </header>

      {/* ALERTAS */}
      {error && (
        <Alert
          type="danger"
          title="No se pudo completar"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {showErrorSucursales && (
        <Alert
          type="danger"
          title="No se pudieron cargar las sucursales"
        />
      )}

      {/* FILTROS */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <FiFilter size={15} />
          </span>

          <div>
            <h2 className="text-sm font-semibold text-ink">
              Filtros de búsqueda
            </h2>

            <p className="text-xs text-muted">
              Selecciona el período y la sucursal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* SUCURSAL */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Sucursal *
            </label>

            {userData?.idRol === 1 ? (
              <div className="relative">
                <FiFilter
                  size={14}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />

                <select
                  value={selectedSucursal}
                  onChange={(e) =>
                    setSelectedSucursal(
                      e.target.value
                    )
                  }
                  disabled={loadingSucursales}
                  className={selectClass}
                >
                  <option value="">
                    Seleccionar sucursal
                  </option>

                  {sucursales?.map(
                    (sucursal) => (
                      <option
                        key={
                          sucursal.idSucursal
                        }
                        value={
                          sucursal.idSucursal
                        }
                      >
                        {
                          sucursal.nombreSucursal
                        }
                      </option>
                    )
                  )}
                </select>

                <FiChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            ) : (
              <div className="flex min-h-[42px] items-center rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-muted">
                {sucursales?.find(
                  (s) =>
                    String(s.idSucursal) ===
                    String(
                      userData?.idSucursal
                    )
                )?.nombreSucursal ||
                  "Tu sucursal"}
              </div>
            )}

            {loadingSucursales && (
              <p className="mt-1 text-2xs text-muted">
                Cargando sucursales...
              </p>
            )}
          </div>

          {/* FECHA INICIO */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Fecha inicio *
            </label>

            <div className="relative">
              <FiCalendar
                size={14}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                type="date"
                value={fechaInicio}
                max={
                  fechaFin ||
                  dayjs().format(
                    "YYYY-MM-DD"
                  )
                }
                onChange={(e) =>
                  setFechaInicio(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-sm text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </div>
          </div>

          {/* FECHA FIN */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Fecha fin *
            </label>

            <div className="relative">
              <FiCalendar
                size={14}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                type="date"
                value={fechaFin}
                min={fechaInicio}
                max={dayjs().format(
                  "YYYY-MM-DD"
                )}
                onChange={(e) =>
                  setFechaFin(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-sm text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </div>
          </div>
        </div>

        {/* ACCIONES */}
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
            onClick={
              handleGenerarReporte
            }
            disabled={
              !isFormValid ||
              loadingReporte
            }
            className={`flex items-center justify-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold transition-colors ${
              !isFormValid ||
              loadingReporte
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
                <FiFilter size={15} />
                Generar reporte
              </>
            )}
          </button>
        </div>
      </div>

      {/* RESUMEN */}
      {filteredData.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">
                  Productos afectados
                </p>

                <p className="mt-1 text-2xl font-bold text-ink">
                  {filteredData.length}
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <FiPackage size={18} />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">
                  Unidades perdidas
                </p>

                <p className="mt-1 text-2xl font-bold text-danger-700">
                  {totalUnidades}
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-50 text-danger-600">
                <FiTrendingDown size={18} />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted">
                  Pérdida total
                </p>

                <p className="mt-1 text-2xl font-bold text-danger-700">
                  {formatCurrency(
                    totalDinero
                  )}
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-50 text-danger-600">
                <FiDollarSign size={18} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* EXPORTACIONES */}
      {filteredData.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted">
            {totalRegistros}{" "}
            {totalRegistros === 1
              ? "registro"
              : "registros"}{" "}
            encontrados
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={
                generateExcel
              }
              disabled={
                generatingExcel
              }
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
              onClick={
                generatePDF
              }
              disabled={
                generatingPDF
              }
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
        </div>
      )}

      {/* RESULTADOS */}
      {filteredData.length > 0 ? (
        <>
          {/* DESKTOP */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-surface-2/95">
                  <tr>
                    <th className="border-b border-line px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                      Producto
                    </th>

                    <th className="border-b border-line px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                      Sucursal
                    </th>

                    <th className="border-b border-line px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                      Unidades
                    </th>

                    <th className="border-b border-line px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                      Pérdida
                    </th>

                    <th className="w-10 border-b border-line px-4 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map(
                    (item, index) => {
                      const rowId =
                        getRowId(
                          item,
                          index
                        );

                      const isOpen =
                        expandedRow ===
                        rowId;

                      const detalles =
                        getDetalles(
                          item
                        );

                      return (
                        <tr
                          key={rowId}
                          className="contents"
                        >
                          {/* FILA */}
                          <tr
                            onClick={() =>
                              toggleRow(
                                item,
                                index
                              )
                            }
                            className={`
                              cursor-pointer
                              border-b border-line
                              transition-colors
                              ${
                                isOpen
                                  ? "bg-brand-50/60"
                                  : index % 2 === 1
                                  ? "bg-surface-2/30 hover:bg-brand-50/50"
                                  : "hover:bg-brand-50/50"
                              }
                            `}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-600">
                                  <FiPackage
                                    size={16}
                                  />
                                </span>

                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-ink">
                                    {
                                      item.nombreProducto
                                    }
                                  </p>

                                  <p className="mt-0.5 text-xs text-muted">
                                    {
                                      detalles.length
                                    }{" "}
                                    {detalles.length ===
                                    1
                                      ? "registro"
                                      : "registros"}{" "}
                                    de pérdida
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-ink">
                              {item.sucursal ||
                                sucursalSeleccionada?.nombreSucursal ||
                                "—"}
                            </td>

                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center rounded-full bg-danger-50 px-2.5 py-1 text-xs font-bold text-danger-700">
                                -
                                {
                                  item.totalUnidadesPerdidas
                                }
                              </span>
                            </td>

                            <td className="px-4 py-4 text-right">
                              <span className="font-bold text-danger-700">
                                {formatCurrency(
                                  item.totalDineroPerdido
                                )}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-center">
                              <span
                                className={`
                                  inline-flex h-8 w-8 items-center justify-center rounded-full
                                  transition-colors
                                  ${
                                    isOpen
                                      ? "bg-brand-100 text-brand-700"
                                      : "bg-surface-2 text-muted"
                                  }
                                `}
                              >
                                <FiChevronDown
                                  size={15}
                                  className={`transition-transform duration-200 ${
                                    isOpen
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </span>
                            </td>
                          </tr>

                          {/* DETALLE */}
                          {isOpen && (
                            <tr className="border-b border-line bg-surface-2/40">
                              <td
                                colSpan={5}
                                className="px-4 py-4"
                              >
                                <div className="mx-2 my-3 overflow-hidden rounded-2xl border border-brand-200 bg-brand-50 shadow-sm dark:border-brand-900/60 dark:bg-brand-950/30">
                                  {/* Encabezado del detalle */}
                                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-200 bg-brand-100/70 px-4 py-3 dark:border-brand-900/60 dark:bg-brand-900/30">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-50 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
                                          <FiTrendingDown size={15} />
                                        </span>

                                        <div>
                                          <h3 className="text-sm font-semibold text-ink">
                                            Detalle de pérdidas
                                          </h3>

                                          <p className="text-xs text-muted">
                                            {item.nombreProducto}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="rounded-full bg-danger-50 px-2.5 py-1 text-xs font-semibold text-danger-700 dark:bg-danger-900/30 dark:text-danger-400">
                                        {detalles.length}{" "}
                                        {detalles.length === 1 ? "registro" : "registros"}
                                      </span>

                                      <span className="rounded-full border border-brand-200 bg-surface px-2.5 py-1 text-xs font-semibold text-ink dark:border-brand-800">
                                        {formatCurrency(item.totalDineroPerdido)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Registros */}
                                  {detalles.length > 0 ? (
                                    <div className="divide-y divide-brand-200 dark:divide-brand-900/60">
                                      {detalles.map((detalle, detalleIndex) => (
                                        <div
                                          key={
                                            detalle.idDescuento ??
                                            `${rowId}-${detalleIndex}`
                                          }
                                          className="grid grid-cols-1 gap-4 px-4 py-4 transition-colors hover:bg-brand-100/60 dark:hover:bg-brand-900/20 md:grid-cols-2 lg:grid-cols-5"
                                        >
                                          <div>
                                            <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
                                              Fecha
                                            </p>

                                            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink">
                                              <FiCalendar
                                                size={13}
                                                className="text-brand-600 dark:text-brand-400"
                                              />
                                              {formatFecha(detalle.fechaDescuento)}
                                            </p>
                                          </div>

                                          <div>
                                            <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
                                              Usuario
                                            </p>

                                            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-ink">
                                              <FiUser
                                                size={13}
                                                className="text-brand-600 dark:text-brand-400"
                                              />
                                              {detalle.usuario || "—"}
                                            </p>
                                          </div>

                                          <div>
                                            <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
                                              Turno
                                            </p>

                                            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink">
                                              <FiClock
                                                size={13}
                                                className="text-brand-600 dark:text-brand-400"
                                              />
                                              {detalle.turno || "—"}
                                            </p>
                                          </div>

                                          <div>
                                            <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
                                              Unidades perdidas
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-danger-700 dark:text-danger-400">
                                              -{detalle.unidadesPerdidas}
                                            </p>
                                          </div>

                                          <div>
                                            <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
                                              Dinero perdido
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-danger-700 dark:text-danger-400">
                                              {formatCurrency(detalle.dineroPerdida)}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="px-4 py-8 text-center">
                                      <p className="text-sm text-muted">
                                        No hay detalles disponibles para esta pérdida.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MÓVIL */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filteredData.map(
              (item, index) => {
                const rowId =
                  getRowId(
                    item,
                    index
                  );

                const isOpen =
                  expandedRow ===
                  rowId;

                const detalles =
                  getDetalles(item);

                return (
                  <div
                    key={rowId}
                    className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
                  >
                    {/* TARJETA CLICKEABLE */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleRow(
                          item,
                          index
                        )
                      }
                      className={`
                        flex w-full items-start justify-between gap-3
                        p-4 text-left
                        transition-colors
                        ${
                          isOpen
                            ? "bg-brand-50/50"
                            : "hover:bg-surface-2"
                        }
                      `}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-50 text-danger-600">
                          <FiTrendingDown
                            size={17}
                          />
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {
                              item.nombreProducto
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-muted">
                            {item.sucursal ||
                              sucursalSeleccionada?.nombreSucursal ||
                              "—"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-danger-50 px-2 py-0.5 text-2xs font-bold text-danger-700">
                              -
                              {
                                item.totalUnidadesPerdidas
                              }{" "}
                              unidades
                            </span>

                            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-2xs font-semibold text-muted">
                              {
                                detalles.length
                              }{" "}
                              registros
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`
                          flex h-8 w-8 shrink-0 items-center justify-center
                          rounded-full
                          ${
                            isOpen
                              ? "bg-brand-100 text-brand-700"
                              : "bg-surface-2 text-muted"
                          }
                        `}
                      >
                        <FiChevronDown
                          size={15}
                          className={`transition-transform duration-200 ${
                            isOpen
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </span>
                    </button>

                    {/* RESUMEN */}
                    <div className="flex items-center justify-between border-t border-line bg-surface-2/40 px-4 py-3">
                      <span className="text-xs text-muted">
                        Pérdida total
                      </span>

                      <span className="text-sm font-bold text-danger-700">
                        {formatCurrency(
                          item.totalDineroPerdido
                        )}
                      </span>
                    </div>

                    {/* DETALLES EXPANDIDOS */}
                    {isOpen && (
                      <div className="border-t border-line bg-surface-2/40 p-3">
                        <div className="overflow-hidden rounded-xl border border-brand-200 bg-brand-50 shadow-sm dark:border-brand-900/60 dark:bg-brand-950/30">
                          {/* Encabezado */}
                          <div className="border-b border-brand-200 bg-brand-100/70 px-4 py-3 dark:border-brand-900/60 dark:bg-brand-900/30">
                            <div className="flex items-center gap-2">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
                                <FiTrendingDown size={15} />
                              </span>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink">
                                  Detalle de pérdidas
                                </p>

                                <p className="mt-0.5 truncate text-xs text-muted">
                                  {item.nombreProducto}
                                </p>
                              </div>
                            </div>
                          </div>

                          {detalles.length > 0 ? (
                            <div className="divide-y divide-brand-200 dark:divide-brand-900/60">
                              {detalles.map((detalle, detalleIndex) => (
                                <div
                                  key={
                                    detalle.idDescuento ??
                                    `${rowId}-${detalleIndex}`
                                  }
                                  className="p-4 transition-colors hover:bg-brand-100/50 dark:hover:bg-brand-900/20"
                                >
                                  {/* Fecha + unidades */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
                                        Fecha
                                      </p>

                                      <p className="mt-1 text-sm font-medium text-ink">
                                        {formatFecha(detalle.fechaDescuento)}
                                      </p>
                                    </div>

                                    <span className="shrink-0 rounded-full bg-danger-50 px-2.5 py-1 text-xs font-bold text-danger-700 dark:bg-danger-900/30 dark:text-danger-400">
                                      -{detalle.unidadesPerdidas} unidades
                                    </span>
                                  </div>

                                  {/* Usuario + turno */}
                                  <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
                                        Usuario
                                      </p>

                                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-ink">
                                        <FiUser
                                          size={13}
                                          className="shrink-0 text-brand-600 dark:text-brand-400"
                                        />

                                        <span className="truncate">
                                          {detalle.usuario || "—"}
                                        </span>
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
                                        Turno
                                      </p>

                                      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink">
                                        <FiClock
                                          size={13}
                                          className="shrink-0 text-brand-600 dark:text-brand-400"
                                        />

                                        {detalle.turno || "—"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Dinero perdido */}
                                  <div className="mt-4 rounded-xl border border-danger-200 bg-danger-50 px-3 py-3 dark:border-danger-900/50 dark:bg-danger-900/20">
                                    <p className="text-2xs font-semibold uppercase tracking-wide text-danger-600 dark:text-danger-400">
                                      Dinero perdido
                                    </p>

                                    <p className="mt-0.5 text-base font-bold text-danger-700 dark:text-danger-400">
                                      {formatCurrency(detalle.dineroPerdida)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-8 text-center">
                              <p className="text-sm text-muted">
                                No hay detalles disponibles.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </>
      ) : yaGenero &&
        !loadingReporte ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiCalendar size={20} />
          </span>

          <p className="text-sm font-medium text-ink">
            No hay datos para el rango de fechas seleccionado
          </p>

          <p className="text-xs text-muted">
            Ajusta las fechas o limpia los filtros para ver otros datos.
          </p>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border-0 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-500"
          >
            <FiRefreshCw size={14} />
            Limpiar filtros
          </button>
        </div>
      ) : (
        !showErrorSucursales && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
            {loadingReporte ? (
              <>
                <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />

                <p className="text-sm text-muted">
                  Generando reporte...
                </p>
              </>
            ) : (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
                  <FiInbox size={20} />
                </span>

                <p className="text-sm font-medium text-ink">
                  No hay datos para mostrar
                </p>

                <p className="text-xs text-muted">
                  Completa todos los campos para generar el reporte.
                </p>
              </>
            )}
          </div>
        )
      )}
    </div>
  );
}

export default ReportePerdidasPage;