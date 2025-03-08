import React, { useState, useEffect } from "react"; // Importamos useState y useEffect
import { Badge, Card, Button, Dropdown } from "react-bootstrap";
import { formatDateToDisplay } from "../../utils/dateUtils";
import { BsBox, BsClipboard, BsCalendar, BsDownload, BsFileEarmarkPdf, BsFileEarmarkExcel, BsPerson, BsClock, BsPersonBadge, BsClipboardCheck, BsBuilding, BsArrowUp } from "react-icons/bs"; // Añadimos BsArrowUp

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

  // Estado para controlar la visibilidad del botón flotante
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Efecto para mostrar u ocultar el botón flotante según el scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Función para regresar al inicio de la página
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Desplazamiento suave
    });
  };

  return (
    <>
      <Card className="p-3 border-0 rounded-4" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
        <Card.Body className="px-2">
          {/* Encabezado */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <Card.Title className="h4 mb-1 text-dark">
                <BsBox size={24} className="text-primary me-2" style={{ color: "#FF6B6B" }} />
                Orden #{encabezado?.idOrdenProduccion}
              </Card.Title>
              <small className="text-secondary fw-bold">
                <BsClipboard size={16} className="me-2" style={{ color: "#4ECDC4" }} />
                Detalles de materia prima
              </small>
            </div>
            {/* Menú desplegable para descargas */}
            <Dropdown>
              <Dropdown.Toggle
                style={{ backgroundColor: "#4ECDC4", borderColor: "#4ECDC4", color: "#FFFFFF" }}
                className="rounded-circle p-2"
                id="dropdown-download"
              >
                <BsDownload size={20} />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={onDownloadPDF}>
                  <div className="d-flex align-items-center gap-2">
                    <BsFileEarmarkPdf size={16} className="text-danger" style={{ color: "#FF6B6B" }} />
                    <span>Descargar PDF</span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item onClick={onDownloadXLS}>
                  <div className="d-flex align-items-center gap-2">
                    <BsFileEarmarkExcel size={16} className="text-success" style={{ color: "#4ECDC4" }} />
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
                <BsCalendar size={16} className="me-2" style={{ color: "#FF6B6B" }} />
                Fecha a producir:
              </span>
              <span className="fw-medium text-dark fw-bold">
                {formatDateToDisplay(encabezado?.fechaAProducir)}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary">
                <BsBuilding size={16} className="me-2" style={{ color: "#4ECDC4" }} />
                Sucursal:
              </span>
              <span className="fw-medium text-dark text-end fw-bold" style={{ maxWidth: "60%" }}>
                {encabezado?.nombreSucursal}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary">
                <BsPerson size={16} className="me-2" style={{ color: "#FF6B6B" }} />
                Solicitado por:
              </span>
              <span className="fw-medium text-dark fw-bold">{encabezado?.nombreUsuario}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary">
                <BsPersonBadge size={16} className="me-2" style={{ color: "#4ECDC4" }} />
                Panadero:
              </span>
              <span className="fw-medium text-dark fw-bold">{encabezado?.nombrePanadero}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-secondary">
                <BsClock size={16} className="me-2" style={{ color: "#FF6B6B" }} />
                Turno:
              </span>
              <span className="fw-medium text-dark">{encabezado?.ordenTurno}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-secondary">
                <BsClipboardCheck size={16} className="me-2" style={{ color: "#4ECDC4" }} />
                Estado orden:
              </span>
              <Badge
                bg={encabezado?.estadoOrden === "P" ? "warning" : "success"}
                className="px-2 py-1"
                style={{ backgroundColor: encabezado?.estadoOrden === "P" ? "#FF6B6B" : "#4ECDC4" }}
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

      {/* Botón flotante para regresar al inicio */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="btn btn-dark rounded-circle shadow"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BsArrowUp size={20} /> {/* Ícono de flecha hacia arriba */}
        </button>
      )}
    </>
  );
};

const MateriaPrimaCardMobile = ({ detalle, index }) => {
  return (
    <Card className="mb-3 border-0 rounded-3 shadow-sm" style={{ backgroundColor: "#F8F9FA" }}>
      <Card.Body className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge rounded-pill" style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}># {index + 1}</span>
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