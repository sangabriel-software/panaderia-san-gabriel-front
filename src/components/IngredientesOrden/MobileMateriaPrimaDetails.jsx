import React from 'react';
import { Badge, Card } from 'react-bootstrap';
import DownloadDropdown from '../DownloadDropdown/DownloadDropdown';
import { formatDateToDisplay } from '../../utils/dateUtils';

const MobileMateriaPrimaDetails = ({ order, detalleConsumo, onDownloadXLS, onDownloadPDF }) => {
  const encabezado = order?.encabezadoOrden;

  // Agrupar los detalles de consumo por producto
  const groupedConsumo = detalleConsumo?.reduce((acc, item) => {
    if (!acc[item.Producto]) {
      acc[item.Producto] = [];
    }
    acc[item.Producto].push(item);
    return acc;
  }, {});

  // Calcular el total de la cantidad usada por ingrediente
  const totalPorIngrediente = detalleConsumo?.reduce((acc, item) => {
    if (!acc[item.Ingrediente]) {
      acc[item.Ingrediente] = { cantidad: 0, unidad: item.UnidadMedida };
    }
    acc[item.Ingrediente].cantidad += item.CantidadUsada;
    return acc;
  }, {});

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

        {Object.entries(groupedConsumo || {}).map(([producto, detalles], index) => (
          <React.Fragment key={producto}>
            <div className="mb-3">
              <span className="fw-bold">{producto}</span>
            </div>
            {detalles.map((detalle, subIndex) => (
              <MateriaPrimaCardMobile key={`${producto}-${subIndex}`} detalle={detalle} index={subIndex} />
            ))}
          </React.Fragment>
        ))}

        {/* Sección de resumen de ingredientes */}
        <div className="mt-4">
          <h6 className="mb-3 text-uppercase text-muted">Resumen de Ingredientes Usados</h6>
          {Object.entries(totalPorIngrediente || {}).map(([ingrediente, { cantidad, unidad }]) => (
            <div key={ingrediente} className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-medium">{ingrediente}</span>
              <span className="fw-bold">
                {cantidad.toFixed(2)} {unidad}
              </span>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

const MateriaPrimaCardMobile = ({ detalle, index }) => {
  return (
    <Card className="mb-3 border-0 rounded-3 shadow-sm" style={{ backgroundColor: 'rgba(0,123,255,0.05)' }}>
      <Card.Body className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-primary rounded-pill"># {index + 1}</span>
          <span className="h6 mb-0 text-primary">{detalle.Ingrediente}</span>
        </div>

        <div className="d-flex justify-content-between small">
          <div className="text-center">
            <div className="text-muted">Cantidad Usada</div>
            <div className="fw-bold">{detalle.CantidadUsada}</div>
          </div>
          <div className="text-center">
            <div className="text-muted">Unidad</div>
            <div className="fw-bold">{detalle.UnidadMedida}</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MobileMateriaPrimaDetails;