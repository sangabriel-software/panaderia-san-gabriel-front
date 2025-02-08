import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { formatDateToDisplay } from "../../utils/dateUtils";
import "./OrderCard.css"; // Importa el archivo de estilos

const OrderCard = ({ order, onViewDetails, onDeleteOrder }) => {
  return (
    <Card className="order-card mb-3">
      <Card.Body>
        {/* Encabezado de la tarjeta */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title className="order-card-title">
            Orden #{order.idOrdenProduccion}
          </Card.Title>
          <Badge bg="secondary" className="order-card-badge">
            {order.nombreSucursal}
          </Badge>
        </div>

        {/* Detalles de la orden */}
        <div className="order-card-detail">
          <strong>Fecha a producir:</strong> {formatDateToDisplay(order.fechaAProducir)}
        </div>
        <div className="order-card-detail">
          <strong>Productos:</strong> {order.cantidadProductos}
        </div>

        {/* Botones de acción */}
        <div className="d-flex justify-content-between">
          <Button
            variant="primary"
            size="sm"
            className="order-card-button"
            onClick={() => onViewDetails(order)}
          >
            Ver Detalles
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="order-card-button"
            onClick={() => onDeleteOrder(order.idOrdenProduccion)}
          >
            Eliminar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default OrderCard;
