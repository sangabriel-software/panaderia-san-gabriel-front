import React, { useState, useRef, useEffect } from "react";
import { Table, Button, Badge, Container } from "react-bootstrap";
import { formatDateToDisplay } from "../../utils/dateUtils";
import { FaTrashAlt, FaRegEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../PaginationComponent/PaginationComponent";
import { handleViewDetalle } from "../../pages/PedidosProdPage/DetallesOrdenesProd/DetallesOrdenesProdUtils";
import "./OrderTable.css";

const ITEMS_PER_PAGE = 5;

const getColorByName = (name) => {
  const COLORS = ["success", "primary", "info"];
  if (!name) return "warning";
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
};

const OrderTable = ({ orders, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleRowClick = (idOrdenProduccion) => {
    handleViewDetalle(idOrdenProduccion, navigate);
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
          {paginatedOrders.map((order, index) => (
            <tr
              key={order.idOrdenProduccion}
              className="table-row"
              onDoubleClick={() => handleRowClick(order.idOrdenProduccion)}
            >
              <td className="text-center serial-number">#{startIndex + index + 1}</td>
              <td className="text-center order-number">ORD-{order.idOrdenProduccion}</td>
              <td className="text-center">
                <Badge pill className="branch-badge text-light" bg={getColorByName(order.nombreSucursal)}>
                  {order.nombreSucursal}
                </Badge>
              </td>
              <td className="text-center shift-cell">{order.ordenTurno}</td>
              <td className="text-center">
                <Badge pill className={`status-badge ${order.estadoOrden === "P" ? "status-pending" : "status-completed"}`}>
                  {order.estadoOrden === "P" ? "Pendiente" : "Completado"}
                </Badge>
              </td>
              <td className="text-center production-date">{formatDateToDisplay(order.fechaAProducir)}</td>
              <td className="text-center actions-cell">
                <Button
                  variant="link"
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(order.idOrdenProduccion);
                  }}
                >
                  <FaTrashAlt className="action-icon" />
                </Button>
              </td>
            </tr>
          ))}
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