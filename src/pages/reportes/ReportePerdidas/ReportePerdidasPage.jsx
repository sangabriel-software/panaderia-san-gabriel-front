import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiFilter, FiDownload, FiRefreshCw, FiChevronDown, 
  FiChevronUp, FiArrowLeft, FiUsers, FiCalendar, 
  FiEye, FiX, FiClock, FiPackage, FiDollarSign,
  FiTrendingDown, FiUser, FiSun, FiMoon
} from 'react-icons/fi';
import { 
  Container, Row, Col, Form, Button, Spinner, 
  Card, Accordion, Table, Badge, Modal, ProgressBar 
} from 'react-bootstrap';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useNavigate } from 'react-router-dom';
import useGetSucursales from '../../../hooks/sucursales/useGetSucursales';
import { generarReportePerdidasService } from '../../../services/reportes/reportes.service';
import { getUserData } from '../../../utils/Auth/decodedata';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import './ReportePerdidas.styles.css';

// Configurar dayjs con plugins y locale español
dayjs.locale('es');
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

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
  
  // Estados para el modal de detalles
  const [showModal, setShowModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);

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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('HH:mm');
  };

  const formatDateLong = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('dddd, DD [de] MMMM [de] YYYY');
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).fromNow();
  };

  const togglePerdida = (id) => {
    setActivePerdida(activePerdida === id ? null : id);
  };

  const handleShowDetails = (producto) => {
    setSelectedProducto(producto);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProducto(null);
  };

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    const totalUnidades = reporteData.reduce((sum, item) => sum + item.totalUnidadesPerdidas, 0);
    const totalDinero = reporteData.reduce((sum, item) => sum + item.totalDineroPerdido, 0);
    const totalRegistros = reporteData.reduce((sum, item) => sum + (item.detalles?.length || 0), 0);
    const totalUsuarios = new Set(
      reporteData.flatMap(item => 
        item.detalles?.map(d => d.usuario) || []
      )
    ).size;

    return { totalUnidades, totalDinero, totalRegistros, totalUsuarios };
  }, [reporteData]);

  // Obtener usuarios únicos por producto
  const getUsuariosUnicos = (detalles) => {
    if (!detalles || detalles.length === 0) return [];
    const usuarios = new Set();
    detalles.forEach(detalle => {
      if (detalle.usuario) usuarios.add(detalle.usuario);
    });
    return Array.from(usuarios);
  };

  // Obtener fechas únicas por producto
  const getFechasUnicas = (detalles) => {
    if (!detalles || detalles.length === 0) return [];
    const fechas = new Set();
    detalles.forEach(detalle => {
      if (detalle.fechaDescuento) {
        fechas.add(dayjs(detalle.fechaDescuento).format('YYYY-MM-DD'));
      }
    });
    return Array.from(fechas);
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
      const fechaGeneracion = dayjs().format('DD/MM/YYYY HH:mm:ss');
      
      // Título
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DETALLADO DE PÉRDIDAS', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
      
      // Información del reporte
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${fechaGeneracion}`, doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Sucursal: ${sucursalNombre}`, 40, 85);
      doc.text(
        `Rango de fechas: ${dayjs(fechaInicio).format('DD/MM/YYYY')} - ${dayjs(fechaFin).format('DD/MM/YYYY')}`,
        40,
        100
      );
      
      // Resumen general
      doc.text(`Total productos afectados: ${reporteData.length}`, 40, 115);
      doc.text(`Total unidades perdidas: ${formatNumber(estadisticas.totalUnidades)}`, 40, 130);
      doc.text(`Total dinero perdido: ${formatCurrency(estadisticas.totalDinero)}`, 40, 145);
      
      let currentY = 170;
      
      // Para cada producto
      reporteData.forEach((producto, idx) => {
        // Encabezado del producto
        if (currentY > doc.internal.pageSize.getHeight() - 100) {
          doc.addPage();
          currentY = 40;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text(`Producto: ${producto.nombreProducto}`, 40, currentY);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        currentY += 20;
        doc.text(`Sucursal: ${producto.sucursal}`, 40, currentY);
        doc.text(`Período: ${formatDate(producto.fechaInicio)} - ${formatDate(producto.fechaFin)}`, 250, currentY);
        
        currentY += 15;
        doc.text(`Unidades totales: ${formatNumber(producto.totalUnidadesPerdidas)}`, 40, currentY);
        doc.text(`Dinero total: ${formatCurrency(producto.totalDineroPerdido)}`, 250, currentY);
        doc.text(`Registros: ${producto.detalles?.length || 0}`, 450, currentY);
        
        currentY += 25;
        
        // Tabla de detalles
        if (producto.detalles && producto.detalles.length > 0) {
          const tableData = producto.detalles.map(detalle => [
            formatDateTime(detalle.fechaDescuento),
            detalle.usuario || 'N/A',
            detalle.turno || 'N/A',
            formatNumber(detalle.unidadesPerdidas),
            formatCurrency(detalle.dineroPerdida)
          ]);
          
          autoTable(doc, {
            startY: currentY,
            head: [
              ['Fecha y Hora', 'Usuario', 'Turno', 'Unidades', 'Valor']
            ],
            body: tableData,
            theme: 'grid',
            headStyles: {
              fillColor: [52, 152, 219],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 9
            },
            bodyStyles: {
              fontSize: 8
            },
            alternateRowStyles: {
              fillColor: [245, 245, 245]
            },
            columnStyles: {
              0: { cellWidth: 100 },
              1: { cellWidth: 80 },
              2: { cellWidth: 50, halign: 'center' },
              3: { cellWidth: 60, halign: 'center' },
              4: { cellWidth: 70, halign: 'right' }
            },
            margin: { horizontal: 40 },
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
          
          currentY = doc.lastAutoTable.finalY + 20;
        }
        
        // Línea separadora entre productos
        if (idx < reporteData.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.line(40, currentY, doc.internal.pageSize.getWidth() - 40, currentY);
          currentY += 20;
        }
      });
      
      const fileNameFecha = dayjs().format('YYYY-MM-DD_HH-mm-ss');
      doc.save(`reporte-detallado-perdidas-${fileNameFecha}.pdf`);
    } catch (err) {
      setError('Error al generar el PDF: ' + err.message);
      console.error('Error PDF:', err);
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
      const fechaGeneracion = dayjs().format('DD/MM/YYYY HH:mm:ss');
      const wb = XLSX.utils.book_new();
      
      // Hoja de Resumen
      const summaryData = [
        ["REPORTE DETALLADO DE PÉRDIDAS"],
        [`Generado el: ${fechaGeneracion}`],
        [`Sucursal: ${sucursalNombre}`],
        [`Rango de fechas: ${dayjs(fechaInicio).format('DD/MM/YYYY')} - ${dayjs(fechaFin).format('DD/MM/YYYY')}`],
        [],
        ["RESUMEN GENERAL"],
        [`Total productos afectados: ${reporteData.length}`],
        [`Total unidades perdidas: ${estadisticas.totalUnidades}`],
        [`Total dinero perdido: ${estadisticas.totalDinero}`],
        [`Total registros: ${estadisticas.totalRegistros}`],
        [`Total usuarios involucrados: ${estadisticas.totalUsuarios}`],
        [],
        ["RESUMEN POR PRODUCTO"],
        ["Producto", "Sucursal", "Unidades Perdidas", "Dinero Perdido", "Total Registros", "Período"]
      ];
      
      const summaryRows = reporteData.map(producto => [
        producto.nombreProducto,
        producto.sucursal,
        producto.totalUnidadesPerdidas,
        producto.totalDineroPerdido,
        producto.detalles?.length || 0,
        `${formatDate(producto.fechaInicio)} - ${formatDate(producto.fechaFin)}`
      ]);
      
      const summaryAllData = [...summaryData, ...summaryRows];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryAllData);
      
      // Configurar anchos de columna
      wsSummary['!cols'] = [
        { wch: 35 },
        { wch: 30 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 },
        { wch: 35 }
      ];
      
      // Combinar celdas para títulos
      wsSummary['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: 5 } }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");
      
      // Hoja de detalles por producto
      reporteData.forEach((producto, idx) => {
        const detalleData = [
          [`DETALLES - ${producto.nombreProducto}`],
          [`Sucursal: ${producto.sucursal}`],
          [`Período: ${formatDate(producto.fechaInicio)} - ${formatDate(producto.fechaFin)}`],
          [`Unidades totales: ${producto.totalUnidadesPerdidas} | Dinero total: ${producto.totalDineroPerdido}`],
          [],
          ["Fecha y Hora", "Usuario", "Turno", "Unidades", "Valor", "ID Descuento"]
        ];
        
        const detalleRows = producto.detalles?.map(detalle => [
          detalle.fechaDescuento ? dayjs(detalle.fechaDescuento).format('DD/MM/YYYY HH:mm') : 'N/A',
          detalle.usuario || 'N/A',
          detalle.turno || 'N/A',
          detalle.unidadesPerdidas,
          detalle.dineroPerdida,
          detalle.idDescuento || 'N/A'
        ]) || [];
        
        const allDetalleData = [...detalleData, ...detalleRows];
        const wsDetalle = XLSX.utils.aoa_to_sheet(allDetalleData);
        
        wsDetalle['!cols'] = [
          { wch: 25 },
          { wch: 25 },
          { wch: 10 },
          { wch: 12 },
          { wch: 15 },
          { wch: 12 }
        ];
        
        wsDetalle['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
          { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
          { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } }
        ];
        
        const sheetName = producto.nombreProducto.substring(0, 31) || `Producto ${idx + 1}`;
        XLSX.utils.book_append_sheet(wb, wsDetalle, sheetName);
      });
      
      const fileNameFecha = dayjs().format('YYYY-MM-DD_HH-mm-ss');
      const fileName = `Reporte_Detallado_Perdidas_${fileNameFecha}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (err) {
      setError('Error al generar el Excel: ' + err.message);
      console.error('Error Excel:', err);
    } finally {
      setGeneratingExcel(false);
    }
  };

  // Renderizar badge de turno
  const renderTurnoBadge = (turno) => {
    const turnoLower = turno?.toUpperCase() || '';
    const isAM = turnoLower.includes('AM');
    const isPM = turnoLower.includes('PM');
    
    let variant = 'secondary';
    let icon = null;
    
    if (isAM) {
      variant = 'warning';
      icon = <FiSun size={10} className="me-1" />;
    } else if (isPM) {
      variant = 'dark';
      icon = <FiMoon size={10} className="me-1" />;
    }
    
    return (
      <Badge bg={variant} className="turno-badge">
        {icon}
        {turno || 'N/A'}
      </Badge>
    );
  };

  // Calcular porcentaje para barra de progreso
  const getPorcentaje = (producto) => {
    if (estadisticas.totalUnidades === 0) return 0;
    return (producto.totalUnidadesPerdidas / estadisticas.totalUnidades) * 100;
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
          <h1 className="report-title">Reporte Detallado de Pérdidas</h1>
          <p className="report-subtitle">
            Consulta el historial completo de pérdidas por producto | Última actualización: {dayjs().format('DD/MM/YYYY HH:mm')}
          </p>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="filtros-card mb-4">
        <Card.Body>
          <Row>
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label className="filter-label">
                  Fecha Inicio <small className="text-muted ms-1">({dayjs(fechaInicio).format('DD/MM/YYYY')})</small>
                </Form.Label>
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
                <Form.Label className="filter-label">
                  Fecha Fin <small className="text-muted ms-1">({dayjs(fechaFin).format('DD/MM/YYYY')})</small>
                </Form.Label>
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
                      <FiFilter className="me-1" /> Generar Reporte
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

      {/* Estadísticas */}
      {reporteData.length > 0 && (
        <>
        {  /*
          <Row className="mb-4">
            <Col md={3} sm={6} className="mb-3">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-content">
                    <div className="stat-icon productos">
                      <FiPackage size={24} />
                    </div>
                    <div className="stat-text">
                      <div className="stat-value">{reporteData.length}</div>
                      <div className="stat-label">Productos Afectados</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-content">
                    <div className="stat-icon unidades">
                      <FiTrendingDown size={24} />
                    </div>
                    <div className="stat-text">
                      <div className="stat-value">{formatNumber(estadisticas.totalUnidades)}</div>
                      <div className="stat-label">Unidades Perdidas</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-content">
                    <div className="stat-icon dinero">
                      <FiDollarSign size={24} />
                    </div>
                    <div className="stat-text">
                      <div className="stat-value">{formatCurrency(estadisticas.totalDinero)}</div>
                      <div className="stat-label">Valor Total</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-content">
                    <div className="stat-icon usuarios">
                      <FiUsers size={24} />
                    </div>
                    <div className="stat-text">
                      <div className="stat-value">{estadisticas.totalUsuarios}</div>
                      <div className="stat-label">Usuarios Involucrados</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Botones de exportación */}
          <Row className="mb-3">
            <Col className="text-end">
              <Button 
                variant="outline-primary" 
                className="export-button me-2"
                onClick={generateExcel}
                disabled={generatingExcel}
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
                disabled={generatingPDF}
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
              <div className="mt-2 text-muted small">
                <FiClock size={12} className="me-1" />
                Reporte generado: {dayjs().format('DD/MM/YYYY HH:mm:ss')}
              </div>
            </Col>
          </Row>
        </>
      )}

      {/* Tabla de Productos */}
      <Row>
        <Col>
          {reporteData.length > 0 ? (
            <>
              {/* Vista Desktop */}
              <div className="d-none d-md-block">
                <Card className="table-card mb-4">
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover className="reporte-table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th className="text-center">Registros</th>
                            <th className="text-center">Unidades Perdidas</th>
                            <th className="text-end">Valor Total</th>
                            <th className="text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporteData.map((producto, index) => {
                            const usuariosUnicos = getUsuariosUnicos(producto.detalles);
                            const porcentaje = getPorcentaje(producto);
                            
                            return (
                              <tr key={producto.idProducto || index}>
                                <td>
                                  <div className="producto-cell">
                                    <div className="producto-nombre">{producto.nombreProducto}</div>
                                    <div className="producto-meta">
                                      <small className="text-muted">{producto.sucursal}</small>
                                      {usuariosUnicos.length > 0 && (
                                        <Badge bg="secondary" className="ms-2 usuarios-count-badge">
                                          <FiUser size={10} /> {usuariosUnicos.length}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <Badge bg="info" className="registros-badge">
                                    <FiCalendar size={12} className="me-1" />
                                    {producto.detalles?.length || 0}
                                  </Badge>
                                </td>
                                <td className="text-center">
                                  <span className="unidades-value">{formatNumber(producto.totalUnidadesPerdidas)}</span>
                                </td>
                                <td className="text-end">
                                  <span className="dinero-value">{formatCurrency(producto.totalDineroPerdido)}</span>
                                </td>
                                <td className="text-center">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="btn-ver-detalles"
                                    onClick={() => handleShowDetails(producto)}
                                  >
                                    <FiEye size={16} className="me-1" />
                                    Detalles
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* Vista Móvil */}
              <div className="d-md-none">
                <Accordion activeKey={activePerdida}>
                  {reporteData.map((producto, index) => {
                    const itemKey = `${producto.idProducto}-${index}`;
                    const usuariosUnicos = getUsuariosUnicos(producto.detalles);
                    const fechasUnicas = getFechasUnicas(producto.detalles);
                    const ultimoDetalle = producto.detalles?.[producto.detalles.length - 1];
                    
                    return (
                      <Accordion.Item 
                        key={itemKey} 
                        eventKey={itemKey}
                        className="perdida-card"
                      >
                        <Accordion.Header onClick={() => togglePerdida(itemKey)}>
                          <div className="perdida-header-content">
                            <div className="perdida-header-left">
                              <span className="perdida-producto">{producto.nombreProducto}</span>
                              <div className="perdida-meta">
                                <Badge bg="secondary" className="sucursal-badge-mobile">
                                  {producto.sucursal}
                                </Badge>
                                <Badge bg="info" className="registros-badge-mobile">
                                  <FiCalendar size={10} /> {producto.detalles?.length || 0}
                                </Badge>
                                {usuariosUnicos.length > 0 && (
                                  <Badge bg="secondary" className="usuarios-badge-mobile">
                                    <FiUser size={10} /> {usuariosUnicos.length}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="perdida-header-right">
                              <span className="perdida-dinero">{formatCurrency(producto.totalDineroPerdido)}</span>
                              <span className="perdida-unidades">{formatNumber(producto.totalUnidadesPerdidas)} uds</span>
                            </div>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <div className="perdida-details">
                            <div className="detail-row-mobile">
                              <span className="detail-label">Sucursal:</span>
                              <span className="detail-value">{producto.sucursal}</span>
                            </div>
                            
                            <div className="detail-row-mobile">
                              <span className="detail-label">Período:</span>
                              <span className="detail-value">
                                {formatDate(producto.fechaInicio)} - {formatDate(producto.fechaFin)}
                              </span>
                            </div>

                            <div className="detail-section">
                              <div className="detail-section-title">
                                <FiUsers size={14} className="me-1" />
                                <span>Usuarios involucrados ({usuariosUnicos.length})</span>
                              </div>
                              <div className="usuarios-mobile-list">
                                {usuariosUnicos.length > 0 ? (
                                  usuariosUnicos.map((usuario, idx) => (
                                    <Badge key={idx} bg="secondary" className="usuario-badge-mobile">
                                      {usuario}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted">N/A</span>
                                )}
                              </div>
                            </div>

                            <div className="detail-section">
                              <div className="detail-section-title">
                                <FiCalendar size={14} className="me-1" />
                                <span>Días con pérdidas ({fechasUnicas.length})</span>
                              </div>
                              <div className="fechas-mobile-list">
                                {fechasUnicas.length > 0 ? (
                                  fechasUnicas.slice(0, 3).map((fecha, idx) => (
                                    <Badge key={idx} bg="light" text="dark" className="fecha-badge-mobile">
                                      {dayjs(fecha).format('DD/MM/YYYY')}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted">N/A</span>
                                )}
                                {fechasUnicas.length > 3 && (
                                  <Badge bg="light" text="dark" className="fecha-badge-mobile">
                                    +{fechasUnicas.length - 3} más
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="detail-row-mobile highlight">
                              <span className="detail-label">Unidades perdidas:</span>
                              <span className="detail-value">{formatNumber(producto.totalUnidadesPerdidas)}</span>
                            </div>
                            
                            <div className="detail-row-mobile highlight">
                              <span className="detail-label">Dinero perdido:</span>
                              <span className="detail-value">{formatCurrency(producto.totalDineroPerdido)}</span>
                            </div>

                            {ultimoDetalle && (
                              <div className="detail-row-mobile text-muted small">
                                <span className="detail-label">
                                  <FiClock size={12} className="me-1" />
                                  Último registro:
                                </span>
                                <span className="detail-value">
                                  {formatDateTime(ultimoDetalle.fechaDescuento)}
                                </span>
                              </div>
                            )}

                            <div className="text-center mt-3">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="w-100"
                                onClick={() => handleShowDetails(producto)}
                              >
                                <FiEye size={16} className="me-1" />
                                Ver todos los registros
                              </Button>
                            </div>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    );
                  })}
                  
                  {/* Resumen total */}
                  <Card className="mt-3 totals-card-mobile">
                    <Card.Body>
                      <div className="totals-mobile-title">Resumen Total</div>
                      <div className="detail-row-mobile">
                        <span className="detail-label fw-bold">Productos afectados:</span>
                        <span className="detail-value fw-bold">{reporteData.length}</span>
                      </div>
                      <div className="detail-row-mobile">
                        <span className="detail-label fw-bold">Total unidades perdidas:</span>
                        <span className="detail-value fw-bold">
                          {formatNumber(estadisticas.totalUnidades)}
                        </span>
                      </div>
                      <div className="detail-row-mobile">
                        <span className="detail-label fw-bold">Total dinero perdido:</span>
                        <span className="detail-value fw-bold text-danger">
                          {formatCurrency(estadisticas.totalDinero)}
                        </span>
                      </div>
                      <div className="detail-row-mobile text-muted small">
                        <span className="detail-label">
                          <FiClock size={12} className="me-1" />
                          Reporte generado:
                        </span>
                        <span className="detail-value">
                          {dayjs().format('DD/MM/YYYY HH:mm:ss')}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Accordion>
              </div>
            </>
          ) : !showErrorSucursales && (
            <Card className="empty-state">
              <Card.Body className="text-center py-5">
                {loadingReporte ? (
                  <>
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <p className="mt-2 mb-1">Generando reporte...</p>
                    <small className="text-muted">
                      <FiClock size={12} className="me-1" />
                      Iniciado: {dayjs().format('HH:mm:ss')}
                    </small>
                  </>
                ) : (
                  <>
                    <FiFilter size={64} className="text-muted mb-3" />
                    <h5>No hay datos para mostrar</h5>
                    <p className="text-muted mb-3">
                      Selecciona un rango de fechas y haz clic en "Generar Reporte"
                    </p>
                    <small className="text-muted">
                      <FiClock size={12} className="me-1" />
                      Hora actual: {dayjs().format('HH:mm:ss')}
                    </small>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal de Detalles Completo */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" centered className="modal-detalles" scrollable>
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <div className="modal-title-content">
              <FiEye size={28} className="me-3" />
              <div>
                <div className="modal-title-main">Registros de Pérdidas</div>
                <div className="modal-title-sub">{selectedProducto?.nombreProducto}</div>
                <div className="modal-title-meta">
                  <Badge bg="info" className="me-2">
                    {selectedProducto?.detalles?.length || 0} registros
                  </Badge>
                  <Badge bg="secondary">
                    {selectedProducto?.sucursal}
                  </Badge>
                </div>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedProducto && (
            <>
              {/* Resumen del Producto */}
              <div className="modal-summary-section">
                <Row>
                  <Col lg={3} md={6} className="summary-item">
                    <div className="summary-label">Unidades Totales</div>
                    <div className="summary-value unidades">{formatNumber(selectedProducto.totalUnidadesPerdidas)}</div>
                  </Col>
                  <Col lg={3} md={6} className="summary-item">
                    <div className="summary-label">Valor Total</div>
                    <div className="summary-value dinero">{formatCurrency(selectedProducto.totalDineroPerdido)}</div>
                  </Col>
                  <Col lg={3} md={6} className="summary-item">
                    <div className="summary-label">Total Registros</div>
                    <div className="summary-value registros">
                      <FiCalendar size={20} className="me-2" />
                      {selectedProducto.detalles?.length || 0}
                    </div>
                  </Col>
                  <Col lg={3} md={6} className="summary-item">
                    <div className="summary-label">Período</div>
                    <div className="summary-value periodo">
                      {formatDate(selectedProducto.fechaInicio)} - {formatDate(selectedProducto.fechaFin)}
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Tabla de Detalles */}
              <div className="modal-section">
                <div className="modal-section-header">
                  <FiCalendar size={20} className="me-2" />
                  <span>Registros Detallados</span>
                  <Badge bg="info" className="ms-2">
                    {selectedProducto.detalles?.length || 0}
                  </Badge>
                </div>
                <div className="modal-section-content">
                  {/* Desktop */}
                  <div className="d-none d-lg-block">
                    <div className="table-responsive">
                      <Table hover className="detalles-table">
                        <thead>
                          <tr>
                            <th>Fecha y Hora</th>
                            <th>Usuario</th>
                            <th className="text-center">Turno</th>
                            <th className="text-center">Unidades</th>
                            <th className="text-end">Valor</th>
                            <th className="text-center">ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProducto.detalles?.map((detalle, index) => (
                            <tr key={detalle.idDescuento || index}>
                              <td>
                                <div className="detalle-fecha">
                                  <div>{formatDateTime(detalle.fechaDescuento)}</div>
                                  <small className="text-muted">
                                    {formatRelativeTime(detalle.fechaDescuento)}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <div className="detalle-usuario">
                                  <FiUser size={14} className="me-2" />
                                  {detalle.usuario || 'N/A'}
                                </div>
                              </td>
                              <td className="text-center">
                                {renderTurnoBadge(detalle.turno)}
                              </td>
                              <td className="text-center">
                                <span className="detalle-unidades">{formatNumber(detalle.unidadesPerdidas)}</span>
                              </td>
                              <td className="text-end">
                                <span className="detalle-dinero">{formatCurrency(detalle.dineroPerdida)}</span>
                              </td>
                              <td className="text-center">
                                <Badge bg="light" text="dark" className="id-badge">
                                  #{detalle.idDescuento}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="table-totals">
                            <td colSpan="3" className="text-end fw-bold">Totales:</td>
                            <td className="text-center fw-bold">
                              {formatNumber(selectedProducto.totalUnidadesPerdidas)}
                            </td>
                            <td className="text-end fw-bold">
                              {formatCurrency(selectedProducto.totalDineroPerdido)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  </div>

                  {/* Mobile y Tablet */}
                  <div className="d-lg-none">
                    <div className="detalles-list">
                      {selectedProducto.detalles?.map((detalle, index) => (
                        <Card key={detalle.idDescuento || index} className="detalle-card mb-3">
                          <Card.Body>
                            <Row>
                              <Col xs={12} className="mb-2">
                                <div className="detalle-fecha-mobile">
                                  <FiCalendar size={14} className="me-2" />
                                  {formatDateTime(detalle.fechaDescuento)}
                                  <small className="text-muted ms-2">
                                    {formatRelativeTime(detalle.fechaDescuento)}
                                  </small>
                                </div>
                              </Col>
                              <Col xs={6} md={4}>
                                <div className="detalle-info">
                                  <div className="detalle-label">Usuario</div>
                                  <div className="detalle-value usuario">
                                    <FiUser size={12} className="me-1" />
                                    {detalle.usuario || 'N/A'}
                                  </div>
                                </div>
                              </Col>
                              <Col xs={6} md={4}>
                                <div className="detalle-info">
                                  <div className="detalle-label">Turno</div>
                                  <div className="detalle-value">
                                    {renderTurnoBadge(detalle.turno)}
                                  </div>
                                </div>
                              </Col>
                              <Col xs={6} md={4}>
                                <div className="detalle-info">
                                  <div className="detalle-label">Unidades</div>
                                  <div className="detalle-value unidades">
                                    {formatNumber(detalle.unidadesPerdidas)}
                                  </div>
                                </div>
                              </Col>
                              <Col xs={6} md={4}>
                                <div className="detalle-info">
                                  <div className="detalle-label">Valor</div>
                                  <div className="detalle-value dinero">
                                    {formatCurrency(detalle.dineroPerdida)}
                                  </div>
                                </div>
                              </Col>
                              <Col xs={6} md={4}>
                                <div className="detalle-info">
                                  <div className="detalle-label">ID</div>
                                  <div className="detalle-value">
                                    <Badge bg="light" text="dark">
                                      #{detalle.idDescuento}
                                    </Badge>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <div className="footer-time-info small text-muted">
            <FiClock size={12} className="me-1" />
            Consultado: {dayjs().format('HH:mm:ss')}
          </div>
          <Button variant="secondary" onClick={handleCloseModal}>
            <FiX size={16} className="me-1" />
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReportePerdidasPage;