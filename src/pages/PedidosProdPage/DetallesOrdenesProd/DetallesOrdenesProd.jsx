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
            <Title title="ORDEN-1" />
          </div>
        </div>
      </div>
      {isMobile ? (
        // Vista móvil: Diseño en tarjetas
        
        <Card className="p-3 shadow-lg border-0 rounded-4" style={{ backgroundColor: '#f8f9fa' }}>
        <Card.Body className="px-2">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <Card.Title className="h4 mb-1 text-primary">Orden #{orden.id}</Card.Title>
              <small className="text-muted">Detalles de producción</small>
            </div>
            <DownloadDropdown
              onDownloadXLS={handleDownloadXLS}
              onDownloadPDF={handleDownloadPDF}
              variant="outline-primary"
            />
          </div>
    
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-muted">Fecha:</span>
              <span className="fw-medium">{orden.fecha}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-muted">Sucursal:</span>
              <span className="fw-medium text-end" style={{ maxWidth: '60%' }}>{orden.sucursal}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-muted">Realizada por:</span>
              <span className="fw-medium">{orden.realizadaPor}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-muted">Encargado:</span>
              <span className="fw-medium">{orden.encargado}</span>
            </div>
          </div>
    
          <h6 className="mb-3 text-uppercase text-muted">Productos</h6>
          
          {orden.productos.map((prod) => (
            <Card 
              key={prod.item} 
              className="mb-3 border-0 rounded-3 shadow-sm"
              style={{ backgroundColor: 'rgba(0,123,255,0.05)' }}
            >
              <Card.Body className="py-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-primary rounded-pill"># {prod.item}</span>
                  <span className="h6 mb-0 text-primary">{prod.producto}</span>
                </div>
                
                <div className="d-flex justify-content-between small">
                  <div className="text-center">
                    <div className="text-muted">Bandejas</div>
                    <div className="fw-bold">{prod.bandejas}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted">Unidades</div>
                    <div className="fw-bold">{prod.unidades.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted">Venta</div>
                    <div className="fw-bold text-success">
                      ${prod.ventaEstimada.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
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
              <Table
                hover
                responsive
                bordered
                className="shadow-lg rounded"
                style={{ minWidth: "800px" }}
              >
                <thead className="table-dark">
                  <tr>
                    <th className="text-center align-middle">#</th>
                    <th className="align-middle">Producto</th>
                    <th className="text-center align-middle">Bandejas</th>
                    <th className="text-center align-middle">Unidades</th>
                    <th className="text-end align-middle">Venta Estimada</th>
                  </tr>
                </thead>
                <tbody>
                  {orden.productos.map((prod) => (
                    <tr
                      key={prod.item}
                      className={prod.item % 2 === 0 ? "table-secondary" : ""}
                    >
                      <td className="text-center fw-bold">{prod.item}</td>
                      <td className="fw-medium">{prod.producto}</td>
                      <td className="text-center">{prod.bandejas}</td>
                      <td className="text-center">
                        {prod.unidades.toLocaleString()}
                      </td>
                      <td className="text-end text-success fw-bold">
                        $
                        {prod.ventaEstimada.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </td>
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
