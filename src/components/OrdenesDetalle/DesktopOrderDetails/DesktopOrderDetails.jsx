import React from 'react';
import { Card, Col, Container, Row, Table } from 'react-bootstrap';
import { BsArrowRightCircle } from 'react-icons/bs';
import DownloadDropdown from '../../../components/DownloadDropdown/DownloadDropdown';

const DesktopOrderDetails = ({ order, onDownloadXLS, onDownloadPDF }) => {
  return (
    <Container fluid>
      <DesktopHeader order={order} onDownloadXLS={onDownloadXLS} onDownloadPDF={onDownloadPDF} />
      <OrderTable products={order.productos} />
    </Container>
  );
};

const DesktopHeader = ({ order, onDownloadXLS, onDownloadPDF }) => (
  <Card className="shadow-lg border-0 mb-4 bg-gradient-primary" style={{ borderRadius: '15px' }}>
    <Card.Body className="p-4">
      <Row className="g-4">
        <Col md={6} className="border-end border-light">
          <div className="d-flex flex-column text-dark">
            <div className="mb-3">
              <span className="text-uppercase small opacity-75">Fecha de producción</span>
              <h3 className="mb-0 fw-bold">{order.fecha}</h3>
            </div>
            <div>
              <span className="text-uppercase small opacity-75">Sucursal</span>
              <h4 className="mb-0 fw-semibold">{order.sucursal}</h4>
            </div>
          </div>
        </Col>
        
        <Col md={6} className="ps-5">
          <div className="d-flex flex-column text-dark">
            <div className="mb-3">
              <span className="text-uppercase small opacity-75">Responsables</span>
              <div className="d-flex flex-column gap-2 mt-2">
                <div>
                  <span className="fw-medium">Realizada por: </span>
                  <span className="fw-bold">{order.realizadaPor}</span>
                </div>
                <div>
                  <span className="fw-medium">Encargado: </span>
                  <span className="fw-bold">{order.encargado}</span>
                </div>
              </div>
            </div>
            <div className="mt-auto">
              <DownloadDropdown
                onDownloadXLS={onDownloadXLS}
                onDownloadPDF={onDownloadPDF}
                variant="light"
              />
            </div>
          </div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

const OrderTable = ({ products }) => (
  <Card className="shadow-lg border-0 overflow-hidden" style={{ borderRadius: '15px' }}>
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead className="bg-dark text-white">
          <tr>
            <th className="ps-4 py-3 text-center fw-semibold" style={{ width: '10%' }}>#</th>
            <th className="py-3 fw-semibold" style={{ width: '30%' }}>Producto</th>
            <th className="py-3 text-center fw-semibold" style={{ width: '20%' }}>Bandejas</th>
            <th className="py-3 text-center fw-semibold" style={{ width: '20%' }}>Unidades</th>
            <th className="pe-4 py-3 text-end fw-semibold" style={{ width: '20%' }}>Venta Estimada</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <TableRow key={prod.item} product={prod} />
          ))}
        </tbody>
      </Table>
    </div>
  </Card>
);

const TableRow = ({ product }) => (
  <tr 
    className="align-middle"
    style={{ 
      backgroundColor: product.item % 2 === 0 ? '#f8f9fa' : 'white',
      borderBottom: '2px solid #f1f1f1'
    }}
  >
    <td className="ps-4 text-center">
      <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
        {product.item}
      </span>
    </td>
    <td>
      <div className="d-flex align-items-center gap-3">
        <div className="icon-wrapper bg-primary bg-opacity-10 rounded-circle p-2">
          <span className="text-primary fw-bold">{product.producto.charAt(0)}</span>
        </div>
        <span className="fw-medium">{product.producto}</span>
      </div>
    </td>
    <td className="text-center fw-bold text-info">{product.bandejas}</td>
    <td className="text-center">
      <span className="badge bg-secondary bg-opacity-10 text-dark rounded-pill px-3 py-2">
        {product.unidades.toLocaleString()}
      </span>
    </td>
    <td className="pe-4 text-end">
      <div className="d-flex align-items-center justify-content-end gap-2">
        <span className="text-success fw-bold h5 mb-0">
          ${product.ventaEstimada.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
        <div className="arrow-icon text-success">
          <BsArrowRightCircle size={20} />
        </div>
      </div>
    </td>
  </tr>
);

export default DesktopOrderDetails;