import React, { useState, useEffect } from "react";
import { Form, Table, Button } from "react-bootstrap";
import { filterProductsByName, getInitials, getUniqueColor } from "../../../pages/VentasPage/IngresarVenta/IngresarVenta.Utils";
import "./SeccionProductos.styles.css";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";

const SeccionProductos = ({ searchTerm, setSearchTerm, categorias, activeCategory, setActiveCategory, ordenYProductos, productsToShow, 
                            trayQuantities, setTrayQuantities, stockGeneral, stockDelDia }) => {
                              
  const [focusedInput, setFocusedInput] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);

  const stockGeneralArray = Array.isArray(stockGeneral) ? stockGeneral : [];
  const stockDelDiaArray = Array.isArray(stockDelDia) ? stockDelDia : [];

  const productosConStock = ordenYProductos.filter(producto => {
    const hasGeneralStock = stockGeneralArray.some(item => item.idProducto === producto.idProducto && item.cantidadExistente > 0);
    const hasDailyStock = stockDelDiaArray.some(item => item.idProducto === producto?.idProducto && item?.cantidadExistente > 0);
    return hasGeneralStock || hasDailyStock;
  });

  const getCurrentStock = (idProducto) => {
    const generalStockItem = stockGeneralArray.find(item => item.idProducto === idProducto);
    const dailyStockItem = stockDelDiaArray.find(item => item.idProducto === idProducto);
    return (generalStockItem?.cantidadExistente || 0) + (dailyStockItem?.cantidadExistente || 0);
  };

  const formatStock = (producto) => {
    const stock = getCurrentStock(producto.idProducto);
    // if (producto.nombreProducto === "Frances") {
    //   const filas = Math.floor(stock / 6);
    //   const unidades = stock % 6;
    //   return unidades > 0 ? `${filas}.${unidades}` : `${filas}`;
    // }
    return stock;
  };

  useEffect(() => {
    const initialQuantities = {};
    productosConStock.forEach((producto) => {
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
  }, [productosConStock]);

  const handleFocus = (idProducto) => {
    setFocusedInput(idProducto);
    setErrorMessage(null);
  };

  const handleBlur = (idProducto, value, productoNombre) => {
    let parsedValue;
    if (productoNombre === "Frances") {
      parsedValue = parseFloat(value) || 0;
      parsedValue = Math.max(0, parsedValue);
    } else {
      parsedValue = parseInt(value, 10) || 0;
      parsedValue = Math.max(0, parsedValue);
    }

    const producto = productosConStock.find(p => p.idProducto === idProducto);
    const stockDisponible = getCurrentStock(idProducto);
    let cantidadIngresada = parsedValue;

    if (productoNombre === "Frances") {
      cantidadIngresada = Math.floor(parsedValue) * 6 + Math.round((parsedValue % 1) * 10);
    }

    if (cantidadIngresada > stockDisponible) {
      const mensajeError = `No hay suficiente ${productoNombre} en stock. Stock disponible: ${formatStock(producto)} ${productoNombre === "Frances" ? "filas" : "unidades"}`;
      setErrorMessage(mensajeError);
      setIsPopupErrorOpen(true);
      return;
    }

    setTrayQuantities({
      ...trayQuantities,
      [idProducto]: {
        cantidad: parsedValue,
        precioPorUnidad: productsToShow.find((p) => p.idProducto === idProducto)?.precioPorUnidad,
      },
    });
    setFocusedInput(null);
  };

  const handleInputChange = (e, producto) => {
    const value = e.target.value;
    const isFrances = producto.nombreProducto === "Frances";

    if (isFrances && value.includes('.') && value.split('.')[1]?.length > 1) return;

    const productoCompleto = productosConStock.find(p => p.idProducto === producto.idProducto);
    const stockDisponible = getCurrentStock(producto.idProducto);

    if (value !== "") {
      let cantidadIngresada = parseInt(value, 10);

      if (cantidadIngresada > stockDisponible) {
        const mensajeError = `No hay suficiente ${producto.nombreProducto} en stock. Stock disponible: ${formatStock(productoCompleto)} ${isFrances ? "filas" : "unidades"}`;
        setErrorMessage(mensajeError);
        setIsPopupErrorOpen(true);
        return;
      }
    }

    if (isFrances) {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setTrayQuantities({
          ...trayQuantities,
          [producto.idProducto]: {
            cantidad: value === "" ? "" : value,
            precioPorUnidad: producto.precioPorUnidad,
          },
        });
      }
    } else {
      if (value === "" || /^\d*$/.test(value)) {
        setTrayQuantities({
          ...trayQuantities,
          [producto.idProducto]: {
            cantidad: value === "" ? "" : parseInt(value, 10),
            precioPorUnidad: producto.precioPorUnidad,
          },
        });
      }
    }
  };

  const getInputValue = (producto) => {
    const cantidad = trayQuantities[producto.idProducto]?.cantidad ?? 0;
    if (focusedInput === producto.idProducto) {
      return cantidad === 0 ? "" : cantidad.toString();
    }
    return producto.nombreProducto === "Frances"
      ? cantidad.toString()
      : Math.floor(cantidad).toString();
  };

  // ✅ Variable extraída — evita llamar filterProductsByName múltiples veces
  const productosFiltradosPorNombre = filterProductsByName(productosConStock, searchTerm);

  const filteredProducts = productosFiltradosPorNombre
    .filter(producto => activeCategory === "Todas" || producto.nombreCategoria === activeCategory);

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
        {/* ✅ Todas siempre primero y activo por defecto */}
        <Button
          variant={activeCategory === "Todas" ? "primary" : "outline-primary"}
          onClick={() => setActiveCategory("Todas")}
          className="ventas-category-btn"
        >
          Todas ({productosFiltradosPorNombre.length})
        </Button>
        {categorias
          .filter(cat => cat !== "Todas") // ✅ evita duplicar "Todas" si viene en la prop
          .map((categoria) => (
            <Button
              key={categoria}
              variant={activeCategory === categoria ? "primary" : "outline-primary"}
              onClick={() => setActiveCategory(categoria)}
              className="ventas-category-btn"
            >
              {categoria} ({productosFiltradosPorNombre.filter(p => p.nombreCategoria === categoria).length})
            </Button>
          ))}
      </div>

      {/* Tabla de productos */}
      <div className="table-responsive excel-table-container mb-4">
        <Table striped bordered hover className="excel-table">
          <thead>
            <tr>
              <th className="dark-header text-center" style={{ width: "40%" }}>Producto</th>
              <th className="dark-header text-center" style={{ width: "30%" }}>Stock Actual</th>
              <th className="dark-header text-center" style={{ width: "30%" }}>U/F No Vendidas</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((producto) => {
                const esFrances = producto.nombreProducto === "Frances";
                const stockFormateado = formatStock(producto);
                return (
                  <tr key={producto.idProducto}>
                    <td>
                      <div className="product-info">
                        <div
                          className="product-badge-stock"
                          style={{ backgroundColor: getUniqueColor(producto.nombreProducto) }}
                        >
                          {getInitials(producto.nombreProducto)}
                        </div>
                        <span className="product-name">{producto.nombreProducto}</span>
                      </div>
                    </td>
                    <td className="text-center align-middle" style={{ fontWeight: "bold" }}>
                      {stockFormateado}
                    </td>
                    <td className="text-center align-middle">
                      {esFrances ? (
                        <Form.Control
                          type="text"
                          value={getInputValue(producto)}
                          onChange={(e) => handleInputChange(e, producto)}
                          onFocus={() => handleFocus(producto.idProducto)}
                          onBlur={(e) => handleBlur(producto.idProducto, e.target.value, producto.nombreProducto)}
                          className="quantity-input"
                          inputMode="decimal"
                          onWheel={(e) => e.target.blur()} // ✅ suelta el foco al scrollear
                        />
                      ) : (
                        <Form.Control
                          type="number"
                          min="0"
                          step="1"
                          value={getInputValue(producto)}
                          onChange={(e) => handleInputChange(e, producto)}
                          onFocus={() => handleFocus(producto.idProducto)}
                          onBlur={(e) => handleBlur(producto.idProducto, e.target.value, producto.nombreProducto)}
                          className="quantity-input"
                          onWheel={(e) => e.target.blur()} // ✅ suelta el foco al scrollear
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  {productosConStock.length === 0
                    ? "No hay productos con stock disponible."
                    : "No se encontraron productos con ese nombre."}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorMessage}
      />
    </div>
  );
};

export default SeccionProductos;