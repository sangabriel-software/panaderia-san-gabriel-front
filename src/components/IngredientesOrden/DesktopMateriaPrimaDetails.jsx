import React from "react";
import { Badge, Card, Col, Container, Row, Table } from "react-bootstrap";
import DownloadDropdown from "../DownloadDropdown/DownloadDropdown";
import { formatDateToDisplay } from "../../utils/dateUtils";

const DesktopMateriaPrimaDetails = ({ order, detalleConsumo, onDownloadXLS, onDownloadPDF }) => {
  const encabezado = order?.encabezadoOrden;

  // Agrupar los detalles de consumo por producto
  const groupedConsumo = detalleConsumo?.reduce((acc, item) => {
    if (!acc[item.Producto]) {
      acc[item.Producto] = [];
    }
    acc[item.Producto].push(item);
    return acc;
  }, {});

  // Calcular el total de la cantidad usada por ingrediente
  const totalPorIngrediente = detalleConsumo?.reduce((acc, item) => {
    if (!acc[item.Ingrediente]) {
      acc[item.Ingrediente] = { cantidad: 0, unidad: item.UnidadMedida };
    }
    acc[item.Ingrediente].cantidad += item.CantidadUsada;
    return acc;
  }, {});

  return (
    <Container fluid>
      <DesktopHeader
        encabezado={encabezado}
        onDownloadXLS={onDownloadXLS}
        onDownloadPDF={onDownloadPDF}
      />
      <Card className="shadow-lg border-0 overflow-hidden mb-5" style={{ borderRadius: "15px" }}>
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="bg-dark text-white">
              <tr>
                <th className="ps-4 py-3 text-center fw-semibold">Item</th>
                <th className="py-3 fw-semibold">Producto</th>
                <th className="py-3 fw-semibold">Ingredientes</th>
                <th className="py-3 text-center fw-semibold">Cantidad Usada</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedConsumo || {}).map(([producto, detalles], index) => (
                <React.Fragment key={producto}>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <td className="ps-4 text-center">
                      <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                        {index + 1}
                      </span>
                    </td>
                    <td colSpan="2">
                      <span className="fw-bold">{producto}</span>
                    </td>
                    <td></td>
                  </tr>
                  {detalles.map((detalle, subIndex) => (
                    <TableRow key={`${producto}-${subIndex}`} detalle={detalle} subIndex={subIndex} />
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Card para mostrar el total por ingrediente */}
      <Card className="shadow-lg border-0 mb-5" style={{ borderRadius: "15px" }}>
        <Card.Body className="p-4">
          <h5 className="mb-4 fw-bold text-primary">Resumen de Ingredientes Usados</h5>
          <Row>
            {Object.entries(totalPorIngrediente || {}).map(([ingrediente, { cantidad, unidad }]) => (
              <Col key={ingrediente} md={4} className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-medium">{ingrediente}</span>
                  <span className="fw-bold">
                    {cantidad.toFixed(2)} {unidad}
                  </span>
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

// Componente DesktopHeader (copiado desde DesktopOrderDetails)
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
                    : "Venta Cerrada"}
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

// Componente TableRow para mostrar los detalles de los ingredientes
const TableRow = ({ detalle, subIndex }) => {
  return (
    <tr className="align-middle" style={{ backgroundColor: "white", borderBottom: "2px solid #f1f1f1" }}>
      <td></td>
      <td></td>
      <td className="ps-4">
        <span className="text-muted">{detalle.Ingrediente}</span>
      </td>
      <td className="text-center">
        <span className="fw-bold">
          {detalle.CantidadUsada} {detalle.UnidadMedida}
        </span>
      </td>
    </tr>
  );
};

export default DesktopMateriaPrimaDetails;