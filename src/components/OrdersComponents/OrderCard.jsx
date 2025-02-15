import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { formatDateToDisplay } from "../../utils/dateUtils";
import { 
  FaCalendarAlt, 
  FaBreadSlice, 
  FaUser, 
  FaInfoCircle,
  FaTrash
} from "react-icons/fa";
import "./OrderCard.css";

const OrderCard = ({ order, onViewDetails, onDeleteOrder }) => {
  return (
    <Card className="order-card">
      <Card.Body>
        {/* Encabezado */}
        <div className="card-header">
          <div className="card-title-container">
            <Badge className="order-badge">{order.nombreSucursal}</Badge>
            <h3 className="order-number">ORD-{order.idOrdenProduccion}</h3>
          </div>
          
          <div className="status-indicator">
            <div className={`status-dot ${order.estadoOrden === 'P' ? 'pending' : 'completed'}`} />
            <span>{order.estadoOrden === 'P' ? 'Pendiente' : 'Completado'}</span>
          </div>
        </div>

        {/* Detalles */}
        <div className="card-details">
          <div className="detail-item">
            <FaCalendarAlt className="detail-icon" />
            <span>{formatDateToDisplay(order.fechaAProducir)}</span>
          </div>
          
          <div className="detail-item">
            <FaBreadSlice className="detail-icon" />
            <span>{order.cantidadProductos} Productos</span>
          </div>
          
          <div className="detail-item">
            <FaUser className="detail-icon" />
            <span>{order.nombrePanadero || 'Sin asignar'}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="card-actions">
          <Button 
            variant="primary" 
            className="action-btn detail-btn"
            onClick={() => onViewDetails(order)}
          >
            <FaInfoCircle className="btn-icon" />
            Detalles
          </Button>
          
          <Button 
            variant="danger" 
            className="action-btn"
            onClick={() => onDeleteOrder(order.idOrdenProduccion)}
          >
            <FaTrash className="btn-icon" />
            Eliminar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default OrderCard;