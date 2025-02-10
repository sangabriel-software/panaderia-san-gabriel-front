import React, { useState, useRef, useEffect } from "react";
import { Table, Button, Badge, Container } from "react-bootstrap";
import { formatDateToDisplay } from "../../utils/dateUtils";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "./OrderTable.css";
import PaginationComponent from "../PaginationComponent/PaginationComponent";

const ITEMS_PER_PAGE = 5;

const getColorByName = (name) => {
  const COLORS = ["succes", "primary", "info",];
  if (!name) return "#FFC107";
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % COLORS.length;
  return COLORS[index];
};

const OrderTable = ({ orders, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Manejador para redireccionar al hacer doble clic en una fila
  const handleRowClick = (idOrdenProduccion) => {
    navigate(`/pedidos-produccion/detalles/${idOrdenProduccion}`);
  };

  // Cada vez que cambie la página, se realiza el scroll al final del contenedor
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [currentPage]);

  return (
    <Container className="p-3" ref={containerRef}>
      <Table striped hover responsive bordered className="modern-table shadow">
        <thead className="custom-thead">
          <tr>
            <th className="text-center p-3">#</th>
            <th className="text-center p-3">Número de Orden</th>
            <th className="text-center p-3">Sucursal</th>
            <th className="text-center p-3">Panadero Encargado</th>
            <th className="text-center p-3">Fecha a Producir</th>
            <th className="text-center p-3">Total Productos</th>
            <th className="text-center p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order, index) => (
            <tr
              key={order.idOrdenProduccion}
              className="align-middle"
              onDoubleClick={() => handleRowClick(order.idOrdenProduccion)}
              style={{ cursor: "pointer" }}
            >
              <td className="text-center p-3" title="Doble click para ver detalles">
                {startIndex + index + 1}
              </td>
              <td className="text-center p-3" title="Doble click para ver detalles">
                {`ORD-${order.idOrdenProduccion}`}
              </td>
              <td className="text-center p-3" title="Doble click para ver detalles">
                <Badge bg={getColorByName(order.nombreSucursal)} className="px-1 py-1">
                  {order.nombreSucursal}
                </Badge>
              </td>
              <td className="text-center p-3" title="Doble click para ver detalles">
                {order.nombrePanadero}
              </td>
              <td className="text-center p-3" title="Doble click para ver detalles">
                {formatDateToDisplay(order.fechaAProducir)}
              </td>
              <td className="text-center p-3" title="Doble click para ver detalles">
                {order.cantidadProductos}
              </td>
              <td className="text-center p-3" onDoubleClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(order.idOrdenProduccion);
                  }}
                >
                  <FaTrashAlt /> Eliminar
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
