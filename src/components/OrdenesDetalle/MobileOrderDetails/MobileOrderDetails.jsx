import React, { useState, useEffect } from "react";
import { Badge, Card, Button, Dropdown } from "react-bootstrap";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import { BsArrowUp, BsBuildingAdd, BsCalendar2, BsClipboardCheckFill, BsCloudCheckFill, BsDownload, BsFileEarmarkExcel, BsFileEarmarkPdf, BsPersonAdd, BsPersonBadgeFill } from "react-icons/bs";

const MobileOrderDetails = ({ order, onDownloadXLS, onDownloadPDF }) => {
  const encabezado = order?.encabezadoOrden;
  const detalles = order?.detalleOrden;

  const formatCurrency = (value) => {
    return `Q ${parseFloat(value).toFixed(2)}`;
  };

  const [showScrollButton, setShowScrollButton] = useState(false);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <Card
        className="p-3 border-0 rounded-4"
        style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }} // Fondo blanco con sombra
      >
        <Card.Body className="px-2">
          {/* Encabezado */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <Card.Title className="h4 mb-1 text-dark">
                Orden #{encabezado?.idOrdenProduccion}
              </Card.Title>
              <small className="text-secondary fw-bold">
                Detalles de producción
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
                <BsCalendar2 size={16} className="me-2" style={{ color: "#FF6B6B" }} /> {/* Ícono de calendario en rojo coral */}
                Fecha a producir:
              </span>
              <span className="fw-medium text-dark fw-bold">
                {formatDateToDisplay(encabezado?.fechaAProducir)}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary">
                <BsBuildingAdd size={16} className="me-2" style={{ color: "#4ECDC4" }} /> {/* Ícono de sucursal en turquesa */}
                Sucursal:
              </span>
              <span className="fw-medium text-dark text-end fw-bold" style={{ maxWidth: "60%" }}>
                {encabezado?.nombreSucursal}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary">
                <BsPersonAdd size={16} className="me-2" style={{ color: "#FF6B6B" }} /> {/* Ícono de usuario en rojo coral */}
                Solicitado por:
              </span>
              <span className="fw-medium text-dark fw-bold">{encabezado?.nombreUsuario}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary">
                <BsPersonBadgeFill size={16} className="me-2" style={{ color: "#4ECDC4" }} /> {/* Ícono de panadero en turquesa */}
                Panadero:
              </span>
              <span className="fw-medium text-dark fw-bold">{encabezado?.nombrePanadero}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-secondary">
                <BsCloudCheckFill size={16} className="me-2" style={{ color: "#FF6B6B" }} /> {/* Ícono de turno en rojo coral */}
                Turno:
              </span>
              <span className="fw-medium text-dark fw-bold">{encabezado?.ordenTurno}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-secondary">
                <BsClipboardCheckFill size={16} className="me-2" style={{ color: "#4ECDC4" }} /> {/* Ícono de estado en turquesa */}
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

          {/* Productos */}
          <h6 className="mb-3 text-uppercase text-secondary" style={{ color: "#556270" }}>Productos</h6>
          {detalles?.map((prod, index) => (
            <ProductCardMobile key={prod.idDetalleOrdenProduccion} product={prod} index={index} />
          ))}
        </Card.Body>
      </Card>

      {/* Botón de flecha para volver arriba */}
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
          <BsArrowUp size={20} /> {/* Ahora BsArrowUp está importado correctamente */}
        </button>
      )}
    </>
  );
};

const ProductCardMobile = ({ product, index }) => {
  return (
    <Card
      className="mb-3 border-0 rounded-3 shadow-sm"
      style={{ backgroundColor: "#FFF3E0" }} // Fondo naranja pastel suave
    >
      <Card.Body className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge rounded-pill" style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}># {index + 1}</span> {/* Badge en rojo coral */}
          <span className="h6 mb-0 text-dark">{product.nombreProducto}</span>
        </div>

        <div className="d-flex justify-content-between small">
          <div className="text-center">
            <div className="text-secondary">Bandejas</div>
            <div className="fw-bold text-dark">{product.cantidadBandejas}</div>
          </div>
          <div className="text-center">
            <div className="text-secondary">Unidades</div>
            <div className="fw-bold text-dark">{product.cantidadUnidades.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-secondary">Categoria</div>
            <div className="fw-bold text-success">
              {product.nombreCategoria}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MobileOrderDetails;