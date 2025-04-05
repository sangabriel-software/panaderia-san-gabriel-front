import React, { useState, useEffect } from "react";
import { Form, Table, Button } from "react-bootstrap";
import { filterProductsByName, getInitials, getUniqueColor } from "../../../pages/VentasPage/IngresarVenta/IngresarVenta.Utils";
import "./SeccionProductos.styles.css";

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
          cantidad: 0,
          precioPorUnidad: producto.precioPorUnidad,
        };
      }
    });

    if (Object.keys(initialQuantities).length > 0) {
      setTrayQuantities((prev) => ({ ...prev, ...initialQuantities }));
    }
  }, [ordenYProductos]);

  const handleFocus = (idProducto) => {
    setFocusedInput(idProducto);
  };

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

  const getInputValue = (producto) => {
    const cantidad = trayQuantities[producto.idProducto]?.cantidad ?? 0;

    if (producto.nombreCategoria === "Panaderia") {
      if (focusedInput === producto.idProducto) {
        return cantidad === 0 ? "" : cantidad.toString();
      } else {
        return cantidad.toString();
      }
    } else {
      return cantidad === 0 ? "" : cantidad.toString();
    }
  };

  // Función para determinar el texto del header según la categoría activa
  const getHeaderText = () => {
    return activeCategory === "Panaderia" || 
           productsToShow.some(p => p.idCategoria === 1) 
      ? "Unidades no vendidas" 
      : "Unidades vendidas";
  };

  return (
    <div className="ventas-products-section mt-4">
      {/* Barra de búsqueda */}
      <div className="mb-4 ventas-search-container">
        <Form.Control
          type="text"
          placeholder="Buscar producto por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ventas-search-input"
        />
        <span className="ventas-search-icon">🔍</span>
      </div>

      {/* Selector de categoría */}
      <div className="mb-4 ventas-category-selector">
        {categorias.map((categoria) => (
          <Button
            key={categoria}
            variant={activeCategory === categoria ? "primary" : "outline-primary"}
            onClick={() => setActiveCategory(categoria)}
            className="ventas-category-btn"
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

      {/* Tabla de productos simplificada */}
      <div className="ventas-table-responsive">
        <Table bordered hover className="ventas-products-table">
          <thead>
            <tr>
              <th className="ventas-table-header-v text-center">Producto</th>
              <th className="ventas-table-header-v text-center">
                {getHeaderText()}
              </th>
            </tr>
          </thead>
          <tbody>
            {productsToShow.length > 0 ? (
              productsToShow.map((producto) => (
                <tr key={producto.idProducto}>
                  <td className="text-center align-middle">
                    <div className="ventas-product-info">
                      <div 
                        className="ventas-product-badge"
                        style={{ backgroundColor: getUniqueColor(producto.nombreProducto) }}
                      >
                        {getInitials(producto.nombreProducto)}
                      </div>
                      <span className="ventas-product-name">{producto.nombreProducto}</span>
                    </div>
                  </td>
                  <td className="text-center align-middle">
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
                            cantidad: cantidadNoVendida,
                            precioPorUnidad: producto.precioPorUnidad,
                          },
                        });
                      }}
                      onFocus={() => handleFocus(producto.idProducto)}
                      onBlur={(e) => handleBlur(producto.idProducto, e.target.value)}
                      className="ventas-quantity-input"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center py-4">
                  {ordenYProductos.length === 0 
                    ? "No hay productos disponibles." 
                    : "No se encontraron productos con ese nombre."}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default SeccionProductos;