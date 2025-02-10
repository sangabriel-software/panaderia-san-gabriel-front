import React from "react";
import { Container, Row, Col, Table, Card } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import DownloadDropdown from "../../../components/DownloadDropdown/DownloadDropdown";
import { BsArrowLeft } from "react-icons/bs";

import { useNavigate } from "react-router";
import Title from "../../../components/Title/Title";

const DetallesOrdenesProduccionPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Funciones para el manejo de la descarga
  const handleDownloadXLS = () => {
    console.log("Descargando XLS...");
    // Aquí iría la lógica para descargar XLS
  };

  const handleDownloadPDF = () => {
    console.log("Descargando PDF...");
    // Aquí iría la lógica para descargar PDF
  };

  const orden = {
    id: "ORD-1",
    fecha: "07/02/2025",
    sucursal: "San Miguel Dueñas",
    realizadaPor: "Angel Garcia",
    encargado: "Juan Gomez",
    productos: [
      {
        item: 1,
        producto: "Francés",
        bandejas: 40,
        unidades: 2000,
        ventaEstimada: 666.6,
      },
      {
        item: 2,
        producto: "Baguette",
        bandejas: 20,
        unidades: 1000,
        ventaEstimada: 333.3,
      },
      {
        item: 3,
        producto: "Integral",
        bandejas: 30,
        unidades: 1500,
        ventaEstimada: 500.0,
      },
      {
        item: 3,
        producto: "Integral",
        bandejas: 30,
        unidades: 1500,
        ventaEstimada: 500.0,
      },
      {
        item: 3,
        producto: "Integral",
        bandejas: 30,
        unidades: 1500,
        ventaEstimada: 500.0,
      },
      {
        item: 3,
        producto: "Integral",
        bandejas: 30,
        unidades: 1500,
        ventaEstimada: 500.0,
      },
      {
        item: 3,
        producto: "Integral",
        bandejas: 30,
        unidades: 1500,
        ventaEstimada: 500.0,
      },
      {
        item: 3,
        producto: "Integral",
        bandejas: 30,
        unidades: 1500,
        ventaEstimada: 500.0,
      },
      {
        item: 3,
        producto: "Integral",
        bandejas: 30,
        unidades: 1500,
        ventaEstimada: 500.0,
      },
      {
        item: 3,
        producto: "Integral",
        bandejas: 30,
        unidades: 1500,
        ventaEstimada: 500.0,
      },
    ],
  };

  return (
    <Container className="mt-4">
      <div className="text-center">
        <div className="row">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/ordenes-produccion")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <Title
              title="ORDEN-1"
            />
          </div>
        </div>
      </div>
      {isMobile ? (
        // Vista móvil: Diseño en tarjetas
        <Card className="p-3 shadow">
          <Card.Body>
            <Card.Title>Orden #{orden.id}</Card.Title>
            <Card.Text>
              <strong>Fecha:</strong> {orden.fecha}
              <br />
              <strong>Sucursal:</strong> {orden.sucursal}
              <br />
              <strong>Realizada por:</strong> {orden.realizadaPor}
              <br />
              <strong>Encargado:</strong> {orden.encargado}
            </Card.Text>
            {/* DownloadDropdown colocado encima del primer producto */}
            <DownloadDropdown
              onDownloadXLS={handleDownloadXLS}
              onDownloadPDF={handleDownloadPDF}
            />
            {orden.productos.map((prod) => (
              <Card key={prod.item} className="mb-2 p-2 shadow-sm">
                <Card.Body>
                  <Card.Title>Producto: {prod.producto}</Card.Title>
                  <Card.Text>
                    <strong>Bandejas:</strong> {prod.bandejas}
                    <br />
                    <strong>Unidades:</strong> {prod.unidades}
                    <br />
                    <strong>Venta Estimada:</strong> $
                    {prod.ventaEstimada.toFixed(2)}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
          </Card.Body>
        </Card>
      ) : (
        // Vista de escritorio: Información en dos columnas y tabla de productos
        <Container fluid>
          <Row className="my-3">
            <Col md={6}>
              <p>
                <strong>Fecha a producir:</strong> {orden.fecha}
              </p>
              <p>
                <strong>Sucursal:</strong> {orden.sucursal}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Orden realizada por:</strong> {orden.realizadaPor}
              </p>
              <p>
                <strong>Panadero Encargado:</strong> {orden.encargado}
              </p>
            </Col>
          </Row>
          {/* Fila con el DownloadDropdown en la esquina superior izquierda */}
          <Row className="mb-3">
            <Col md={6}>
              <DownloadDropdown
                onDownloadXLS={handleDownloadXLS}
                onDownloadPDF={handleDownloadPDF}
              />
            </Col>
          </Row>
          <Row className="my-4">
            <Col>
              <Table responsive bordered hover>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Producto</th>
                    <th>Bandejas</th>
                    <th>Unidades</th>
                    <th>Venta Estimada</th>
                  </tr>
                </thead>
                <tbody>
                  {orden.productos.map((prod) => (
                    <tr key={prod.item}>
                      <td>{prod.item}</td>
                      <td>{prod.producto}</td>
                      <td>{prod.bandejas}</td>
                      <td>{prod.unidades}</td>
                      <td>${prod.ventaEstimada.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Container>
      )}
    </Container>
  );
};

export default DetallesOrdenesProduccionPage;
