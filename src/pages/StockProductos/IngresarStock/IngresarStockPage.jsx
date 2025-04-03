import { useState } from "react";
import { Container, Table, Button, Form, Spinner, Alert, ButtonGroup } from "react-bootstrap";
import DotsMove from "../../../components/Spinners/DotsMove";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import "./IngresarStockPage.styles.css";
import { getInitials, getUniqueColor } from "./IngresarStock.utils";

const IngresarStockGeneralPage = () => {
  const { productos, loadigProducts, showErrorProductos } = useGetProductosYPrecios();
  const [stockValues, setStockValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");

  // Filtrar productos no bandejas y agrupar por categoría
  const prodPorHarina = productos?.filter(item => item.tipoProduccion !== "bandejas");
  
  // Obtener categorías únicas
  const categorias = [...new Set(productos?.map(item => item.nombreCategoria) || [])];

  // Filtrar productos por categoría seleccionada
  const productosFiltrados = categoriaActiva === "Todas" 
    ? prodPorHarina 
    : prodPorHarina?.filter(item => item.nombreCategoria === categoriaActiva);

  const handleStockChange = (idProducto, value) => {
    setStockValues(prev => ({
      ...prev,
      [idProducto]: value ? parseInt(value) : null
    }));
  };

  const handleSubmit = () => {
    setIsLoading(true);
    const payload = Object.entries(stockValues)
      .filter(([_, value]) => value !== null && !isNaN(value))
      .map(([idProducto, cantidad]) => ({
        idProducto: parseInt(idProducto),
        cantidad
      }));
    
    console.log("Payload a enviar:", payload);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
    }, 1500);
  };

  if (loadigProducts) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <DotsMove />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {showErrorProductos && <Alert variant="danger" className="mb-4">Error al cargar los productos</Alert>}

      {/* Filtros por categoría */}
      <div className="mb-4">
        <h6 className="mb-3">Filtrar por categoría:</h6>
        <ButtonGroup className="flex-wrap">
          <Button
            variant={categoriaActiva === "Todas" ? "primary" : "outline-primary"}
            onClick={() => setCategoriaActiva("Todas")}
            className="m-1"
          >
            Todas
          </Button>
          {categorias.map(categoria => (
            <Button
              key={categoria}
              variant={categoriaActiva === categoria ? "primary" : "outline-primary"}
              onClick={() => setCategoriaActiva(categoria)}
              className="m-1"
            >
              {categoria}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div className="table-responsive excel-table-container mb-4">
        <Table striped bordered hover className="excel-table">
          <thead>
            <tr>
              <th className="dark-header text-center" style={{ width: '60%' }}>Producto</th>
              <th className="dark-header text-center" style={{ width: '40%' }}>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados?.length > 0 ? (
              productosFiltrados.map(producto => (
                <tr key={producto.idProducto}>
                  <td>
                    <div className="product-info">
                      <div className="product-badge" style={{ backgroundColor: getUniqueColor(producto.nombreProducto) }}>
                        {getInitials(producto.nombreProducto)}
                      </div>
                      <span className="product-name">{producto.nombreProducto}</span>
                    </div>
                  </td>
                  <td className="text-center align-middle">
                    <Form.Control
                      type="number"
                      min="0"
                      value={stockValues[producto.idProducto] || ""}
                      onChange={(e) => handleStockChange(producto.idProducto, e.target.value)}
                      className="quantity-input"
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center py-4">No hay productos disponibles en esta categoría</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <div className="text-center">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading || Object.values(stockValues).every(val => val === null || isNaN(val))}
        >
          {isLoading ? <Spinner animation="border" size="sm" /> : 'Guardar Stock'}
        </Button>
      </div>

      <SuccessPopup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="¡Éxito!"
        message="El stock se ha guardado correctamente"
      />
    </Container>
  );
};

export default IngresarStockGeneralPage;