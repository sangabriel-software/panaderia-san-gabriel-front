import React from "react";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import { FaTimes, FaSearch, FaCalendarAlt, FaFilter } from "react-icons/fa";
import "./FilterBarVentas.css";

const FilterBarVentas = ({ filters, onFilterChange, ventas }) => {

  const handleSearchChange = (e) => {
    let inputValue = e.target.value.replace(/^VENTA-/, ""); // Cambio de "ORD-" a "VENTA-"
    if (inputValue.trim() === "") inputValue = "";
    onFilterChange({ ...filters, search: inputValue });
  };

  const handleClearSearch = () => {
    onFilterChange({ ...filters, search: "" });
  };

  const handleClearDate = () => {
    onFilterChange({ ...filters, date: "" });
  };

  // Obtener sucursales únicas de las ventas
  const uniqueSucursales = Array.from(
    new Set(ventas?.map((venta) => venta.nombreSucursal))
  );


  return (
    <Form className="modern-filter" onSubmit={(e) => e.preventDefault()}>
      <Row className="g-3">
        {/* Campo de búsqueda */}
        <Col xs={12} md={4} lg={4}>
          <InputGroup className="filter-input-group">
            <InputGroup.Text className="filter-prefix">
              <FaSearch className="me-2" />
              <span>VENTA-</span> {/* Cambio de "ORD-" a "VENTA-" */}
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Venta..."
              value={filters.search}
              onChange={handleSearchChange}
              className="filter-input"
            />
            {filters.search && (
              <Button
                variant="link"
                className="clear-btn"
                onClick={handleClearSearch}
              >
                <FaTimes />
              </Button>
            )}
          </InputGroup>
        </Col>

        {/* Filtro por fecha */}
        <Col xs={12} md={4} lg={4}>
          <InputGroup className="filter-input-group">
            <InputGroup.Text className="filter-prefix">
              <FaCalendarAlt />
            </InputGroup.Text>
            <Form.Control
              type="date"
              value={filters.date}
              onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
              className="filter-input"
            />
            {filters.date && (
              <Button
                variant="link"
                className="clear-btn"
                onClick={handleClearDate}
              >
                <FaTimes />
              </Button>
            )}
          </InputGroup>
        </Col>

        {/* Filtro por sucursal */}
        <Col xs={12} md={4} lg={4}>
          <InputGroup className="filter-input-group">
            <InputGroup.Text className="filter-prefix">
              <FaFilter />
            </InputGroup.Text>
            <Form.Select
              value={filters.sucursal}
              onChange={(e) => onFilterChange({ ...filters, sucursal: e.target.value })}
              className="filter-input"
            >
              <option value="">Todas las sucursales</option>
              {uniqueSucursales.map((sucursal, index) => (
                <option key={index} value={sucursal}>
                  {sucursal}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>
    </Form>
  );
};

export default FilterBarVentas;