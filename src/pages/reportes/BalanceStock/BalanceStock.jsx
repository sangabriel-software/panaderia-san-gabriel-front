import React, { useState, useEffect } from 'react';
import { FiFilter, FiDownload, FiRefreshCw, FiCalendar, FiChevronDown, FiChevronUp, FiArrowLeft, FiPackage, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { Container, Row, Col, Form, Button, Spinner, Card, Accordion, Table, Badge, Modal } from 'react-bootstrap';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import useGetSucursales from '../../../hooks/sucursales/useGetSucursales';
import { generarReporteBalanceStockService } from '../../../services/reportes/reportes.service';
import { getUserData } from '../../../utils/Auth/decodedata';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import './BalanceStock.styles.css';

const BalanceStockPage = () => {
  const navigate = useNavigate();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const userData = getUserData();
  
  const [selectedSucursal, setSelectedSucursal] = useState('');
  const [balanceStock, setBalanceStock] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState(null);
  const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedTurno, setSelectedTurno] = useState('TODOS');
  const [activeProducto, setActiveProducto] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

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
    if (selectedTurno === 'TODOS') {
      setFilteredData(balanceStock);
    } else {
      const filtered = balanceStock.filter(producto => producto.turno === selectedTurno);
      setFilteredData(filtered);
    }
  }, [selectedTurno, balanceStock]);

  const handleGenerarReporte = async () => {
    if (!fecha) {
      setError('Debes seleccionar una fecha');
      return;
    }

    if (!selectedSucursal) {
      setError('Debes seleccionar una sucursal');
      return;
    }

    if (!selectedTurno) {
      setError('Debes seleccionar un turno');
      return;
    }

    setError(null);
    setLoadingReporte(true);

    try {
      const data = await generarReporteBalanceStockService(fecha, selectedSucursal, selectedTurno === 'TODOS' ? '' : selectedTurno);
      setBalanceStock(data.reporte || []);
      setFilteredData(data.reporte || []);
    } catch (err) {
      setError('Error al generar el reporte: ' + err.message);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleReset = () => {
    setFecha(dayjs().format('YYYY-MM-DD'));
    setSelectedTurno('TODOS');
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
    setBalanceStock([]);
    setFilteredData([]);
    setError(null);
    setActiveProducto(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(amount);
  };

  const toggleProducto = (id) => {
    setActiveProducto(activeProducto === id ? null : id);
  };

  const handleVerDetalle = (producto) => {
    setProductoSeleccionado(producto);
    setShowDetalleModal(true);
  };

  const handleCloseDetalleModal = () => {
    setShowDetalleModal(false);
    setProductoSeleccionado(null);
  };

  const renderErrorAlert = (message) => (
    <div className="bs-custom-alert bs-error">
      <div className="bs-alert-content">
        <span className="bs-alert-message">{message}</span>
      </div>
    </div>
  );

  const renderTurnoBadge = (turno) => {
    switch(turno) {
      case 'AM':
        return <Badge bg="info" className="bs-turno-badge bs-am">{turno}</Badge>;
      case 'PM':
        return <Badge bg="primary" className="bs-turno-badge bs-pm">{turno}</Badge>;
      case 'TODOS':
        return <Badge bg="secondary" className="bs-turno-badge bs-todos">{turno}</Badge>;
      default:
        return <Badge bg="secondary" className="bs-turno-badge">{turno}</Badge>;
    }
  };

  const getStockBackgroundColor = (stock) => {
    if (stock > 0) return 'rgba(39, 174, 96, 0.1)';
    if (stock < 0) return 'rgba(231, 76, 60, 0.1)';
    return 'rgba(241, 196, 15, 0.1)';
  };

  const getStockTextColor = (stock) => {
    if (stock > 0) return 'rgba(39, 174, 96, 1)';
    if (stock < 0) return 'rgba(231, 76, 60, 1)';
    return 'rgba(241, 196, 15, 1)';
  };

  const getStockIcon = (stock) => {
    if (stock > 0) return <FiTrendingUp className="bs-stock-icon bs-stock-positive" />;
    if (stock < 0) return <FiTrendingDown className="bs-stock-icon bs-stock-negative" />;
    return <FiMinus className="bs-stock-icon bs-stock-zero" />;
  };

  const calcularTotales = () => {
    const totalProductos = filteredData.length;
    const totalUnidadesProducidas = filteredData.reduce((sum, producto) => sum + producto.unidadesProducidas, 0);
    const totalUnidadesVendidas = filteredData.reduce((sum, producto) => sum + producto.unidadesVendidas, 0);
    const totalUnidadesDescontadas = filteredData.reduce((sum, producto) => sum + producto.unidadesDescontadas, 0);
    const totalStockDisponible = filteredData.reduce((sum, producto) => sum + producto.stockDisponible, 0);
    
    return { totalProductos, totalUnidadesProducidas, totalUnidadesVendidas, totalUnidadesDescontadas, totalStockDisponible };
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
  
      // Encabezado general
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE BALANCE DE STOCK', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
  
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${dateStr}`, doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Sucursal: ${sucursalNombre}`, 40, 80);
      doc.text(`Fecha: ${dayjs(fecha).format('DD/MM/YYYY')}`, 40, 95);
      doc.text(`Turno: ${selectedTurno}`, 40, 110);
  
      // Tabla principal
      const tableData = dataToExport.map(producto => [
        producto.nombreProducto,
        producto.turno,
        producto.unidadesProducidas.toString(),
        producto.unidadesVendidas.toString(),
        producto.unidadesDescontadas.toString(),
        producto.stockDisponible.toString()
      ]);

      autoTable(doc, {
        startY: 130,
        head: [
          ['Producto', 'Turno', 'Unidades Producidas', 'Unidades Vendidas', 'Unidades Descontadas', 'Stock Disponible']
        ],
        body: tableData,
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
        tableWidth: 'auto'
      });

      // Totales
      const { totalProductos, totalUnidadesProducidas, totalUnidadesVendidas, totalUnidadesDescontadas, totalStockDisponible } = calcularTotales();
      const finalY = doc.lastAutoTable.finalY + 20;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTALES:', 40, finalY);
      doc.text(`Productos: ${totalProductos}`, 200, finalY);
      doc.text(`Producidas: ${totalUnidadesProducidas}`, 300, finalY);
      doc.text(`Vendidas: ${totalUnidadesVendidas}`, 400, finalY);
      doc.text(`Descontadas: ${totalUnidadesDescontadas}`, 500, finalY);
      doc.text(`Stock: ${totalStockDisponible}`, 600, finalY);
  
      doc.save(`reporte-balance-stock-${sucursalNombre.replace(/\s+/g, '_')}-${dateStr.replace(/\//g, '-').replace(/:/g, '-').replace(' ', '_')}.pdf`);
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

      // Hoja principal
      const mainData = [
        ["REPORTE DE BALANCE DE STOCK"],
        [`Generado el: ${dateStr}`],
        [`Sucursal: ${sucursalNombre}`],
        [`Fecha: ${dayjs(fecha).format('DD/MM/YYYY')}`],
        [`Turno: ${selectedTurno}`],
        [],
        ["PRODUCTOS"],
        ["Producto", "Turno", "Unidades Producidas", "Unidades Vendidas", "Unidades Descontadas", "Stock Disponible"]
      ];

      // Agregar datos de productos
      dataToExport.forEach((producto) => {
        mainData.push([
          producto.nombreProducto,
          producto.turno,
          producto.unidadesProducidas,
          producto.unidadesVendidas,
          producto.unidadesDescontadas,
          producto.stockDisponible
        ]);
      });

      // Agregar totales
      const { totalProductos, totalUnidadesProducidas, totalUnidadesVendidas, totalUnidadesDescontadas, totalStockDisponible } = calcularTotales();
      mainData.push([]);
      mainData.push(["TOTALES", "", totalUnidadesProducidas, totalUnidadesVendidas, totalUnidadesDescontadas, totalStockDisponible]);
      mainData.push([`Total productos: ${totalProductos}`]);

      const ws = XLSX.utils.aoa_to_sheet(mainData);

      // Ajustar anchos de columnas
      const colWidths = [
        { wch: 35 }, { wch: 12 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 16 }
      ];
      ws['!cols'] = colWidths;

      // Formatear encabezados
      ['A1', 'A7'].forEach(cell => {
        if (ws[cell]) {
          ws[cell].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "3498DB" } }
          };
        }
      });

      // Formatear encabezado de tabla
      ['A7', 'B7', 'C7', 'D7', 'E7', 'F7'].forEach(cell => {
        if (ws[cell]) {
          ws[cell].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2C3E50" } }
          };
        }
      });

      XLSX.utils.book_append_sheet(wb, ws, "Balance Stock");

      const fileName = `Reporte_Balance_Stock_${sucursalNombre.replace(/\s+/g, '_')}_${dateStr.replace(/\//g, '-').replace(/:/g, '-').replace(' ', '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (err) {
      setError('Error al generar el Excel: ' + err.message);
      console.error('Error detallado:', err);
    } finally {
      setGeneratingExcel(false);
    }
  };

  const { totalProductos, totalUnidadesProducidas, totalUnidadesVendidas, totalUnidadesDescontadas, totalStockDisponible } = calcularTotales();

  return (
    <Container fluid className="bs-container">
      <Row className="bs-header-row">
        <Col xs="auto" className="bs-back-col">
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/reportes')}
            className="bs-back-button"
          >
            <FiArrowLeft size={20} />
          </Button>
        </Col>
        <Col>
          <h1 className="bs-title">
            <FiPackage className="bs-title-icon" />
            Balance de Stock
          </h1>
          <p className="bs-subtitle">Consulta el balance de stock por producto, sucursal y fecha</p>
        </Col>
      </Row>

      {/* Resumen - Solo visible en desktop */}
      {balanceStock.length > 0 && (
        <div className="d-none d-md-block">
          <Row className="bs-resumen-row">
            <Col>
              <Card className="bs-resumen-card">
                <Card.Body>
                  <Row>
                    <Col md={3} className="bs-resumen-col">
                      <div className="bs-resumen-item">
                        <div className="bs-resumen-icon bs-productos">
                          <FiPackage />
                        </div>
                        <div className="bs-resumen-info">
                          <span className="bs-resumen-label">Total Productos</span>
                          <span className="bs-resumen-value">{totalProductos}</span>
                        </div>
                      </div>
                    </Col>
                    <Col md={3} className="bs-resumen-col">
                      <div className="bs-resumen-item">
                        <div className="bs-resumen-icon bs-producidas">
                          <FiTrendingUp />
                        </div>
                        <div className="bs-resumen-info">
                          <span className="bs-resumen-label">Unidades Producidas</span>
                          <span className="bs-resumen-value">{totalUnidadesProducidas}</span>
                        </div>
                      </div>
                    </Col>
                    <Col md={3} className="bs-resumen-col">
                      <div className="bs-resumen-item">
                        <div className="bs-resumen-icon bs-vendidas">
                          <FiTrendingDown />
                        </div>
                        <div className="bs-resumen-info">
                          <span className="bs-resumen-label">Unidades Vendidas</span>
                          <span className="bs-resumen-value">{totalUnidadesVendidas}</span>
                        </div>
                      </div>
                    </Col>
                    <Col md={3} className="bs-resumen-col">
                      <div className="bs-resumen-item">
                        <div className="bs-resumen-icon bs-stock">
                          {getStockIcon(totalStockDisponible)}
                        </div>
                        <div className="bs-resumen-info">
                          <span className="bs-resumen-label">Stock Disponible</span>
                          <span className={`bs-resumen-value ${totalStockDisponible < 0 ? 'bs-text-danger' : totalStockDisponible > 0 ? 'bs-text-success' : 'bs-text-warning'}`}>
                            {totalStockDisponible}
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

      <Card className="bs-filtros-card">
        <Card.Body>
          <Row>
            <Col md={3} className="bs-filtro-col">
              <Form.Group>
                <Form.Label className="bs-filter-label">Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={fecha}
                  max={dayjs().format('YYYY-MM-DD')}
                  onChange={(e) => setFecha(e.target.value)}
                  className="bs-filter-select bs-date-input"
                  placeholder=" "
                  onFocus={(e) => e.target.showPicker()}
                />
              </Form.Group>
            </Col>

            <Col md={3} className="bs-filtro-col">
              <Form.Group>
                <Form.Label className="bs-filter-label">Sucursal</Form.Label>
                {userData?.idRol === 1 ? (
                  <Form.Control
                    as="select"
                    value={selectedSucursal}
                    onChange={(e) => setSelectedSucursal(e.target.value)}
                    disabled={loadingSucursales || sucursales.length === 0}
                    className="bs-filter-select"
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
                    className="bs-filter-select"
                  />
                )}
                {loadingSucursales && <small className="bs-loading-text">Cargando sucursales...</small>}
                {!loadingSucursales && sucursales.length === 0 && (
                  <small className="bs-error-text">No hay sucursales disponibles</small>
                )}
              </Form.Group>
            </Col>

            <Col md={3} className="bs-filtro-col">
              <Form.Group>
                <Form.Label className="bs-filter-label">Turno</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedTurno}
                  onChange={(e) => setSelectedTurno(e.target.value)}
                  className="bs-filter-select"
                >
                  <option value="TODOS">Todos los turnos</option>
                  <option value="AM">Turno AM</option>
                  <option value="PM">Turno PM</option>
                </Form.Control>
              </Form.Group>
            </Col>

            <Col md={3} className="bs-filtro-col">
              <Form.Group>
                <Form.Label className="bs-filter-label">&nbsp;</Form.Label>
                <div className="bs-actions-buttons">
                  <Button
                    variant="outline-secondary"
                    onClick={handleReset}
                    className="bs-reset-btn"
                  >
                    <FiRefreshCw />
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleGenerarReporte}
                    disabled={!fecha || !selectedSucursal || !selectedTurno || loadingReporte}
                    className="bs-generar-btn"
                  >
                    {loadingReporte ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <FiFilter className="bs-btn-icon" /> Generar
                      </>
                    )}
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Row className="bs-error-row">
          <Col>
            {renderErrorAlert(error)}
          </Col>
        </Row>
      )}

      {showErrorSucursales && (
        <Row className="bs-error-row">
          <Col xs={12} md={6}>
            {renderErrorAlert(`Error al cargar las sucursales`)}
          </Col>
        </Row>
      )}

      {balanceStock.length > 0 && (
        <>
          <Row className="bs-export-row">
            <Col md={12} className="bs-export-col">
              <Button 
                variant="outline-primary" 
                className="bs-export-btn bs-excel-btn"
                onClick={generateExcel}
                disabled={generatingExcel || filteredData.length === 0}
              >
                {generatingExcel ? (
                  <>
                    <Spinner animation="border" size="sm" className="bs-btn-spinner" /> Generando...
                  </>
                ) : (
                  <>
                    <FiDownload className="bs-btn-icon" /> Exportar a Excel
                  </>
                )}
              </Button>
              <Button 
                variant="outline-danger" 
                className="bs-export-btn bs-pdf-btn"
                onClick={generatePDF}
                disabled={generatingPDF || filteredData.length === 0}
              >
                {generatingPDF ? (
                  <>
                    <Spinner animation="border" size="sm" className="bs-btn-spinner" /> Generando...
                  </>
                ) : (
                  <>
                    <FiDownload className="bs-btn-icon" /> Exportar a PDF
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
                <Table responsive bordered hover className="bs-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Turno</th>
                      <th>Unidades Producidas</th>
                      <th>Unidades Vendidas</th>
                      <th>Unidades Descontadas</th>
                      <th>Stock Disponible</th>
                      {/* <th>Acciones</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((producto) => (
                      <tr key={`${producto.idProducto}-${producto.turno}`}>
                        <td className="bs-text-bold">{producto.nombreProducto}</td>
                        <td className="bs-text-center">
                          {renderTurnoBadge(producto.turno)}
                        </td>
                        <td className="bs-text-center">{producto.unidadesProducidas}</td>
                        <td className="bs-text-center">{producto.unidadesVendidas}</td>
                        <td className="bs-text-center">{producto.unidadesDescontadas}</td>
                        <td 
                          className="bs-text-center bs-stock-cell"
                          style={{
                            backgroundColor: getStockBackgroundColor(producto.stockDisponible),
                            color: getStockTextColor(producto.stockDisponible),
                            fontWeight: 'bold'
                          }}
                        >
                          <div className="bs-stock-content">
                            {getStockIcon(producto.stockDisponible)}
                            {producto.stockDisponible}
                          </div>
                        </td>
                        {/* <td className="bs-text-center">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleVerDetalle(producto)}
                            className="bs-detalle-btn"
                          >
                            <FiPackage className="bs-btn-icon" />
                            Detalle
                          </Button>
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="d-md-none">
                <Accordion activeKey={activeProducto}>
                  {filteredData.map((producto) => (
                    <Accordion.Item 
                      key={`${producto.idProducto}-${producto.turno}`} 
                      eventKey={producto.idProducto}
                      className="bs-producto-card"
                    >
                      <Accordion.Header onClick={() => toggleProducto(producto.idProducto)}>
                        <div className="bs-accordion-header">
                          <div className="bs-producto-info">
                            <span className="bs-producto-nombre">{producto.nombreProducto}</span>
                            <span className="bs-producto-turno">{renderTurnoBadge(producto.turno)}</span>
                          </div>
                          <div className="bs-producto-datos">
                            <span 
                              className={`bs-producto-stock ${producto.stockDisponible < 0 ? 'bs-text-danger' : producto.stockDisponible > 0 ? 'bs-text-success' : 'bs-text-warning'}`}
                            >
                              {getStockIcon(producto.stockDisponible)}
                              {producto.stockDisponible}
                            </span>
                            {activeProducto === producto.idProducto ? <FiChevronUp /> : <FiChevronDown />}
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="bs-producto-details">
                          <div className="bs-detail-row">
                            <span className="bs-detail-label">Unidades Producidas:</span>
                            <span>{producto.unidadesProducidas}</span>
                          </div>
                          <div className="bs-detail-row">
                            <span className="bs-detail-label">Unidades Vendidas:</span>
                            <span>{producto.unidadesVendidas}</span>
                          </div>
                          <div className="bs-detail-row">
                            <span className="bs-detail-label">Unidades Descontadas:</span>
                            <span>{producto.unidadesDescontadas}</span>
                          </div>
                          <div className="bs-detail-row">
                            <span className="bs-detail-label">Stock Disponible:</span>
                            <span className={producto.stockDisponible < 0 ? 'bs-text-danger' : producto.stockDisponible > 0 ? 'bs-text-success' : 'bs-text-warning'}>
                              {producto.stockDisponible}
                            </span>
                          </div>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </div>
            </>
          ) : balanceStock.length > 0 && filteredData.length === 0 ? (
            <Card className="bs-empty-state">
              <Card.Body className="bs-empty-body">
                <FiFilter size={48} className="bs-empty-icon" />
                <h5>No hay resultados para el filtro aplicado</h5>
                <p className="bs-empty-text">
                  No se encontraron productos para el turno seleccionado
                </p>
              </Card.Body>
            </Card>
          ) : !showErrorSucursales && (
            <Card className="bs-empty-state">
              <Card.Body className="bs-empty-body">
                {loadingReporte ? (
                  <>
                    <Spinner animation="border" variant="primary" />
                    <p className="bs-loading-text">Generando reporte...</p>
                  </>
                ) : (
                  <>
                    <FiPackage size={48} className="bs-empty-icon" />
                    <h5>No hay datos para mostrar</h5>
                    <p className="bs-empty-text">
                      Selecciona una fecha, sucursal y turno para generar el reporte de balance de stock
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
        className="bs-modal"
      >
        <Modal.Header closeButton className="bs-modal-header">
          <Modal.Title className="bs-modal-title">
            <FiPackage className="bs-modal-icon" />
            Detalle de Producto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bs-modal-body">
          {productoSeleccionado && (
            <div className="bs-detalle-content">
              <Row className="bs-detalle-info-row">
                <Col md={6}>
                  <div className="bs-detalle-info">
                    <strong>ID Producto:</strong> {productoSeleccionado.idProducto}
                  </div>
                  <div className="bs-detalle-info">
                    <strong>Nombre:</strong> {productoSeleccionado.nombreProducto}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="bs-detalle-info">
                    <strong>Turno:</strong> {renderTurnoBadge(productoSeleccionado.turno)}
                  </div>
                  <div className="bs-detalle-info">
                    <strong>Stock Disponible:</strong>
                    <span className={productoSeleccionado.stockDisponible < 0 ? 'bs-text-danger' : productoSeleccionado.stockDisponible > 0 ? 'bs-text-success' : 'bs-text-warning'}>
                      {productoSeleccionado.stockDisponible} unidades
                    </span>
                  </div>
                </Col>
              </Row>

              <Row className="bs-summary-row">
                <Col md={4}>
                  <Card className="bs-summary-card">
                    <Card.Body>
                      <div className="bs-summary-item">
                        <span>Unidades Producidas</span>
                        <strong>{productoSeleccionado.unidadesProducidas}</strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="bs-summary-card">
                    <Card.Body>
                      <div className="bs-summary-item">
                        <span>Unidades Vendidas</span>
                        <strong>{productoSeleccionado.unidadesVendidas}</strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="bs-summary-card">
                    <Card.Body>
                      <div className="bs-summary-item">
                        <span>Unidades Descontadas</span>
                        <strong>{productoSeleccionado.unidadesDescontadas}</strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="bs-resumen-card">
                <Card.Header className="bs-resumen-header">
                  <h6 className="bs-resumen-title">
                    <FiTrendingUp className="bs-resumen-icon" />
                    Resumen de Movimientos
                  </h6>
                </Card.Header>
                <Card.Body className="bs-resumen-body">
                  <div className="bs-resumen-grid">
                    <div className="bs-resumen-item-detalle">
                      <span className="bs-resumen-label">Entradas (Producción):</span>
                      <span className="bs-resumen-value bs-text-success">{productoSeleccionado.unidadesProducidas}</span>
                    </div>
                    <div className="bs-resumen-item-detalle">
                      <span className="bs-resumen-label">Salidas (Ventas):</span>
                      <span className="bs-resumen-value bs-text-danger">-{productoSeleccionado.unidadesVendidas}</span>
                    </div>
                    <div className="bs-resumen-item-detalle">
                      <span className="bs-resumen-label">Descuentos:</span>
                      <span className="bs-resumen-value bs-text-warning">-{productoSeleccionado.unidadesDescontadas}</span>
                    </div>
                    <div className="bs-resumen-item-detalle bs-resumen-total">
                      <span className="bs-resumen-label">Stock Final:</span>
                      <span className={`bs-resumen-value ${productoSeleccionado.stockDisponible < 0 ? 'bs-text-danger' : productoSeleccionado.stockDisponible > 0 ? 'bs-text-success' : 'bs-text-warning'}`}>
                        {productoSeleccionado.stockDisponible}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bs-modal-footer">
          <Button variant="secondary" onClick={handleCloseDetalleModal} className="bs-close-btn">
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BalanceStockPage;