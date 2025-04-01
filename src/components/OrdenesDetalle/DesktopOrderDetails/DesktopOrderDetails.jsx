import React from "react";
import { Badge, Card, Col, Container, Row, Table } from "react-bootstrap";
import DownloadDropdown from "../../../components/DownloadDropdown/DownloadDropdown";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import "./DesktopOrderDetails.css";

const DesktopOrderDetails = ({ order, onDownloadXLS, onDownloadPDF }) => {
  const encabezado = order?.encabezadoOrden;
  const detalles = order?.detalleOrden;

  return (
    <Container fluid>
      <DesktopHeader
        encabezado={encabezado}
        onDownloadXLS={onDownloadXLS}
        onDownloadPDF={onDownloadPDF}
      />
      <OrderTable productos={detalles} />
    </Container>
  );
};

const DesktopHeader = ({ encabezado, onDownloadXLS, onDownloadPDF }) => (
  <Card
    className="shadow-lg border-0 mb-4 bg-gradient-primary"
    style={{ borderRadius: "15px" }}
  >
    <Card.Body className="p-4">
      <Row className="g-3">
        <Col md={4} className="border-end border-light">
          <h3 className="mb-3 fw-bold">{`ORD #${encabezado?.idOrdenProduccion}`}</h3>
          <div className="d-flex flex-column text-dark">
            <div className="mb-3">
              <span className="text-uppercase small opacity-75">
                Fecha de producción
              </span>
              <h3 className="mb-0 fw-bold">
                {formatDateToDisplay(encabezado?.fechaAProducir)}
              </h3>
            </div>
            <div>
              <span className="text-uppercase small opacity-75">Sucursal</span>
              <h4 className="mb-0 fw-semibold">{encabezado?.nombreSucursal}</h4>
            </div>
          </div>
        </Col>
        <Col md={3} className="border-end border-light">
          <div className="d-flex flex-column text-dark">
            <div className="mb-3">
              <span className="text-uppercase small opacity-75">Turno</span>
              <h3 className="mb-0 fw-bold">{encabezado?.ordenTurno}</h3>
            </div>
            <div>
              <span className="text-uppercase small opacity-75">
                Estado Orden:{" "}
              </span>
              <h4>
                <Badge
                  bg={encabezado?.estadoOrden === "P" ? "danger" : "success"}
                  className="px-1 py-1"
                >
                  {encabezado?.estadoOrden === "P"
                    ? "Venta Pendiente"
                    : "Orden Cerrada"}
                </Badge>
              </h4>
            </div>
          </div>
        </Col>
        <Col md={5} className="ps-5">
          <div className="d-flex flex-column text-dark">
            <div className="mb-3">
              <span className="text-uppercase small opacity-75">
                Responsables
              </span>
              <div className="d-flex flex-column gap-2 mt-2">
                <div>
                  <span className="fw-medium">Solicitado por: </span>
                  <span className="fw-bold">{encabezado?.nombreUsuario}</span>
                </div>
                <div>
                  <span className="fw-medium">Panadero: </span>
                  <span className="fw-bold">{encabezado?.nombrePanadero}</span>
                </div>
              </div>
            </div>
            <div className="mt-auto">
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

const OrderTable = ({ productos }) => {
  // Filtrar productos por tipo de producción
  const productosBandejas = productos?.filter(prod => prod.tipoProduccion === "bandejas") || [];
  const productosHarina = productos?.filter(prod => prod.tipoProduccion === "harina") || [];

  // Calcular total de harina
  const totalHarina = productosHarina.reduce((total, prod) => {
    return total + (Number(prod.cantidadHarina) || 0);
  }, 0);

  return (
    <Card className="shadow-lg border-0 overflow-hidden mb-5" style={{ borderRadius: "15px" }}>
      <div className="table-responsive">
        {/* Tabla para productos por bandejas */}
        {productosBandejas.length > 0 && (
          <>
            <div className="bg-secondary bg-opacity-10 p-3">
              <h5 className="mb-0 fw-bold text-dark">PRODUCTOS POR BANDEJAS</h5>
            </div>
            <Table hover className="mb-0">
              <thead className="bg-dark text-white">
                <tr>
                  <th className="ps-4 py-3 text-center fw-semibold">#</th>
                  <th className="py-3 fw-semibold">Producto</th>
                  <th className="py-3 text-center fw-semibold">Bandejas</th>
                  <th className="py-3 text-center fw-semibold">Unidades</th>
                  <th className="py-3 text-center fw-semibold">Categoría</th>
                </tr>
              </thead>
              <tbody>
                {productosBandejas.map((prod, index) => (
                  <TableRow key={prod.idDetalleOrdenProduccion} product={prod} index={index} />
                ))}
              </tbody>
            </Table>
          </>
        )}

        {/* Tabla para productos por harina */}
        {productosHarina.length > 0 && (
          <>
            <div className="bg-secondary bg-opacity-10 p-3 mt-4">
              <h5 className="mb-0 fw-bold text-dark">PRODUCTOS POR HARINA</h5>
            </div>
            <Table hover className="mb-0">
              <thead className="bg-dark text-white">
                <tr>
                  <th className="ps-4 py-3 text-center fw-semibold">#</th>
                  <th className="py-3 fw-semibold">Producto</th>
                  <th className="py-3 text-center fw-semibold">Harina (Lb)</th>
                  <th className="py-3 text-center fw-semibold">Categoría</th>
                </tr>
              </thead>
              <tbody>
                {productosHarina.map((prod, index) => (
                  <TableRowHarina key={prod.idDetalleOrdenProduccion} product={prod} index={index} />
                ))}
                {/* Fila de total */}
                <tr className="bg-light">
                  {/* <td colSpan="2" className="text-end fw-bold">Total Harina:</td> */}
                  {/* <td className="text-center fw-bold text-primary">{totalHarina} kg</td> */}
                  <td></td>
                </tr>
              </tbody>
            </Table>
          </>
        )}
      </div>
    </Card>
  );
};

const TableRow = ({ product, index }) => {
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
        {product.cantidadBandejas}
      </td>
      <td className="text-center">
        <span className="badge bg-secondary bg-opacity-10 text-dark rounded-pill px-3 py-2">
          {product.cantidadUnidades.toLocaleString()}
        </span>
      </td>
      <td className="text-center">
        <span className="badge bg-primary bg-opacity-10 text-dark rounded-pill px-3 py-2">
          {product.nombreCategoria}
        </span>
      </td>
    </tr>
  );
};

const TableRowHarina = ({ product, index }) => {
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
        {product.cantidadHarina}
      </td>
      <td className="text-center">
        <span className="badge bg-primary bg-opacity-10 text-dark rounded-pill px-3 py-2">
          {product.nombreCategoria}
        </span>
      </td>
    </tr>
  );
};

export default DesktopOrderDetails;