import React, { useState, useEffect } from 'react';
import { FiFilter, FiDownload, FiRefreshCw, FiCalendar, FiChevronDown, FiChevronUp, FiArrowLeft, FiPackage, FiEye } from 'react-icons/fi';
import { Container, Row, Col, Form, Button, Spinner, Card, Accordion, Table, Badge, Modal } from 'react-bootstrap';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import useGetSucursales from '../../../hooks/sucursales/useGetSucursales';
import { generarReporteSobranteStockService } from '../../../services/reportes/reportes.service';
import { getUserData } from '../../../utils/Auth/decodedata';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import './SobrantesReport.styles.css';

const SobrantesReport = () => {
  const navigate = useNavigate();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const userData = getUserData();
  
  const [selectedSucursal, setSelectedSucursal] = useState('');
  const [sobrantesData, setSobrantesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState(null);
  const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
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
      setFilteredData(sobrantesData);
    } else {
      const filtered = sobrantesData.filter(venta => venta.ventaTurno === selectedTurno);
      setFilteredData(filtered);
    }
  }, [selectedTurno, sobrantesData]);

  const handleGenerarReporte = async () => {
    if (!fecha) {
      setError('Debes seleccionar una fecha');
      return;
    }

    if (!selectedSucursal) {
      setError('Debes seleccionar una sucursal');
      return;
    }

    setError(null);
    setLoadingReporte(true);
    setSelectedTurno('Todos');

    try {
      const data = await generarReporteSobranteStockService(fecha, selectedSucursal);
      setSobrantesData(data.reporte || []);
      setFilteredData(data.reporte || []);
    } catch (err) {
      setError('Error al generar el reporte: ' + err.message);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleReset = () => {
    setFecha(dayjs().format('YYYY-MM-DD'));
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
    setSobrantesData([]);
    setFilteredData([]);
    setError(null);
    setActiveVenta(null);
    setSelectedTurno('Todos');
  };

  const formatFecha = (fecha) => {
    return dayjs(fecha).format('DD/MM/YYYY');
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
    <div className="sr-custom-alert sr-error">
      <div className="sr-alert-content">
        <span className="sr-alert-message">{message}</span>
      </div>
    </div>
  );

  const renderTurnoBadge = (turno) => {
    switch(turno) {
      case 'AM':
        return <Badge bg="info" className="sr-turno-badge sr-am">{turno}</Badge>;
      case 'PM':
        return <Badge bg="primary" className="sr-turno-badge sr-pm">{turno}</Badge>;
      default:
        return <Badge bg="secondary" className="sr-turno-badge">{turno}</Badge>;
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
    const totalProductos = filteredData.reduce((sum, venta) => sum + venta.ventaDetalle.length, 0);
    const totalUnidadesSobrantes = filteredData.reduce((sum, venta) => 
      sum + venta.ventaDetalle.reduce((prodSum, producto) => prodSum + producto.unidadesSobrantes, 0), 0
    );
    
    return { totalVentas, totalProductos, totalUnidadesSobrantes };
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
      doc.text('REPORTE DE PRODUCTOS SOBRANTES', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${dateStr}`, doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Sucursal: ${sucursalNombre}`, 40, 80);
      doc.text(`Fecha del reporte: ${dayjs(fecha).format('DD/MM/YYYY')}`, 40, 95);
      
      if (selectedTurno !== 'Todos') {
        doc.text(`Turno: ${selectedTurno}`, 40, 110);
      }

      let currentY = 130;
      
      // Detalle de cada venta - UNA VENTA POR PÁGINA
      dataToExport.forEach((venta, index) => {
        // Si no es la primera venta, agregar nueva página
        if (index > 0) {
          doc.addPage();
          currentY = 40;
        }

        // Encabezado de la venta
        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.setFont('helvetica', 'bold');
        doc.text(`VENTA #${venta.idVenta}`, doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
        
        currentY += 25;

        // Información básica de la venta
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Sucursal: ${venta.nombreSucursal}`, 40, currentY);
        doc.text(`Fecha Venta: ${formatFecha(venta.fechaVenta)}`, 200, currentY);
        currentY += 15;
        
        doc.text(`Usuario: ${venta.usuario}`, 40, currentY);
        doc.text(`Turno: ${venta.ventaTurno}`, 200, currentY);
        currentY += 20;

        // Tabla de productos sobrantes
        if (venta.ventaDetalle.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('PRODUCTOS SOBRANTES:', 40, currentY);
          currentY += 15;

          const productosData = venta.ventaDetalle.map(producto => [
            producto.nombreProducto || `Producto #${producto.idProducto}`,
            producto.unidadesSobrantes.toString()
          ]);

          // Configurar autoTable
          const tableOptions = {
            startY: currentY,
            head: [
              ['Producto', 'Unidades Sobrantes']
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

          // Totales
          const totalUnidades = venta.ventaDetalle.reduce((sum, prod) => sum + prod.unidadesSobrantes, 0);
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(`Total productos: ${venta.ventaDetalle.length}`, 40, currentY);
          doc.text(`Total unidades sobrantes: ${totalUnidades}`, 200, currentY);
          
          currentY += 20;
        }

        // Número de página
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Página ${doc.internal.getNumberOfPages()} - Venta ${index + 1} de ${dataToExport.length}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 20,
          { align: 'center' }
        );
      });
  
      doc.save(`reporte-productos-sobrantes-${sucursalNombre.replace(/\s+/g, '_')}-${dateStr.replace(/\//g, '-').replace(/:/g, '-').replace(' ', '_')}.pdf`);
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

      // Crear una hoja por cada venta
      dataToExport.forEach((venta, index) => {
        const ventaData = [
          ["REPORTE DE PRODUCTOS SOBRANTES"],
          [`Generado el: ${dateStr}`],
          [`Sucursal: ${sucursalNombre}`],
          [`Fecha del reporte: ${dayjs(fecha).format('DD/MM/YYYY')}`],
          selectedTurno !== 'Todos' ? [`Turno: ${selectedTurno}`] : [],
          [],
          ["DETALLE DE VENTA"],
          [`Venta #${venta.idVenta}`],
          [],
          ["INFORMACIÓN GENERAL"],
          [`ID Venta: ${venta.idVenta}`],
          [`Sucursal: ${venta.nombreSucursal}`],
          [`Fecha Venta: ${formatFecha(venta.fechaVenta)}`],
          [`Usuario: ${venta.usuario}`],
          [`Turno: ${venta.ventaTurno}`],
          [],
          ["PRODUCTOS SOBRANTES"],
          ["Producto", "Unidades Sobrantes"]
        ];

        // Agregar productos
        venta.ventaDetalle.forEach((producto) => {
          ventaData.push([
            producto.nombreProducto || `Producto #${producto.idProducto}`,
            producto.unidadesSobrantes
          ]);
        });

        // Agregar totales
        const totalUnidades = venta.ventaDetalle.reduce((sum, prod) => sum + prod.unidadesSobrantes, 0);
        ventaData.push([]);
        ventaData.push(["", "TOTAL UNIDADES:", totalUnidades]);
        ventaData.push([`Total productos: ${venta.ventaDetalle.length}`]);

        const wsVenta = XLSX.utils.aoa_to_sheet(ventaData);

        // Ajustar anchos de columnas
        const colWidths = [
          { wch: 35 }, { wch: 20 }
        ];
        wsVenta['!cols'] = colWidths;

        // Formatear celdas de encabezados principales
        ['A1', 'A7', 'A10', 'A17'].forEach(cell => {
          if (wsVenta[cell]) {
            wsVenta[cell].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "3498DB" } }
            };
          }
        });

        // Formatear encabezado de productos
        ['A17', 'B17'].forEach((cell, colIndex) => {
          if (wsVenta[cell]) {
            wsVenta[cell].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "27AE60" } }
            };
          }
        });

        XLSX.utils.book_append_sheet(wb, wsVenta, `Venta ${venta.idVenta}`);
      });

      const fileName = `Reporte_Productos_Sobrantes_${sucursalNombre.replace(/\s+/g, '_')}_${dateStr.replace(/\//g, '-').replace(/:/g, '-').replace(' ', '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (err) {
      setError('Error al generar el Excel: ' + err.message);
      console.error('Error detallado:', err);
    } finally {
      setGeneratingExcel(false);
    }
  };

  const { totalVentas, totalProductos, totalUnidadesSobrantes } = calcularTotales();

  return (
    <Container fluid className="sr-container">
      <Row className="sr-header-row">
        <Col xs="auto" className="sr-back-col">
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/reportes')}
            className="sr-back-button"
          >
            <FiArrowLeft size={20} />
          </Button>
        </Col>
        <Col>
          <h1 className="sr-title">
            <FiPackage className="sr-title-icon" />
            Productos Sobrantes
          </h1>
          <p className="sr-subtitle">Consulta el reporte de productos sobrantes por sucursal y fecha</p>
        </Col>
      </Row>

      {/* Resumen - Solo visible en desktop */}
      {sobrantesData.length > 0 && (
        <div className="d-none d-md-block">
          <Row className="sr-resumen-row">
            <Col>
              <Card className="sr-resumen-card">
                <Card.Body>
                  <Row>
                    <Col md={4} className="sr-resumen-col">
                      <div className="sr-resumen-item">
                        <div className="sr-resumen-icon sr-ventas">
                          <FiPackage />
                        </div>
                        <div className="sr-resumen-info">
                          <span className="sr-resumen-label">Ventas Reportadas</span>
                          <span className="sr-resumen-value">{totalVentas}</span>
                        </div>
                      </div>
                    </Col>
                    <Col md={4} className="sr-resumen-col">
                      <div className="sr-resumen-item">
                        <div className="sr-resumen-icon sr-productos">
                          <FiPackage />
                        </div>
                        <div className="sr-resumen-info">
                          <span className="sr-resumen-label">Total Productos</span>
                          <span className="sr-resumen-value">{totalProductos}</span>
                        </div>
                      </div>
                    </Col>
                    <Col md={4} className="sr-resumen-col">
                      <div className="sr-resumen-item">
                        <div className="sr-resumen-icon sr-unidades">
                          <FiPackage />
                        </div>
                        <div className="sr-resumen-info">
                          <span className="sr-resumen-label">Unidades Sobrantes</span>
                          <span className="sr-resumen-value">{totalUnidadesSobrantes}</span>
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

      <Card className="sr-filtros-card">
        <Card.Body>
          <Row>
            <Col md={4} className="sr-filtro-col">
              <Form.Group>
                <Form.Label className="sr-filter-label">Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={fecha}
                  max={dayjs().format('YYYY-MM-DD')}
                  onChange={(e) => setFecha(e.target.value)}
                  className="sr-filter-select sr-date-input"
                  placeholder=" "
                  onFocus={(e) => e.target.showPicker()}
                />
              </Form.Group>
            </Col>

            <Col md={4} className="sr-filtro-col">
              <Form.Group>
                <Form.Label className="sr-filter-label">Sucursal</Form.Label>
                {userData?.idRol === 1 ? (
                  <Form.Control
                    as="select"
                    value={selectedSucursal}
                    onChange={(e) => setSelectedSucursal(e.target.value)}
                    disabled={loadingSucursales || sucursales.length === 0}
                    className="sr-filter-select"
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
                    className="sr-filter-select"
                  />
                )}
                {loadingSucursales && <small className="sr-loading-text">Cargando sucursales...</small>}
                {!loadingSucursales && sucursales.length === 0 && (
                  <small className="sr-error-text">No hay sucursales disponibles</small>
                )}
              </Form.Group>
            </Col>

            <Col md={4} className="sr-filtro-col">
              <Form.Group>
                <Form.Label className="sr-filter-label">Turno</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedTurno}
                  onChange={(e) => setSelectedTurno(e.target.value)}
                  disabled={sobrantesData.length === 0}
                  className="sr-filter-select"
                >
                  <option value="Todos">Todos los turnos</option>
                  <option value="AM">Turno AM</option>
                  <option value="PM">Turno PM</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <Row className="sr-actions-row">
            <Col className="sr-actions-col">
              <div className="sr-actions-buttons">
                <Button
                  variant="outline-secondary"
                  onClick={handleReset}
                  className="sr-reset-btn"
                >
                  <FiRefreshCw />
                </Button>
                <Button
                  variant="primary"
                  onClick={handleGenerarReporte}
                  disabled={!fecha || !selectedSucursal || loadingReporte}
                  className="sr-generar-btn"
                >
                  {loadingReporte ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <>
                      <FiFilter className="sr-btn-icon" /> Generar
                    </>
                  )}
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Row className="sr-error-row">
          <Col>
            {renderErrorAlert(error)}
          </Col>
        </Row>
      )}

      {showErrorSucursales && (
        <Row className="sr-error-row">
          <Col xs={12} md={6}>
            {renderErrorAlert(`Error al cargar las sucursales`)}
          </Col>
        </Row>
      )}

      {sobrantesData.length > 0 && (
        <>
          <Row className="sr-export-row">
            <Col md={12} className="sr-export-col">
              <Button 
                variant="outline-primary" 
                className="sr-export-btn sr-excel-btn"
                onClick={generateExcel}
                disabled={generatingExcel || filteredData.length === 0}
              >
                {generatingExcel ? (
                  <>
                    <Spinner animation="border" size="sm" className="sr-btn-spinner" /> Generando...
                  </>
                ) : (
                  <>
                    <FiDownload className="sr-btn-icon" /> Exportar a Excel
                  </>
                )}
              </Button>
              <Button 
                variant="outline-danger" 
                className="sr-export-btn sr-pdf-btn"
                onClick={generatePDF}
                disabled={generatingPDF || filteredData.length === 0}
              >
                {generatingPDF ? (
                  <>
                    <Spinner animation="border" size="sm" className="sr-btn-spinner" /> Generando...
                  </>
                ) : (
                  <>
                    <FiDownload className="sr-btn-icon" /> Exportar a PDF
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
                <Table responsive bordered hover className="sr-table">
                  <thead>
                    <tr>
                      <th>Fecha Venta</th>
                      <th>ID Venta</th>
                      <th>Sucursal</th>
                      <th>Usuario</th>
                      <th>Turno</th>
                      <th>Productos</th>
                      <th>Unidades Sobrantes</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((venta) => {
                      const totalUnidades = venta.ventaDetalle.reduce((sum, prod) => sum + prod.unidadesSobrantes, 0);
                      return (
                        <tr key={venta.idVenta}>
                          <td>{formatFecha(venta.fechaVenta)}</td>
                          <td className="sr-text-center">{venta.idVenta}</td>
                          <td>{venta.nombreSucursal}</td>
                          <td className="sr-text-center">{venta.usuario}</td>
                          <td style={{
                            backgroundColor: getTurnoBackgroundColor(venta.ventaTurno),
                            color: getTurnoTextColor(venta.ventaTurno),
                            fontWeight: 'bold'
                          }} className="sr-text-center">
                            {venta.ventaTurno}
                          </td>
                          <td className="sr-text-center">{venta.ventaDetalle.length}</td>
                          <td className="sr-text-center">{totalUnidades}</td>
                          <td className="sr-text-center">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleVerDetalle(venta)}
                              className="sr-detalle-btn"
                            >
                              <FiEye className="sr-btn-icon" />
                              Ver Detalle
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              <div className="d-md-none">
                <Accordion activeKey={activeVenta}>
                  {filteredData.map((venta) => {
                    const totalUnidades = venta.ventaDetalle.reduce((sum, prod) => sum + prod.unidadesSobrantes, 0);
                    return (
                      <Accordion.Item 
                        key={venta.idVenta} 
                        eventKey={venta.idVenta}
                        className="sr-venta-card"
                      >
                        <Accordion.Header onClick={() => toggleVenta(venta.idVenta)}>
                          <div className="sr-accordion-header">
                            <div className="sr-venta-info">
                              <span className="sr-venta-fecha">{formatFecha(venta.fechaVenta)}</span>
                              <span className="sr-venta-id">Venta #{venta.idVenta}</span>
                            </div>
                            <div className="sr-venta-datos">
                              <span className="sr-venta-unidades">{totalUnidades} unidades</span>
                              {renderTurnoBadge(venta.ventaTurno)}
                            </div>
                            {activeVenta === venta.idVenta ? <FiChevronUp /> : <FiChevronDown />}
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <div className="sr-venta-details">
                            <div className="sr-detail-row">
                              <span className="sr-detail-label">Sucursal:</span>
                              <span>{venta.nombreSucursal}</span>
                            </div>
                            <div className="sr-detail-row">
                              <span className="sr-detail-label">Usuario:</span>
                              <span>{venta.usuario}</span>
                            </div>
                            <div className="sr-detail-row">
                              <span className="sr-detail-label">Total Productos:</span>
                              <span>{venta.ventaDetalle.length}</span>
                            </div>
                            
                            {/* Detalle de productos */}
                            {venta.ventaDetalle.length > 0 && (
                              <div className="sr-productos-detalle">
                                <h6 className="sr-detalle-title">Productos Sobrantes:</h6>
                                {venta.ventaDetalle.map((producto, index) => (
                                  <div key={producto.idSobrante} className="sr-producto-item">
                                    <div className="sr-detail-row">
                                      <span className="sr-detail-label">Producto:</span>
                                      <span>{producto.nombreProducto || `Producto #${producto.idProducto}`}</span>
                                    </div>
                                    <div className="sr-detail-row">
                                      <span className="sr-detail-label">Unidades Sobrantes:</span>
                                      <span>{producto.unidadesSobrantes}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    );
                  })}
                </Accordion>
              </div>
            </>
          ) : sobrantesData.length > 0 && filteredData.length === 0 ? (
            <Card className="sr-empty-state">
              <Card.Body className="sr-empty-body">
                <FiFilter size={48} className="sr-empty-icon" />
                <h5>No hay resultados para el filtro aplicado</h5>
                <p className="sr-empty-text">
                  No se encontraron ventas para el turno seleccionado
                </p>
              </Card.Body>
            </Card>
          ) : !showErrorSucursales && (
            <Card className="sr-empty-state">
              <Card.Body className="sr-empty-body">
                {loadingReporte ? (
                  <>
                    <Spinner animation="border" variant="primary" />
                    <p className="sr-loading-text">Generando reporte...</p>
                  </>
                ) : (
                  <>
                    <FiPackage size={48} className="sr-empty-icon" />
                    <h5>No hay datos para mostrar</h5>
                    <p className="sr-empty-text">
                      Selecciona una fecha y una sucursal para generar el reporte de productos sobrantes
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
        className="sr-modal"
      >
        <Modal.Header closeButton className="sr-modal-header">
          <Modal.Title className="sr-modal-title">
            <FiEye className="sr-modal-icon" />
            Detalle de Productos Sobrantes
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="sr-modal-body">
          {ventaSeleccionada && (
            <div className="sr-detalle-content">
              <Row className="sr-detalle-info-row">
                <Col md={6}>
                  <div className="sr-detalle-info">
                    <strong>ID Venta:</strong> {ventaSeleccionada.idVenta}
                  </div>
                  <div className="sr-detalle-info">
                    <strong>Sucursal:</strong> {ventaSeleccionada.nombreSucursal}
                  </div>
                  <div className="sr-detalle-info">
                    <strong>Usuario:</strong> {ventaSeleccionada.usuario}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="sr-detalle-info">
                    <strong>Fecha Venta:</strong> {formatFecha(ventaSeleccionada.fechaVenta)}
                  </div>
                  <div className="sr-detalle-info">
                    <strong>Turno:</strong> {renderTurnoBadge(ventaSeleccionada.ventaTurno)}
                  </div>
                </Col>
              </Row>

              <Card className="sr-productos-card">
                <Card.Header className="sr-productos-header">
                  <h6 className="sr-productos-title">
                    <FiPackage className="sr-productos-icon" />
                    Productos Sobrantes ({ventaSeleccionada.ventaDetalle.length})
                  </h6>
                </Card.Header>
                <Card.Body className="sr-productos-body">
                  <div className="sr-table-responsive">
                    <Table striped bordered hover size="sm" className="sr-productos-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Unidades Sobrantes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventaSeleccionada.ventaDetalle.map((producto, index) => (
                          <tr key={producto.idSobrante}>
                            <td>{producto.nombreProducto || `Producto #${producto.idProducto}`}</td>
                            <td className="sr-text-center">{producto.unidadesSobrantes}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="sr-text-end"><strong>Total:</strong></td>
                          <td className="sr-text-center">
                            <strong>
                              {ventaSeleccionada.ventaDetalle.reduce((sum, prod) => sum + prod.unidadesSobrantes, 0)}
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
        <Modal.Footer className="sr-modal-footer">
          <Button variant="secondary" onClick={handleCloseDetalleModal} className="sr-close-btn">
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SobrantesReport;