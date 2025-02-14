import React from 'react';
import { Badge, Card } from 'react-bootstrap';
import DownloadDropdown from '../DownloadDropdown/DownloadDropdown';
import { formatDateToDisplay } from '../../utils/dateUtils';

const MobileMateriaPrimaDetails = ({ order, onDownloadXLS, onDownloadPDF }) => {
  const encabezado = order?.encabezadoOrden;
  const detalles = order?.detalleMateriaPrima;

  return (
    <Card className="p-3 shadow-lg border-0 rounded-4" style={{ backgroundColor: '#f8f9fa' }}>
      <Card.Body className="px-2">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <Card.Title className="h4 mb-1 text-primary">
              Orden #{encabezado?.idOrdenProduccion}
            </Card.Title>
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
            <span className="text-muted">Producción para Fecha:</span>
            <span className="fw-medium">{formatDateToDisplay(encabezado?.fechaAProducir)}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span className="text-muted">Sucursal:</span>
            <span className="fw-medium text-end" style={{ maxWidth: '60%' }}>
              {encabezado?.nombreSucursal}
            </span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span className="text-muted">Solicitado por:</span>
            <span className="fw-medium">{encabezado?.nombreUsuario}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2">
            <span className="text-muted">Panadero:</span>
            <span className="fw-medium">{encabezado?.nombrePanadero}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2">
            <span className="text-muted">Turno:</span>
            <span className="fw-medium">{encabezado?.ordenTurno}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2">
            <span className="text-muted">Estado orden:</span>
            <Badge bg={encabezado?.estadoOrden === "P" ? "danger" : "success"} className="px-1 py-1">
              {encabezado?.estadoOrden === "P" ? "Venta Pendiente" : "Venta Cerrada"}
            </Badge>
          </div>
        </div>

        <h6 className="mb-3 text-uppercase text-muted">Materia Prima Utilizada</h6>

        {detalles?.map((mat, index) => (
          <MateriaPrimaCardMobile key={index} materia={mat} index={index} />
        ))}
      </Card.Body>
    </Card>
  );
};

const MateriaPrimaCardMobile = ({ materia, index }) => {
  return (
    <Card className="mb-3 border-0 rounded-3 shadow-sm" style={{ backgroundColor: 'rgba(0,123,255,0.05)' }}>
      <Card.Body className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-primary rounded-pill"># {index + 1}</span>
          <span className="h6 mb-0 text-primary">{materia.nombreProducto}</span>
        </div>

        <div className="d-flex justify-content-between small">
          <div className="text-center">
            <div className="text-muted">Materia Prima</div>
            <div className="fw-bold">{materia.nombreMateriaPrima}</div>
          </div>
          <div className="text-center">
            <div className="text-muted">Cantidad Usada</div>
            <div className="fw-bold">{materia.cantidadUsada}</div>
          </div>
          <div className="text-center">
            <div className="text-muted">Unidad</div>
            <div className="fw-bold">{materia.unidad}</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MobileMateriaPrimaDetails;
