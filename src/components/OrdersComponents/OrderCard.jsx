// src/components/Orders/OrderCard.jsx
import React from "react";
import { Card, Button } from "react-bootstrap";
import { formatDateToDisplay } from "../../utils/dateUtils";

const OrderCard = ({ order, onViewDetails }) => {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{order.orderNumber}</Card.Title>
        <Card.Text>
          <strong>Fecha a producir:</strong> {formatDateToDisplay(order.fechaAProducir)} <br />
          <strong>Productos:</strong> {order.cantidadProductos} <br />
          <strong>Estado:</strong> {order.estadoOrden}
        </Card.Text>
        <Button variant="primary" size="sm" onClick={() => onViewDetails(order)}>
          Ver Detalles
        </Button>
      </Card.Body>
    </Card>
  );
};

export default OrderCard;
