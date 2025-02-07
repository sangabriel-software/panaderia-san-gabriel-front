// src/components/Orders/OrderTable.jsx
import React from "react";
import { Table, Button } from "react-bootstrap";

const OrderTable = ({ orders, onViewDetails }) => {
  return (
    <Table striped hover responsive>
      <thead>
        <tr>
          <th>#</th>
          <th>Fecha</th>
          <th>Número de Orden</th>
          <th>Total Items</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{order.id}</td>
            <td>{order.date}</td>
            <td>{order.orderNumber}</td>
            <td>{order.totalItems}</td>
            <td>{order.status}</td>
            <td>
              <Button variant="primary" size="sm" onClick={() => onViewDetails(order)}>
                Ver Detalles
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default OrderTable;
