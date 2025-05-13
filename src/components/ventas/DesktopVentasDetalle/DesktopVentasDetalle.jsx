import React, { useState } from "react";
import { Badge, Card, Col, Container, Row, Table, Modal, Button } from "react-bootstrap";
import DownloadDropdown from "../../../components/DownloadDropdown/DownloadDropdown";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import {
  BsCash,
  BsDashCircle,
  BsWallet,
  BsPerson,
  BsShop,
  BsCalendar,
  BsClock,
  BsCheckCircle,
  BsXCircle,
  BsDownload,
  BsCashStack,
  BsPlusCircle,
  BsListUl
} from "react-icons/bs";

const DesktopVentaDetalle = ({ venta, onDownloadXLS, onDownloadPDF }) => {
  const encabezadoVenta = venta?.encabezadoVenta;
  const detallesVenta = venta?.detalleVenta;
  const detalleIngresos = venta?.detalleIngresos;
  const detallesGastos = venta?.detalleGastos;

  return (
    <Container fluid className="p-0">
      {/* Encabezado */}
      <DesktopHeader
        encabezadoVenta={encabezadoVenta}
        onDownloadXLS={onDownloadXLS}
        onDownloadPDF={onDownloadPDF}
      />

      {/* Tabla de Productos */}
      <OrderTable productos={detallesVenta} />

      {/* Balance Financiero */}
      <Balance 
        detalleIngresos={detalleIngresos} 
        detallesGastos={detallesGastos} 
      />
    </Container>
  );
};

const DesktopHeader = ({ encabezadoVenta, onDownloadXLS, onDownloadPDF }) => {
  const formatCurrency = (value) => {
    return `Q ${parseFloat(value).toFixed(2)}`;
  };

  return (
    <Card
      className="border-0 mb-4 shadow-sm"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Card.Body className="p-3">
        <Row className="align-items-center">
          {/* Información de la Venta */}
          <Col md={4}>
            <div className="d-flex flex-column">
              <h4 className="mb-2 fw-bold text-dark">
                <BsShop
                  size={24}
                  className="me-2"
                  style={{ color: "#FF6B6B" }}
                />
                Venta #{encabezadoVenta?.idVenta}
              </h4>
              <div className="d-flex align-items-center gap-2 mb-2">
                <BsPerson size={16} style={{ color: "#4ECDC4" }} />
                <span className="text-secondary">Vendido por:</span>
                <span className="fw-bold text-dark">{`${encabezadoVenta?.nombreUsuario}`}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <BsShop size={16} style={{ color: "#4ECDC4" }} />
                <span className="text-secondary">Sucursal:</span>
                <span className="fw-bold text-dark">
                  {encabezadoVenta?.nombreSucursal}
                </span>
              </div>
            </div>
          </Col>

          {/* Fecha y Turno */}
          <Col md={4}>
            <div className="d-flex flex-column">
              <div className="d-flex align-items-center gap-2 mb-2">
                <BsCalendar size={16} style={{ color: "#4ECDC4" }} />
                <span className="text-secondary">Fecha:</span>
                <span className="fw-bold text-dark">
                  {formatDateToDisplay(encabezadoVenta?.fechaVenta)}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <BsClock size={16} style={{ color: "#4ECDC4" }} />
                <span className="text-secondary">Turno:</span>
                <span className="fw-bold text-dark">
                  {encabezadoVenta?.ventaTurno || "N/A"}
                </span>
              </div>
            </div>
          </Col>

          {/* Estado y Total */}
          <Col md={4}>
            <div className="d-flex flex-column align-items-end">
              <div className="d-flex align-items-center gap-2 mb-2">
                {encabezadoVenta?.estadoVenta === "C" ? (
                  <BsCheckCircle size={16} style={{ color: "#4ECDC4" }} />
                ) : (
                  <BsXCircle size={16} style={{ color: "#FF6B6B" }} />
                )}
                <span className="text-secondary">Estado:</span>
                <Badge
                  bg={
                    encabezadoVenta?.estadoVenta === "C" ? "success" : "danger"
                  }
                  className="px-2 py-1"
                >
                  {encabezadoVenta?.estadoVenta === "C"
                    ? "Cerrada"
                    : "Pendiente"}
                </Badge>
              </div>
              <div className="d-flex align-items-center gap-2">
                <BsCash size={16} style={{ color: "#4ECDC4" }} />
                <span className="text-secondary">Total:</span>
                <span className="fw-bold text-dark">
                  {formatCurrency(encabezadoVenta?.totalVenta)}
                </span>
              </div>
              <div className="mt-2">
                <DownloadDropdown
                  onDownloadXLS={onDownloadXLS}
                  onDownloadPDF={onDownloadPDF}
                  variant="outline-dark"
                  className="rounded-circle p-2"
                >
                  <BsDownload size={20} />
                </DownloadDropdown>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

const OrderTable = ({ productos }) => {
  const formatCurrency = (value) => {
    return `Q ${parseFloat(value).toFixed(2)}`;
  };

  const totalSum = productos?.reduce((sum, prod) => {
    return sum + prod.cantidadVendida * prod.precioUnitario;
  }, 0);

  return (
    <Card
      className="border-0 mb-4 shadow-sm"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Card.Body className="p-3">
        <h5 className="mb-3 fw-bold text-dark">Productos Vendidos</h5>
        <Table hover className="mb-0">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th>Producto</th>
              <th className="text-center">Cantidad</th>
              <th className="text-center">Precio Unitario</th>
              <th className="text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {productos?.map((prod, index) => (
              <TableRow
                key={prod.idDetalleVenta}
                product={prod}
                index={index}
                formatCurrency={formatCurrency}
              />
            ))}
            <tr>
              <td colSpan={4} className="text-end fw-bold">
                Total General:
              </td>
              <td className="text-center fw-bold">
                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">
                  {formatCurrency(totalSum)}
                </span>
              </td>
            </tr>
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

const Balance = ({ detalleIngresos, detallesGastos }) => {
  const [showGastosModal, setShowGastosModal] = useState(false);
  const formatCurrency = (value) => {
    return `Q ${parseFloat(value).toFixed(2)}`;
  };

  const ventaReal = (detalleIngresos?.montoTotalIngresado || 0) + (detalleIngresos?.montoTotalGastos || 0);
  const diferencia = ventaReal - (detalleIngresos?.montoEsperado || 0);
  const diferenciaColor = diferencia >= 0 ? "success" : "danger";

  return (
    <>
      <Card
        className="border-0 mb-4 shadow-sm"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Card.Body className="p-3">
          <h5 className="mb-3 fw-bold text-dark">Balance Financiero</h5>
          <Row>
            <Col md={12}>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <BsWallet size={18} style={{ color: "#4ECDC4" }} />
                    <span className="text-secondary">Monto Ingresado:</span>
                  </div>
                  <span className="fw-bold text-dark">
                    {formatCurrency(detalleIngresos?.montoTotalIngresado)}
                  </span>
                </div>

                <div 
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => setShowGastosModal(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div className="position-relative">
                      <BsCashStack size={18} style={{ color: "#FF6B6B" }} />
                      {detallesGastos?.length > 0 && (
                        <Badge 
                          pill 
                          bg="danger" 
                          className="position-absolute top-0 start-100 translate-middle"
                          style={{ fontSize: '0.6em' }}
                        >
                          {detallesGastos.length}
                        </Badge>
                      )}
                    </div>
                    <span className="text-secondary">Gastos del Turno:</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-danger">
                      {formatCurrency(detalleIngresos?.montoTotalGastos)}
                    </span>
                    <BsListUl size={16} style={{ color: "#6c757d" }} />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                  <div className="d-flex align-items-center gap-2">
                    <BsPlusCircle size={18} style={{ color: "#4ECDC4" }} />
                    <span className="fw-semibold">Venta Real del Turno:</span>
                  </div>
                  <span className="fw-bold text-primary">
                    {formatCurrency(ventaReal)}
                  </span>
                </div>

                <hr className="my-1" />

                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <BsCash size={18} style={{ color: "#4ECDC4" }} />
                    <span className="text-secondary">Venta Esperada:</span>
                  </div>
                  <span className="fw-bold text-dark">
                    {formatCurrency(detalleIngresos?.montoEsperado)}
                  </span>
                </div>

                <hr className="my-1" />

                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <BsDashCircle size={18} style={{ color: diferenciaColor }} />
                    <span className="fw-semibold">Diferencia:</span>
                  </div>
                  <Badge bg={diferenciaColor} className="px-3 py-1">
                    {formatCurrency(diferencia)}
                  </Badge>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Modal de Detalles de Gastos */}
      <Modal show={showGastosModal} onHide={() => setShowGastosModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <BsCashStack className="me-2" style={{ color: "#FF6B6B" }} />
            Detalle de Gastos
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detallesGastos?.length > 0 ? (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Descripción</th>
                    <th className="text-end">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {detallesGastos.map((gasto, index) => (
                    <tr key={gasto.idGastoDiarioDetalle}>
                      <td>{index + 1}</td>
                      <td>{gasto.detalleGasto}</td>
                      <td className="text-end text-info fw-bold">
                        {formatCurrency(gasto.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="text-end fw-bold">Total:</td>
                    <td className="text-end text-danger fw-bold">
                      {formatCurrency(detalleIngresos?.montoTotalGastos)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <BsCashStack size={48} className="text-muted mb-3" />
              <h5>No hay gastos registrados</h5>
              <p className="text-muted">No se encontraron gastos para este turno</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowGastosModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const TableRow = ({ product, index, formatCurrency }) => {
  return (
    <tr>
      <td className="text-center">
        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
          {index + 1}
        </span>
      </td>
      <td>{product.nombreProducto}</td>
      <td className="text-center">{product.cantidadVendida}</td>
      <td className="text-center">
        <span className="badge bg-secondary bg-opacity-10 text-dark rounded-pill px-3 py-2">
          {formatCurrency(product.precioUnitario)}
        </span>
      </td>
      <td className="text-center">
        <span className="badge bg-primary bg-opacity-10 text-dark rounded-pill px-3 py-2">
          {formatCurrency(product.cantidadVendida * product.precioUnitario)}
        </span>
      </td>
    </tr>
  );
};

export default DesktopVentaDetalle;