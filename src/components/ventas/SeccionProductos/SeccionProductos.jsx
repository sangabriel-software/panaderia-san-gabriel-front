// SeccionProductos.js
import React, { useState, useEffect } from "react";
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

  // Inicializar trayQuantities con 0 solo para productos de Panaderia
  useEffect(() => {
    const productosPanaderia = ordenYProductos.filter(
      (producto) => producto.nombreCategoria === "Panaderia"
    );

    const initialQuantities = {};
    productosPanaderia.forEach((producto) => {
      if (trayQuantities[producto.idProducto] === undefined) {
        initialQuantities[producto.idProducto] = {
          cantidad: 0, // Valor predeterminado para Panaderia
          precioPorUnidad: producto.precioPorUnidad,
        };
      }
    });

    // Solo actualizar si hay productos de Panaderia para inicializar
    if (Object.keys(initialQuantities).length > 0) {
      setTrayQuantities((prev) => ({ ...prev, ...initialQuantities }));
    }
  }, [ordenYProductos]); // Dependencia: ordenYProductos

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
          cantidad: 0, // Restablecer a 0 si el input está vacío
          precioPorUnidad: productsToShow.find((p) => p.idProducto === idProducto).precioPorUnidad,
        },
      });
    }
    setFocusedInput(null);
  };

  // Función para obtener el valor del input
  const getInputValue = (producto) => {
    const cantidad = trayQuantities[producto.idProducto]?.cantidad ?? 0;

    if (producto.nombreCategoria === "Panaderia") {
      if (focusedInput === producto.idProducto) {
        // Si el input está enfocado, mostrar el valor sin el 0
        return cantidad === 0 ? "" : cantidad.toString();
      } else {
        // Si no está enfocado, mostrar el valor (incluyendo 0)
        return cantidad.toString();
      }
    } else {
      // Para otras categorías, mostrar el valor vacío si no se ha ingresado nada
      return cantidad === 0 ? "" : cantidad.toString();
    }
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
                  {producto.nombreCategoria === "Panaderia"
                    ? "Unidades no vendidas"
                    : "Unidades"}
                </p>
                <InputGroup className="product-input-group">
                  <Form.Control
                    type="number"
                    min="0"
                    value={getInputValue(producto)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const cantidadNoVendida = Math.max(0, parseInt(value, 10) || 0);

                      setTrayQuantities({
                        ...trayQuantities,
                        [producto.idProducto]: {
                          cantidad: cantidadNoVendida, // Almacenar la cantidad no vendida
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