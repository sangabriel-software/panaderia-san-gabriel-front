import React from "react";
import { Badge, Card, Col, Container, Row, Table } from "react-bootstrap";
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
} from "react-icons/bs";

const DesktopVentaDetalle = ({ venta, onDownloadXLS, onDownloadPDF }) => {
  const encabezadoVenta = venta?.encabezadoVenta;
  const detallesVenta = venta?.detalleVenta;
  const detalleIngresos = venta?.detalleIngresos;

  return (
    <Container
      fluid
      className="p-0"
    >
      {/* Encabezado */}
      <DesktopHeader
        encabezadoVenta={encabezadoVenta}
        onDownloadXLS={onDownloadXLS}
        onDownloadPDF={onDownloadPDF}
      />

      {/* Tabla de Productos */}
      <OrderTable productos={detallesVenta} />

      {/* Balance */}
      <Balance detalleIngresos={detalleIngresos} />
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
                <span className="fw-bold text-dark">{`@${encabezadoVenta?.usuario}`}</span>
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

const Balance = ({ detalleIngresos }) => {
  const formatCurrency = (value) => {
    return `Q ${parseFloat(value).toFixed(2)}`;
  };

  const diferenciaColor =
    detalleIngresos?.diferencia >= 0 ? "success" : "danger";

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
        <h5 className="mb-3 fw-bold text-dark">Balance</h5>
        <Row>
          <Col md={12}>
            <div className="d-flex flex-column gap-1">
              <div className="d-flex align-items-center gap-3">
                <BsCash size={16} style={{ color: "#4ECDC4" }} />
                <span className="text-secondary ">Monto Esperado:</span>
                <span className="fw-bold text-dark">
                  {formatCurrency(detalleIngresos?.montoEsperado)}
                </span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <BsWallet size={16} style={{ color: "#4ECDC4" }} />
                <span className="text-secondary">Monto Ingresado:</span>
                <span className="fw-bold text-dark">
                  {formatCurrency(detalleIngresos?.montoTotalIngresado)}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <BsDashCircle size={16} style={{ color: "#FF6B6B" }} />
                <span className="text-secondary">Diferencia:</span>
                <Badge bg={diferenciaColor} className="px-2 py-1">
                  {formatCurrency(detalleIngresos?.diferencia)}
                </Badge>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
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
