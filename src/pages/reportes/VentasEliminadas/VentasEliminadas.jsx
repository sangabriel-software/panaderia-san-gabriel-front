import React, { useState, useEffect } from 'react';
import {
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiAlertTriangle
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import useGetSucursales from '../../../hooks/sucursales/useGetSucursales';
import {
  generarReporteVentasEliminadasService
} from '../../../services/reportes/reportes.service';
import { getUserData } from '../../../utils/Auth/decodedata';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const VentasEliminadasPage = () => {
  const navigate = useNavigate();

  const {
    sucursales,
    loadingSucursales,
    showErrorSucursales
  } = useGetSucursales();

  const userData = getUserData();

  const [selectedSucursal, setSelectedSucursal] = useState('');
  const [ventasEliminadas, setVentasEliminadas] = useState([]);
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
   * Asignar automáticamente la sucursal del usuario
   * cuando no es administrador.
   */
  useEffect(() => {
    if (!loadingSucursales && sucursales.length > 0) {
      if (userData?.idRol !== 1) {
        const sucursalUsuario = sucursales.find(
          s => s.idSucursal === userData.idSucursal
        );

        if (sucursalUsuario) {
          setSelectedSucursal(sucursalUsuario.idSucursal);
        }
      }
    }
  }, [loadingSucursales, sucursales, userData]);

  /*
   * Filtrar por turno.
   */
  useEffect(() => {
    if (selectedTurno === 'Todos') {
      setFilteredData(ventasEliminadas);
    } else {
      const filtered = ventasEliminadas.filter(
        venta => venta.turno === selectedTurno
      );

      setFilteredData(filtered);
    }
  }, [selectedTurno, ventasEliminadas]);

  /*
   * Generar reporte.
   */
  const handleGenerarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Debes seleccionar ambas fechas');
      return;
    }

    if (!selectedSucursal) {
      setError('Debes seleccionar una sucursal');
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

    setError(null);
    setLoadingReporte(true);
    setSelectedTurno('Todos');
    setActiveVenta(null);

    try {
      const data = await generarReporteVentasEliminadasService(
        fechaInicio,
        fechaFin,
        selectedSucursal
      );

      setVentasEliminadas(data.ventasEliminadas || []);
      setFilteredData(data.ventasEliminadas || []);
    } catch (err) {
      setError('Error al generar el reporte: ' + err.message);
    } finally {
      setLoadingReporte(false);
    }
  };

  /*
   * Reset.
   */
  const handleReset = () => {
    setFechaInicio(dayjs().format('YYYY-MM-DD'));
    setFechaFin(dayjs().format('YYYY-MM-DD'));

    if (!loadingSucursales && sucursales.length > 0) {
      if (userData?.idRol !== 1) {
        const sucursalUsuario = sucursales.find(
          s => s.idSucursal === userData?.idSucursal
        );

        if (sucursalUsuario) {
          setSelectedSucursal(sucursalUsuario.idSucursal);
        }
      } else {
        setSelectedSucursal('');
      }
    }

    setVentasEliminadas([]);
    setFilteredData([]);
    setError(null);
    setActiveVenta(null);
    setSelectedTurno('Todos');
  };

  /*
   * Formatos.
   */
  const formatFecha = fecha => {
    return dayjs(fecha).format('DD/MM/YYYY');
  };

  const formatFechaHora = fecha => {
    return dayjs(fecha).format('DD/MM/YYYY HH:mm');
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(Number(amount || 0));
  };

  /*
   * Expandir / contraer venta.
   */
  const toggleVenta = id => {
    setActiveVenta(activeVenta === id ? null : id);
  };

  /*
   * Badge de turno.
   */
  const renderTurnoBadge = turno => {
    const classes =
      turno === 'AM'
        ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300'
        : turno === 'PM'
        ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
        : 'bg-surface-2 text-muted';

    return (
      <span
        className={`inline-flex items-center rounded-full border border-line px-2.5 py-1 text-2xs font-bold ${classes}`}
      >
        {turno}
      </span>
    );
  };

  /*
   * Color de diferencia.
   */
  const getDifferenceClass = value => {
    return Number(value || 0) < 0
      ? 'text-danger-600 dark:text-danger-400'
      : 'text-brand-600 dark:text-brand-400';
  };

  /*
   * Totales.
   */
  const calcularTotales = () => {
    const totalVentas = filteredData.length;

    const totalDiferencia = filteredData.reduce(
      (sum, venta) => sum + Number(venta.diferencia || 0),
      0
    );

    const totalMontoIngresado = filteredData.reduce(
      (sum, venta) => sum + Number(venta.montoTotalIngresado || 0),
      0
    );

    const totalMontoEsperado = filteredData.reduce(
      (sum, venta) => sum + Number(venta.montoEsperado || 0),
      0
    );

    const totalGastos = filteredData.reduce(
      (sum, venta) => sum + Number(venta.montoTotalGastos || 0),
      0
    );

    return {
      totalVentas,
      totalDiferencia,
      totalMontoIngresado,
      totalMontoEsperado,
      totalGastos
    };
  };

  /*
   * Generar PDF.
   */
  const generatePDF = () => {
    const dataToExport = filteredData;

    if (dataToExport.length === 0) {
      setError('No hay datos para generar el reporte');
      return;
    }

    setGeneratingPDF(true);
    setError(null);

    try {
      const doc = new jsPDF('portrait', 'pt', 'a4');

      const sucursalNombre =
        sucursales.find(
          s => s.idSucursal == selectedSucursal
        )?.nombreSucursal || 'Sucursal no especificada';

      const today = new Date();

      const dateStr =
        today.toLocaleDateString('es-GT') +
        ' ' +
        today.toLocaleTimeString('es-GT', {
          hour: '2-digit',
          minute: '2-digit'
        });

      /*
       * Encabezado.
       */
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont('helvetica', 'bold');

      doc.text(
        'REPORTE DE VENTAS ELIMINADAS',
        doc.internal.pageSize.getWidth() / 2,
        40,
        {
          align: 'center'
        }
      );

      doc.setFontSize(10);
      doc.setTextColor(100);

      doc.text(
        `Generado el: ${dateStr}`,
        doc.internal.pageSize.getWidth() / 2,
        60,
        {
          align: 'center'
        }
      );

      doc.setFontSize(12);

      doc.text(
        `Sucursal: ${sucursalNombre}`,
        40,
        80
      );

      doc.text(
        `Rango de fechas: ${dayjs(fechaInicio).format(
          'DD/MM/YYYY'
        )} - ${dayjs(fechaFin).format('DD/MM/YYYY')}`,
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

      let currentY = selectedTurno !== 'Todos' ? 130 : 115;

      /*
       * Una venta por página.
       */
      dataToExport.forEach((venta, index) => {
        if (index > 0) {
          doc.addPage();
          currentY = 40;
        }

        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');

        doc.text(
          `VENTA ELIMINADA #${venta.idVenta}`,
          doc.internal.pageSize.getWidth() / 2,
          currentY,
          {
            align: 'center'
          }
        );

        currentY += 25;

        /*
         * Información general.
         */
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        doc.text(
          `ID Eliminación: ${venta.idEliminacion}`,
          40,
          currentY
        );

        doc.text(
          `Fecha Eliminación: ${formatFecha(
            venta.fechaEliminacion
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
          `Turno: ${venta.turno}`,
          200,
          currentY
        );

        currentY += 20;

        /*
         * Resumen financiero.
         */
        doc.setFont('helvetica', 'bold');

        doc.text(
          'RESUMEN FINANCIERO',
          40,
          currentY
        );

        currentY += 15;

        doc.setFont('helvetica', 'normal');

        doc.text(
          `Monto Ingresado: ${formatCurrency(
            venta.montoTotalIngresado
          )}`,
          60,
          currentY
        );

        doc.text(
          `Gastos: ${formatCurrency(
            venta.montoTotalGastos
          )}`,
          200,
          currentY
        );

        currentY += 15;

        doc.text(
          `Monto Esperado: ${formatCurrency(
            venta.montoEsperado
          )}`,
          60,
          currentY
        );

        doc.text(
          `Diferencia: ${formatCurrency(
            venta.diferencia
          )}`,
          200,
          currentY
        );

        currentY += 25;

        /*
         * Productos.
         */
        if (
          venta.ventaEliminadaDetalle &&
          venta.ventaEliminadaDetalle.length > 0
        ) {
          doc.setFont('helvetica', 'bold');

          doc.text(
            'PRODUCTOS ELIMINADOS:',
            40,
            currentY
          );

          currentY += 15;

          const productosData =
            venta.ventaEliminadaDetalle.map(producto => [
              producto.nombreProducto ||
                `Producto #${producto.idProducto}`,
              producto.cantidadVendidaEliminada?.toString() || '0',
              formatCurrency(producto.precioUnitario),
              formatCurrency(producto.subtotal)
            ]);

          autoTable(doc, {
            startY: currentY,
            head: [
              [
                'Producto',
                'Cantidad',
                'Precio Unitario',
                'Subtotal'
              ]
            ],
            body: productosData,
            theme: 'grid',
            headStyles: {
              fillColor: [192, 57, 43],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 9
            },
            alternateRowStyles: {
              fillColor: [250, 250, 250]
            },
            styles: {
              fontSize: 8,
              cellPadding: 4,
              overflow: 'linebreak'
            },
            margin: {
              horizontal: 40
            },
            tableWidth: 'auto',
            pageBreak: 'auto'
          });

          currentY = doc.lastAutoTable.finalY + 15;

          const totalProductos =
            venta.ventaEliminadaDetalle.reduce(
              (sum, prod) =>
                sum + Number(prod.subtotal || 0),
              0
            );

          doc.setFontSize(9);
          doc.setTextColor(100);

          doc.text(
            `Total productos: ${venta.ventaEliminadaDetalle.length}`,
            40,
            currentY
          );

          doc.text(
            `Monto total: ${formatCurrency(totalProductos)}`,
            200,
            currentY
          );

          currentY += 20;
        }

        /*
         * Pie de página.
         */
        doc.setFontSize(8);
        doc.setTextColor(150);

        doc.text(
          `Página ${doc.internal.getNumberOfPages()} - Venta ${
            index + 1
          } de ${dataToExport.length}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 20,
          {
            align: 'center'
          }
        );
      });

      const safeSucursalName = sucursalNombre.replace(
        /\s+/g,
        '_'
      );

      const safeDate = dateStr
        .replace(/\//g, '-')
        .replace(/:/g, '-')
        .replace(' ', '_');

      doc.save(
        `reporte-ventas-eliminadas-${safeSucursalName}-${safeDate}.pdf`
      );
    } catch (err) {
      setError(
        'Error al generar el PDF: ' + err.message
      );
    } finally {
      setGeneratingPDF(false);
    }
  };

  /*
   * Generar Excel.
   */
  const generateExcel = () => {
    const dataToExport = filteredData;

    if (dataToExport.length === 0) {
      setError('No hay datos para generar el reporte');
      return;
    }

    setGeneratingExcel(true);
    setError(null);

    try {
      const sucursalNombre =
        sucursales.find(
          s => s.idSucursal == selectedSucursal
        )?.nombreSucursal || 'Sucursal no especificada';

      const today = new Date();

      const dateStr =
        today.toLocaleDateString('es-GT') +
        ' ' +
        today.toLocaleTimeString('es-GT', {
          hour: '2-digit',
          minute: '2-digit'
        });

      const wb = XLSX.utils.book_new();

      /*
       * Una hoja por venta.
       */
      dataToExport.forEach(venta => {
        const ventaData = [
          ['REPORTE DE VENTAS ELIMINADAS'],
          [`Generado el: ${dateStr}`],
          [`Sucursal: ${sucursalNombre}`],
          [
            `Rango de fechas: ${dayjs(fechaInicio).format(
              'DD/MM/YYYY'
            )} - ${dayjs(fechaFin).format('DD/MM/YYYY')}`
          ],
          selectedTurno !== 'Todos'
            ? [`Turno: ${selectedTurno}`]
            : [],
          [],
          ['DETALLE DE VENTA ELIMINADA'],
          [`Venta #${venta.idVenta}`],
          [],
          ['INFORMACIÓN GENERAL'],
          [`ID Eliminación: ${venta.idEliminacion}`],
          [`ID Venta: ${venta.idVenta}`],
          [
            `Fecha Eliminación: ${formatFecha(
              venta.fechaEliminacion
            )}`
          ],
          [`Usuario: ${venta.usuario}`],
          [`Turno: ${venta.turno}`],
          [],
          ['RESUMEN FINANCIERO'],
          [
            `Monto Ingresado: ${formatCurrency(
              venta.montoTotalIngresado
            )}`
          ],
          [
            `Gastos: ${formatCurrency(
              venta.montoTotalGastos
            )}`
          ],
          [
            `Monto Esperado: ${formatCurrency(
              venta.montoEsperado
            )}`
          ],
          [
            `Diferencia: ${formatCurrency(
              venta.diferencia
            )}`
          ],
          [],
          ['PRODUCTOS ELIMINADOS'],
          [
            'Producto',
            'Cantidad',
            'Precio Unitario',
            'Subtotal'
          ]
        ];

        if (venta.ventaEliminadaDetalle) {
          venta.ventaEliminadaDetalle.forEach(
            producto => {
              ventaData.push([
                producto.nombreProducto ||
                  `Producto #${producto.idProducto}`,
                producto.cantidadVendidaEliminada,
                producto.precioUnitario,
                producto.subtotal
              ]);
            }
          );
        }

        const totalVenta =
          venta.ventaEliminadaDetalle?.reduce(
            (sum, prod) =>
              sum + Number(prod.subtotal || 0),
            0
          ) || 0;

        ventaData.push([]);
        ventaData.push([
          '',
          '',
          'TOTAL:',
          totalVenta
        ]);

        ventaData.push([
          `Total productos: ${
            venta.ventaEliminadaDetalle?.length || 0
          }`
        ]);

        const wsVenta =
          XLSX.utils.aoa_to_sheet(ventaData);

        wsVenta['!cols'] = [
          { wch: 35 },
          { wch: 12 },
          { wch: 15 },
          { wch: 15 }
        ];

        /*
         * Encabezados principales.
         */
        [
          'A1',
          'A7',
          'A10',
          'A17',
          'A23'
        ].forEach(cell => {
          if (wsVenta[cell]) {
            wsVenta[cell].s = {
              font: {
                bold: true,
                color: {
                  rgb: 'FFFFFF'
                }
              },
              fill: {
                fgColor: {
                  rgb: 'C0392B'
                }
              }
            };
          }
        });

        /*
         * Encabezado productos.
         */
        [
          'A23',
          'B23',
          'C23',
          'D23'
        ].forEach(cell => {
          if (wsVenta[cell]) {
            wsVenta[cell].s = {
              font: {
                bold: true,
                color: {
                  rgb: 'FFFFFF'
                }
              },
              fill: {
                fgColor: {
                  rgb: '3498DB'
                }
              }
            };
          }
        });

        /*
         * Formato de moneda.
         */
        const currencyRows = [17, 18, 19, 20];

        currencyRows.forEach(row => {
          ['C', 'D'].forEach(col => {
            const cellRef =
              XLSX.utils.encode_cell({
                r: row,
                c: col === 'C' ? 2 : 3
              });

            if (wsVenta[cellRef]) {
              wsVenta[cellRef].z =
                '"Q"#,##0.00';
            }
          });
        });

        /*
         * Productos como moneda.
         */
        const startProductsRow = 23;

        (venta.ventaEliminadaDetalle || []).forEach(
          (_, productIndex) => {
            const dataRow =
              startProductsRow + 1 + productIndex;

            ['C', 'D'].forEach(col => {
              const cellRef =
                XLSX.utils.encode_cell({
                  r: dataRow,
                  c: col === 'C' ? 2 : 3
                });

              if (wsVenta[cellRef]) {
                wsVenta[cellRef].z =
                  '"Q"#,##0.00';
              }
            });
          }
        );

        /*
         * Total.
         */
        const totalRow =
          startProductsRow +
          (venta.ventaEliminadaDetalle?.length || 0) +
          2;

        ['C', 'D'].forEach(col => {
          const cellRef =
            XLSX.utils.encode_cell({
              r: totalRow,
              c: col === 'C' ? 2 : 3
            });

          if (wsVenta[cellRef]) {
            wsVenta[cellRef].z =
              '"Q"#,##0.00';

            wsVenta[cellRef].s = {
              font: {
                bold: true
              }
            };
          }
        });

        XLSX.utils.book_append_sheet(
          wb,
          wsVenta,
          `Venta ${venta.idVenta}`
        );
      });

      const safeSucursalName =
        sucursalNombre.replace(/\s+/g, '_');

      const safeDate = dateStr
        .replace(/\//g, '-')
        .replace(/:/g, '-')
        .replace(' ', '_');

      const fileName =
        `Reporte_Ventas_Eliminadas_${safeSucursalName}_${safeDate}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (err) {
      setError(
        'Error al generar el Excel: ' + err.message
      );

      console.error(
        'Error detallado:',
        err
      );
    } finally {
      setGeneratingExcel(false);
    }
  };

  const {
    totalVentas,
    totalDiferencia,
    totalMontoIngresado,
    totalMontoEsperado,
    totalGastos
  } = calcularTotales();

  /*
   * Tarjeta de detalle de productos.
   */
  const renderProductosDetalle = venta => {
    if (
      !venta.ventaEliminadaDetalle ||
      venta.ventaEliminadaDetalle.length === 0
    ) {
      return (
        <div className="rounded-xl border border-line bg-surface-2 p-4 text-sm text-muted">
          No hay productos registrados en el detalle de esta venta.
        </div>
      );
    }

    const totalProductos =
      venta.ventaEliminadaDetalle.reduce(
        (sum, producto) =>
          sum + Number(producto.subtotal || 0),
        0
      );

    return (
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <FiPackage className="text-brand-600 dark:text-brand-400" />

            <div>
              <p className="text-sm font-bold text-ink">
                Productos eliminados
              </p>

              <p className="text-2xs text-muted">
                {venta.ventaEliminadaDetalle.length}{' '}
                producto
                {venta.ventaEliminadaDetalle.length !== 1
                  ? 's'
                  : ''}
              </p>
            </div>
          </div>

          <span className="text-sm font-bold text-ink">
            {formatCurrency(totalProductos)}
          </span>
        </div>

        <div className="divide-y divide-line">
          {venta.ventaEliminadaDetalle.map(
            (producto, index) => (
              <div
                key={`${venta.idEliminacion}-${index}`}
                className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_100px_130px_130px] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {producto.nombreProducto ||
                      `Producto #${producto.idProducto}`}
                  </p>

                  <p className="mt-0.5 text-2xs text-muted">
                    ID producto: {producto.idProducto}
                  </p>
                </div>

                <div>
                  <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                    Cantidad
                  </p>

                  <p className="mt-1 text-sm font-semibold text-ink">
                    {producto.cantidadVendidaEliminada}
                  </p>
                </div>

                <div>
                  <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                    Precio unitario
                  </p>

                  <p className="mt-1 text-sm font-semibold text-ink">
                    {formatCurrency(
                      producto.precioUnitario
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                    Subtotal
                  </p>

                  <p className="mt-1 text-sm font-bold text-ink">
                    {formatCurrency(
                      producto.subtotal
                    )}
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-surface-2 px-4 py-3">
          <span className="text-xs font-semibold text-muted">
            Total de productos
          </span>

          <span className="text-sm font-bold text-ink">
            {formatCurrency(totalProductos)}
          </span>
        </div>
      </div>
    );
  };

  /*
   * Detalle expandido.
   */
  const renderVentaDetail = venta => (
    <div className="border-t border-danger-200 bg-danger-50/70 p-4 dark:border-danger-900/50 dark:bg-danger-900/10 sm:p-5">
      <div className="overflow-hidden rounded-2xl border border-danger-200 bg-surface shadow-sm dark:border-danger-900/50">
        {/* Encabezado */}
        <div className="flex flex-col gap-3 border-b border-line bg-surface-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
              <FiTrash2 />
            </div>

            <div>
              <p className="text-sm font-bold text-ink">
                Detalle de venta eliminada #{venta.idVenta}
              </p>

              <p className="mt-0.5 text-xs text-muted">
                Eliminada el{' '}
                {formatFechaHora(
                  venta.fechaEliminacion
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {renderTurnoBadge(venta.turno)}

            <span className="inline-flex items-center rounded-full border border-danger-200 bg-danger-50 px-2.5 py-1 text-2xs font-bold text-danger-700 dark:border-danger-900/50 dark:bg-danger-900/20 dark:text-danger-300">
              ELIMINADA
            </span>
          </div>
        </div>

        {/* Información general */}
        <div className="border-b border-line p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <FiUser className="text-brand-600 dark:text-brand-400" />

            <h3 className="text-sm font-bold text-ink">
              Información de eliminación
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                ID Eliminación
              </p>

              <p className="mt-1 text-sm font-bold text-ink">
                #{venta.idEliminacion}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                ID Venta
              </p>

              <p className="mt-1 text-sm font-bold text-ink">
                #{venta.idVenta}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                Usuario
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-ink">
                {venta.usuario || 'No disponible'}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                Fecha de eliminación
              </p>

              <p className="mt-1 text-sm font-semibold text-ink">
                {formatFechaHora(
                  venta.fechaEliminacion
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen financiero */}
        <div className="border-b border-line p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <FiDollarSign className="text-brand-600 dark:text-brand-400" />

            <h3 className="text-sm font-bold text-ink">
              Resumen financiero
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                Monto ingresado
              </p>

              <p className="mt-1 text-sm font-bold text-ink">
                {formatCurrency(
                  venta.montoTotalIngresado
                )}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                Gastos
              </p>

              <p className="mt-1 text-sm font-bold text-ink">
                {formatCurrency(
                  venta.montoTotalGastos
                )}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                Monto esperado
              </p>

              <p className="mt-1 text-sm font-bold text-ink">
                {formatCurrency(
                  venta.montoEsperado
                )}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                Diferencia
              </p>

              <p
                className={`mt-1 text-sm font-bold ${getDifferenceClass(
                  venta.diferencia
                )}`}
              >
                {formatCurrency(venta.diferencia)}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                Turno
              </p>

              <div className="mt-1">
                {renderTurnoBadge(venta.turno)}
              </div>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <FiPackage className="text-brand-600 dark:text-brand-400" />

            <h3 className="text-sm font-bold text-ink">
              Productos eliminados
            </h3>
          </div>

          {renderProductosDetalle(venta)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ============================================================
          HEADER
      ============================================================ */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate('/reportes')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20"
          aria-label="Regresar a reportes"
        >
          <FiArrowLeft size={19} />
        </button>

        <div className="flex items-start gap-3">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400 sm:flex">
            <FiTrash2 size={21} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-ink sm:text-2xl">
              Ventas Eliminadas
            </h1>

            <p className="mt-1 text-sm text-muted">
              Consulta el historial de ventas eliminadas por
              sucursal y fecha.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================
          RESUMEN
      ============================================================ */}
      {ventasEliminadas.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Ventas */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
                <FiTrash2 />
              </div>

              <div className="min-w-0">
                <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                  Ventas eliminadas
                </p>

                <p className="mt-1 text-xl font-bold text-ink">
                  {totalVentas}
                </p>
              </div>
            </div>
          </div>

          {/* Ingresado */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <FiDollarSign />
              </div>

              <div className="min-w-0">
                <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                  Monto ingresado
                </p>

                <p className="mt-1 truncate text-lg font-bold text-ink">
                  {formatCurrency(
                    totalMontoIngresado
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Gastos */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-muted">
                <FiRefreshCw />
              </div>

              <div className="min-w-0">
                <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                  Total gastos
                </p>

                <p className="mt-1 truncate text-lg font-bold text-ink">
                  {formatCurrency(totalGastos)}
                </p>
              </div>
            </div>
          </div>

          {/* Diferencia */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-muted">
                <FiAlertTriangle />
              </div>

              <div className="min-w-0">
                <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                  Diferencia total
                </p>

                <p
                  className={`mt-1 truncate text-lg font-bold ${getDifferenceClass(
                    totalDiferencia
                  )}`}
                >
                  {formatCurrency(totalDiferencia)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          FILTROS
      ============================================================ */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <FiFilter size={17} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-ink">
              Filtros del reporte
            </h2>

            <p className="text-2xs text-muted">
              Selecciona los criterios para consultar las
              ventas eliminadas.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Fecha inicio */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Fecha inicio
            </label>

            <div className="relative">
              <FiCalendar
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                size={16}
              />

              <input
                type="date"
                value={fechaInicio}
                max={
                  fechaFin ||
                  dayjs().format('YYYY-MM-DD')
                }
                onChange={e =>
                  setFechaInicio(e.target.value)
                }
                onFocus={e =>
                  e.target.showPicker?.()
                }
                className="h-11 w-full rounded-xl border border-line bg-surface-2 pl-10 pr-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Fecha fin */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Fecha fin
            </label>

            <div className="relative">
              <FiCalendar
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                size={16}
              />

              <input
                type="date"
                value={fechaFin}
                min={fechaInicio}
                max={dayjs().format('YYYY-MM-DD')}
                onChange={e =>
                  setFechaFin(e.target.value)
                }
                onFocus={e =>
                  e.target.showPicker?.()
                }
                className="h-11 w-full rounded-xl border border-line bg-surface-2 pl-10 pr-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Sucursal */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Sucursal
            </label>

            {userData?.idRol === 1 ? (
              <div className="relative">
                <select
                  value={selectedSucursal}
                  onChange={e =>
                    setSelectedSucursal(e.target.value)
                  }
                  disabled={
                    loadingSucursales ||
                    sucursales.length === 0
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-line bg-surface-2 px-3 pr-10 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    Seleccionar sucursal
                  </option>

                  {sucursales.map(sucursal => (
                    <option
                      key={sucursal.idSucursal}
                      value={sucursal.idSucursal}
                    >
                      {sucursal.nombreSucursal}
                    </option>
                  ))}
                </select>

                <FiChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  size={17}
                />
              </div>
            ) : (
              <input
                type="text"
                readOnly
                value={
                  sucursales.find(
                    s =>
                      s.idSucursal ===
                      userData?.idSucursal
                  )?.nombreSucursal ||
                  'Tu sucursal'
                }
                className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm text-ink outline-none"
              />
            )}

            {loadingSucursales && (
              <p className="mt-1 text-2xs text-muted">
                Cargando sucursales...
              </p>
            )}

            {!loadingSucursales &&
              sucursales.length === 0 && (
                <p className="mt-1 text-2xs text-danger-600 dark:text-danger-400">
                  No hay sucursales disponibles.
                </p>
              )}
          </div>

          {/* Turno */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">
              Turno
            </label>

            <div className="relative">
              <select
                value={selectedTurno}
                onChange={e =>
                  setSelectedTurno(e.target.value)
                }
                disabled={ventasEliminadas.length === 0}
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

              <FiChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                size={17}
              />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-muted transition hover:bg-surface-2"
          >
            <FiRefreshCw size={16} />
            Restablecer
          </button>

          <button
            type="button"
            onClick={handleGenerarReporte}
            disabled={
              !fechaInicio ||
              !fechaFin ||
              !selectedSucursal ||
              loadingReporte
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
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

      {/* ============================================================
          ERRORES
      ============================================================ */}
      {error && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 dark:border-danger-900/50 dark:bg-danger-900/20 dark:text-danger-300">
          {error}
        </div>
      )}

      {showErrorSucursales && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 dark:border-danger-900/50 dark:bg-danger-900/20 dark:text-danger-300">
          Error al cargar las sucursales.
        </div>
      )}

      {/* ============================================================
          EXPORTACIONES
      ============================================================ */}
      {ventasEliminadas.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={generateExcel}
            disabled={
              generatingExcel ||
              filteredData.length === 0
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generatingExcel ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted/30 border-t-muted" />
                Generando...
              </>
            ) : (
              <>
                <FiDownload size={16} />
                Exportar a Excel
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
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 text-sm font-semibold text-danger-700 transition hover:bg-danger-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-danger-900/50 dark:bg-danger-900/20 dark:text-danger-300 dark:hover:bg-danger-900/30"
          >
            {generatingPDF ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-danger-300/40 border-t-danger-600 dark:border-danger-700/40 dark:border-t-danger-300" />
                Generando...
              </>
            ) : (
              <>
                <FiDownload size={16} />
                Exportar a PDF
              </>
            )}
          </button>
        </div>
      )}

      {/* ============================================================
          RESULTADOS
      ============================================================ */}
      {filteredData.length > 0 ? (
        <>
          {/* ========================================================
              DESKTOP
          ======================================================== */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-surface-2">
                  <tr>
                    <th className="px-4 py-3 text-2xs font-bold uppercase tracking-wide text-muted">
                      Fecha
                    </th>

                    <th className="px-4 py-3 text-2xs font-bold uppercase tracking-wide text-muted">
                      Venta / Usuario
                    </th>

                    <th className="px-4 py-3 text-2xs font-bold uppercase tracking-wide text-muted">
                      Turno
                    </th>

                    <th className="px-4 py-3 text-right text-2xs font-bold uppercase tracking-wide text-muted">
                      Ingresado
                    </th>

                    <th className="px-4 py-3 text-right text-2xs font-bold uppercase tracking-wide text-muted">
                      Diferencia
                    </th>

                    <th className="w-12 px-4 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map(venta => {
                    const isOpen =
                      activeVenta ===
                      venta.idEliminacion;

                    return (
                      <React.Fragment
                        key={venta.idEliminacion}
                      >
                        {/* Fila resumen */}
                        <tr
                          onClick={() =>
                            toggleVenta(
                              venta.idEliminacion
                            )
                          }
                          className="cursor-pointer border-t border-line text-sm text-ink"
                        >
                          <td className="px-4 py-4 align-middle">
                            <div className="flex items-center gap-2">
                              <FiCalendar
                                className="shrink-0 text-muted"
                                size={15}
                              />

                              <div>
                                <p className="font-semibold">
                                  {formatFecha(
                                    venta.fechaEliminacion
                                  )}
                                </p>

                                <p className="text-2xs text-muted">
                                  {dayjs(
                                    venta.fechaEliminacion
                                  ).format('HH:mm')}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-middle">
                            <p className="font-bold text-ink">
                              Venta #{venta.idVenta}
                            </p>

                            <p className="mt-0.5 text-xs text-muted">
                              {venta.usuario ||
                                'Usuario no disponible'}
                            </p>
                          </td>

                          <td className="px-4 py-4 align-middle">
                            {renderTurnoBadge(
                              venta.turno
                            )}
                          </td>

                          <td className="px-4 py-4 text-right align-middle">
                            <span className="font-semibold text-ink">
                              {formatCurrency(
                                venta.montoTotalIngresado
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right align-middle">
                            <span
                              className={`font-bold ${getDifferenceClass(
                                venta.diferencia
                              )}`}
                            >
                              {formatCurrency(
                                venta.diferencia
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center align-middle">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted">
                              {isOpen ? (
                                <FiChevronUp
                                  size={17}
                                />
                              ) : (
                                <FiChevronDown
                                  size={17}
                                />
                              )}
                            </span>
                          </td>
                        </tr>

                        {/* Detalle expandido */}
                        {isOpen && (
                          <tr className="border-t border-line">
                            <td
                              colSpan={6}
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
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================
              MOBILE
          ======================================================== */}
          <div className="space-y-3 sm:hidden">
            {filteredData.map(venta => {
              const isOpen =
                activeVenta ===
                venta.idEliminacion;

              return (
                <div
                  key={venta.idEliminacion}
                  className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
                >
                  {/* Resumen */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleVenta(
                        venta.idEliminacion
                      )
                    }
                    className="flex w-full items-center justify-between gap-3 p-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
                          <FiTrash2 size={16} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink">
                            Venta #{venta.idVenta}
                          </p>

                          <p className="mt-0.5 text-2xs text-muted">
                            {formatFecha(
                              venta.fechaEliminacion
                            )}{' '}
                            ·{' '}
                            {dayjs(
                              venta.fechaEliminacion
                            ).format('HH:mm')}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="truncate text-xs font-medium text-muted">
                          {venta.usuario ||
                            'Usuario no disponible'}
                        </span>

                        {renderTurnoBadge(
                          venta.turno
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`text-sm font-bold ${getDifferenceClass(
                          venta.diferencia
                        )}`}
                      >
                        {formatCurrency(
                          venta.diferencia
                        )}
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted">
                        {isOpen ? (
                          <FiChevronUp size={17} />
                        ) : (
                          <FiChevronDown size={17} />
                        )}
                      </span>
                    </div>
                  </button>

                  {/* Detalle */}
                  {isOpen && (
                    <div className="border-t border-danger-200 bg-danger-50/70 p-3 dark:border-danger-900/50 dark:bg-danger-900/10">
                      <div className="overflow-hidden rounded-xl border border-danger-200 bg-surface shadow-sm dark:border-danger-900/50">
                        <div className="border-b border-line bg-surface-2 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-ink">
                                Detalle de eliminación
                              </p>

                              <p className="mt-0.5 text-2xs text-muted">
                                ID eliminación #
                                {venta.idEliminacion}
                              </p>
                            </div>

                            <span className="inline-flex items-center rounded-full border border-danger-200 bg-danger-50 px-2.5 py-1 text-2xs font-bold text-danger-700 dark:border-danger-900/50 dark:bg-danger-900/20 dark:text-danger-300">
                              ELIMINADA
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4 p-4">
                          {/* Información */}
                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <FiUser
                                size={15}
                                className="text-brand-600 dark:text-brand-400"
                              />

                              <p className="text-xs font-bold text-ink">
                                Información general
                              </p>
                            </div>

                            <div className="grid gap-2">
                              <div className="rounded-lg bg-surface-2 p-3">
                                <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                                  Usuario
                                </p>

                                <p className="mt-1 text-sm font-semibold text-ink">
                                  {venta.usuario ||
                                    'No disponible'}
                                </p>
                              </div>

                              <div className="rounded-lg bg-surface-2 p-3">
                                <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                                  Fecha de eliminación
                                </p>

                                <p className="mt-1 text-sm font-semibold text-ink">
                                  {formatFechaHora(
                                    venta.fechaEliminacion
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Finanzas */}
                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <FiDollarSign
                                size={15}
                                className="text-brand-600 dark:text-brand-400"
                              />

                              <p className="text-xs font-bold text-ink">
                                Resumen financiero
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-lg bg-surface-2 p-3">
                                <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                                  Ingresado
                                </p>

                                <p className="mt-1 text-sm font-bold text-ink">
                                  {formatCurrency(
                                    venta.montoTotalIngresado
                                  )}
                                </p>
                              </div>

                              <div className="rounded-lg bg-surface-2 p-3">
                                <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                                  Gastos
                                </p>

                                <p className="mt-1 text-sm font-bold text-ink">
                                  {formatCurrency(
                                    venta.montoTotalGastos
                                  )}
                                </p>
                              </div>

                              <div className="rounded-lg bg-surface-2 p-3">
                                <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                                  Esperado
                                </p>

                                <p className="mt-1 text-sm font-bold text-ink">
                                  {formatCurrency(
                                    venta.montoEsperado
                                  )}
                                </p>
                              </div>

                              <div className="rounded-lg bg-surface-2 p-3">
                                <p className="text-2xs font-bold uppercase tracking-wide text-muted">
                                  Diferencia
                                </p>

                                <p
                                  className={`mt-1 text-sm font-bold ${getDifferenceClass(
                                    venta.diferencia
                                  )}`}
                                >
                                  {formatCurrency(
                                    venta.diferencia
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Productos */}
                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <FiPackage
                                size={15}
                                className="text-brand-600 dark:text-brand-400"
                              />

                              <p className="text-xs font-bold text-ink">
                                Productos eliminados
                              </p>
                            </div>

                            {renderProductosDetalle(
                              venta
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : ventasEliminadas.length > 0 &&
        filteredData.length === 0 ? (
        /* ============================================================
           FILTRO SIN RESULTADOS
        ============================================================ */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-12 text-center shadow-card">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-muted">
            <FiFilter size={25} />
          </div>

          <h3 className="mt-4 text-base font-bold text-ink">
            No hay resultados
          </h3>

          <p className="mt-1 max-w-md text-sm text-muted">
            No se encontraron ventas eliminadas para el
            turno seleccionado.
          </p>
        </div>
      ) : (
        /* ============================================================
           ESTADO VACÍO
        ============================================================ */
        !showErrorSucursales && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-14 text-center shadow-card">
            {loadingReporte ? (
              <>
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 dark:border-brand-900/40 dark:border-t-brand-400" />

                <h3 className="mt-4 text-base font-bold text-ink">
                  Generando reporte...
                </h3>

                <p className="mt-1 text-sm text-muted">
                  Estamos consultando las ventas eliminadas.
                </p>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
                  <FiTrash2 size={26} />
                </div>

                <h3 className="mt-4 text-base font-bold text-ink">
                  No hay datos para mostrar
                </h3>

                <p className="mt-1 max-w-md text-sm text-muted">
                  Selecciona un rango de fechas y una sucursal
                  para generar el reporte de ventas eliminadas.
                </p>
              </>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default VentasEliminadasPage;