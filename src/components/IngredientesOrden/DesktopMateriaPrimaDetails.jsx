import React from "react";
import { Badge, Card, Col, Container, Row, Table } from "react-bootstrap";
import DownloadDropdown from "../DownloadDropdown/DownloadDropdown";
import { formatDateToDisplay } from "../../utils/dateUtils";

const DesktopMateriaPrimaDetails = ({ order, detalleConsumo, onDownloadXLS, onDownloadPDF }) => {
  const encabezado = order?.encabezadoOrden;
  const detalleOrden = order.detalleOrden;
  
  // Filtrar productos por tipo de producción
  const prodBandejas = detalleOrden?.filter(item => item.tipoProduccion === "bandejas") || [];
  const prodHarina = detalleOrden?.filter(item => item.tipoProduccion === "harina") || [];

  // Agrupar los detalles de consumo por producto
  const groupedConsumo = detalleConsumo?.reduce((acc, item) => {
    if (!acc[item.Producto]) {
      acc[item.Producto] = [];
    }
    acc[item.Producto].push(item);
    return acc;
  }, {});

  // Agregar los productos de harina al consumo
  prodHarina?.forEach(producto => {
    if (!groupedConsumo[producto.nombreProducto]) {
      groupedConsumo[producto.nombreProducto] = [];
    }
    groupedConsumo[producto.nombreProducto].push({
      Producto: producto.nombreProducto,
      Ingrediente: "Harina",
      CantidadUsada: producto.cantidadHarina,
      UnidadMedida: "Lb"
    });
  });

  // Calcular el total de la cantidad usada por ingrediente
  const totalPorIngrediente = detalleConsumo?.reduce((acc, item) => {
    if (!acc[item.Ingrediente]) {
      acc[item.Ingrediente] = { cantidad: 0, unidad: item.UnidadMedida };
    }
    acc[item.Ingrediente].cantidad += parseFloat(item.CantidadUsada) || 0;
    return acc;
  }, {});

  // Calcular total de harina de ingredientes (de detalleConsumo)
  const totalHarinaIngredientes = detalleConsumo?.reduce((total, item) => {
    return item.Ingrediente.toLowerCase().includes('harina') ? 
           total + (parseFloat(item.CantidadUsada) || 0) : total;
  }, 0) || 0;

  // Calcular total de harina de productos por harina
  const totalHarinaProductos = prodHarina.reduce((total, producto) => {
    return total + (parseFloat(producto.cantidadHarina) || 0);
  }, 0) || 0;

  // Total general de harina
  const totalGeneralHarina = totalHarinaIngredientes + totalHarinaProductos;

  return (
    <Container fluid>
      <DesktopHeader
        encabezado={encabezado}
        onDownloadXLS={onDownloadXLS}
        onDownloadPDF={onDownloadPDF}
      />
      
      {/* Tabla de consumo de materia prima */}
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

      {/* Resumen de productos por bandejas */}
      {/* {prodBandejas.length > 0 && (
        <Card className="shadow-lg border-0 mb-4" style={{ borderRadius: "15px" }}>
          <Card.Body className="p-4">
            <h5 className="mb-3 fw-bold text-primary">Productos Solicitados por Bandejas</h5>
            <Table hover>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="text-center">Bandejas</th>
                  <th className="text-center">Unidades</th>
                </tr>
              </thead>
              <tbody>
                {prodBandejas.map((producto, index) => (
                  <tr key={index}>
                    <td>{producto.nombreProducto}</td>
                    <td className="text-center fw-bold">{producto.cantidadBandejas}</td>
                    <td className="text-center">{producto.cantidadUnidades.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card> */}
      {/* )} */}

      {/* Resumen de harina */}
      <Card className="shadow-lg border-0 mb-5" style={{ borderRadius: "15px" }}>
        <Card.Body className="p-4">
          <h5 className="mb-4 fw-bold text-primary">Resumen de Harina</h5>
          
          <Row className="mb-4">
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <h6 className="fw-bold text-center mb-3">Productos Solicitados por bandejas</h6>
                  <div className="text-center">
                  <span className="fw-bold h4">{Math.round(totalHarinaIngredientes.toFixed(2))} Lb</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <h6 className="fw-bold text-center mb-3">Productos Solicitados por harina</h6>
                  <div className="text-center">
                  <span className="fw-bold h4">{Math.round(totalHarinaProductos.toFixed(2))} Lb</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Total general */}
          <div className="mt-3 pt-3 border-top">
            <Row>
              <Col md={12}>
                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                  <span className="fw-bold h5">TOTAL GENERAL DE HARINA:</span>
                  <span className="fw-bold h4 text-danger">
                    {Math.round(totalGeneralHarina.toFixed(2))} Lb
                  </span>
                </div>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

// Componente DesktopHeader
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
          {detalle.CantidadUsada.toFixed(2)} {detalle.UnidadMedida}
        </span>
      </td>
    </tr>
  );
};

export default DesktopMateriaPrimaDetails;