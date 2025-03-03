// SeccionProductos.js
import React from "react";
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
                    value={trayQuantities[producto.idProducto]?.cantidad || ""}
                    onChange={(e) =>
                      setTrayQuantities({
                        ...trayQuantities,
                        [producto.idProducto]: {
                          cantidad: parseInt(e.target.value) || 0,
                          precioPorUnidad: producto.precioPorUnidad, // Incluye la categoría
                        },
                      })
                    }
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