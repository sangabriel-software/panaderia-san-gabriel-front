import React, { useState, useEffect } from 'react';
import { FiFilter, FiDownload, FiRefreshCw, FiCalendar, FiChevronDown, FiChevronUp, FiArrowLeft } from 'react-icons/fi';
import { Container, Row, Col, Form, Button, Spinner, Card, Accordion, Table, Dropdown, Badge } from 'react-bootstrap';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import useGetSucursales from '../../../hooks/sucursales/useGetSucursales';
import { generarReporteVentasService } from '../../../services/reportes/reportes.service';
import { getUserData } from '../../../utils/Auth/decodedata';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import './VentasReport.styles.css';

const VentasReportPage = () => {
  const navigate = useNavigate();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const userData = getUserData();
  
  const [selectedSucursal, setSelectedSucursal] = useState('');
  const [reporteData, setReporteData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(dayjs().format('YYYY-MM-DD'));
  const [fechaFin, setFechaFin] = useState(dayjs().format('YYYY-MM-DD'));
  const [activeVenta, setActiveVenta] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState('Todos');

  useEffect(() => {
    if (!loadingSucursales && sucursales.length > 0 && userData?.idRol !== 1) {
      const sucursalUsuario = sucursales.find(s => s.idSucursal === userData.idSucursal);
      if (sucursalUsuario) {
        setSelectedSucursal(sucursalUsuario.idSucursal);
      }
    }
  }, [loadingSucursales, sucursales, userData]);

  useEffect(() => {
    if (selectedTurno === 'Todos') {
      setFilteredData(reporteData);
    } else {
      const filtered = reporteData.filter(venta => venta.turno === selectedTurno);
      setFilteredData(filtered);
    }
  }, [selectedTurno, reporteData]);

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
    setSelectedTurno('Todos');

    try {
      const data = await generarReporteVentasService(fechaInicio, fechaFin, selectedSucursal);
      setReporteData(data.reporte || []);
      setFilteredData(data.reporte || []);
    } catch (err) {
      setError('Error al generar el reporte: ' + err.message);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleReset = () => {
    setFechaInicio(dayjs().format('YYYY-MM-DD'));
    setFechaFin(dayjs().format('YYYY-MM-DD'));
    setSelectedSucursal('');
    setReporteData([]);
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

  const renderErrorAlert = (message) => (
    <div className="custom-alert error">
      <div className="alert-content">
        <span className="alert-message">{message}</span>
      </div>
    </div>
  );

  const renderTurnoBadge = (turno) => {
    switch(turno) {
      case 'AM':
        return <Badge bg="info" className="turno-badge am">{turno}</Badge>;
      case 'PM':
        return <Badge bg="primary" className="turno-badge pm">{turno}</Badge>;
      default:
        return <Badge bg="secondary" className="turno-badge">{turno}</Badge>;
    }
  };

  const getTurnoBackgroundColor = (turno) => {
    return turno === 'AM' ? 'rgba(75, 192, 192, 0.2)' : 'rgba(153, 102, 255, 0.2)';
  };

  const getTurnoTextColor = (turno) => {
    return turno === 'AM' ? 'rgba(75, 192, 192, 1)' : 'rgba(153, 102, 255, 1)';
  };

  const generatePDF = () => {
    const dataToExport = selectedTurno === 'Todos' ? reporteData : filteredData;
    
    if (dataToExport.length === 0) {
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
  
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE VENTAS', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
  
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
  
      const totalVentas = dataToExport.reduce((sum, venta) => sum + venta.total_venta, 0);
      const totalEfectivo = dataToExport.reduce((sum, venta) => sum + venta.efectivo_ingresado, 0);
      const totalGastos = dataToExport.reduce((sum, venta) => sum + venta.gastos_del_turno, 0);
      const totalDiferencia = dataToExport.reduce((sum, venta) => sum + venta.diferencia, 0);
  
      doc.text(`Total Ventas: ${formatCurrency(totalVentas)}`, 40, selectedTurno !== 'Todos' ? 125 : 110);
      doc.text(`Total Efectivo: ${formatCurrency(totalEfectivo)}`, 40, selectedTurno !== 'Todos' ? 140 : 125);
      doc.text(`Total Gastos: ${formatCurrency(totalGastos)}`, 40, selectedTurno !== 'Todos' ? 155 : 140);
      doc.text(`Diferencia Total: ${formatCurrency(totalDiferencia)}`, 40, selectedTurno !== 'Todos' ? 170 : 155);
  
      const tableData = dataToExport.map(venta => [
        dayjs(venta.fecha_hora_venta).format('DD/MM/YYYY'),
        venta.sucursal,
        venta.vendedor,
        venta.turno,
        formatCurrency(venta.total_venta),
        venta.cantidad_productos,
        venta.unidades_vendidas,
        formatCurrency(venta.efectivo_ingresado),
        formatCurrency(venta.gastos_del_turno),
        formatCurrency(venta.total_esperado),
        formatCurrency(venta.diferencia),
      ]);
  
      autoTable(doc, {
        startY: selectedTurno !== 'Todos' ? 185 : 170,
        head: [
          ['Fecha', 'Sucursal', 'Vendedor', 'Turno', 'Total Venta', 'Productos', 'Unidades', 
           'Efectivo', 'Gastos', 'Total Esperado', 'Diferencia', 'Estado']
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
          fontSize: 7,
          cellPadding: 2,
          overflow: 'linebreak'
        },
        margin: { horizontal: 20 },
        didDrawPage: function (data) {
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
  
      doc.save(`reporte-ventas-${dateStr.replace(/\//g, '-').replace(/:/g, '-').replace(' ', '_')}.pdf`);
    } catch (err) {
      setError('Error al generar el PDF: ' + err.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const generateExcel = () => {
    const dataToExport = selectedTurno === 'Todos' ? reporteData : filteredData;
    
    if (dataToExport.length === 0) {
      setError('No hay datos para generar el reporte');
      return;
    }
  
    setGeneratingExcel(true);
    setError(null);
  
    try {
      const sucursalNombre = sucursales.find(s => s.idSucursal === selectedSucursal)?.nombreSucursal || 'Todas las sucursales';
      const today = new Date();
      const dateStr = today.toLocaleDateString('es-GT') + ' ' + today.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  
      const excelData = dataToExport.map(venta => ({
        'ID': venta.idVenta,
        'Fecha': dayjs(venta.fecha_hora_venta).format('DD/MM/YYYY'),
        'Sucursal': venta.sucursal,
        'Vendedor': venta.vendedor,
        'Turno': venta.turno,
        'Total Venta': venta.total_venta,
        'Cant. Productos': venta.cantidad_productos,
        'Unidades Vendidas': venta.unidades_vendidas,
        'Efectivo Ingresado': venta.efectivo_ingresado,
        'Gastos del Turno': venta.gastos_del_turno,
        'Total Esperado': venta.total_esperado,
        'Diferencia': venta.diferencia,
      }));
  
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([]);
  
      const colWidths = [
        { wch: 8 },  { wch: 18 }, { wch: 20 }, { wch: 15 }, 
        { wch: 8 },  { wch: 12 }, { wch: 10 }, { wch: 10 }, 
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      ];
      ws['!cols'] = colWidths;
  
      const reportInfo = [
        ["REPORTE DE VENTAS"],
        [`Generado el: ${dateStr}`],
        [`Sucursal: ${sucursalNombre}`],
        [`Rango de fechas: ${dayjs(fechaInicio).format('DD/MM/YYYY')} - ${dayjs(fechaFin).format('DD/MM/YYYY')}`],
        selectedTurno !== 'Todos' ? [`Turno: ${selectedTurno}`] : [],
        []
      ].filter(item => item.length > 0);
  
      XLSX.utils.sheet_add_aoa(ws, reportInfo, { origin: 'A1' });
  
      const merges = reportInfo.map((_, index) => ({
        s: { r: index, c: 0 }, 
        e: { r: index, c: 12 }
      }));
      ws['!merges'] = merges;
  
      const headers = Object.keys(excelData[0] || {});
      const headerRow = reportInfo.length;
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: XLSX.utils.encode_row(headerRow) });
  
      headers.forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: colIndex });
        ws[cellRef] = ws[cellRef] || { t: 's' };
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4BACC6" } },
          alignment: { horizontal: "center" }
        };
      });
  
      XLSX.utils.sheet_add_json(ws, excelData, {
        header: headers,
        skipHeader: true,
        origin: XLSX.utils.encode_row(headerRow + 1)
      });
  
      const currencyColumns = ['Total Venta', 'Efectivo Ingresado', 'Gastos del Turno', 'Total Esperado', 'Diferencia'];
      const currencyColIndices = headers
        .map((header, index) => currencyColumns.includes(header) ? index : null)
        .filter(index => index !== null);
  
      excelData.forEach((_, rowIndex) => {
        const dataRow = headerRow + 1 + rowIndex;
        
        currencyColIndices.forEach(colIndex => {
          const cellRef = XLSX.utils.encode_cell({ r: dataRow, c: colIndex });
          ws[cellRef] = ws[cellRef] || { t: 'n' };
          ws[cellRef].z = '"Q"#,##0.00';
        });
      });
  
      XLSX.utils.book_append_sheet(wb, ws, "Reporte Ventas");
  
      const fileName = `Reporte_Ventas_${sucursalNombre.replace(/\s+/g, '_')}_${dateStr.replace(/\//g, '-').replace(/:/g, '-').replace(' ', '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);
  
    } catch (err) {
      setError('Error al generar el Excel: ' + err.message);
      console.error('Error detallado:', err);
    } finally {
      setGeneratingExcel(false);
    }
  };

  return (
    <Container fluid className="ventas-report-container">
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
          <h1 className="report-title">Reporte de Ventas</h1>
          <p className="report-subtitle">Consulta el historial de ventas por sucursal y fecha</p>
        </Col>
      </Row>

      <Card className="filtros-card mb-4">
        <Card.Body>
          <Row>
            <Col md={3} className="mb-3 mb-md-0">
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

            <Col md={3} className="mb-3 mb-md-0">
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

            <Col md={3} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label className="filter-label">Sucursal</Form.Label>
                {userData?.idRol === 1 ? (
                  <Form.Control
                    as="select"
                    value={selectedSucursal}
                    onChange={(e) => setSelectedSucursal(e.target.value)}
                    disabled={loadingSucursales}
                    className="filter-select"
                    required
                  >
                    <option value="" disabled>Seleccione una sucursal</option>
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

            <Col md={3} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label className="filter-label">Turno</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedTurno}
                  onChange={(e) => setSelectedTurno(e.target.value)}
                  disabled={reporteData.length === 0}
                  className="filter-select"
                >
                  <option value="Todos">Todos los turnos</option>
                  <option value="AM">Turno AM</option>
                  <option value="PM">Turno PM</option>
                </Form.Control>
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
                  disabled={loadingReporte || !selectedSucursal}
                  className="generate-button"
                  title={!selectedSucursal ? 'Por favor seleccione una sucursal' : ''}
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
        <>
          <Row className="mb-3">
            <Col md={4}>
            </Col>
            <Col md={8} className="text-end">
              <Button 
                variant="outline-primary" 
                className="export-button me-2"
                onClick={generateExcel}
                disabled={generatingExcel || filteredData.length === 0}
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
                disabled={generatingPDF || filteredData.length === 0}
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
        </>
      )}

      <Row>
        <Col>
          {filteredData.length > 0 ? (
            <>
              <div className="d-none d-md-block">
                <Table responsive bordered hover className="reporte-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Sucursal</th>
                      <th>Vendedor</th>
                      <th>Turno</th>
                      <th>Total Venta</th>
                      <th>Productos</th>
                      <th>Unidades</th>
                      <th>Efectivo</th>
                      <th>Gastos</th>
                      <th>Total Esperado</th>
                      <th>Diferencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((venta) => (
                      <tr key={venta.idVenta}>
                        <td>{formatFecha(venta.fecha_hora_venta)}</td>
                        <td>{venta.sucursal}</td>
                        <td>{venta.vendedor}</td>
                        <td style={{
                          backgroundColor: getTurnoBackgroundColor(venta.turno),
                          color: getTurnoTextColor(venta.turno),
                          fontWeight: 'bold'
                        }}>
                          {venta.turno}
                        </td>
                        <td className="text-end">{formatCurrency(venta.total_venta)}</td>
                        <td className="text-center">{venta.cantidad_productos}</td>
                        <td className="text-center">{venta.unidades_vendidas}</td>
                        <td className="text-end">{formatCurrency(venta.efectivo_ingresado)}</td>
                        <td className="text-end">{formatCurrency(venta.gastos_del_turno)}</td>
                        <td className="text-end">{formatCurrency(venta.total_esperado)}</td>
                        <td className={`text-end ${venta.diferencia < 0 ? 'text-danger' : 'text-success'}`}>
                          {formatCurrency(venta.diferencia)}
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
                      key={venta.idVenta} 
                      eventKey={venta.idVenta}
                      className="venta-card"
                    >
                      <Accordion.Header onClick={() => toggleVenta(venta.idVenta)}>
                        <div className="d-flex justify-content-between w-100 pe-2 align-items-center">
                          <div className="d-flex flex-column">
                            <span className="venta-fecha">{formatFecha(venta.fecha_hora_venta)}</span>
                            <span className="venta-vendedor">{venta.vendedor}</span>
                          </div>
                          <div className="d-flex flex-column align-items-end">
                            <span className="venta-total">{formatCurrency(venta.total_venta)}</span>
                            {renderTurnoBadge(venta.turno)}
                          </div>
                          {activeVenta === venta.idVenta ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="venta-details">
                          <div className="detail-row">
                            <span className="detail-label">Turno:</span>
                            <span>{venta.turno}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Sucursal:</span>
                            <span>{venta.sucursal}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Productos:</span>
                            <span>{venta.cantidad_productos}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Unidades:</span>
                            <span>{venta.unidades_vendidas}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Efectivo:</span>
                            <span>{formatCurrency(venta.efectivo_ingresado)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Gastos:</span>
                            <span>{formatCurrency(venta.gastos_del_turno)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Total Esperado:</span>
                            <span>{formatCurrency(venta.total_esperado)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Diferencia:</span>
                            <span className={`${venta.diferencia < 0 ? 'text-danger' : 'text-success'}`}>
                              {formatCurrency(venta.diferencia)}
                            </span>
                          </div>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </div>
            </>
          ) : reporteData.length > 0 && filteredData.length === 0 ? (
            <Card className="empty-state">
              <Card.Body className="text-center py-4">
                <FiFilter size={48} className="text-muted mb-3" />
                <h5>No hay resultados para el filtro aplicado</h5>
                <p className="text-muted">
                  No se encontraron ventas para el turno seleccionado
                </p>
              </Card.Body>
            </Card>
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

export default VentasReportPage;