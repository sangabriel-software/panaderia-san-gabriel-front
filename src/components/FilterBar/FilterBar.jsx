import React from "react";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import "./FilterBar.css";

const FilterBar = ({ filters, onFilterChange, ordenesProduccion }) => {
  const handleSearchChange = (e) => {
    let inputValue = e.target.value.replace(/^ORD-/, ""); // Evita que se borre el prefijo
    if (inputValue.trim() === "") inputValue = ""; // Corrige el bug cuando se borra todo
    onFilterChange({ ...filters, search: inputValue });
  };

  const handleClearDate = () => {
    onFilterChange({ ...filters, date: "" }); // Limpia la fecha y restaura los datos
  };

  // Obtener lista única de sucursales
  const uniqueSucursales = Array.from(
    new Set(ordenesProduccion?.map((order) => order.nombreSucursal))
  );

  return (
    <Form className="mb-4" onSubmit={(e) => e.preventDefault()}> {/* Evita recarga al presionar Enter */}
      <Row className="g-2">
        {/* Campo de búsqueda */}
        <Col xs={12} md={4}>
          <InputGroup>
            <InputGroup.Text className="span-filter" style={{ fontWeight: "bold", color: "blue" }}>ORD-</InputGroup.Text>
            <Form.Control
              className="input-filter"
              type="text"
              placeholder="Ingrese número de orden..."
              value={filters.search}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </Col>

        {/* Filtro por fecha con botón de limpiar */}
        <Col xs={12} md={4}>
          <InputGroup>
            <Form.Control
              className="input-filter"
              type="date"
              value={filters.date}
              onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
            />
            {filters.date && ( // Solo mostrar botón si hay fecha seleccionada
              <Button variant="outline-danger" onClick={handleClearDate}>
                ❌
              </Button>
            )}
          </InputGroup>
        </Col>

        {/* Filtro por sucursal */}
        <Col xs={12} md={4}>
          <Form.Select
            className="input-filter"
            value={filters.sucursal}
            onChange={(e) => onFilterChange({ ...filters, sucursal: e.target.value })}
          >
            <option value="">Todas las sucursales</option>
            {uniqueSucursales.map((sucursal, index) => (
              <option key={index} value={sucursal}>{sucursal}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
    </Form>
  );
};

export default FilterBar;
