import React from "react";
import { Card, Button, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaCalendarAlt, FaUser, FaInfoCircle, FaTrash } from "react-icons/fa";
import "./VentasCard.css";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import dayjs from "dayjs";

const VentasCard = ({ sale, onViewDetails, onDeleteSale }) => {
  // Función para verificar si una venta es de hoy
  const esVentaDeHoy = (fechaVenta) => {
    return dayjs(fechaVenta).isSame(dayjs(), 'day');
  };

  const esHoy = esVentaDeHoy(sale.fechaVenta);

  return (
    <Card className="ventas-card">
      <Card.Body>
        {/* Encabezado */}
        <div className="ventas-card-header">
          <div className="ventas-card-title-container">
            <Badge className="ventas-sale-badge">{sale.nombreSucursal}</Badge>
            <h3 className="ventas-sale-number">VENTA-{sale.idVenta}</h3>
          </div>
          
          <div className="ventas-status-indicator">
            <div className={`ventas-status-dot ${sale.estadoVenta === 'C' ? 'ventas-completed' : 'ventas-pending'}`} />
            <span>{sale.estadoVenta === 'C' ? 'Completado' : 'Pendiente'}</span>
          </div>
        </div>

        {/* Detalles */}
        <div className="ventas-card-details">
          <div className="ventas-detail-item">
            <FaCalendarAlt className="ventas-detail-icon" />
            <span>{formatDateToDisplay(sale.fechaVenta)}</span>
          </div>
          
          <div className="ventas-detail-item">
            <FaUser className="ventas-detail-icon" />
            <span>{sale.nombreUsuario}</span>
          </div>
          
          <div className="ventas-detail-item">
            <span>Total: Q.{sale.totalVenta}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="ventas-card-actions">
          <Button 
            variant="primary" 
            className="ventas-action-btn ventas-detail-btn"
            onClick={() => onViewDetails(sale)}
          >
            <FaInfoCircle className="ventas-btn-icon" />
            Detalles
          </Button>
          
          <Button 
            variant="danger" 
            className="ventas-action-btn"
                onClick={() => esHoy && onDeleteSale(sale.idVenta)}
                disabled={!esHoy}
          >
            <FaTrash className="ventas-btn-icon" />
            Eliminar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default VentasCard;