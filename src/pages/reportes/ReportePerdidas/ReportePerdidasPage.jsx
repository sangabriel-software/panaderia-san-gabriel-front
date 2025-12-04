import React, { useState, useEffect } from 'react';
import { FiFilter, FiDownload, FiRefreshCw, FiChevronDown, FiChevronUp, FiArrowLeft } from 'react-icons/fi';
import { Container, Row, Col, Form, Button, Spinner, Card, Accordion, Table } from 'react-bootstrap';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import useGetSucursales from '../../../hooks/sucursales/useGetSucursales';
import { generarReportePerdidasService } from '../../../services/reportes/reportes.service';
import { getUserData } from '../../../utils/Auth/decodedata';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import './ReportePerdidas.styles.css';

const ReportePerdidasPage = () => {
  const navigate = useNavigate();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const userData = getUserData();
  
  const [selectedSucursal, setSelectedSucursal] = useState('');
  const [reporteData, setReporteData] = useState([]);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
  const [fechaFin, setFechaFin] = useState(dayjs().format('YYYY-MM-DD'));
  const [activePerdida, setActivePerdida] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);

  useEffect(() => {
    if (!loadingSucursales && sucursales.length > 0 && userData?.idRol !== 1) {
      const sucursalUsuario = sucursales.find(s => s.idSucursal === userData.idSucursal);
      if (sucursalUsuario) {
        setSelectedSucursal(sucursalUsuario.idSucursal);
      }
    }
  }, [loadingSucursales, sucursales, userData]);

  const handleGenerarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Debes seleccionar ambas fechas');
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

    try {
      const { reporte } = await generarReportePerdidasService(fechaInicio, fechaFin, selectedSucursal);
      console.log(reporte)
      setReporteData(reporte || []);
    } catch (err) {
      setError('Error al generar el reporte: ' + err.message);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleReset = () => {
    setFechaInicio(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
    setFechaFin(dayjs().format('YYYY-MM-DD'));
    setSelectedSucursal(userData?.idRol === 1 ? '' : userData?.idSucursal || '');
    setReporteData([]);
    setError(null);
    setActivePerdida(null);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-GT').format(number);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', { 
      style: 'currency', 
      currency: 'GTQ',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const togglePerdida = (id) => {
    setActivePerdida(activePerdida === id ? null : id);
  };

  const renderErrorAlert = (message) => (
    <div className="custom-alert error">
      <div className="alert-content">
        <span className="alert-message">{message}</span>
      </div>
    </div>
  );

  const generatePDF = () => {
    if (reporteData.length === 0) {
      setError('No hay datos para generar el reporte');
      return;
    }
  
    setGeneratingPDF(true);
    setError(null);
  
    try {
      const doc = new jsPDF('landscape', 'pt', 'a4');
      const sucursalNombre = sucursales.find(s => s.idSucursal === selectedSucursal)?.nombreSucursal || 'Todas las sucursales';
      const today = new Date();
      const dateStr = today.toLocaleDateString('es-GT') + ' ' + today.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

      // Título
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE PÉRDIDAS', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

      // Información del reporte
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

      // Calcular totales
      const totalPerdidas = reporteData.reduce((sum, perdida) => sum + perdida.total_perdido, 0);
      const totalDineroPerdida = reporteData.reduce((sum, perdida) => sum + perdida.dineroPerdida, 0);

      // Agregar resumen
      doc.text(`Total unidades perdidas: ${formatNumber(totalPerdidas)}`, 40, 110);
      doc.text(`Total dinero perdido: ${formatCurrency(totalDineroPerdida)}`, 40, 125);

      // Preparar datos para la tabla
      const tableData = reporteData.map(perdida => [
        perdida.producto,
        perdida.usuario,
        perdida.fechaDescuento ? dayjs(perdida.fechaDescuento).format('DD/MM/YYYY HH:mm') : 'N/A',
        formatNumber(perdida.total_perdido),
        formatCurrency(perdida.dineroPerdida)
      ]);

      // Configuración de la tabla
      autoTable(doc, {
        startY: 150,
        head: [
          ['Producto', 'Usuario', 'Fecha Descuento', 'Unidades Perdidas', 'Dinero Perdido']
        ],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak'
        },
        columnStyles: {
          2: { cellWidth: 80 }
        },
        margin: { horizontal: 20 },
        didDrawPage: function (data) {
          // Footer
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text(
            `Página ${doc.internal.getNumberOfPages()}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 20,
            { align: 'center' }
          );
        }
      });

      // Guardar el PDF
      doc.save(`reporte-perdidas-${dateStr.replace(/\//g, '-').replace(/:/g, '-').replace(' ', '_')}.pdf`);
    } catch (err) {
      setError('Error al generar el PDF: ' + err.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const generateExcel = () => {
    if (reporteData.length === 0) {
      setError('No hay datos para generar el reporte');
      return;
    }
  
    setGeneratingExcel(true);
    setError(null);
  
    try {
      const sucursalNombre = sucursales.find(s => s.idSucursal === selectedSucursal)?.nombreSucursal || 'Todas las sucursales';
      const today = new Date();
      const dateStr = today.toLocaleDateString('es-GT') + ' ' + today.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

      // 1. Preparar los datos para Excel
      const excelData = reporteData.map(perdida => ({
        'Producto': perdida.producto,
        'Usuario': perdida.usuario,
        'Fecha Descuento': perdida.fechaDescuento ? dayjs(perdida.fechaDescuento).format('DD/MM/YYYY HH:mm') : 'N/A',
        'Unidades Perdidas': perdida.total_perdido,
        'Dinero Perdido': perdida.dineroPerdida
      }));

      // 2. Crear libro y hoja de trabajo
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // 3. Definir anchos de columna
      const colWidths = [
        { wch: 30 }, // Producto
        { wch: 20 }, // Usuario
        { wch: 20 }, // Fecha Descuento
        { wch: 15 }, // Unidades Perdidas
        { wch: 15 }  // Dinero Perdido
      ];
      ws['!cols'] = colWidths;

      // 4. Agregar información del reporte al inicio
      const reportInfo = [
        ["REPORTE DE PÉRDIDAS"],
        [`Generado el: ${dateStr}`],
        [`Sucursal: ${sucursalNombre}`],
        [`Rango de fechas: ${dayjs(fechaInicio).format('DD/MM/YYYY')} - ${dayjs(fechaFin).format('DD/MM/YYYY')}`],
        []
      ];

      // Insertar información del reporte al inicio
      XLSX.utils.sheet_add_aoa(ws, reportInfo, { origin: { r: 0, c: 0 } });

      // 5. Combinar celdas para los títulos
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push(
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }
      );

      // 6. Mover los datos hacia abajo
      const range = XLSX.utils.decode_range(ws['!ref']);
      range.s.r += reportInfo.length;
      range.e.r += reportInfo.length;
      ws['!ref'] = XLSX.utils.encode_range(range);

      // 7. Agregar encabezados de columnas
      const headerRow = reportInfo.length;
      const headers = ['Producto', 'Usuario', 'Fecha Descuento', 'Unidades Perdidas', 'Dinero Perdido'];
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: { r: headerRow, c: 0 } });

      // 8. Aplicar estilos a encabezados
      headers.forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: colIndex });
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4BACC6" } },
          alignment: { horizontal: "center" }
        };
      });

      // 9. Aplicar formatos a los datos
      const dataStartRow = headerRow + 1;
      const dataEndRow = dataStartRow + excelData.length - 1;
      
      // Formato para unidades
      for (let row = dataStartRow; row <= dataEndRow; row++) {
        const unidadesCell = XLSX.utils.encode_cell({ r: row, c: 3 });
        ws[unidadesCell].z = '#,##0';
        
        // Formato para dinero
        const dineroCell = XLSX.utils.encode_cell({ r: row, c: 4 });
        ws[dineroCell].z = '"Q"#,##0.00';
      }

      // 10. Agregar fila de totales
      const totalRow = dataEndRow + 1;
      const totalPerdidas = excelData.reduce((sum, item) => sum + item['Unidades Perdidas'], 0);
      const totalDinero = excelData.reduce((sum, item) => sum + item['Dinero Perdido'], 0);
      
      XLSX.utils.sheet_add_aoa(ws, [
        ['', '', 'TOTALES:', totalPerdidas, totalDinero]
      ], { origin: { r: totalRow, c: 0 } });

      // Estilo para la fila de totales
      for (let col = 2; col <= 4; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: totalRow, c: col });
        ws[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "D9E1F2" } }
        };
      }

      // 11. Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, "Reporte Pérdidas");

      // 12. Generar archivo
      const fileName = `Reporte_Perdidas_${sucursalNombre.replace(/\s+/g, '_')}_${dateStr.replace(/\//g, '-').replace(/:/g, '-').replace(' ', '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (err) {
      setError('Error al generar el Excel: ' + err.message);
      console.error('Error detallado:', err);
    } finally {
      setGeneratingExcel(false);
    }
  };

  return (
    <Container fluid className="perdidas-report-container">
      <Row className="mb-4 align-items-center">
        <Col xs="auto" className="pe-0">
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/reportes')}
            className="back-button"
          >
            <FiArrowLeft size={20} />
          </Button>
        </Col>
        <Col>
          <h1 className="report-title">Reporte de Pérdidas</h1>
          <p className="report-subtitle">Consulta el historial de pérdidas por fecha</p>
        </Col>
      </Row>

      <Card className="filtros-card mb-4">
        <Card.Body>
          <Row>
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label className="filter-label">Fecha Inicio</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaInicio}
                  max={fechaFin || dayjs().format('YYYY-MM-DD')}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="filter-select date-input"
                  placeholder=" "
                  onFocus={(e) => e.target.showPicker()}
                />
              </Form.Group>
            </Col>

            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label className="filter-label">Fecha Fin</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaFin}
                  min={fechaInicio}
                  max={dayjs().format('YYYY-MM-DD')}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="filter-select date-input"
                  placeholder=" "
                  onFocus={(e) => e.target.showPicker()}
                />
              </Form.Group>
            </Col>

            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label className="filter-label">Sucursal</Form.Label>
                {userData?.idRol === 1 ? (
                  <Form.Control
                    as="select"
                    value={selectedSucursal}
                    onChange={(e) => setSelectedSucursal(e.target.value)}
                    disabled={loadingSucursales}
                    className="filter-select"
                  >
                    <option value="">Todas las sucursales</option>
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
                    className="filter-select"
                  />
                )}
                {loadingSucursales && <small className="text-muted">Cargando sucursales...</small>}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col className="d-flex justify-content-end">
              <div className="d-flex">
                <Button
                  variant="outline-secondary"
                  onClick={handleReset}
                  className="me-2"
                >
                  <FiRefreshCw />
                </Button>
                <Button
                  variant="primary"
                  onClick={handleGenerarReporte}
                  disabled={!fechaInicio || !fechaFin || loadingReporte}
                >
                  {loadingReporte ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <>
                      <FiFilter className="me-1" /> Generar
                    </>
                  )}
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Row className="mb-3">
          <Col>
            {renderErrorAlert(error)}
          </Col>
        </Row>
      )}

      {showErrorSucursales && (
        <Row style={{ justifyContent: 'center' }} className="mb-3">
          <Col xs={12} md={6}>
            {renderErrorAlert(`Error al cargar las sucursales`)}
          </Col>
        </Row>
      )}

      {reporteData.length > 0 && (
        <Row className="mb-3">
          <Col className="text-end">
            <Button 
              variant="outline-primary" 
              className="export-button me-2"
              onClick={generateExcel}
              disabled={generatingExcel || reporteData.length === 0}
            >
              {generatingExcel ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" /> Generando...
                </>
              ) : (
                <>
                  <FiDownload className="me-1" /> Exportar a Excel
                </>
              )}
            </Button>
            <Button 
              variant="outline-danger" 
              className="export-button"
              onClick={generatePDF}
              disabled={generatingPDF || reporteData.length === 0}
            >
              {generatingPDF ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" /> Generando...
                </>
              ) : (
                <>
                  <FiDownload className="me-1" /> Exportar a PDF
                </>
              )}
            </Button>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          {reporteData.length > 0 ? (
            <>
              <div className="d-none d-md-block">
                <Table responsive bordered hover className="reporte-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Usuario</th>
                      <th>Fecha Descuento</th>
                      <th>Unidades Perdidas</th>
                      <th>Dinero Perdido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporteData.map((perdida, index) => (
                      <tr key={`${perdida.idProducto}-${index}`}>
                        <td>{perdida.producto}</td>
                        <td>{perdida.usuario}</td>
                        <td className="text-center">
                          {perdida.fechaDescuento ? (
                            <div className="fecha-desc-container">
                              <div className="fecha-desc-fecha">
                                {dayjs(perdida.fechaDescuento).format('DD/MM/YYYY')}
                              </div>
                              <div className="fecha-desc-hora">
                                {dayjs(perdida.fechaDescuento).format('HH:mm')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td className="text-center">{formatNumber(perdida.total_perdido)}</td>
                        <td className="text-end">{formatCurrency(perdida.dineroPerdida)}</td>
                      </tr>
                    ))}
                    <tr className="table-totals">
                      <td colSpan="3" className="text-end fw-bold">Totales:</td>
                      <td className="text-center fw-bold">
                        {formatNumber(reporteData.reduce((sum, item) => sum + item.total_perdido, 0))}
                      </td>
                      <td className="text-end fw-bold">
                        {formatCurrency(reporteData.reduce((sum, item) => sum + item.dineroPerdida, 0))}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              <div className="d-md-none">
                <Accordion activeKey={activePerdida}>
                  {reporteData.map((perdida, index) => (
                    <Accordion.Item 
                      key={`${perdida.idProducto}-${index}`} 
                      eventKey={`${perdida.idProducto}-${index}`}
                      className="perdida-card"
                    >
                      <Accordion.Header onClick={() => togglePerdida(`${perdida.idProducto}-${index}`)}>
                        <div className="d-flex justify-content-between w-100 pe-2 align-items-center">
                          <div className="d-flex flex-column">
                            <span className="perdida-producto">{perdida.producto}</span>
                            <span className="perdida-usuario">{perdida.usuario}</span>
                          </div>
                          <div className="d-flex flex-column align-items-end">
                            <span className="perdida-dinero">{formatCurrency(perdida.dineroPerdida)}</span>
                            <span className="perdida-unidades">{formatNumber(perdida.total_perdido)} unidades</span>
                          </div>
                          {activePerdida === `${perdida.idProducto}-${index}` ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="perdida-details">
                          <div className="detail-row">
                            <span className="detail-label">Fecha descuento:</span>
                            <span>
                              {perdida.fechaDescuento ? (
                                <>
                                  {dayjs(perdida.fechaDescuento).format('DD/MM/YYYY')} a las{' '}
                                  {dayjs(perdida.fechaDescuento).format('HH:mm')}
                                </>
                              ) : (
                                'N/A'
                              )}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Unidades perdidas:</span>
                            <span>{formatNumber(perdida.total_perdido)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Dinero perdido:</span>
                            <span>{formatCurrency(perdida.dineroPerdida)}</span>
                          </div>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                  <Card className="mt-3">
                    <Card.Body className="totals-card">
                      <div className="detail-row">
                        <span className="detail-label fw-bold">Total unidades perdidas:</span>
                        <span className="fw-bold">
                          {formatNumber(reporteData.reduce((sum, item) => sum + item.total_perdido, 0))}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label fw-bold">Total dinero perdido:</span>
                        <span className="fw-bold">
                          {formatCurrency(reporteData.reduce((sum, item) => sum + item.dineroPerdida, 0))}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Accordion>
              </div>
            </>
          ) : !showErrorSucursales && (
            <Card className="empty-state">
              <Card.Body className="text-center py-4">
                {loadingReporte ? (
                  <>
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Generando reporte...</p>
                  </>
                ) : (
                  <>
                    <FiFilter size={48} className="text-muted mb-3" />
                    <h5>No hay datos para mostrar</h5>
                    <p className="text-muted">
                      Selecciona un rango de fechas para generar el reporte
                    </p>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ReportePerdidasPage;