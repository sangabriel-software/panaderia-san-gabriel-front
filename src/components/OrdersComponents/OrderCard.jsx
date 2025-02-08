// src/components/Orders/OrderCard.jsx
import React from "react";
import { Card, Button } from "react-bootstrap";

const OrderCard = ({ order, onViewDetails }) => {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{order.orderNumber}</Card.Title>
        <Card.Text>
          <strong>Fecha:</strong> {order.date} <br />
          <strong>Items:</strong> {order.totalItems} <br />
          <strong>Estado:</strong> {order.status}
        </Card.Text>
        <Button variant="primary" size="sm" onClick={() => onViewDetails(order)}>
          Ver Detalles
        </Button>
      </Card.Body>
    </Card>
  );
};

export default OrderCard;
