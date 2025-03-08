import React, { useState, useEffect } from "react";
import { Badge, Card, Button, Dropdown } from "react-bootstrap";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import { BsCash, BsWallet, BsDashCircle, BsArrowUp, BsDownload, BsFileEarmarkPdf, BsFileEarmarkExcel, BsCalendar, BsShop, BsPerson, BsClock, BsClipboardCheck, BsBox, BsWallet2 } from "react-icons/bs";
import { useMediaQuery } from "react-responsive"; // Importamos useMediaQuery

const MobileVentaDetalle = ({ venta, onDownloadXLS, onDownloadPDF }) => {
  const encabezadoVenta = venta?.encabezadoVenta;
  const detallesVenta = venta?.detalleVenta;
  const detalleIngresos = venta?.detalleIngresos;

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
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Usamos useMediaQuery para detectar pantallas pequeñas
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });

  return (
    <>
      <Card
        className="p-3 border-0 rounded-4"
        style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", fontFamily: "'Consolas', monospace" }} // Fondo blanco con sombra y fuente tipo consola
      >
        <Card.Body className="px-2">
          {/* Encabezado */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <Card.Title className="h4 mb-1 text-dark">
                <BsBox size={24} className="me-2" style={{ color: "#FF6B6B" }} /> {/* Ícono de caja */}
                Venta #{encabezadoVenta?.idVenta}
              </Card.Title>
              <small className="text-secondary">Detalles de la venta</small>
            </div>
            {/* Menú desplegable para descargas */}
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-dark"
                className="rounded-circle p-2"
                id="dropdown-download"
              >
                <BsDownload size={20} />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={onDownloadPDF}>
                  <div className="d-flex align-items-center gap-2">
                    <BsFileEarmarkPdf size={16} className="text-danger" />
                    <span>Descargar PDF</span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item onClick={onDownloadXLS}>
                  <div className="d-flex align-items-center gap-2">
                    <BsFileEarmarkExcel size={16} className="text-success" />
                    <span>Descargar Excel</span>
                  </div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Información de la Venta */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary d-flex align-items-center gap-2">
                <BsCalendar size={16} style={{ color: "#4ECDC4" }} /> {/* Ícono de calendario */}
                Fecha de Venta:
              </span>
              <span className="fw-medium text-dark fw-bold">
                {formatDateToDisplay(encabezadoVenta?.fechaVenta)}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary d-flex align-items-center gap-2">
                <BsShop size={16} style={{ color: "#4ECDC4" }} /> {/* Ícono de sucursal */}
                Sucursal:
              </span>
              <span className="fw-medium text-dark text-end fw-bold" style={{ maxWidth: "60%" }}>
                {encabezadoVenta?.nombreSucursal}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary d-flex align-items-center gap-2">
                <BsPerson size={16} style={{ color: "#4ECDC4" }} /> {/* Ícono de usuario */}
                Usuario:
              </span>
              <span className="fw-medium text-dark fw-bold">{`@${encabezadoVenta?.usuario}`}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary d-flex align-items-center gap-2">
                <BsClock size={16} style={{ color: "#4ECDC4" }} /> {/* Ícono de turno */}
                Turno:
              </span>
              <span className="fw-medium text-dark fw-bold">
                {encabezadoVenta?.ordenTurno || "N/A"}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-secondary d-flex align-items-center gap-2">
                <BsClipboardCheck size={16} style={{ color: "#4ECDC4" }} /> {/* Ícono de estado */}
                Estado:
              </span>
              <Badge
                bg={encabezadoVenta?.estadoVenta === "C" ? "success" : "danger"}
                className="px-2 py-1"
                style={{ backgroundColor: encabezadoVenta?.estadoVenta === "C" ? "#4ECDC4" : "#FF6B6B" }} // Turquesa para cerrada, rojo coral para pendiente
              >
                {encabezadoVenta?.estadoVenta === "C" ? "Cerrada" : "Pendiente"}
              </Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-secondary d-flex align-items-center gap-2">
                <BsCash size={16} style={{ color: "#4ECDC4" }} /> {/* Ícono de efectivo */}
                Venta Ingresada:
              </span>
              <span className="fw-medium text-dark">
                {formatCurrency(encabezadoVenta?.totalVenta)}
              </span>
            </div>
          </div>

          {/* Productos Vendidos */}
          <h6 className="mb-3 text-uppercase text-secondary">Productos Vendidos</h6>
          {detallesVenta?.map((prod, index) => (
            <ProductCardMobile key={prod.idDetalleVenta} product={prod} index={index} />
          ))}

          {/* Balance */}
          <h6 className="mb-3 text-uppercase text-secondary mt-4">Balance</h6>
          <Card
            className="mb-3 border-0 rounded-3"
            style={{ backgroundColor: "rgba(230, 230, 250, 0.7)" }} // Fondo morado translúcido
          >
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary d-flex align-items-center gap-1" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "50%" }}>
                  <BsCash size={16} style={{ color: "#4ECDC4" }} /> M. Esperado
                </span>
                <span className="fw-bold text-dark" style={{ fontSize: isSmallScreen ? "0.875rem" : "1rem" }}>
                  {formatCurrency(detalleIngresos?.montoEsperado)}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary d-flex align-items-center gap-1" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "50%" }}>
                <BsCash size={16} style={{ color: "#4ECDC4" }} /> M. Ingresado
                </span>
                <span className="fw-bold text-dark" style={{ fontSize: isSmallScreen ? "0.875rem" : "1rem" }}>
                  {formatCurrency(detalleIngresos?.montoTotalIngresado)}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-secondary d-flex align-items-center gap-2">
                  <BsDashCircle size={16} className="text-danger" /> Diferencia
                </span>
                <span className="fw-bold">
                  <Badge
                    bg={detalleIngresos?.diferencia >= 0 ? "success" : "danger"}
                    className="px-2 py-1"
                    style={{ backgroundColor: detalleIngresos?.diferencia >= 0 ? "#4ECDC4" : "#FF6B6B" }} // Turquesa para positivo, rojo coral para negativo
                  >
                    {formatCurrency(detalleIngresos?.diferencia)}
                  </Badge>
                </span>
              </div>
            </Card.Body>
          </Card>
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
          <BsArrowUp size={20} />
        </button>
      )}
    </>
  );
};

const ProductCardMobile = ({ product, index }) => {
  return (
    <Card
      className="mb-3 border-0 rounded-3"
      style={{ backgroundColor: "rgba(230, 230, 250, 0.7)" }} // Fondo morado translúcido
    >
      <Card.Body className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge rounded-pill" style={{ backgroundColor: "#4ECDC4", color: "#FFFFFF" }}># {index + 1}</span> {/* Badge en turquesa */}
          <span className="h6 mb-0 text-dark">{product.nombreProducto}</span>
        </div>

        <div className="d-flex justify-content-between small">
          <div className="text-center">
            <div className="text-secondary">C/Vendida</div>
            <div className="fw-bold text-dark">{product.cantidadVendida}</div>
          </div>
          <div className="text-center">
            <div className="text-secondary">P/Unitario</div>
            <div className="fw-bold text-dark">{`Q ${product.precioUnitario.toFixed(2)}`}</div>
          </div>
          <div className="text-center">
            <div className="text-secondary text-nowrap">Total</div>
            <div className="fw-bold text-success">
              {`Q ${(product.cantidadVendida * product.precioUnitario).toFixed(2)}`}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MobileVentaDetalle;