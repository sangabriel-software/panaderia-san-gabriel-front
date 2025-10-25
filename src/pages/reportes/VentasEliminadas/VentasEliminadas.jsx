import React, { useState, useEffect } from 'react';
import { FiFilter, FiDownload, FiRefreshCw, FiCalendar, FiChevronDown, FiChevronUp, FiArrowLeft, FiTrash2, FiEye } from 'react-icons/fi';
import { Container, Row, Col, Form, Button, Spinner, Card, Accordion, Table, Badge, Modal } from 'react-bootstrap';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import useGetSucursales from '../../../hooks/sucursales/useGetSucursales';
import { generarReporteVentasEliminadasService } from '../../../services/reportes/reportes.service';
import { getUserData } from '../../../utils/Auth/decodedata';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import './VentasEliminadas.styles.css';

const VentasEliminadasPage = () => {
  const navigate = useNavigate();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const userData = getUserData();
  
  const [selectedSucursal, setSelectedSucursal] = useState('');
  const [ventasEliminadas, setVentasEliminadas] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(dayjs().format('YYYY-MM-DD'));
  const [fechaFin, setFechaFin] = useState(dayjs().format('YYYY-MM-DD'));
  const [activeVenta, setActiveVenta] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState('Todos');
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  useEffect(() => {
    if (!loadingSucursales && sucursales.length > 0) {
      if (userData?.idRol !== 1) {
        // Para usuarios que no son admin, asignar su sucursal automáticamente
        const sucursalUsuario = sucursales.find(s => s.idSucursal === userData.idSucursal);
        if (sucursalUsuario) {
          setSelectedSucursal(sucursalUsuario.idSucursal);
        }
      }
      // Para admin, no asignamos automáticamente, dejamos que seleccione
    }
  }, [loadingSucursales, sucursales, userData]);

  useEffect(() => {
    if (selectedTurno === 'Todos') {
      setFilteredData(ventasEliminadas);
    } else {
      const filtered = ventasEliminadas.filter(venta => venta.turno === selectedTurno);
      setFilteredData(filtered);
    }
  }, [selectedTurno, ventasEliminadas]);

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
      setError('La fecha de inicio no puede ser mayor a la fecha final');
      return;
    }

    setError(null);
    setLoadingReporte(true);
    setSelectedTurno('Todos');

    try {
      const data = await generarReporteVentasEliminadasService(fechaInicio, fechaFin, selectedSucursal);
      setVentasEliminadas(data.ventasEliminadas || []);
      setFilteredData(data.ventasEliminadas || []);
    } catch (err) {
      setError('Error al generar el reporte: ' + err.message);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleReset = () => {
    setFechaInicio(dayjs().format('YYYY-MM-DD'));
    setFechaFin(dayjs().format('YYYY-MM-DD'));
    // Al resetear, solo asignamos automáticamente para usuarios no admin
    if (!loadingSucursales && sucursales.length > 0) {
      if (userData?.idRol !== 1) {
        const sucursalUsuario = sucursales.find(s => s.idSucursal === userData?.idSucursal);
        if (sucursalUsuario) {
          setSelectedSucursal(sucursalUsuario.idSucursal);
        }
      } else {
        // Para admin, reseteamos a vacío para que tenga que seleccionar
        setSelectedSucursal('');
      }
    }
    setVentasEliminadas([]);
    setFilteredData([]);
    setError(null);
    setActiveVenta(null);
    setSelectedTurno('Todos');
  };

  const formatFecha = (fecha) => {
    return dayjs(fecha).format('DD/MM/YYYY');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(amount);
  };

  const toggleVenta = (id) => {
    setActiveVenta(activeVenta === id ? null : id);
  };

  const handleVerDetalle = (venta) => {
    setVentaSeleccionada(venta);
    setShowDetalleModal(true);
  };

  const handleCloseDetalleModal = () => {
    setShowDetalleModal(false);
    setVentaSeleccionada(null);
  };

  const renderErrorAlert = (message) => (
    <div className="ve-custom-alert ve-error">
      <div className="ve-alert-content">
        <span className="ve-alert-message">{message}</span>
      </div>
    </div>
  );

  const renderTurnoBadge = (turno) => {
    switch(turno) {
      case 'AM':
        return <Badge bg="info" className="ve-turno-badge ve-am">{turno}</Badge>;
      case 'PM':
        return <Badge bg="primary" className="ve-turno-badge ve-pm">{turno}</Badge>;
      default:
        return <Badge bg="secondary" className="ve-turno-badge">{turno}</Badge>;
    }
  };

  const getTurnoBackgroundColor = (turno) => {
    return turno === 'AM' ? 'rgba(75, 192, 192, 0.2)' : 'rgba(153, 102, 255, 0.2)';
  };

  const getTurnoTextColor = (turno) => {
    return turno === 'AM' ? 'rgba(75, 192, 192, 1)' : 'rgba(153, 102, 255, 1)';
  };

  const calcularTotales = () => {
    const totalVentas = filteredData.length;
    const totalDiferencia = filteredData.reduce((sum, venta) => sum + venta.diferencia, 0);
    const totalMontoIngresado = filteredData.reduce((sum, venta) => sum + venta.montoTotalIngresado, 0);
    const totalMontoEsperado = filteredData.reduce((sum, venta) => sum + venta.montoEsperado, 0);
    const totalGastos = filteredData.reduce((sum, venta) => sum + venta.montoTotalGastos, 0);
    
    return { totalVentas, totalDiferencia, totalMontoIngresado, totalMontoEsperado, totalGastos };
  };

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
      const sucursalNombre = sucursales.find(s => s.idSucursal == selectedSucursal)?.nombreSucursal || 'Sucursal no especificada';
      const today = new Date();
      const dateStr = today.toLocaleDateString('es-GT') + ' ' + today.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  
      // Encabezado general solo en la primera página
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE VENTAS ELIMINADAS', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
  
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${dateStr}`, doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Sucursal: ${sucursalNombre}`, 40, 80);
      doc.text(
        `Rango de fechas: ${dayjs(fechaInicio).format('DD/MM/YYYY')} - ${dayjs(fechaFin).format('DD/MM/YYYY')}`,
        40,
        95
      );
      
      if (selectedTurno !== 'Todos') {
        doc.text(`Turno: ${selectedTurno}`, 40, 110);
      }
  
      let currentY = 130;
      
      // Detalle de cada venta eliminada - UNA VENTA POR PÁGINA
      dataToExport.forEach((venta, index) => {
        // Si no es la primera venta, agregar nueva página
        if (index > 0) {
          doc.addPage();
          currentY = 40;
        }

        // Encabezado de la venta eliminada
        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text(`VENTA ELIMINADA #${venta.idVenta}`, doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
        
        currentY += 25;

        // Información básica de la venta
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`ID Eliminación: ${venta.idEliminacion}`, 40, currentY);
        doc.text(`Fecha Eliminación: ${formatFecha(venta.fechaEliminacion)}`, 200, currentY);
        currentY += 15;
        
        doc.text(`Usuario: ${venta.usuario}`, 40, currentY);
        doc.text(`Turno: ${venta.turno}`, 200, currentY);
        currentY += 20;

        // Resumen financiero
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN FINANCIERO', 40, currentY);
        currentY += 15;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Monto Ingresado: ${formatCurrency(venta.montoTotalIngresado)}`, 60, currentY);
        doc.text(`Gastos: ${formatCurrency(venta.montoTotalGastos)}`, 200, currentY);
        currentY += 15;
        
        doc.text(`Monto Esperado: ${formatCurrency(venta.montoEsperado)}`, 60, currentY);
        doc.text(`Diferencia: ${formatCurrency(venta.diferencia)}`, 200, currentY);
        currentY += 25;

        // Tabla de productos
        if (venta.ventaEliminadaDetalle.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('PRODUCTOS ELIMINADOS:', 40, currentY);
          currentY += 15;

          const productosData = venta.ventaEliminadaDetalle.map(producto => [
            producto.nombreProducto || `Producto #${producto.idProducto}`,
            producto.cantidadVendidaEliminada.toString(),
            formatCurrency(producto.precioUnitario),
            formatCurrency(producto.subtotal)
          ]);

          // Configurar autoTable para manejar páginas automáticamente
          const tableOptions = {
            startY: currentY,
            head: [
              ['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']
            ],
            body: productosData,
            theme: 'grid',
            headStyles: {
              fillColor: [52, 152, 219],
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
            margin: { horizontal: 40 },
            tableWidth: 'auto',
            pageBreak: 'auto'
          };

          autoTable(doc, tableOptions);

          currentY = doc.lastAutoTable.finalY + 15;

          // Total de productos
          const totalProductos = venta.ventaEliminadaDetalle.reduce((sum, prod) => sum + prod.subtotal, 0);
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(`Total productos: ${venta.ventaEliminadaDetalle.length}`, 40, currentY);
          doc.text(`Monto total: ${formatCurrency(totalProductos)}`, 200, currentY);
          
          currentY += 20;
        }

        // Número de página para cada venta
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${doc.internal.getNumberOfPages()} - Venta ${index + 1} de ${dataToExport.length}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 20,
          { align: 'center' }
        );
      });
  
      doc.save(`reporte-ventas-eliminadas-${sucursalNombre.replace(/\s+/g, '_')}-${dateStr.replace(/\//g, '-').replace(/:/g, '-').replace(' ', '_')}.pdf`);
    } catch (err) {
      setError('Error al generar el PDF: ' + err.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const generateExcel = () => {
    const dataToExport = filteredData;
    
    if (dataToExport.length === 0) {
      setError('No hay datos para generar el reporte');
      return;
    }
  
    setGeneratingExcel(true);
    setError(null);
  
    try {
      const sucursalNombre = sucursales.find(s => s.idSucursal == selectedSucursal)?.nombreSucursal || 'Sucursal no especificada';
      const today = new Date();
      const dateStr = today.toLocaleDateString('es-GT') + ' ' + today.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  
      const wb = XLSX.utils.book_new();

      // Crear una hoja por cada venta - UNA VENTA POR HOJA
      dataToExport.forEach((venta, index) => {
        const ventaData = [
          ["REPORTE DE VENTAS ELIMINADAS"],
          [`Generado el: ${dateStr}`],
          [`Sucursal: ${sucursalNombre}`],
          [`Rango de fechas: ${dayjs(fechaInicio).format('DD/MM/YYYY')} - ${dayjs(fechaFin).format('DD/MM/YYYY')}`],
          selectedTurno !== 'Todos' ? [`Turno: ${selectedTurno}`] : [],
          [],
          ["DETALLE DE VENTA ELIMINADA"],
          [`Venta #${venta.idVenta}`],
          [],
          ["INFORMACIÓN GENERAL"],
          [`ID Eliminación: ${venta.idEliminacion}`],
          [`ID Venta: ${venta.idVenta}`],
          [`Fecha Eliminación: ${formatFecha(venta.fechaEliminacion)}`],
          [`Usuario: ${venta.usuario}`],
          [`Turno: ${venta.turno}`],
          [],
          ["RESUMEN FINANCIERO"],
          [`Monto Ingresado: ${formatCurrency(venta.montoTotalIngresado)}`],
          [`Gastos: ${formatCurrency(venta.montoTotalGastos)}`],
          [`Monto Esperado: ${formatCurrency(venta.montoEsperado)}`],
          [`Diferencia: ${formatCurrency(venta.diferencia)}`],
          [],
          ["PRODUCTOS ELIMINADOS"],
          ["Producto", "Cantidad", "Precio Unitario", "Subtotal"]
        ];

        // Agregar productos
        venta.ventaEliminadaDetalle.forEach((producto) => {
          ventaData.push([
            producto.nombreProducto || `Producto #${producto.idProducto}`,
            producto.cantidadVendidaEliminada,
            producto.precioUnitario,
            producto.subtotal
          ]);
        });

        // Agregar total
        const totalVenta = venta.ventaEliminadaDetalle.reduce((sum, prod) => sum + prod.subtotal, 0);
        ventaData.push([]);
        ventaData.push(["", "", "TOTAL:", totalVenta]);
        ventaData.push([`Total productos: ${venta.ventaEliminadaDetalle.length}`]);

        const wsVenta = XLSX.utils.aoa_to_sheet(ventaData);

        // Ajustar anchos de columnas para esta hoja
        const colWidths = [
          { wch: 35 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
        ];
        wsVenta['!cols'] = colWidths;

        // Formatear celdas de encabezados principales
        ['A1', 'A7', 'A10', 'A17', 'A23'].forEach(cell => {
          if (wsVenta[cell]) {
            wsVenta[cell].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "C0392B" } }
            };
          }
        });

        // Formatear encabezado de productos
        ['A23', 'B23', 'C23', 'D23'].forEach((cell, colIndex) => {
          if (wsVenta[cell]) {
            wsVenta[cell].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "3498DB" } }
            };
          }
        });

        // Formatear celdas de moneda en resumen financiero
        const currencyRows = [17, 18, 19, 20]; // Filas de resumen financiero
        currencyRows.forEach(row => {
          ['C', 'D'].forEach(col => {
            const cellRef = XLSX.utils.encode_cell({ r: row, c: col === 'C' ? 2 : 3 });
            if (wsVenta[cellRef]) {
              wsVenta[cellRef].z = '"Q"#,##0.00';
            }
          });
        });

        // Formatear productos como moneda
        const startProductsRow = 23;
        venta.ventaEliminadaDetalle.forEach((_, productIndex) => {
          const dataRow = startProductsRow + 1 + productIndex;
          ['C', 'D'].forEach(col => {
            const cellRef = XLSX.utils.encode_cell({ r: dataRow, c: col === 'C' ? 2 : 3 });
            if (wsVenta[cellRef]) {
              wsVenta[cellRef].z = '"Q"#,##0.00';
            }
          });
        });

        // Formatear total
        const totalRow = startProductsRow + venta.ventaEliminadaDetalle.length + 2;
        ['C', 'D'].forEach(col => {
          const cellRef = XLSX.utils.encode_cell({ r: totalRow, c: col === 'C' ? 2 : 3 });
          if (wsVenta[cellRef]) {
            wsVenta[cellRef].z = '"Q"#,##0.00';
            wsVenta[cellRef].s = { font: { bold: true } };
          }
        });

        XLSX.utils.book_append_sheet(wb, wsVenta, `Venta ${venta.idVenta}`);
      });

      const fileName = `Reporte_Ventas_Eliminadas_${sucursalNombre.replace(/\s+/g, '_')}_${dateStr.replace(/\//g, '-').replace(/:/g, '-').replace(' ', '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (err) {
      setError('Error al generar el Excel: ' + err.message);
      console.error('Error detallado:', err);
    } finally {
      setGeneratingExcel(false);
    }
  };

  const { totalVentas, totalDiferencia, totalMontoIngresado, totalMontoEsperado, totalGastos } = calcularTotales();

  return (
    <Container fluid className="ve-container">
      <Row className="ve-header-row">
        <Col xs="auto" className="ve-back-col">
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/reportes')}
            className="ve-back-button"
          >
            <FiArrowLeft size={20} />
          </Button>
        </Col>
        <Col>
          <h1 className="ve-title">
            <FiTrash2 className="ve-title-icon" />
            Ventas Eliminadas
          </h1>
          <p className="ve-subtitle">Consulta el historial de ventas eliminadas por sucursal y fecha</p>
        </Col>
      </Row>

      {/* Resumen - Solo visible en desktop */}
      {ventasEliminadas.length > 0 && (
        <div className="d-none d-md-block">
          <Row className="ve-resumen-row">
            <Col>
              <Card className="ve-resumen-card">
                <Card.Body>
                  <Row>
                    <Col md={3} className="ve-resumen-col">
                      <div className="ve-resumen-item">
                        <div className="ve-resumen-icon ve-eliminar">
                          <FiTrash2 />
                        </div>
                        <div className="ve-resumen-info">
                          <span className="ve-resumen-label">Ventas Eliminadas</span>
                          <span className="ve-resumen-value">{totalVentas}</span>
                        </div>
                      </div>
                    </Col>
                    <Col md={3} className="ve-resumen-col">
                      <div className="ve-resumen-item">
                        <div className="ve-resumen-icon ve-ingresos">
                          <FiDownload />
                        </div>
                        <div className="ve-resumen-info">
                          <span className="ve-resumen-label">Monto Ingresado</span>
                          <span className="ve-resumen-value">{formatCurrency(totalMontoIngresado)}</span>
                        </div>
                      </div>
                    </Col>
                    <Col md={3} className="ve-resumen-col">
                      <div className="ve-resumen-item">
                        <div className="ve-resumen-icon ve-gastos">
                          <FiRefreshCw />
                        </div>
                        <div className="ve-resumen-info">
                          <span className="ve-resumen-label">Total Gastos</span>
                          <span className="ve-resumen-value">{formatCurrency(totalGastos)}</span>
                        </div>
                      </div>
                    </Col>
                    <Col md={3} className="ve-resumen-col">
                      <div className="ve-resumen-item">
                        <div className="ve-resumen-icon ve-diferencia">
                          <span className={`${totalDiferencia < 0 ? 've-text-danger' : 've-text-success'}`}>
                            {totalDiferencia < 0 ? '▼' : '▲'}
                          </span>
                        </div>
                        <div className="ve-resumen-info">
                          <span className="ve-resumen-label">Diferencia Total</span>
                          <span className={`ve-resumen-value ${totalDiferencia < 0 ? 've-text-danger' : 've-text-success'}`}>
                            {formatCurrency(totalDiferencia)}
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      <Card className="ve-filtros-card">
        <Card.Body>
          <Row>
            <Col md={3} className="ve-filtro-col">
              <Form.Group>
                <Form.Label className="ve-filter-label">Fecha Inicio</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaInicio}
                  max={fechaFin || dayjs().format('YYYY-MM-DD')}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="ve-filter-select ve-date-input"
                  placeholder=" "
                  onFocus={(e) => e.target.showPicker()}
                />
              </Form.Group>
            </Col>

            <Col md={3} className="ve-filtro-col">
              <Form.Group>
                <Form.Label className="ve-filter-label">Fecha Fin</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaFin}
                  min={fechaInicio}
                  max={dayjs().format('YYYY-MM-DD')}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="ve-filter-select ve-date-input"
                  placeholder=" "
                  onFocus={(e) => e.target.showPicker()}
                />
              </Form.Group>
            </Col>

            <Col md={3} className="ve-filtro-col">
              <Form.Group>
                <Form.Label className="ve-filter-label">Sucursal</Form.Label>
                {userData?.idRol === 1 ? (
                  <Form.Control
                    as="select"
                    value={selectedSucursal}
                    onChange={(e) => setSelectedSucursal(e.target.value)}
                    disabled={loadingSucursales || sucursales.length === 0}
                    className="ve-filter-select"
                  >
                    <option value="">Seleccionar sucursal</option>
                    {sucursales.map((sucursal) => (
                      <option key={sucursal.idSucursal} value={sucursal.idSucursal}>
                        {sucursal.nombreSucursal}
                      </option>
                    ))}
                  </Form.Control>
                ) : (
                  <Form.Control
                    type="text"
                    readOnly
                    value={sucursales.find(s => s.idSucursal === userData?.idSucursal)?.nombreSucursal || "Tu sucursal"}
                    className="ve-filter-select"
                  />
                )}
                {loadingSucursales && <small className="ve-loading-text">Cargando sucursales...</small>}
                {!loadingSucursales && sucursales.length === 0 && (
                  <small className="ve-error-text">No hay sucursales disponibles</small>
                )}
              </Form.Group>
            </Col>

            <Col md={3} className="ve-filtro-col">
              <Form.Group>
                <Form.Label className="ve-filter-label">Turno</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedTurno}
                  onChange={(e) => setSelectedTurno(e.target.value)}
                  disabled={ventasEliminadas.length === 0}
                  className="ve-filter-select"
                >
                  <option value="Todos">Todos los turnos</option>
                  <option value="AM">Turno AM</option>
                  <option value="PM">Turno PM</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <Row className="ve-actions-row">
            <Col className="ve-actions-col">
              <div className="ve-actions-buttons">
                <Button
                  variant="outline-secondary"
                  onClick={handleReset}
                  className="ve-reset-btn"
                >
                  <FiRefreshCw />
                </Button>
                <Button
                  variant="primary"
                  onClick={handleGenerarReporte}
                  disabled={!fechaInicio || !fechaFin || !selectedSucursal || loadingReporte}
                  className="ve-generar-btn"
                >
                  {loadingReporte ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <>
                      <FiFilter className="ve-btn-icon" /> Generar
                    </>
                  )}
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Row className="ve-error-row">
          <Col>
            {renderErrorAlert(error)}
          </Col>
        </Row>
      )}

      {showErrorSucursales && (
        <Row className="ve-error-row">
          <Col xs={12} md={6}>
            {renderErrorAlert(`Error al cargar las sucursales`)}
          </Col>
        </Row>
      )}

      {ventasEliminadas.length > 0 && (
        <>
          <Row className="ve-export-row">
            <Col md={12} className="ve-export-col">
              <Button 
                variant="outline-primary" 
                className="ve-export-btn ve-excel-btn"
                onClick={generateExcel}
                disabled={generatingExcel || filteredData.length === 0}
              >
                {generatingExcel ? (
                  <>
                    <Spinner animation="border" size="sm" className="ve-btn-spinner" /> Generando...
                  </>
                ) : (
                  <>
                    <FiDownload className="ve-btn-icon" /> Exportar a Excel
                  </>
                )}
              </Button>
              <Button 
                variant="outline-danger" 
                className="ve-export-btn ve-pdf-btn"
                onClick={generatePDF}
                disabled={generatingPDF || filteredData.length === 0}
              >
                {generatingPDF ? (
                  <>
                    <Spinner animation="border" size="sm" className="ve-btn-spinner" /> Generando...
                  </>
                ) : (
                  <>
                    <FiDownload className="ve-btn-icon" /> Exportar a PDF
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </>
      )}

      <Row>
        <Col>
          {filteredData.length > 0 ? (
            <>
              <div className="d-none d-md-block">
                <Table responsive bordered hover className="ve-table">
                  <thead>
                    <tr>
                      <th>Fecha Eliminación</th>
                      <th>ID Venta</th>
                      <th>Usuario</th>
                      <th>Turno</th>
                      <th>Monto Ingresado</th>
                      <th>Gastos</th>
                      <th>Monto Esperado</th>
                      <th>Diferencia</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((venta) => (
                      <tr key={venta.idEliminacion}>
                        <td>{formatFecha(venta.fechaEliminacion)}</td>
                        <td className="ve-text-center">{venta.idVenta}</td>
                        <td className="ve-text-center">{venta.usuario}</td>
                        <td style={{
                          backgroundColor: getTurnoBackgroundColor(venta.turno),
                          color: getTurnoTextColor(venta.turno),
                          fontWeight: 'bold'
                        }} className="ve-text-center">
                          {venta.turno}
                        </td>
                        <td className="ve-text-end">{formatCurrency(venta.montoTotalIngresado)}</td>
                        <td className="ve-text-end">{formatCurrency(venta.montoTotalGastos)}</td>
                        <td className="ve-text-end">{formatCurrency(venta.montoEsperado)}</td>
                        <td className={`ve-text-end ${venta.diferencia < 0 ? 've-text-danger' : 've-text-success'}`}>
                          {formatCurrency(venta.diferencia)}
                        </td>
                        <td className="ve-text-center">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleVerDetalle(venta)}
                            className="ve-detalle-btn"
                          >
                            <FiEye className="ve-btn-icon" />
                            Ver Detalle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="d-md-none">
                <Accordion activeKey={activeVenta}>
                  {filteredData.map((venta) => (
                    <Accordion.Item 
                      key={venta.idEliminacion} 
                      eventKey={venta.idEliminacion}
                      className="ve-venta-card"
                    >
                      <Accordion.Header onClick={() => toggleVenta(venta.idEliminacion)}>
                        <div className="ve-accordion-header">
                          <div className="ve-venta-info">
                            <span className="ve-venta-fecha">{formatFecha(venta.fechaEliminacion)}</span>
                            <span className="ve-venta-id">Venta #{venta.idVenta}</span>
                          </div>
                          <div className="ve-venta-datos">
                            <span className={`ve-venta-diferencia ${venta.diferencia < 0 ? 've-text-danger' : 've-text-success'}`}>
                              {formatCurrency(venta.diferencia)}
                            </span>
                            {renderTurnoBadge(venta.turno)}
                          </div>
                          {activeVenta === venta.idEliminacion ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="ve-venta-details">
                          <div className="ve-detail-row">
                            <span className="ve-detail-label">Usuario:</span>
                            <span>{venta.usuario}</span>
                          </div>
                          <div className="ve-detail-row">
                            <span className="ve-detail-label">Monto Ingresado:</span>
                            <span>{formatCurrency(venta.montoTotalIngresado)}</span>
                          </div>
                          <div className="ve-detail-row">
                            <span className="ve-detail-label">Gastos:</span>
                            <span>{formatCurrency(venta.montoTotalGastos)}</span>
                          </div>
                          <div className="ve-detail-row">
                            <span className="ve-detail-label">Monto Esperado:</span>
                            <span>{formatCurrency(venta.montoEsperado)}</span>
                          </div>
                          
                          {/* Detalle de productos */}
                          {venta.ventaEliminadaDetalle.length > 0 && (
                            <div className="ve-productos-detalle">
                              <h6 className="ve-detalle-title">Detalle de Productos:</h6>
                              {venta.ventaEliminadaDetalle.map((producto, index) => (
                                <div key={index} className="ve-producto-item">
                                  <div className="ve-detail-row">
                                    <span className="ve-detail-label">Producto:</span>
                                    <span>{producto.nombreProducto || `Producto #${producto.idProducto}`}</span>
                                  </div>
                                  <div className="ve-detail-row">
                                    <span className="ve-detail-label">Cantidad:</span>
                                    <span>{producto.cantidadVendidaEliminada} unidades</span>
                                  </div>
                                  <div className="ve-detail-row">
                                    <span className="ve-detail-label">Precio Unitario:</span>
                                    <span>{formatCurrency(producto.precioUnitario)}</span>
                                  </div>
                                  <div className="ve-detail-row">
                                    <span className="ve-detail-label">Subtotal:</span>
                                    <span>{formatCurrency(producto.subtotal)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </div>
            </>
          ) : ventasEliminadas.length > 0 && filteredData.length === 0 ? (
            <Card className="ve-empty-state">
              <Card.Body className="ve-empty-body">
                <FiFilter size={48} className="ve-empty-icon" />
                <h5>No hay resultados para el filtro aplicado</h5>
                <p className="ve-empty-text">
                  No se encontraron ventas eliminadas para el turno seleccionado
                </p>
              </Card.Body>
            </Card>
          ) : !showErrorSucursales && (
            <Card className="ve-empty-state">
              <Card.Body className="ve-empty-body">
                {loadingReporte ? (
                  <>
                    <Spinner animation="border" variant="primary" />
                    <p className="ve-loading-text">Generando reporte...</p>
                  </>
                ) : (
                  <>
                    <FiTrash2 size={48} className="ve-empty-icon" />
                    <h5>No hay datos para mostrar</h5>
                    <p className="ve-empty-text">
                      Selecciona un rango de fechas y una sucursal para generar el reporte de ventas eliminadas
                    </p>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal de Detalle */}
      <Modal 
        show={showDetalleModal} 
        onHide={handleCloseDetalleModal}
        size="lg"
        centered
        className="ve-modal"
      >
        <Modal.Header closeButton className="ve-modal-header">
          <Modal.Title className="ve-modal-title">
            <FiEye className="ve-modal-icon" />
            Detalle de Venta Eliminada
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="ve-modal-body">
          {ventaSeleccionada && (
            <div className="ve-detalle-content">
              <Row className="ve-detalle-info-row">
                <Col md={6}>
                  <div className="ve-detalle-info">
                    <strong>ID Eliminación:</strong> {ventaSeleccionada.idEliminacion}
                  </div>
                  <div className="ve-detalle-info">
                    <strong>ID Venta:</strong> {ventaSeleccionada.idVenta}
                  </div>
                  <div className="ve-detalle-info">
                    <strong>Usuario:</strong> {ventaSeleccionada.usuario}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="ve-detalle-info">
                    <strong>Fecha Eliminación:</strong> {formatFecha(ventaSeleccionada.fechaEliminacion)}
                  </div>
                  <div className="ve-detalle-info">
                    <strong>Turno:</strong> {renderTurnoBadge(ventaSeleccionada.turno)}
                  </div>
                </Col>
              </Row>

              <Row className="ve-summary-row">
                <Col md={6}>
                  <Card className="ve-summary-card">
                    <Card.Body>
                      <div className="ve-summary-item">
                        <span>Monto Ingresado:</span>
                        <strong>{formatCurrency(ventaSeleccionada.montoTotalIngresado)}</strong>
                      </div>
                      <div className="ve-summary-item">
                        <span>Gastos:</span>
                        <strong>{formatCurrency(ventaSeleccionada.montoTotalGastos)}</strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="ve-summary-card">
                    <Card.Body>
                      <div className="ve-summary-item">
                        <span>Monto Esperado:</span>
                        <strong>{formatCurrency(ventaSeleccionada.montoEsperado)}</strong>
                      </div>
                      <div className="ve-summary-item">
                        <span>Diferencia:</span>
                        <strong className={ventaSeleccionada.diferencia < 0 ? 've-text-danger' : 've-text-success'}>
                          {formatCurrency(ventaSeleccionada.diferencia)}
                        </strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="ve-productos-card">
                <Card.Header className="ve-productos-header">
                  <h6 className="ve-productos-title">
                    <FiEye className="ve-productos-icon" />
                    Productos Eliminados ({ventaSeleccionada.ventaEliminadaDetalle.length})
                  </h6>
                </Card.Header>
                <Card.Body className="ve-productos-body">
                  <div className="ve-table-responsive">
                    <Table striped bordered hover size="sm" className="ve-productos-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Unitario</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventaSeleccionada.ventaEliminadaDetalle.map((producto, index) => (
                          <tr key={index}>
                            <td>{producto.nombreProducto || `Producto #${producto.idProducto}`}</td>
                            <td className="ve-text-center">{producto.cantidadVendidaEliminada}</td>
                            <td className="ve-text-end">{formatCurrency(producto.precioUnitario)}</td>
                            <td className="ve-text-end">{formatCurrency(producto.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="ve-text-end"><strong>Total:</strong></td>
                          <td className="ve-text-end">
                            <strong>
                              {formatCurrency(ventaSeleccionada.ventaEliminadaDetalle.reduce((sum, prod) => sum + prod.subtotal, 0))}
                            </strong>
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="ve-modal-footer">
          <Button variant="secondary" onClick={handleCloseDetalleModal} className="ve-close-btn">
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VentasEliminadasPage;