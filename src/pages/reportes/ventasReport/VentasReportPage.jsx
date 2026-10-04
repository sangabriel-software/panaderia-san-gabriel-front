import React, { useEffect, useState } from 'react';
import {
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiCalendar,
  FiUser,
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiShoppingBag,
  FiTrendingUp,
  FiTrendingDown,
  FiPackage,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import useGetSucursales from '../../../hooks/sucursales/useGetSucursales';
import { generarReporteVentasService } from '../../../services/reportes/reportes.service';
import { getUserData } from '../../../utils/Auth/decodedata';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const VentasReportPage = () => {
  const navigate = useNavigate();

  const {
    sucursales,
    loadingSucursales,
    showErrorSucursales,
  } = useGetSucursales();

  const userData = getUserData();

  const [selectedSucursal, setSelectedSucursal] = useState('');
  const [reporteData, setReporteData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState(null);

  const [fechaInicio, setFechaInicio] = useState(
    dayjs().format('YYYY-MM-DD')
  );

  const [fechaFin, setFechaFin] = useState(
    dayjs().format('YYYY-MM-DD')
  );

  const [activeVenta, setActiveVenta] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState('Todos');

  /*
   * ============================================================
   * SUCURSAL DEL USUARIO
   * ============================================================
   */
  useEffect(() => {
    if (
      !loadingSucursales &&
      sucursales.length > 0 &&
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

  /*
   * ============================================================
   * FILTRO POR TURNO
   * ============================================================
   */
  useEffect(() => {
    if (selectedTurno === 'Todos') {
      setFilteredData(reporteData);
    } else {
      setFilteredData(
        reporteData.filter(
          (venta) => venta.turno === selectedTurno
        )
      );
    }
  }, [selectedTurno, reporteData]);

  /*
   * ============================================================
   * GENERAR REPORTE
   * ============================================================
   */
  const handleGenerarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Debes seleccionar ambas fechas');
      return;
    }

    const inicio = dayjs(fechaInicio);
    const fin = dayjs(fechaFin);

    if (inicio.isAfter(fin)) {
      setError(
        'La fecha de inicio no puede ser mayor a la fecha final'
      );
      return;
    }

    if (!selectedSucursal) {
      setError('Debes seleccionar una sucursal');
      return;
    }

    setError(null);
    setLoadingReporte(true);
    setSelectedTurno('Todos');
    setActiveVenta(null);

    try {
      const data = await generarReporteVentasService(
        fechaInicio,
        fechaFin,
        selectedSucursal
      );

      setReporteData(data.reporte || []);
      setFilteredData(data.reporte || []);
    } catch (err) {
      setError(
        'Error al generar el reporte: ' +
          (err?.message || 'Error desconocido')
      );
    } finally {
      setLoadingReporte(false);
    }
  };

  /*
   * ============================================================
   * RESET
   * ============================================================
   */
  const handleReset = () => {
    setFechaInicio(dayjs().format('YYYY-MM-DD'));
    setFechaFin(dayjs().format('YYYY-MM-DD'));

    if (!loadingSucursales && sucursales.length > 0) {
      if (userData?.idRol !== 1) {
        const sucursalUsuario = sucursales.find(
          (s) => s.idSucursal === userData?.idSucursal
        );

        if (sucursalUsuario) {
          setSelectedSucursal(sucursalUsuario.idSucursal);
        }
      } else {
        setSelectedSucursal('');
      }
    } else {
      setSelectedSucursal('');
    }

    setReporteData([]);
    setFilteredData([]);
    setError(null);
    setActiveVenta(null);
    setSelectedTurno('Todos');
  };

  /*
   * ============================================================
   * FORMATOS
   * ============================================================
   */
  const formatFecha = (fecha) => {
    return dayjs(fecha).format('DD/MM/YYYY');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(Number(amount || 0));
  };

  /*
   * ============================================================
   * TOGGLE
   * ============================================================
   */
  const toggleVenta = (id) => {
    setActiveVenta(
      activeVenta === id ? null : id
    );
  };

  /*
   * ============================================================
   * TURNO
   * ============================================================
   */
  const renderTurnoBadge = (turno) => {
    if (turno === 'AM') {
      return (
        <span className="inline-flex items-center rounded-lg border border-accent-200 bg-accent-100 px-2.5 py-1 text-xs font-bold text-accent-700 dark:border-accent-800 dark:bg-accent-900/30 dark:text-accent-300">
          {turno}
        </span>
      );
    }

    if (turno === 'PM') {
      return (
        <span className="inline-flex items-center rounded-lg border border-brand-200 bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
          {turno}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-xs font-bold text-muted">
        {turno}
      </span>
    );
  };

  /*
   * ============================================================
   * DIFERENCIA
   * ============================================================
   */
  const renderDiferencia = (diferencia) => {
    const value = Number(diferencia || 0);

    if (value < 0) {
      return (
        <span className="inline-flex items-center gap-1.5 font-bold text-danger-600 dark:text-danger-400">
          <FiTrendingDown className="h-4 w-4" />
          {formatCurrency(value)}
        </span>
      );
    }

    if (value > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 font-bold text-brand-600 dark:text-brand-400">
          <FiTrendingUp className="h-4 w-4" />
          {formatCurrency(value)}
        </span>
      );
    }

    return (
      <span className="font-bold text-muted">
        {formatCurrency(value)}
      </span>
    );
  };

  /*
   * ============================================================
   * ALERTA
   * ============================================================
   */
  const renderErrorAlert = (message) => (
    <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 dark:border-danger-900/50 dark:bg-danger-900/20 dark:text-danger-300">
      {message}
    </div>
  );

  /*
   * ============================================================
   * TOTALES
   * ============================================================
   */
  const calcularTotales = () => {
    return {
      totalVentas: filteredData.length,

      totalVenta: filteredData.reduce(
        (sum, venta) =>
          sum + Number(venta.total_venta || 0),
        0
      ),

      totalEfectivo: filteredData.reduce(
        (sum, venta) =>
          sum + Number(venta.efectivo_ingresado || 0),
        0
      ),

      totalGastos: filteredData.reduce(
        (sum, venta) =>
          sum + Number(venta.gastos_del_turno || 0),
        0
      ),

      totalDiferencia: filteredData.reduce(
        (sum, venta) =>
          sum + Number(venta.diferencia || 0),
        0
      ),
    };
  };

  const totals = calcularTotales();

  /*
   * ============================================================
   * PDF
   * ============================================================
   */
  const generatePDF = () => {
    const dataToExport =
      selectedTurno === 'Todos'
        ? reporteData
        : filteredData;

    if (dataToExport.length === 0) {
      setError('No hay datos para generar el reporte');
      return;
    }

    setGeneratingPDF(true);
    setError(null);

    try {
      const doc = new jsPDF(
        'landscape',
        'pt',
        'a4'
      );

      const sucursalNombre =
        sucursales.find(
          (s) => s.idSucursal == selectedSucursal
        )?.nombreSucursal ||
        'Todas las sucursales';

      const today = new Date();

      const dateStr =
        today.toLocaleDateString('es-GT') +
        ' ' +
        today.toLocaleTimeString('es-GT', {
          hour: '2-digit',
          minute: '2-digit',
        });

      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont('helvetica', 'bold');

      doc.text(
        'REPORTE DE VENTAS',
        doc.internal.pageSize.getWidth() / 2,
        40,
        {
          align: 'center',
        }
      );

      doc.setFontSize(10);
      doc.setTextColor(100);

      doc.text(
        `Generado el: ${dateStr}`,
        doc.internal.pageSize.getWidth() / 2,
        60,
        {
          align: 'center',
        }
      );

      doc.setFontSize(12);

      doc.text(
        `Sucursal: ${sucursalNombre}`,
        40,
        80
      );

      doc.text(
        `Rango de fechas: ${dayjs(
          fechaInicio
        ).format(
          'DD/MM/YYYY'
        )} - ${dayjs(fechaFin).format(
          'DD/MM/YYYY'
        )}`,
        40,
        95
      );

      if (selectedTurno !== 'Todos') {
        doc.text(
          `Turno: ${selectedTurno}`,
          40,
          110
        );
      }

      const totalVentas = dataToExport.reduce(
        (sum, venta) =>
          sum +
          Number(venta.total_venta || 0),
        0
      );

      const totalEfectivo =
        dataToExport.reduce(
          (sum, venta) =>
            sum +
            Number(
              venta.efectivo_ingresado || 0
            ),
          0
        );

      const totalGastos =
        dataToExport.reduce(
          (sum, venta) =>
            sum +
            Number(
              venta.gastos_del_turno || 0
            ),
          0
        );

      const totalDiferencia =
        dataToExport.reduce(
          (sum, venta) =>
            sum +
            Number(
              venta.diferencia || 0
            ),
          0
        );

      doc.text(
        `Total Ventas: ${formatCurrency(
          totalVentas
        )}`,
        40,
        selectedTurno !== 'Todos'
          ? 125
          : 110
      );

      doc.text(
        `Total Efectivo: ${formatCurrency(
          totalEfectivo
        )}`,
        40,
        selectedTurno !== 'Todos'
          ? 140
          : 125
      );

      doc.text(
        `Total Gastos: ${formatCurrency(
          totalGastos
        )}`,
        40,
        selectedTurno !== 'Todos'
          ? 155
          : 140
      );

      doc.text(
        `Diferencia Total: ${formatCurrency(
          totalDiferencia
        )}`,
        40,
        selectedTurno !== 'Todos'
          ? 170
          : 155
      );

      const tableData =
        dataToExport.map((venta) => [
          dayjs(
            venta.fecha_hora_venta
          ).format('DD/MM/YYYY'),

          venta.sucursal,

          venta.vendedor,

          venta.turno,

          formatCurrency(
            venta.total_venta
          ),

          venta.cantidad_productos,

          venta.unidades_vendidas,

          formatCurrency(
            venta.efectivo_ingresado
          ),

          formatCurrency(
            venta.gastos_del_turno
          ),

          formatCurrency(
            venta.total_esperado
          ),

          formatCurrency(
            venta.diferencia
          ),
        ]);

      autoTable(doc, {
        startY:
          selectedTurno !== 'Todos'
            ? 185
            : 170,

        head: [
          [
            'Fecha',
            'Sucursal',
            'Vendedor',
            'Turno',
            'Total Venta',
            'Productos',
            'Unidades',
            'Efectivo',
            'Gastos',
            'Total Esperado',
            'Diferencia',
          ],
        ],

        body: tableData,

        theme: 'grid',

        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8,
        },

        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },

        styles: {
          fontSize: 7,
          cellPadding: 2,
          overflow: 'linebreak',
        },

        margin: {
          horizontal: 20,
        },

        didDrawPage: function () {
          doc.setFontSize(10);
          doc.setTextColor(150);

          doc.text(
            `Página ${doc.internal.getNumberOfPages()}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 20,
            {
              align: 'center',
            }
          );
        },
      });

      doc.save(
        `reporte-ventas-${dateStr
          .replace(/\//g, '-')
          .replace(/:/g, '-')
          .replace(' ', '_')}.pdf`
      );
    } catch (err) {
      setError(
        'Error al generar el PDF: ' +
          (err?.message ||
            'Error desconocido')
      );
    } finally {
      setGeneratingPDF(false);
    }
  };

  /*
   * ============================================================
   * EXCEL
   * ============================================================
   */
  const generateExcel = () => {
    const dataToExport =
      selectedTurno === 'Todos'
        ? reporteData
        : filteredData;

    if (dataToExport.length === 0) {
      setError('No hay datos para generar el reporte');
      return;
    }

    setGeneratingExcel(true);
    setError(null);

    try {
      const sucursalNombre =
        sucursales.find(
          (s) => s.idSucursal == selectedSucursal
        )?.nombreSucursal ||
        'Todas las sucursales';

      const today = new Date();

      const dateStr =
        today.toLocaleDateString('es-GT') +
        ' ' +
        today.toLocaleTimeString('es-GT', {
          hour: '2-digit',
          minute: '2-digit',
        });

      const excelData =
        dataToExport.map((venta) => ({
          ID: venta.idVenta,

          Fecha: dayjs(
            venta.fecha_hora_venta
          ).format('DD/MM/YYYY'),

          Sucursal: venta.sucursal,

          Vendedor: venta.vendedor,

          Turno: venta.turno,

          'Total Venta': Number(
            venta.total_venta || 0
          ),

          'Cant. Productos': Number(
            venta.cantidad_productos || 0
          ),

          'Unidades Vendidas': Number(
            venta.unidades_vendidas || 0
          ),

          'Efectivo Ingresado': Number(
            venta.efectivo_ingresado || 0
          ),

          'Gastos del Turno': Number(
            venta.gastos_del_turno || 0
          ),

          'Total Esperado': Number(
            venta.total_esperado || 0
          ),

          Diferencia: Number(
            venta.diferencia || 0
          ),
        }));

      const wb =
        XLSX.utils.book_new();

      const ws =
        XLSX.utils.json_to_sheet([]);

      ws['!cols'] = [
        { wch: 8 },
        { wch: 18 },
        { wch: 20 },
        { wch: 15 },
        { wch: 8 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
      ];

      const reportInfo = [
        ['REPORTE DE VENTAS'],
        [`Generado el: ${dateStr}`],
        [`Sucursal: ${sucursalNombre}`],
        [
          `Rango de fechas: ${dayjs(
            fechaInicio
          ).format(
            'DD/MM/YYYY'
          )} - ${dayjs(fechaFin).format(
            'DD/MM/YYYY'
          )}`,
        ],
        selectedTurno !== 'Todos'
          ? [`Turno: ${selectedTurno}`]
          : [],
        [],
      ].filter(
        (item) => item.length > 0
      );

      XLSX.utils.sheet_add_aoa(
        ws,
        reportInfo,
        {
          origin: 'A1',
        }
      );

      ws['!merges'] =
        reportInfo.map(
          (_, index) => ({
            s: {
              r: index,
              c: 0,
            },
            e: {
              r: index,
              c: 12,
            },
          })
        );

      const headers = Object.keys(
        excelData[0] || {}
      );

      const headerRow =
        reportInfo.length;

      XLSX.utils.sheet_add_aoa(
        ws,
        [headers],
        {
          origin:
            XLSX.utils.encode_row(
              headerRow
            ),
        }
      );

      headers.forEach(
        (_, colIndex) => {
          const cellRef =
            XLSX.utils.encode_cell({
              r: headerRow,
              c: colIndex,
            });

          ws[cellRef] =
            ws[cellRef] || {
              t: 's',
            };

          ws[cellRef].s = {
            font: {
              bold: true,
              color: {
                rgb: 'FFFFFF',
              },
            },
            fill: {
              fgColor: {
                rgb: '4BACC6',
              },
            },
            alignment: {
              horizontal: 'center',
            },
          };
        }
      );

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

      const currencyColumns = [
        'Total Venta',
        'Efectivo Ingresado',
        'Gastos del Turno',
        'Total Esperado',
        'Diferencia',
      ];

      const currencyColIndices =
        headers
          .map(
            (header, index) =>
              currencyColumns.includes(
                header
              )
                ? index
                : null
          )
          .filter(
            (index) => index !== null
          );

      excelData.forEach(
        (_, rowIndex) => {
          const dataRow =
            headerRow +
            1 +
            rowIndex;

          currencyColIndices.forEach(
            (colIndex) => {
              const cellRef =
                XLSX.utils.encode_cell({
                  r: dataRow,
                  c: colIndex,
                });

              ws[cellRef] =
                ws[cellRef] || {
                  t: 'n',
                };

              ws[cellRef].z =
                '"Q"#,##0.00';
            }
          );
        }
      );

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        'Reporte Ventas'
      );

      const fileName =
        `Reporte_Ventas_${sucursalNombre
          .replace(/\s+/g, '_')}_${dateStr
          .replace(/\//g, '-')
          .replace(/:/g, '-')
          .replace(' ', '_')}.xlsx`;

      XLSX.writeFile(
        wb,
        fileName
      );
    } catch (err) {
      setError(
        'Error al generar el Excel: ' +
          (err?.message ||
            'Error desconocido')
      );

      console.error(
        'Error detallado:',
        err
      );
    } finally {
      setGeneratingExcel(false);
    }
  };

  /*
   * ============================================================
   * DETALLE DE VENTA
   * ============================================================
   */
  const renderVentaDetail = (venta) => (
    <div className="border-t-2 border-brand-300 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950/40">
      <div className="overflow-hidden rounded-2xl border border-brand-200 bg-surface shadow-card dark:border-brand-800">
        {/* Cabecera */}
        <div className="border-b border-line bg-surface-2 px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                  Venta #{venta.idVenta}
                </span>

                {renderTurnoBadge(
                  venta.turno
                )}
              </div>

              <p className="mt-2 text-sm font-bold text-ink">
                Información completa de la venta
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs text-muted">
                Total de venta
              </p>

              <p className="text-xl font-bold text-ink">
                {formatCurrency(
                  venta.total_venta
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Información principal */}
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-line bg-surface-2/60 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted">
              <FiCalendar className="h-4 w-4" />
              Fecha
            </div>

            <p className="text-sm font-semibold text-ink">
              {formatFecha(
                venta.fecha_hora_venta
              )}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/60 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted">
              <FiMapPin className="h-4 w-4" />
              Sucursal
            </div>

            <p className="text-sm font-semibold text-ink">
              {venta.sucursal || '—'}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/60 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted">
              <FiUser className="h-4 w-4" />
              Vendedor
            </div>

            <p className="text-sm font-semibold text-ink">
              {venta.vendedor || '—'}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/60 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted">
              <FiClock className="h-4 w-4" />
              Turno
            </div>

            <div className="mt-1">
              {renderTurnoBadge(
                venta.turno
              )}
            </div>
          </div>
        </div>

        {/* Información financiera */}
        <div className="border-t border-line p-4">
          <p className="mb-3 text-sm font-bold text-ink">
            Resumen financiero
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-line bg-surface-2/60 p-3">
              <p className="text-xs font-semibold text-muted">
                Efectivo ingresado
              </p>

              <p className="mt-1 text-base font-bold text-ink">
                {formatCurrency(
                  venta.efectivo_ingresado
                )}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface-2/60 p-3">
              <p className="text-xs font-semibold text-muted">
                Gastos del turno
              </p>

              <p className="mt-1 text-base font-bold text-ink">
                {formatCurrency(
                  venta.gastos_del_turno
                )}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface-2/60 p-3">
              <p className="text-xs font-semibold text-muted">
                Total esperado
              </p>

              <p className="mt-1 text-base font-bold text-ink">
                {formatCurrency(
                  venta.total_esperado
                )}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface-2/60 p-3">
              <p className="text-xs font-semibold text-muted">
                Diferencia
              </p>

              <div className="mt-1">
                {renderDiferencia(
                  venta.diferencia
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="border-t border-line p-4">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-ink">
                Productos vendidos
              </p>

              <p className="text-xs text-muted">
                Resumen de cantidades registradas
              </p>
            </div>

            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-muted">
                <FiPackage className="h-3.5 w-3.5" />
                {venta.cantidad_productos ||
                  0}{' '}
                productos
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-100 px-2.5 py-1.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                <FiShoppingBag className="h-3.5 w-3.5" />
                {venta.unidades_vendidas ||
                  0}{' '}
                unidades
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface-2/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Cantidad de productos
              </p>

              <p className="mt-1 text-2xl font-bold text-ink">
                {venta.cantidad_productos ||
                  0}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface-2/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Unidades vendidas
              </p>

              <p className="mt-1 text-2xl font-bold text-ink">
                {venta.unidades_vendidas ||
                  0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /*
   * ============================================================
   * TOTALES / SUCURSAL
   * ============================================================
   */
  const sucursalSeleccionada =
    sucursales.find(
      (s) =>
        s.idSucursal == selectedSucursal
    )?.nombreSucursal || '';

  /*
   * ============================================================
   * RETURN
   * ============================================================
   */
  return (
    <div className="flex flex-col gap-6">

      {/* ========================================================
          HEADER
      ========================================================= */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate('/reportes')
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:border-brand-700 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
          aria-label="Regresar"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
          <FiShoppingBag className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">
            Reporte de Ventas
          </h1>

          <p className="text-sm text-muted">
            Consulta el historial de ventas por sucursal y fecha
          </p>
        </div>
      </div>

      {/* ========================================================
          RESUMEN
      ========================================================= */}
      {filteredData.length > 0 && (
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="grid gap-3 sm:grid-cols-3">

            <div className="rounded-xl border border-line bg-surface-2/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Ventas
              </p>

              <p className="mt-1 text-2xl font-bold text-ink">
                {totals.totalVentas}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface-2/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Total vendido
              </p>

              <p className="mt-1 text-xl font-bold text-ink">
                {formatCurrency(
                  totals.totalVenta
                )}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface-2/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Diferencia total
              </p>

              <div className="mt-1">
                {renderDiferencia(
                  totals.totalDiferencia
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          FILTROS
      ========================================================= */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <FiFilter className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-ink">
              Filtros del reporte
            </h2>

            <p className="text-xs text-muted">
              Selecciona el rango, sucursal y turno
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          {/* Fecha inicio */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Fecha inicio
            </label>

            <div className="relative">
              <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

              <input
                type="date"
                value={fechaInicio}
                max={
                  fechaFin ||
                  dayjs().format(
                    'YYYY-MM-DD'
                  )
                }
                onChange={(e) =>
                  setFechaInicio(
                    e.target.value
                  )
                }
                onFocus={(e) =>
                  e.target.showPicker?.()
                }
                className="h-11 w-full rounded-xl border border-line bg-surface-2 pl-10 pr-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Fecha fin */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Fecha fin
            </label>

            <div className="relative">
              <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

              <input
                type="date"
                value={fechaFin}
                min={fechaInicio}
                max={dayjs().format(
                  'YYYY-MM-DD'
                )}
                onChange={(e) =>
                  setFechaFin(
                    e.target.value
                  )
                }
                onFocus={(e) =>
                  e.target.showPicker?.()
                }
                className="h-11 w-full rounded-xl border border-line bg-surface-2 pl-10 pr-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Sucursal */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Sucursal
            </label>

            {userData?.idRol === 1 ? (
              <div className="relative">
                <select
                  value={selectedSucursal}
                  onChange={(e) =>
                    setSelectedSucursal(
                      e.target.value
                    )
                  }
                  disabled={
                    loadingSucursales
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-line bg-surface-2 px-3 pr-10 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option
                    value=""
                    disabled
                  >
                    Seleccione una sucursal
                  </option>

                  {sucursales.map(
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

                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              </div>
            ) : (
              <div className="relative">
                <FiMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                <input
                  type="text"
                  readOnly
                  value={
                    sucursales.find(
                      (s) =>
                        s.idSucursal ===
                        userData?.idSucursal
                    )
                      ?.nombreSucursal ||
                    'Tu sucursal'
                  }
                  className="h-11 w-full rounded-xl border border-line bg-surface-2 pl-10 pr-3 text-sm text-ink outline-none"
                />
              </div>
            )}

            {loadingSucursales && (
              <p className="mt-1.5 text-xs text-muted">
                Cargando sucursales...
              </p>
            )}
          </div>

          {/* Turno */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Turno
            </label>

            <div className="relative">
              <select
                value={selectedTurno}
                onChange={(e) =>
                  setSelectedTurno(
                    e.target.value
                  )
                }
                disabled={
                  reporteData.length === 0
                }
                className="h-11 w-full appearance-none rounded-xl border border-line bg-surface-2 px-3 pr-10 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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

              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-surface-2"
          >
            <FiRefreshCw className="h-4 w-4" />
            Restablecer
          </button>

          <button
            type="button"
            onClick={handleGenerarReporte}
            disabled={
              loadingReporte ||
              !selectedSucursal
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingReporte ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Generando...
              </>
            ) : (
              <>
                <FiFilter className="h-4 w-4" />
                Generar reporte
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================
          ERRORES
      ========================================================= */}
      {error &&
        renderErrorAlert(error)}

      {showErrorSucursales &&
        renderErrorAlert(
          'Error al cargar las sucursales'
        )}

      {/* ========================================================
          EXPORTACIONES
      ========================================================= */}
      {reporteData.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">
              {filteredData.length}{' '}
              {filteredData.length === 1
                ? 'venta'
                : 'ventas'}
            </p>

            <p className="text-xs text-muted">
              {sucursalSeleccionada ||
                'Todas las sucursales'}
              {' · '}
              {formatFecha(
                fechaInicio
              )}{' '}
              -{' '}
              {formatFecha(fechaFin)}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={generateExcel}
              disabled={
                generatingExcel ||
                filteredData.length === 0
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generatingExcel ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                  Generando...
                </>
              ) : (
                <>
                  <FiDownload className="h-4 w-4" />
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
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 text-sm font-semibold text-danger-700 transition hover:bg-danger-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-danger-900/50 dark:bg-danger-900/20 dark:text-danger-300"
            >
              {generatingPDF ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                  Generando...
                </>
              ) : (
                <>
                  <FiDownload className="h-4 w-4" />
                  PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          TABLA
      ========================================================= */}
      {filteredData.length > 0 ? (
        <>
          {/* DESKTOP */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card md:block">
            <table className="w-full table-fixed text-left">
              <thead>
                <tr className="bg-surface-2">
                  <th className="w-[18%] px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                    Fecha
                  </th>

                  <th className="w-[24%] px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                    Vendedor
                  </th>

                  <th className="w-[15%] px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                    Turno
                  </th>

                  <th className="w-[25%] px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-muted">
                    Total venta
                  </th>

                  <th className="w-[18%] px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-muted">
                    Diferencia
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map(
                  (venta) => {
                    const isActive =
                      activeVenta ===
                      venta.idVenta;

                    return (
                      <React.Fragment
                        key={
                          venta.idVenta
                        }
                      >
                        {/* FILA PRINCIPAL */}
                        <tr
                          onClick={() =>
                            toggleVenta(
                              venta.idVenta
                            )
                          }
                          className={`cursor-pointer border-t border-line ${
                            isActive
                              ? 'bg-brand-50/40 dark:bg-brand-950/20'
                              : 'bg-surface'
                          }`}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                  isActive
                                    ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                                    : 'bg-surface-2 text-muted'
                                }`}
                              >
                                <FiCalendar className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-ink">
                                  {formatFecha(
                                    venta.fecha_hora_venta
                                  )}
                                </p>

                                <p className="text-[11px] text-muted">
                                  Venta #
                                  {
                                    venta.idVenta
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted">
                                <FiUser className="h-4 w-4" />
                              </div>

                              <span className="truncate text-sm font-semibold text-ink">
                                {
                                  venta.vendedor
                                }
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {renderTurnoBadge(
                              venta.turno
                            )}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <span className="text-sm font-bold text-ink">
                              {formatCurrency(
                                venta.total_venta
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right">
                            {renderDiferencia(
                              venta.diferencia
                            )}
                          </td>
                        </tr>

                        {/* DETALLE */}
                        {isActive && (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-0"
                            >
                              {renderVentaDetail(
                                venta
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {/* ====================================================
              MOBILE
          ==================================================== */}
          <div className="space-y-3 md:hidden">
            {filteredData.map(
              (venta) => {
                const isActive =
                  activeVenta ===
                  venta.idVenta;

                return (
                  <div
                    key={
                      venta.idVenta
                    }
                    className={`overflow-hidden rounded-2xl border bg-surface shadow-card ${
                      isActive
                        ? 'border-brand-300 dark:border-brand-700'
                        : 'border-line'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleVenta(
                          venta.idVenta
                        )
                      }
                      className={`w-full p-4 text-left ${
                        isActive
                          ? 'bg-brand-50/40 dark:bg-brand-950/20'
                          : 'bg-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-muted">
                              {formatFecha(
                                venta.fecha_hora_venta
                              )}
                            </span>

                            <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                              #
                              {
                                venta.idVenta
                              }
                            </span>
                          </div>

                          <p className="mt-1.5 truncate text-sm font-bold text-ink">
                            {
                              venta.vendedor
                            }
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span className="text-base font-bold text-ink">
                            {formatCurrency(
                              venta.total_venta
                            )}
                          </span>

                          {renderTurnoBadge(
                            venta.turno
                          )}

                          {isActive ? (
                            <FiChevronUp className="h-4 w-4 text-muted" />
                          ) : (
                            <FiChevronDown className="h-4 w-4 text-muted" />
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                        <span className="text-xs text-muted">
                          Ver detalle de la venta
                        </span>

                        {renderDiferencia(
                          venta.diferencia
                        )}
                      </div>
                    </button>

                    {isActive &&
                      renderVentaDetail(
                        venta
                      )}
                  </div>
                );
              }
            )}
          </div>
        </>
      ) : reporteData.length > 0 &&
        filteredData.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-muted">
            <FiFilter className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-base font-bold text-ink">
            No hay resultados para el filtro aplicado
          </h3>

          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            No se encontraron ventas para el turno seleccionado.
          </p>
        </div>
      ) : (
        !showErrorSucursales && (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
            {loadingReporte ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                </div>

                <h3 className="mt-4 text-base font-bold text-ink">
                  Generando reporte...
                </h3>

                <p className="mt-1 text-sm text-muted">
                  Estamos consultando las ventas seleccionadas.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-muted">
                  <FiFilter className="h-7 w-7" />
                </div>

                <h3 className="mt-4 text-base font-bold text-ink">
                  No hay datos para mostrar
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                  Selecciona un rango de fechas y una sucursal para generar el reporte.
                </p>
              </>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default VentasReportPage;