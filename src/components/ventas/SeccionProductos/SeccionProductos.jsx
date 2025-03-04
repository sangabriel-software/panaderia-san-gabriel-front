// SeccionProductos.js
import React, { useState } from "react";
import { Form, Row, Col, Card, InputGroup, Button } from "react-bootstrap";
import { filterProductsByName, getInitials, getUniqueColor } from "../../../pages/VentasPage/IngresarVenta/IngresarVenta.Utils";

const SeccionProductos = ({
  searchTerm,
  setSearchTerm,
  categorias,
  activeCategory,
  setActiveCategory,
  ordenYProductos,
  productsToShow,
  trayQuantities,
  setTrayQuantities,
}) => {
  // Estado para manejar el foco de los inputs
  const [focusedInput, setFocusedInput] = useState(null);

  // Función para manejar el foco
  const handleFocus = (idProducto) => {
    setFocusedInput(idProducto);
  };

  // Función para manejar la pérdida de foco
  const handleBlur = (idProducto, value) => {
    if (value === "" || isNaN(value)) {
      setTrayQuantities({
        ...trayQuantities,
        [idProducto]: {
          cantidad: 0,
          precioPorUnidad: productsToShow.find((p) => p.idProducto === idProducto).precioPorUnidad,
        },
      });
    }
    setFocusedInput(null);
  };

  return (
    <div className="products-section mt-4">
      {/* Barra de búsqueda */}
      <div className="mb-4">
        <Form.Control
          type="text"
          placeholder="Buscar producto por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-data search-bar"
        />
      </div>

      {/* Selector de categoría */}
      <div className="category-selector mb-4">
        {categorias.map((categoria) => (
          <Button
            key={categoria}
            variant={activeCategory === categoria ? "primary" : "outline-primary"}
            onClick={() => setActiveCategory(categoria)}
            className="category-btn"
          >
            {categoria} (
            {
              filterProductsByName(ordenYProductos, searchTerm).filter(
                (p) => p.nombreCategoria === categoria
              ).length
            }
            )
          </Button>
        ))}
      </div>

      {/* Lista de productos filtrados */}
      <Row className="g-4 product-grid">
        {productsToShow.map((producto) => (
          <Col key={producto.idProducto} xs={12} md={6} lg={4} xl={3}>
            <Card className="product-card">
              <Card.Body className="product-card-body">
                <div
                  className="product-badge"
                  style={{
                    backgroundColor: getUniqueColor(producto.nombreProducto),
                  }}
                >
                  {getInitials(producto.nombreProducto)}
                </div>
                <h3 className="product-title">{producto.nombreProducto}</h3>
                <p className="product-category">
                  {producto.nombreCategoria === "Panadería"
                    ? "Unidades no vendidas"
                    : "Unidades"}
                </p>
                <InputGroup className="product-input-group">
                  <Form.Control
                    type="number"
                    min="0"
                    value={
                      producto.nombreCategoria === "Panadería" && focusedInput !== producto.idProducto
                        ? trayQuantities[producto.idProducto]?.cantidad ?? 0
                        : trayQuantities[producto.idProducto]?.cantidad ?? ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      const cantidad = Math.max(0, parseInt(value, 10) || 0);
                      setTrayQuantities({
                        ...trayQuantities,
                        [producto.idProducto]: {
                          cantidad: cantidad,
                          precioPorUnidad: producto.precioPorUnidad,
                        },
                      });
                    }}
                    onFocus={() => handleFocus(producto.idProducto)}
                    onBlur={(e) => handleBlur(producto.idProducto, e.target.value)}
                    className="product-input"
                  />
                </InputGroup>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SeccionProductos;