// src/components/Orders/FilterBar.jsx
import React from "react";
import { Form, Row, Col } from "react-bootstrap";

const FilterBar = ({ filters, onFilterChange }) => {
  return (
    <Form className="mb-4">
      <Row className="g-2">
        {/* Campo de búsqueda */}
        <Col xs={12} md={4}>
          <Form.Control
            type="text"
            placeholder="Buscar orden..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
          />
        </Col>
        {/* Filtro por fecha */}
        <Col xs={12} md={4}>
          <Form.Control
            type="date"
            value={filters.date}
            onChange={(e) =>
              onFilterChange({ ...filters, date: e.target.value })
            }
          />
        </Col>
        {/* Filtro por estado */}
        <Col xs={12} md={4}>
          <Form.Select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({ ...filters, status: e.target.value })
            }
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En producción">En producción</option>
            <option value="Completado">Completado</option>
          </Form.Select>
        </Col>
      </Row>
    </Form>
  );
};

export default FilterBar;
