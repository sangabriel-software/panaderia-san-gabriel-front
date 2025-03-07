import React, { useState, useEffect } from "react";
import { Badge, Card, Button, Dropdown } from "react-bootstrap";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import { BsCash, BsWallet, BsDashCircle, BsArrowUp, BsDownload, BsFileEarmarkPdf, BsFileEarmarkExcel } from "react-icons/bs";

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

  return (
    <>
      <Card
        className="p-3 border-0 rounded-4"
        style={{ backgroundColor: "rgba(245, 245, 245, 0.9)" }} // Fondo translúcido
      >
        <Card.Body className="px-2">
          {/* Encabezado */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <Card.Title className="h4 mb-1 text-dark">
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
              <span className="text-secondary">Fecha de Venta:</span>
              <span className="fw-medium text-dark">
                {formatDateToDisplay(encabezadoVenta?.fechaVenta)}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary">Sucursal:</span>
              <span className="fw-medium text-dark text-end" style={{ maxWidth: "60%" }}>
                {encabezadoVenta?.nombreSucursal}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary">Usuario:</span>
              <span className="fw-medium text-dark">{`@${encabezadoVenta?.usuario}`}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary">Turno:</span>
              <span className="fw-medium text-dark">
                {encabezadoVenta?.ordenTurno || "N/A"}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-secondary">Estado:</span>
              <Badge
                bg={encabezadoVenta?.estadoVenta === "C" ? "success" : "danger"}
                className="px-2 py-1"
              >
                {encabezadoVenta?.estadoVenta === "C" ? "Cerrada" : "Pendiente"}
              </Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-secondary">Venta Ingresada:</span>
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
                <span className="text-secondary d-flex align-items-center gap-2">
                  <BsCash size={16} /> Monto Esperado
                </span>
                <span className="fw-bold text-dark">
                  {formatCurrency(detalleIngresos?.montoEsperado)}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary d-flex align-items-center gap-2">
                  <BsWallet size={16} /> Monto Ingresado
                </span>
                <span className="fw-bold text-dark">
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
          <span className="badge bg-dark rounded-pill"># {index + 1}</span>
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