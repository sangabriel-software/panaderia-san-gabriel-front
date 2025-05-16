import React, { useState } from 'react';
import { FiFilter, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { Container, Row, Col, Form, Button, Spinner, Alert, Table } from 'react-bootstrap';
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { generarReporteHistorialStockService } from "../../../services/reportes/reportes.service";
import './HistorialStock.styles.css';

const HistorialStock = () => {
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  
  const [selectedProducto, setSelectedProducto] = useState('');
  const [selectedSucursal, setSelectedSucursal] = useState('');
  const [reporteData, setReporteData] = useState([]);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerarReporte = async () => {
    if (!selectedProducto || !selectedSucursal) {
      setError('Debes seleccionar un producto y una sucursal');
      return;
    }

    setError(null);
    setLoadingReporte(true);

    try {
      const data = await generarReporteHistorialStockService(selectedProducto, selectedSucursal);
      setReporteData(data.reporte || []);
    } catch (err) {
      setError('Error al generar el reporte: ' + err.message);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleReset = () => {
    setSelectedProducto('');
    setSelectedSucursal('');
    setReporteData([]);
    setError(null);
  };

  return (
    <Container fluid className="historial-container">
      <Row className="mb-4">
        <Col>
          <h1 className="historial-title">Historial de Stock</h1>
          <p className="historial-subtitle">Consulta los movimientos de inventario</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={5} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Label className="filter-label">Producto</Form.Label>
            <Form.Control
              as="select"
              value={selectedProducto}
              onChange={(e) => setSelectedProducto(e.target.value)}
              disabled={loadigProducts}
              className="filter-select"
            >
              <option value="">Seleccionar producto</option>
              {productos.map((producto) => (
                <option key={producto.idProducto} value={producto.idProducto}>
                  {producto.nombreProducto}
                </option>
              ))}
            </Form.Control>
            {loadigProducts && <small className="text-muted">Cargando productos...</small>}
          </Form.Group>
        </Col>

        <Col md={5} className="mb-3 mb-md-0">
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

        <Col md={2} className="d-flex align-items-end">
          <div className="d-flex w-100">
            <Button
              variant="outline-secondary"
              onClick={handleReset}
              className="me-2 flex-grow-1"
            >
              <FiRefreshCw />
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerarReporte}
              disabled={!selectedProducto || !selectedSucursal || loadingReporte}
              className="flex-grow-1"
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

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {showErrorProductos && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger">
              Error al cargar los productos: {showErrorProductos}
            </Alert>
          </Col>
        </Row>
      )}

      {showErrorSucursales && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger">
              Error al cargar las sucursales: {showErrorSucursales}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <div className="reporte-table-container">
            {reporteData.length > 0 ? (
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
                  {reporteData.map((item) => (
                    <tr key={item.idHistorial}>
                      <td>{new Date(item.fechaMovimiento).toLocaleString()}</td>
                      <td>
                        <span className={`badge movimiento-${item.tipoMovimiento.toLowerCase()}`}>
                          {item.tipoMovimiento}
                        </span>
                      </td>
                      <td>{item.cantidad}</td>
                      <td>
                        <div className="stock-change">
                          <span className="stock-before">{item.stockAnterior}</span>
                          <span className="stock-arrow">→</span>
                          <span className="stock-after">{item.stockNuevo}</span>
                        </div>
                      </td>
                      <td>{item.nombreUsuario}</td>
                      <td className="observaciones">{item.observaciones}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="empty-state">
                {loadingReporte ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Generando reporte...</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FiFilter size={48} className="text-muted mb-3" />
                    <h5>No hay datos para mostrar</h5>
                    <p className="text-muted">
                      Selecciona un producto y una sucursal para generar el reporte
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>

      {reporteData.length > 0 && (
        <Row className="mt-3">
          <Col className="text-end">
            <Button variant="outline-primary" size="sm">
              <FiDownload className="me-1" /> Exportar
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default HistorialStock;