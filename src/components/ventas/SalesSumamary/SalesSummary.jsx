import React from "react";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import { BsCheckCircle, BsBoxSeam, BsClock, BsShop, BsPerson, BsCash, BsCashStack } from "react-icons/bs";
import styled from "styled-components";
import { formatDateToDisplay } from "../../../utils/dateUtils";

const StyledModal = styled(Modal)`
  .modal-content {
    border-radius: 15px;
    border: none;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  }

  .modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 15px 15px 0 0;
    border: none;
    
    .modal-title {
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    .btn-close {
      filter: invert(1);
    }
  }

  .modal-body {
    padding: 1.5rem;
  }

  .detail-item {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    
    svg {
      margin-right: 12px;
      font-size: 1.2rem;
      color: #6c757d;
    }
  }

  .table-responsive {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    width: 80%;
    margin: 0 auto;
    
    th {
      background: #f8f9fa;
      font-weight: 600;
    }
    
    td {
      vertical-align: middle;
    }
  }

  .product-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 20px;
    background: #e9ecef;
    font-size: 0.85rem;
    margin-bottom: 4px;
    
    svg {
      margin-right: 6px;
    }
  }

  .total-row {
    font-weight: bold;
    background-color: #f8f9fa !important;
  }
`;

const SalesSummary = ({ show, handleClose, orderData, trayQuantities, productos, sucursales, isLoading, onConfirm, ventaReal, gastos }) => {
  // Función para obtener el nombre del producto basado en el idProducto
  const getProductName = (idProducto) => {
    const product = productos.find((p) => p.idProducto === idProducto);
    return product ? product.nombreProducto : "Desconocido";
  };

  // Función para obtener el nombre de la sucursal basado en el idSucursal
  const getSucursalName = (idSucursal) => {
    const sucursal = sucursales.find((s) => s.idSucursal == idSucursal );
    return sucursal ? sucursal.nombreSucursal : "Desconocida";
  };

  // Filtrar y separar productos por categoría
  const productosPanaderia = productos.filter((p) => p.nombreCategoria === "Panaderia");
  const productosOtros = productos.filter((p) => p.nombreCategoria !== "Panaderia");

  // Obtener la cantidad no vendida para productos de Panaderia
  const productosPanaderiaConCantidad = productosPanaderia.map((producto) => {
    const cantidadNoVendida = trayQuantities[producto.idProducto]?.cantidad || 0;
    return {
      ...producto,
      cantidadNoVendida,
    };
  });

  // Obtener la cantidad vendida para productos de otras categorías
  const productosOtrosConCantidad = productosOtros.map((producto) => {
    const cantidadVendida = trayQuantities[producto.idProducto]?.cantidad || 0;
    return {
      ...producto,
      cantidadVendida,
    };
  });

  // Verificar si todos los productos de Panaderia fueron vendidos
  const todosProductosPanaderiaVendidos = productosPanaderiaConCantidad.every(
    (producto) => producto.cantidadNoVendida === 0
  );

  // Calcular total de gastos
  const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.subtotal, 0);
  // Calcular venta neta
  const ventaNeta = ventaReal ? ventaReal + totalGastos : 0;

  return (
    <StyledModal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <BsCheckCircle className="me-2" />
          Resumen de la Venta
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-4">
          <h5 className="mb-3 fw-semibold text-primary">Detalles Generales</h5>
          <div className="detail-item">
            <BsShop />
            <span>
              <strong>Sucursal:</strong> {getSucursalName(orderData.sucursal)}
            </span>
          </div>
          <div className="detail-item">
            <BsClock />
            <span>
              <strong>Turno:</strong> {orderData.turno}
            </span>
          </div>
          <div className="detail-item">
            <BsBoxSeam />
            <span>
              <strong>Fecha Venta:</strong>{" "}
              {formatDateToDisplay(orderData.fechaAProducir)}
            </span>
          </div>
          <div className="detail-item">
            <BsPerson />
            <span>
              <strong>Vendedor (a):</strong> {orderData.nombrePanadero}
            </span>
          </div>
        </div>

        {/* Sección de Cobro */}
        <div className="mb-4">
          <h5 className="mb-3 fw-semibold text-primary">Ingreso de la venta</h5>
          <div className="detail-item">
            <BsCash />
            <span>
              <strong>Monto Total:</strong> Q.{ventaReal ? ventaReal.toFixed(2) : "0.00"}
            </span>
          </div>
        </div>

        {/* Sección de Gastos */}
        <div className="mb-4">
          <h5 className="mb-3 fw-semibold text-primary">Gastos del Turno</h5>
          {gastos.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Detalle</th>
                    <th className="text-end">Monto (Q)</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((gasto, index) => (
                    <tr key={index}>
                      <td>{gasto.detalleGasto}</td>
                      <td className="text-end">Q{gasto.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td>Total Gastos</td>
                    <td className="text-end">Q{totalGastos.toFixed(2)}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted">No se registraron gastos</p>
          )}
        </div>

        {/* Resumen Financiero */}
        <div className="mb-4">
          <h5 className="mb-3 fw-semibold text-primary">Resumen Financiero</h5>
          <div className="table-responsive">
            <Table bordered>
              <tbody>
                <tr>
                  <td><strong>Venta Total</strong></td>
                  <td className="text-end">Q{ventaReal ? ventaReal.toFixed(2) : "0.00"}</td>
                </tr>
                <tr>
                  <td><strong>Total Gastos</strong></td>
                  <td className="text-end">Q{totalGastos.toFixed(2)}</td>
                </tr>
                <tr className="table-active">
                  <td><strong>Venta Neta</strong></td>
                  <td className="text-end fw-bold">Q{ventaNeta.toFixed(2)}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>

        {/* Sección de Panaderia */}
        <h5 className="mb-3 fw-semibold text-primary">Panaderia</h5>
        {todosProductosPanaderiaVendidos ? (
          <p className="text-center text-muted">Todos los productos de Panaderia fueron vendidos.</p>
        ) : (
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="text-end">Cantidad no vendida</th>
                </tr>
              </thead>
              <tbody>
                {productosPanaderiaConCantidad.map((producto) => (
                  producto.cantidadNoVendida > 0 && (
                    <tr key={producto.idProducto}>
                      <td>{producto.nombreProducto}</td>
                      <td className="text-end fw-semibold">{producto.cantidadNoVendida}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* Sección de Otros productos */}
        <h5 className="mb-3 fw-semibold text-primary">Otros productos</h5>
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-end">Unidades no vendidas</th>
              </tr>
            </thead>
            <tbody>
              {productosOtrosConCantidad.map((producto) => (
                producto.cantidadVendida > 0 && (
                  <tr key={producto.idProducto}>
                    <td>{producto.nombreProducto}</td>
                    <td className="text-end fw-semibold">{producto.cantidadVendida}</td>
                  </tr>
                )
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-top-0">
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          className="px-4 rounded-pill"
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            onConfirm();
            handleClose();
          }}
          className="px-4 rounded-pill"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Procesando...
            </>
          ) : (
            "Confirmar y Guardar"
          )}
        </Button>
      </Modal.Footer>
    </StyledModal>
  );
};

export default SalesSummary;