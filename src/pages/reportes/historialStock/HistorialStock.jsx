import React, { useState, useMemo, useEffect } from 'react';
import { FiFilter, FiDownload, FiRefreshCw, FiCalendar, FiChevronDown, FiChevronUp, FiArrowLeft } from 'react-icons/fi';
import { Container, Row, Col, Form, Button, Spinner, Card, Accordion, Table, Dropdown } from 'react-bootstrap';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { generarReporteHistorialStockService } from "../../../services/reportes/reportes.service";
import './HistorialStock.styles.css';
import { getUserData } from "../../../utils/Auth/decodedata";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';

const HistorialStock = () => {
  const navigate = useNavigate();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const userData = getUserData();
  
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [selectedSucursal, setSelectedSucursal] = useState('');
  const [reporteData, setReporteData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [activeMovimiento, setActiveMovimiento] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);

  // Establecer sucursal automáticamente si no es admin
  useEffect(() => {
    if (!loadingSucursales && sucursales.length > 0 && userData?.idRol !== 1) {
      const sucursalUsuario = sucursales.find(s => s.idSucursal === userData.idSucursal);
      if (sucursalUsuario) {
        setSelectedSucursal(sucursalUsuario.idSucursal);
      }
    }
  }, [loadingSucursales, sucursales, userData]);

  // Obtener categorías únicas de los productos
  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map(p => p.nombreCategoria))];
    return ['Todas', ...cats];
  }, [productos]);

  // Filtrar productos por categoría
  const productosFiltrados = useMemo(() => {
    if (categoriaActiva === 'Todas') {
      return productos;
    }
    return productos.filter(p => p.nombreCategoria === categoriaActiva);
  }, [productos, categoriaActiva]);

  const handleGenerarReporte = async () => {
    if (!selectedProducto || !selectedSucursal || !fechaInicio || !fechaFin) {
      setError('Debes completar todos los campos obligatorios');
      return;
    }

    const inicio = dayjs(fechaInicio).startOf('day');
    const fin = dayjs(fechaFin).endOf('day');
    
    if (inicio.isAfter(fin)) {
      setError('La fecha de inicio no puede ser mayor a la fecha final');
      return;
    }

    setError(null);
    setLoadingReporte(true);

    try {
      const data = await generarReporteHistorialStockService(
        selectedProducto.value, 
        selectedSucursal,
        fechaInicio,
        fechaFin
      );
      setReporteData(data.reporte || []);
      setFilteredData(data.reporte || []);
    } catch (err) {
      setError('Error al generar el reporte: ' + err.message);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleReset = () => {
    setSelectedProducto(null);
    setSelectedSucursal(userData?.idRol === 1 ? '' : userData?.idSucursal || '');
    setReporteData([]);
    setFilteredData([]);
    setFechaInicio('');
    setFechaFin('');
    setError(null);
    setActiveMovimiento(null);
    setCategoriaActiva('Todas');
  };

  const formatFecha = (fecha) => {
    return dayjs(fecha).format('DD/MM/YYYY HH:mm');
  };

  const toggleMovimiento = (id) => {
    setActiveMovimiento(activeMovimiento === id ? null : id);
  };

  const renderErrorAlert = (message) => (
    <div className="custom-alert error">
      <div className="alert-content">
        <span className="alert-message">{message}</span>
      </div>
    </div>
  );

  const renderStockChange = (item) => (
    <div className="stock-change-container">
      <div className="stock-change">
        <span className="stock-label">Anterior:</span>
        <span className="stock-before">{item.stockAnterior}</span>
      </div>
      <div className="stock-change">
        <span className="stock-label">{item.tipoMovimiento === 'INGRESO' ? 'Ingresado:' : 'Egresado:'}</span>
        <span className={`stock-quantity ${item.tipoMovimiento.toLowerCase()}`}>
          {item.tipoMovimiento === 'INGRESO' ? '+' : '-'}{item.cantidad}
        </span>
      </div>
      <div className="stock-change">
        <span className="stock-label">Nuevo:</span>
        <span className="stock-after">{item.stockNuevo}</span>
      </div>
    </div>
  );

  const generatePDF = () => {
    if (filteredData.length === 0 && reporteData.length === 0) {
      setError('No hay datos para generar el reporte');
      return;
    }
  
    setGeneratingPDF(true);
    setError(null);
  
    try {
      const doc = new jsPDF('portrait', 'pt', 'a4');
      const dataToExport = filteredData.length > 0 ? filteredData : reporteData;
      const sucursalNombre = sucursales.find(s => s.idSucursal === selectedSucursal)?.nombreSucursal || selectedSucursal;
      const today = new Date();
      // Formato de fecha con hora
      const dateStr = today.toLocaleDateString('es-GT') + ' ' + today.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  
      // Título
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE HISTORIAL DE STOCK', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
  
      // Información del reporte
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${dateStr}`, doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Producto: ${selectedProducto?.label || 'No especificado'}`, 40, 80);
      doc.text(`Sucursal: ${sucursalNombre}`, 40, 95);
      
      if (fechaInicio || fechaFin) {
        doc.text(
          `Rango de fechas: ${fechaInicio ? dayjs(fechaInicio).format('DD/MM/YYYY') : 'Inicio no especificado'} - ${fechaFin ? dayjs(fechaFin).format('DD/MM/YYYY') : 'Fin no especificado'}`,
          40,
          110
        );
      }
  
      // Preparar datos para la tabla
      const tableData = dataToExport.map(item => [
        dayjs(item.fechaMovimiento).format('DD/MM/YYYY HH:mm'),
        item.tipoMovimiento,
        item.cantidad,
        `Ant: ${item.stockAnterior}\nMov: ${item.tipoMovimiento === 'INGRESO' ? '+' : '-'}${item.cantidad}\nNvo: ${item.stockNuevo}`,
        item.nombreUsuario,
        item.observaciones || 'N/A'
      ]);
  
      // Configuración de la tabla
      autoTable(doc, {
        startY: 130,
        head: [['Fecha', 'Movimiento', 'Cantidad', 'Stock', 'Usuario', 'Observaciones']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
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
          0: { cellWidth: 80 },
          1: { cellWidth: 60 },
          2: { cellWidth: 40 },
          3: { cellWidth: 60 },
          4: { cellWidth: 60 },
          5: { cellWidth: 'auto' }
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
      doc.save(`historial-stock-${dateStr.replace(/\//g, '-').replace(/:/g, '-').replace(' ', '_')}.pdf`);
    } catch (err) {
      console.log(err)
      setError('Error al generar el PDF: ' + err.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const generateExcel = () => {
    if (filteredData.length === 0 && reporteData.length === 0) {
      setError('No hay datos para generar el reporte');
      return;
    }
  
    setGeneratingExcel(true);
    setError(null);
  
    try {
      const dataToExport = filteredData.length > 0 ? filteredData : reporteData;
      const sucursalNombre = sucursales.find(s => s.idSucursal === selectedSucursal)?.nombreSucursal || selectedSucursal;
      const today = new Date();
      const dateStr = today.toLocaleDateString('es-GT') + ' ' + today.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  
      // 1. Preparar los datos para Excel
      const excelData = dataToExport.map(item => ({
        'Fecha': dayjs(item.fechaMovimiento).format('DD/MM/YYYY HH:mm'),
        'Tipo Movimiento': item.tipoMovimiento,
        'Cantidad': item.cantidad,
        'Stock Anterior': item.stockAnterior,
        'Movimiento': item.tipoMovimiento === 'INGRESO' ? `+${item.cantidad}` : `-${item.cantidad}`,
        'Stock Nuevo': item.stockNuevo,
        'Usuario': item.nombreUsuario,
        'Observaciones': item.observaciones || 'N/A'
      }));
  
      // 2. Crear libro y hoja de trabajo
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([]); // Hoja vacía inicialmente
  
      // 3. Definir anchos de columna
      const colWidths = [
        { wch: 20 }, // Fecha (columna A/0)
        { wch: 15 }, // Tipo Movimiento (B/1)
        { wch: 10 }, // Cantidad (C/2)
        { wch: 15 }, // Stock Anterior (D/3)
        { wch: 12 }, // Movimiento (E/4)
        { wch: 12 }, // Stock Nuevo (F/5)
        { wch: 15 }, // Usuario (G/6)
        { wch: 30 }  // Observaciones (H/7)
      ];
      ws['!cols'] = colWidths;
  
      // 4. Agregar información del reporte
      const reportInfo = [
        ["REPORTE DE HISTORIAL DE STOCK"],
        [`Generado el: ${dateStr}`],
        [`Producto: ${selectedProducto?.label || 'No especificado'}`],
        [`Sucursal: ${sucursalNombre}`],
        []
      ];
      
      if (fechaInicio || fechaFin) {
        reportInfo.push([
          `Rango de fechas: ${fechaInicio ? dayjs(fechaInicio).format('DD/MM/YYYY') : 'Inicio no especificado'} - ${fechaFin ? dayjs(fechaFin).format('DD/MM/YYYY') : 'Fin no especificado'}`
        ]);
        reportInfo.push([]);
      }
  
      // 5. Insertar información del reporte
      XLSX.utils.sheet_add_aoa(ws, reportInfo, { origin: 'A1' });
  
      // 6. Combinar celdas para los títulos
      const merges = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Título principal
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // Fecha generación
        { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }, // Producto
        { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } }  // Sucursal
      ];
  
      if (fechaInicio || fechaFin) {
        merges.push({ s: { r: 4, c: 0 }, e: { r: 4, c: 7 } }); // Rango fechas
        merges.push({ s: { r: 5, c: 0 }, e: { r: 5, c: 7 } }); // Espacio en blanco
      }
      ws['!merges'] = merges;
  
      // 7. Agregar encabezados de columnas
      const headers = Object.keys(excelData[0] || {});
      const headerRow = reportInfo.length;
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: XLSX.utils.encode_row(headerRow) });
  
      // 8. Aplicar estilos a encabezados
      headers.forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: colIndex });
        ws[cellRef] = ws[cellRef] || { t: 's' };
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4BACC6" } },
          alignment: { horizontal: "center" }
        };
      });
  
      // 9. Agregar los datos
      XLSX.utils.sheet_add_json(ws, excelData, {
        header: headers,
        skipHeader: true,
        origin: XLSX.utils.encode_row(headerRow + 1)
      });
  
      // 10. Aplicar estilos a los datos
      excelData.forEach((row, rowIndex) => {
        const dataRow = headerRow + 1 + rowIndex;
        
        // Estilo para Tipo Movimiento (columna B/1)
        const tipoCell = XLSX.utils.encode_cell({ r: dataRow, c: 1 });
        ws[tipoCell] = ws[tipoCell] || { t: 's' };
        ws[tipoCell].s = {
          font: { 
            bold: true, 
            color: { rgb: row['Tipo Movimiento'] === 'INGRESO' ? "007F00" : "FF0000" } 
          },
          fill: { 
            fgColor: { rgb: row['Tipo Movimiento'] === 'INGRESO' ? "C6EFCE" : "FFC7CE" } 
          }
        };
  
        // Estilo para Movimiento (columna E/4)
        const movCell = XLSX.utils.encode_cell({ r: dataRow, c: 4 });
        ws[movCell] = ws[movCell] || { t: 's' };
        ws[movCell].s = {
          font: { 
            bold: true, 
            color: { rgb: row['Tipo Movimiento'] === 'INGRESO' ? "007F00" : "FF0000" } 
          }
        };
      });
  
      // 11. Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, "Historial Stock");
  
      // 12. Generar archivo
      const fileName = `Historial_Stock_${selectedProducto?.label || 'Producto'}_${dateStr.replace(/\//g, '-').replace(/:/g, '-').replace(' ', '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);
  
    } catch (err) {
      setError('Error al generar el Excel: ' + err.message);
      console.error('Error detallado:', err);
    } finally {
      setGeneratingExcel(false);
    }
  };

  // Verificar si todos los campos obligatorios están llenos
  const isFormValid = selectedProducto && selectedSucursal && fechaInicio && fechaFin;

  return (
    <Container fluid className="historial-container">
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
          <h1 className="historial-title">Historial de Stock</h1>
          <p className="historial-subtitle">Consulta los movimientos de inventario</p>
        </Col>
      </Row>

      <Card className="filtros-card mb-4">
        <Card.Body>
          <Row>
            <Col md={3} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label className="filter-label">Categoría</Form.Label>
                <Dropdown>
                  <Dropdown.Toggle variant="light" className="w-100 text-start filter-select">
                    {categoriaActiva === 'Todas' ? 'Todas las categorías' : categoriaActiva}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100">
                    {categorias.map(categoria => (
                      <Dropdown.Item 
                        key={categoria}
                        active={categoriaActiva === categoria}
                        onClick={() => {
                          setCategoriaActiva(categoria);
                          setSelectedProducto(null);
                        }}
                      >
                        {categoria}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
            </Col>

            <Col md={3} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label className="filter-label">Producto</Form.Label>
                <Dropdown>
                  <Dropdown.Toggle 
                    variant="light" 
                    className="w-100 text-start filter-select"
                    disabled={loadigProducts || productosFiltrados.length === 0}
                  >
                    {selectedProducto ? selectedProducto.label : 'Seleccionar producto'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100">
                    {productosFiltrados.map(producto => (
                      <Dropdown.Item 
                        key={producto.idProducto}
                        onClick={() => setSelectedProducto({
                          value: producto.idProducto,
                          label: producto.nombreProducto
                        })}
                      >
                        {producto.nombreProducto}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                {loadigProducts && <small className="text-muted">Cargando productos...</small>}
                {productosFiltrados.length === 0 && !loadigProducts && (
                  <small className="text-muted">No hay productos en esta categoría</small>
                )}
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
                    className="filter-select"
                  />
                )}
                {loadingSucursales && <small className="text-muted">Cargando sucursales...</small>}
              </Form.Group>
            </Col>

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
          </Row>

          <Row className="mt-3">
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

            <Col md={9} className="d-flex align-items-end justify-content-end">
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
                  disabled={!isFormValid || loadingReporte}
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

      {showErrorProductos && (
        <Row style={{ justifyContent: 'center' }} className="mb-3">
          <Col xs={12} md={6}>
            {renderErrorAlert(`Error al cargar los productos`)}
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

      {filteredData.length > 0 && (
        <Row className="mb-3">
          <Col className="text-end">
            <Button 
              variant="outline-primary" 
              className="export-button me-2"
              onClick={generateExcel}
              disabled={generatingExcel || (filteredData.length === 0 && reporteData.length === 0)}
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
              disabled={generatingPDF || (filteredData.length === 0 && reporteData.length === 0)}
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
          {filteredData.length > 0 ? (
            <>
              <div className="d-none d-md-block">
                <Table responsive bordered hover className="reporte-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Movimiento</th>
                      <th>Cantidad</th>
                      <th>Stock</th>
                      <th>Usuario</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.idHistorial}>
                        <td>{formatFecha(item.fechaMovimiento)}</td>
                        <td>
                          <span className={`badge movimiento-${item.tipoMovimiento.toLowerCase()}`}>
                            {item.tipoMovimiento}
                          </span>
                        </td>
                        <td>{item.cantidad}</td>
                        <td>
                          {renderStockChange(item)}
                        </td>
                        <td>{item.nombreUsuario}</td>
                        <td className="observaciones">{item.observaciones}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="d-md-none">
                <Accordion activeKey={activeMovimiento}>
                  {filteredData.map((item) => (
                    <Accordion.Item 
                      key={item.idHistorial} 
                      eventKey={item.idHistorial}
                      className="movimiento-card"
                    >
                      <Accordion.Header onClick={() => toggleMovimiento(item.idHistorial)}>
                        <div className="d-flex justify-content-between w-100 pe-2 align-items-center">
                          <div className="d-flex flex-column">
                            <span className={`badge movimiento-${item.tipoMovimiento.toLowerCase()} mb-1`}>
                              {item.tipoMovimiento}
                            </span>
                            <span className="movimiento-fecha">{formatFecha(item.fechaMovimiento)}</span>
                          </div>
                          <div className="movimiento-cantidad">
                            {item.tipoMovimiento === 'INGRESO' ? '+' : '-'}{item.cantidad}
                          </div>
                          {activeMovimiento === item.idHistorial ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="movimiento-details">
                          {renderStockChange(item)}
                          <div className="detail-row">
                            <span className="detail-label">Usuario:</span>
                            <span>{item.nombreUsuario}</span>
                          </div>
                          {item.observaciones && (
                            <div className="detail-row">
                              <span className="detail-label">Observaciones:</span>
                              <span className="observaciones">{item.observaciones}</span>
                            </div>
                          )}
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </div>
            </>
          ) : reporteData.length > 0 ? (
            <Card className="empty-state">
              <Card.Body className="text-center py-4">
                <FiCalendar size={48} className="text-muted mb-3" />
                <h5>No hay datos para el rango de fechas seleccionado</h5>
                <p className="text-muted mb-3">
                  Ajusta las fechas o haz clic en Limpiar para ver todos los datos
                </p>
                <Button variant="outline-primary" onClick={handleReset}>
                  <FiRefreshCw className="me-1" /> Limpiar filtros
                </Button>
              </Card.Body>
            </Card>
          ) : !showErrorProductos && !showErrorSucursales && (
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
                      Completa todos los campos para generar el reporte
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

export default HistorialStock;