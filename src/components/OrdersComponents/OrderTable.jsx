import React, { useState, useRef, useEffect } from "react";
import { Table, Button, Badge, Container, Spinner } from "react-bootstrap";
import { formatDateToDisplay } from "../../utils/dateUtils";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../PaginationComponent/PaginationComponent";
import { handleViewDetalle } from "../../pages/PedidosProdPage/DetallesOrdenesProd/DetallesOrdenesProdUtils";
import "./OrderTable.css";
import { BsFileEarmarkPdf } from "react-icons/bs";
import dayjs from "dayjs";

const ITEMS_PER_PAGE = 10;

const getColorByName = (name) => {
  const COLORS = ["success", "primary", "info"];
  if (!name) return "warning";
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
};

const OrderTable = ({ orders, onDelete, onViewPdf, loadingViewPdf }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleRowClick = (idOrdenProduccion) => {
    handleViewDetalle(idOrdenProduccion, navigate);
  };

// Función que verifica si la fecha es hoy o ya pasó usando Day.js
const isToday = (dateString) => {
  if (!dateString) return false;
  return dayjs(dateString).isSame(dayjs(), 'day');
};

const isTodayOrPast = (dateString) => {
  if (!dateString) return false;
  const date = dayjs(dateString);
  const today = dayjs().startOf('day');
  return date.isSame(today, 'day') || date.isBefore(today, 'day');
};


  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [currentPage]);

  return (
    <Container className="p-4 table-container" ref={containerRef}>
      <Table hover responsive className="modern-table">
        <thead className="table-header">
          <tr>
            <th className="text-center">#</th>
            <th className="text-center">No. de Orden</th>
            <th className="text-center">Sucursal</th>
            <th className="text-center">Turno</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Fecha Producción</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order, index) => {
            const isCurrentDay = isTodayOrPast(order.fechaAProducir);
            const isTodayd = isToday(order.fechaAProducir);
            
            return (
              <tr
                key={order.idOrdenProduccion}
                className="table-row"
                onDoubleClick={() => handleRowClick(order.idOrdenProduccion)}
                style={{ cursor: "pointer" }}
              >
                <td className="text-center serial-number" title="Doble clic para ver detalles">
                  #{startIndex + index + 1}
                </td>
                <td className="text-center order-number" title="Doble clic para ver detalles">
                  ORD-{order.idOrdenProduccion}
                </td>
                <td className="text-center" title="Doble clic para ver detalles">
                  <Badge 
                    pill 
                    className="branch-badge text-light" 
                    bg={getColorByName(order.nombreSucursal)}
                  >
                    {order.nombreSucursal}
                  </Badge>
                </td>
                <td className="text-center shift-cell" title="Doble clic para ver detalles">
                  {order.ordenTurno}
                </td>
                <td className="text-center" title="Doble clic para ver detalles">
                  <Badge className={`status-badge ${order.estadoOrden === "P" ? "status-pending" : "status-completed"}`}>
                    {order.estadoOrden === "P" ? "Pendiente" : "Completado"}
                  </Badge>
                </td>
                <td className="text-center production-date" title="Doble clic para ver detalles">
                  {formatDateToDisplay(order.fechaAProducir)}
                  {isTodayd && (
                    <Badge bg="warning" text="dark" className="ms-2">
                      Hoy
                    </Badge>
                  )}
                </td>
                <td className="text-center actions-cell" onDoubleClick={(e) => e.stopPropagation()}>
                  <div className="d-flex justify-content-center gap-2">
                    <Button
                      variant="link"
                      className="action-btn pdf-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewPdf(order.idOrdenProduccion);
                      }}
                      disabled={loadingViewPdf === order.idOrdenProduccion}
                    >
                      {loadingViewPdf === order.idOrdenProduccion ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        <BsFileEarmarkPdf className="action-icon text-primary" />
                      )}
                    </Button>
                    <Button
                      variant="link"
                      className="action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(order.idOrdenProduccion);
                      }}
                      disabled={isCurrentDay}
                      title={isCurrentDay ? "No se pueden eliminar órdenes del día actual" : "Eliminar orden"}
                    >
                      <FaTrashAlt className={`action-icon ${isCurrentDay ? "text-muted" : "text-danger"}`} />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <PaginationComponent
        totalItems={orders.length}
        itemsPerPage={ITEMS_PER_PAGE}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </Container>
  );
};

export default OrderTable;