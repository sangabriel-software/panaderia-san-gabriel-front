import React, { useState, useMemo } from 'react';
import { FiFilter, FiDownload, FiRefreshCw, FiCalendar, FiChevronDown, FiChevronUp, FiArrowLeft } from 'react-icons/fi';
import { Container, Row, Col, Form, Button, Spinner, Card, Accordion, Table, Dropdown } from 'react-bootstrap';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { generarReporteHistorialStockService } from "../../../services/reportes/reportes.service";
import './HistorialStock.styles.css';

const HistorialStock = () => {
  const navigate = useNavigate();
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  
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
    if (!selectedProducto || !selectedSucursal) {
      setError('Debes seleccionar un producto y una sucursal');
      return;
    }

    setError(null);
    setLoadingReporte(true);

    try {
      const data = await generarReporteHistorialStockService(selectedProducto.value, selectedSucursal);
      setReporteData(data.reporte || []);
      setFilteredData(data.reporte || []);
      setFechaInicio('');
      setFechaFin('');
    } catch (err) {
      setError('Error al generar el reporte: ' + err.message);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleReset = () => {
    setSelectedProducto(null);
    setSelectedSucursal('');
    setReporteData([]);
    setFilteredData([]);
    setFechaInicio('');
    setFechaFin('');
    setError(null);
    setActiveMovimiento(null);
    setCategoriaActiva('Todas');
  };

  const handleFiltrarPorFecha = () => {
    if (!fechaInicio || !fechaFin) {
      setError('Debes seleccionar ambas fechas para filtrar');
      return;
    }
  
    const inicio = dayjs(fechaInicio).startOf('day');
    const fin = dayjs(fechaFin).endOf('day');
    
    if (inicio.isAfter(fin)) {
      setError('La fecha de inicio no puede ser mayor a la fecha final');
      return;
    }
  
    setError(null);
    
    const datosFiltrados = reporteData.filter(item => {
      const fechaMovimiento = dayjs(item.fechaMovimiento);
      return (
        (fechaMovimiento.isAfter(inicio) || 
        fechaMovimiento.isSame(inicio, 'day')
      ) && (
        (fechaMovimiento.isBefore(fin)) || 
        fechaMovimiento.isSame(fin, 'day')
      ));
    });
  
    setFilteredData(datosFiltrados);
    setActiveMovimiento(null);
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
            <Col md={4} className="mb-3 mb-md-0">
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

            <Col md={4} className="mb-3 mb-md-0">
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

            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label className="filter-label">Sucursal</Form.Label>
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
                  disabled={!selectedProducto || !selectedSucursal || loadingReporte}
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

          {reporteData.length > 0 && (
            <Row className="mt-3">
              <Col md={4} className="mb-2 mb-md-0">
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
              <Col md={4} className="mb-2 mb-md-0">
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
              <Col md={4} className="d-flex align-items-end">
                <Button
                  variant="outline-primary"
                  onClick={handleFiltrarPorFecha}
                  disabled={!fechaInicio || !fechaFin}
                  className="w-100"
                >
                  <FiCalendar className="me-1" /> Filtrar
                </Button>
              </Col>
            </Row>
          )}
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
              className="export-button"
            >
              <FiDownload className="me-1" /> Exportar a Excel
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
                      Selecciona un producto y una sucursal para generar el reporte
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