import React from "react";
import { Badge, Card, Col, Container, Row, Table } from "react-bootstrap";
import DownloadDropdown from "../DownloadDropdown/DownloadDropdown";
import { formatDateToDisplay } from "../../utils/dateUtils";

const DesktopMateriaPrimaDetails = ({ order, onDownloadXLS, onDownloadPDF }) => {
  const encabezado = order?.encabezadoOrden;
  const detalles = order?.detalleMateriaPrima;

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
                <th className="py-3 fw-semibold">Materia Prima</th>
                <th className="py-3 text-center fw-semibold">Cantidad</th>
                <th className="py-3 text-center fw-semibold">Unidad</th>
              </tr>
            </thead>
            <tbody>
              {detalles?.map((mat, index) => (
                <TableRow key={mat.idMateriaPrima} materia={mat} index={index} />
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </Container>
  );
};

// Copia el componente DesktopHeader desde DesktopOrderDetails.js
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

const TableRow = ({ materia, index }) => {
  return (
    <tr className="align-middle" style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white", borderBottom: "2px solid #f1f1f1" }}>
      <td className="ps-4 text-center">
        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">{index + 1}</span>
      </td>
      <td>
        <div className="d-flex align-items-center gap-3">
          <span className="fw-medium">{materia.nombreMateriaPrima}</span>
        </div>
      </td>
      <td className="text-center fw-bold text-primary">{materia.cantidad}</td>
      <td className="text-center">
        <span className="badge bg-secondary bg-opacity-10 text-dark rounded-pill px-3 py-2">{materia.unidad}</span>
      </td>
    </tr>
  );
};

export default DesktopMateriaPrimaDetails;