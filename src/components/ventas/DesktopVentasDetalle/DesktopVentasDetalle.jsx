import React from "react";
import { Badge, Card, Col, Container, Row, Table } from "react-bootstrap";
import DownloadDropdown from "../../../components/DownloadDropdown/DownloadDropdown";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import "./DesktopVentasDetalle.css";
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
} from "react-icons/bs";

const DesktopVentaDetalle = ({ venta, onDownloadXLS, onDownloadPDF }) => {
  // Acceder a los datos anidados
  const encabezadoVenta = venta?.encabezadoVenta;
  const detallesVenta = venta?.detalleVenta;
  const detalleIngresos = venta?.detalleIngresos;

  return (
    <Container fluid>
      {/* Encabezado Unificado */}
      <DesktopHeader
        encabezadoVenta={encabezadoVenta}
        onDownloadXLS={onDownloadXLS}
        onDownloadPDF={onDownloadPDF}
      />

      {/* Tabla de Productos */}
      <OrderTable productos={detallesVenta} />

      {/* Balance con Estilo Mejorado */}
      <Balance detalleIngresos={detalleIngresos} />
    </Container>
  );
};

const DesktopHeader = ({ encabezadoVenta, onDownloadXLS, onDownloadPDF }) => {
  // Función para formatear números con dos decimales y símbolo Q
  const formatCurrency = (value) => {
    return `Q ${parseFloat(value).toFixed(2)}`;
  };

  return (
    <Card className="shadow-lg border-0 mb-4 bg-gradient-primary" style={{ borderRadius: "15px" }}>
      <Card.Body className="p-4">
        <Row className="g-3">
          {/* Información de la Venta */}
          <Col md={4}>
            <div className="d-flex flex-column text-dark">
              <h3 className="mb-3 fw-bold">{`VENTA #${encabezadoVenta?.idVenta}`}</h3>
              <div className="mb-3">
                <span className="text-uppercase small opacity-75 d-flex align-items-center gap-2">
                  <BsPerson size={16} /> Usuario que ingresó la venta
                </span>
                <h5 className="mb-0 fw-semibold">{`@${encabezadoVenta?.usuario}`}</h5>
              </div>
              <div className="mb-3">
                <span className="text-uppercase small opacity-75 d-flex align-items-center gap-2">
                  <BsShop size={16} /> Sucursal
                </span>
                <h5 className="mb-0 fw-semibold">{encabezadoVenta?.nombreSucursal}</h5>
              </div>
            </div>
          </Col>

          {/* Fecha y Turno */}
          <Col md={4}>
            <div className="d-flex flex-column text-dark">
              <div className="mb-3">
                <span className="text-uppercase small opacity-75 d-flex align-items-center gap-2">
                  <BsCalendar size={16} /> Fecha Venta
                </span>
                <h5 className="mb-0 fw-bold">
                  {formatDateToDisplay(encabezadoVenta?.fechaVenta)}
                </h5>
              </div>
              <div>
                <span className="text-uppercase small opacity-75 d-flex align-items-center gap-2">
                  <BsClock size={16} /> Turno
                </span>
                <h5 className="mb-0 fw-bold">{encabezadoVenta?.ordenTurno || "N/A"}</h5>
              </div>
            </div>
          </Col>

          {/* Estado, Venta Ingresada y Botón de Descargar */}
          <Col md={4}>
            <div className="d-flex flex-column text-dark h-100 justify-content-between">
              <div className="mb-3">
                <span className="text-uppercase small opacity-75 d-flex align-items-center gap-2">
                  {encabezadoVenta?.estadoVenta === "C" ? (
                    <BsCheckCircle size={16} className="text-success" />
                  ) : (
                    <BsXCircle size={16} className="text-danger" />
                  )}{" "}
                  Estado Venta
                </span>
                <h5 className="mb-0 fw-bold">
                  <Badge
                    bg={encabezadoVenta?.estadoVenta === "C" ? "success" : "danger"}
                    className="px-1 py-1"
                  >
                    {encabezadoVenta?.estadoVenta === "C" ? "Cerrada" : "Pendiente"}
                  </Badge>
                </h5>
              </div>
              <div>
                <span className="text-uppercase small opacity-75 d-flex align-items-center gap-2">
                  <BsCash size={16} /> Venta Ingresada
                </span>
                <h5 className="mb-0 fw-semibold mb-2">
                  <Badge bg="primary" className="px-2 py-1">
                    {formatCurrency(encabezadoVenta?.totalVenta)}
                  </Badge>
                </h5>
              </div>
              <div className="mt-auto mt-5">
                <DownloadDropdown
                  onDownloadXLS={onDownloadXLS}
                  onDownloadPDF={onDownloadPDF}
                  variant="light"
                  className="w-100 w-md-auto"
                />
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

const OrderTable = ({ productos }) => {
  // Función para formatear números con dos decimales y símbolo Q
  const formatCurrency = (value) => {
    return `Q ${parseFloat(value).toFixed(2)}`;
  };

  // Calcular la suma total de los productos
  const totalSum = productos?.reduce((sum, prod) => {
    return sum + prod.cantidadVendida * prod.precioUnitario;
  }, 0);

  return (
    <Card className="shadow-lg border-0 overflow-hidden mb-4" style={{ borderRadius: "15px" }}>
      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead className="bg-dark text-white">
            <tr>
              <th className="ps-4 py-3 text-center fw-semibold">Item</th>
              <th className="py-3 fw-semibold">Producto</th>
              <th className="py-3 text-center fw-semibold">Cantidad Vendida</th>
              <th className="py-3 text-center fw-semibold">Precio Unitario</th>
              <th className="py-3 text-center fw-semibold">Total</th>
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
            {/* Fila para mostrar el total */}
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
      </div>
    </Card>
  );
};

const Balance = ({ detalleIngresos }) => {
  // Función para formatear números con dos decimales y símbolo Q
  const formatCurrency = (value) => {
    return `Q ${parseFloat(value).toFixed(2)}`;
  };

  // Determinar el color de la diferencia
  const diferenciaColor = detalleIngresos?.diferencia >= 0 ? "success" : "danger";

  return (
    <Card className="shadow-lg border-0 mb-4 bg-gradient-primary" style={{ borderRadius: "15px" }}>
      <Card.Body className="p-4">
        <Row className="g-3">
          <Col md={12}>
            <div className="d-flex flex-column text-dark">
              <h3 className="mb-3 fw-bold">Balance</h3>
              <div className="d-flex flex-column gap-3">
                {/* Monto Esperado */}
                <div className="d-flex align-items-center gap-2">
                  <BsCash size={20} className="text-primary" />
                  <span className="fw-medium">Monto Esperado: </span>
                  <span className="fw-bold">
                    {formatCurrency(detalleIngresos?.montoEsperado)}
                  </span>
                </div>

                {/* Monto Ingresado */}
                <div className="d-flex align-items-center gap-2">
                  <BsWallet size={20} className="text-primary" />
                  <span className="fw-medium">Monto Ingresado: </span>
                  <span className="fw-bold">
                    {formatCurrency(detalleIngresos?.montoTotalIngresado)}
                  </span>
                </div>

                {/* Operación Matemática */}
                <div className="d-flex align-items-center gap-2">
                  <BsDashCircle size={20} className="text-danger" />
                  <span className="fw-medium">Diferencia: </span>
                  <span className="fw-bold">
                    <Badge bg={diferenciaColor} className="px-2 py-1">
                      {formatCurrency(detalleIngresos?.diferencia)}
                    </Badge>
                  </span>
                </div>
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
    <tr
      className="align-middle"
      style={{
        backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
        borderBottom: "2px solid #f1f1f1",
      }}
    >
      <td className="ps-4 text-center">
        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
          {index + 1}
        </span>
      </td>
      <td>
        <div className="d-flex align-items-center gap-3">
          <span className="fw-medium">{product.nombreProducto}</span>
        </div>
      </td>
      <td className="text-center fw-bold text-primary">
        {product.cantidadVendida}
      </td>
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