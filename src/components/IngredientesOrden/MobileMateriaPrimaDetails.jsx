import React from "react";
import { Badge, Card, Button, Dropdown } from "react-bootstrap";
import { formatDateToDisplay } from "../../utils/dateUtils";
import { BsBox, BsClipboard, BsCalendar, BsDownload, BsFileEarmarkPdf, BsFileEarmarkExcel, BsPerson, BsClock, BsPersonBadge, BsClipboardCheck, BsBuilding } from "react-icons/bs";

const MobileMateriaPrimaDetails = ({ order, detalleConsumo, onDownloadXLS, onDownloadPDF }) => {
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
    <Card className="p-3 border-0 rounded-4" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}> {/* Fondo blanco con sombra */}
      <Card.Body className="px-2">
        {/* Encabezado */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <Card.Title className="h4 mb-1 text-dark">
              <BsBox size={24} className="text-primary me-2" style={{ color: "#FF6B6B" }} /> {/* Ícono de caja en rojo coral */}
              Orden #{encabezado?.idOrdenProduccion}
            </Card.Title>
            <small className="text-secondary">
              <BsClipboard size={16} className="me-2" style={{ color: "#4ECDC4" }} /> {/* Ícono de clipboard en turquesa */}
              Detalles de materia prima
            </small>
          </div>
          {/* Menú desplegable para descargas */}
          <Dropdown>
            <Dropdown.Toggle
              style={{ backgroundColor: "#4ECDC4", borderColor: "#4ECDC4", color: "#FFFFFF" }} // Fondo turquesa, texto blanco
              className="rounded-circle p-2"
              id="dropdown-download"
            >
              <BsDownload size={20} />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={onDownloadPDF}>
                <div className="d-flex align-items-center gap-2">
                  <BsFileEarmarkPdf size={16} className="text-danger" style={{ color: "#FF6B6B" }} /> {/* Ícono PDF en rojo coral */}
                  <span>Descargar PDF</span>
                </div>
              </Dropdown.Item>
              <Dropdown.Item onClick={onDownloadXLS}>
                <div className="d-flex align-items-center gap-2">
                  <BsFileEarmarkExcel size={16} className="text-success" style={{ color: "#4ECDC4" }} /> {/* Ícono Excel en turquesa */}
                  <span>Descargar Excel</span>
                </div>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Información de la Orden */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span className="text-secondary">
              <BsCalendar size={16} className="me-2" style={{ color: "#FF6B6B" }} /> {/* Ícono de calendario en rojo coral */}
              Producción para Fecha:
            </span>
            <span className="fw-medium text-dark">
              {formatDateToDisplay(encabezado?.fechaAProducir)}
            </span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span className="text-secondary">
              <BsBuilding size={16} className="me-2" style={{ color: "#4ECDC4" }} /> {/* Ícono de sucursal en turquesa */}
              Sucursal:
            </span>
            <span className="fw-medium text-dark text-end" style={{ maxWidth: "60%" }}>
              {encabezado?.nombreSucursal}
            </span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span className="text-secondary">
              <BsPerson size={16} className="me-2" style={{ color: "#FF6B6B" }} /> {/* Ícono de usuario en rojo coral */}
              Solicitado por:
            </span>
            <span className="fw-medium text-dark">{encabezado?.nombreUsuario}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span className="text-secondary">
              <BsPersonBadge size={16} className="me-2" style={{ color: "#4ECDC4" }} /> {/* Ícono de panadero en turquesa */}
              Panadero:
            </span>
            <span className="fw-medium text-dark">{encabezado?.nombrePanadero}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2">
            <span className="text-secondary">
              <BsClock size={16} className="me-2" style={{ color: "#FF6B6B" }} /> {/* Ícono de turno en rojo coral */}
              Turno:
            </span>
            <span className="fw-medium text-dark">{encabezado?.ordenTurno}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2">
            <span className="text-secondary">
              <BsClipboardCheck size={16} className="me-2" style={{ color: "#4ECDC4" }} /> {/* Ícono de estado en turquesa */}
              Estado orden:
            </span>
            <Badge
              bg={encabezado?.estadoOrden === "P" ? "warning" : "success"}
              className="px-2 py-1"
              style={{ backgroundColor: encabezado?.estadoOrden === "P" ? "#FF6B6B" : "#4ECDC4" }} // Rojo coral para pendiente, turquesa para cerrada
            >
              {encabezado?.estadoOrden === "P" ? "Orden Pendiente" : "Orden Cerrada"}
            </Badge>
          </div>
        </div>

        {/* Materia Prima Utilizada */}
        <h6 className="mb-3 text-uppercase text-secondary" style={{ color: "#556270" }}>Materia Prima Utilizada</h6>
        {Object.entries(groupedConsumo || {}).map(([producto, detalles], index) => (
          <React.Fragment key={producto}>
            <div className="mb-3">
              <span className="fw-bold" style={{ color: "#556270" }}>{producto}</span>
            </div>
            {detalles.map((detalle, subIndex) => (
              <MateriaPrimaCardMobile key={`${producto}-${subIndex}`} detalle={detalle} index={subIndex} />
            ))}
          </React.Fragment>
        ))}

        {/* Resumen de Ingredientes Usados */}
        <div className="mt-4">
          <h6 className="mb-3 text-uppercase text-secondary" style={{ color: "#556270" }}>Resumen de Ingredientes Usados</h6>
          {Object.entries(totalPorIngrediente || {}).map(([ingrediente, { cantidad, unidad }]) => (
            <div key={ingrediente} className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-medium" style={{ color: "#556270" }}>{ingrediente}</span>
              <span className="fw-bold" style={{ color: "#4ECDC4" }}>
                {cantidad.toFixed(2)} {unidad}
              </span>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

const MateriaPrimaCardMobile = ({ detalle, index }) => {
  return (
    <Card className="mb-3 border-0 rounded-3 shadow-sm" style={{ backgroundColor: "#F8F9FA" }}> {/* Fondo gris claro */}
      <Card.Body className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge rounded-pill" style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}># {index + 1}</span> {/* Badge en rojo coral */}
          <span className="h6 mb-0 text-dark">{detalle.Ingrediente}</span>
        </div>

        <div className="d-flex justify-content-between small">
          <div className="text-center">
            <div className="text-secondary">Cantidad Usada</div>
            <div className="fw-bold text-dark">{detalle.CantidadUsada}</div>
          </div>
          <div className="text-center">
            <div className="text-secondary">Unidad</div>
            <div className="fw-bold text-dark">{detalle.UnidadMedida}</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MobileMateriaPrimaDetails;