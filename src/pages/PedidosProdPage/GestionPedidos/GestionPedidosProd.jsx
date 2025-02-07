import React from "react";
import Title from "../../../components/Title/Title";
import { Container, Row, Col, Form, Button, Card, Table } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";

// Simulación de datos de pedidos
const orders = [
  { id: 1, date: "2023-02-01", orderNumber: "ORD001", totalItems: 5, status: "Pendiente" },
  { id: 2, date: "2023-02-02", orderNumber: "ORD002", totalItems: 3, status: "En producción" },
  { id: 3, date: "2023-02-03", orderNumber: "ORD003", totalItems: 8, status: "Completado" },
  // ...otros pedidos
];

// Componente de la barra de filtros
const FilterBar = () => {
  return (
    <Form className="mb-4">
      <Row className="g-2">
        {/* Campo de búsqueda */}
        <Col xs={12} md={4}>
          <Form.Control type="text" placeholder="Buscar orden..." />
        </Col>
        {/* Filtro por fecha */}
        <Col xs={12} md={4}>
          <Form.Control type="date" placeholder="Fecha" />
        </Col>
        {/* Filtro por estado */}
        <Col xs={12} md={4}>
          <Form.Select>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="produccion">En producción</option>
            <option value="completado">Completado</option>
          </Form.Select>
        </Col>
      </Row>
    </Form>
  );
};

const GestionPedidosProd = () => {
  // Determina si es vista móvil (pantallas menores a 768px)
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <Container>
      {/* Título del módulo */}
      <Title
        title="Órdenes de Producción"
        description="Gestiona los pedidos de la producción a realizar"
      />

      {/* Barra de filtros */}
      <FilterBar />

      {/* Vista para móviles: tarjetas (cards) */}
      {isMobile ? (
        <div>
          {orders.map((order) => (
            <Card key={order.id} className="mb-3">
              <Card.Body>
                <Card.Title>{order.orderNumber}</Card.Title>
                <Card.Text>
                  <strong>Fecha:</strong> {order.date} <br />
                  <strong>Items:</strong> {order.totalItems} <br />
                  <strong>Estado:</strong> {order.status}
                </Card.Text>
                <Button variant="primary" size="sm">
                  Ver Detalles
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        // Vista para PC: tabla de pedidos
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
                  <Button variant="primary" size="sm">
                    Ver Detalles
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default GestionPedidosProd;
