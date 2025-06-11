import React from "react";
import { Card, Button, Badge, OverlayTrigger, Tooltip, Spinner } from "react-bootstrap";
import { FaCalendarAlt, FaUser, FaInfoCircle, FaTrash } from "react-icons/fa";
import "./VentasCard.css";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import dayjs from "dayjs";

const VentasCard = ({ sale, onViewDetails, onDeleteSale, eliminacionesTracking, loadingDelete }) => {
  // Función para verificar si una venta es de hoy
  const esVentaDeHoy = (fechaVenta) => {
    return dayjs(fechaVenta).isSame(dayjs(), 'day');
  };

  // Función para verificar si se puede eliminar la venta
  const puedeEliminarVenta = (sale, eliminacionesTracking) => {
    if (!esVentaDeHoy(sale.fechaVenta)) return false;

    if (!Array.isArray(eliminacionesTracking) || eliminacionesTracking.length === 0) {
      return true;
    }
    
    const eliminacionExistente = eliminacionesTracking?.find(eliminacion => 
      eliminacion.nombreSucursal === sale.nombreSucursal &&
      eliminacion.turno === sale.ventaTurno
    );

    if (eliminacionExistente && eliminacionExistente.cantidadEliminaciones >= 1) {
      return false;   
    }

    return true;
  };

  const puedeEliminar = puedeEliminarVenta(sale, eliminacionesTracking);
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
            <span>Total: Q.{Number(sale.totalVenta).toFixed(2)}</span>
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
          
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip>
                {puedeEliminar 
                  ? "Eliminar venta" 
                  : "Solo se permite una eliminación por turno por sucursal"}
              </Tooltip>
            }
          >
            <span>
              <Button 
                variant="danger" 
                className="ventas-action-btn"
                onClick={() => puedeEliminar && onDeleteSale(sale.idVenta)}
                disabled={!puedeEliminar || loadingDelete === sale.idVenta}
              >
                {loadingDelete === sale.idVenta ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <>
                    <FaTrash className="ventas-btn-icon" />
                    Eliminar
                  </>
                )}
              </Button>
            </span>
          </OverlayTrigger>
        </div>
      </Card.Body>
    </Card>
  );
};

export default VentasCard;