// src/components/Orders/OrderCardSkeleton.jsx
import React from "react";
import { Card } from "react-bootstrap";
import "./OrderCardSkeleton.css"; // Estilos para el Skeleton

const OrderCardSkeleton = () => {
  return (
    <Card className="order-card-skeleton mb-3">
      <Card.Body>
        {/* Encabezado del Skeleton */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="skeleton-title"></div>
          <div className="skeleton-badge"></div>
        </div>

        {/* Detalles del Skeleton */}
        <div className="skeleton-detail"></div>
        <div className="skeleton-detail"></div>
        <div className="skeleton-detail"></div>

        {/* Botones del Skeleton */}
        <div className="d-flex justify-content-between">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default OrderCardSkeleton;