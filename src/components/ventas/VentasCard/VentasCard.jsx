import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { 
  FaCalendarAlt, 
  FaUser, 
  FaInfoCircle,
  FaTrash
} from "react-icons/fa";
import "./VentasCard.css";
import { formatDateToDisplay } from "../../../utils/dateUtils";

const VentasCard = ({ sale, onViewDetails, onDeleteSale }) => {
  return (
    <Card className="sale-card">
      <Card.Body>
        {/* Encabezado */}
        <div className="card-header">
          <div className="card-title-container">
            <Badge className="sale-badge">{sale.nombreSucursal}</Badge>
            <h3 className="sale-number">VENTA-{sale.idVenta}</h3>
          </div>
          
          <div className="status-indicator">
            <div className={`status-dot ${sale.estadoVenta === 'C' ? 'completed' : 'pending'}`} />
            <span>{sale.estadoVenta === 'C' ? 'Completado' : 'Pendiente'}</span>
          </div>
        </div>

        {/* Detalles */}
        <div className="card-details">
          <div className="detail-item">
            <FaCalendarAlt className="detail-icon" />
            <span>{formatDateToDisplay(sale.fechaVenta)}</span>
          </div>
          
          <div className="detail-item">
            <FaUser className="detail-icon" />
            <span>{sale.nombreUsuario}</span>
          </div>
          
          <div className="detail-item">
            <span>Total: ${sale.totalVenta}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="card-actions">
          <Button 
            variant="primary" 
            className="action-btn detail-btn"
            onClick={() => onViewDetails(sale)}
          >
            <FaInfoCircle className="btn-icon" />
            Detalles
          </Button>
          
          <Button 
            variant="danger" 
            className="action-btn"
            onClick={() => onDeleteSale(sale.idVenta)}
          >
            <FaTrash className="btn-icon" />
            Eliminar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default VentasCard;