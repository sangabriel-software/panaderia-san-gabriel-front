import React from 'react';
import { Card } from 'react-bootstrap';
import DownloadDropdown from '../../DownloadDropdown/DownloadDropdown';

const MobileOrderDetails = ({ order, onDownloadXLS, onDownloadPDF }) => {
  return (
    <Card className="p-3 shadow-lg border-0 rounded-4" style={{ backgroundColor: '#f8f9fa' }}>
      <Card.Body className="px-2">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <Card.Title className="h4 mb-1 text-primary">Orden #{order.id}</Card.Title>
            <small className="text-muted">Detalles de producción</small>
          </div>
          <DownloadDropdown
            onDownloadXLS={onDownloadXLS}
            onDownloadPDF={onDownloadPDF}
            variant="outline-primary"
          />
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span className="text-muted">Fecha:</span>
            <span className="fw-medium">{order.fecha}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span className="text-muted">Sucursal:</span>
            <span className="fw-medium text-end" style={{ maxWidth: '60%' }}>{order.sucursal}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span className="text-muted">Realizada por:</span>
            <span className="fw-medium">{order.realizadaPor}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2">
            <span className="text-muted">Encargado:</span>
            <span className="fw-medium">{order.encargado}</span>
          </div>
        </div>

        <h6 className="mb-3 text-uppercase text-muted">Productos</h6>
        
        {order.productos.map((prod) => (
          <ProductCardMobile key={prod.item} product={prod} />
        ))}
      </Card.Body>
    </Card>
  );
};

const ProductCardMobile = ({ product }) => (
  <Card className="mb-3 border-0 rounded-3 shadow-sm" style={{ backgroundColor: 'rgba(0,123,255,0.05)' }}>
    <Card.Body className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="badge bg-primary rounded-pill"># {product.item}</span>
        <span className="h6 mb-0 text-primary">{product.producto}</span>
      </div>
      
      <div className="d-flex justify-content-between small">
        <div className="text-center">
          <div className="text-muted">Bandejas</div>
          <div className="fw-bold">{product.bandejas}</div>
        </div>
        <div className="text-center">
          <div className="text-muted">Unidades</div>
          <div className="fw-bold">{product.unidades.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-muted">Venta</div>
          <div className="fw-bold text-success">
            ${product.ventaEstimada.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </Card.Body>
  </Card>
);

export default MobileOrderDetails;