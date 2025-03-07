import React, { useState, useEffect } from "react";
import { Badge, Card } from "react-bootstrap";
import DownloadDropdown from "../../DownloadDropdown/DownloadDropdown";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import { BsCash, BsWallet, BsDashCircle, BsArrowUp } from "react-icons/bs";

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
      <Card className="p-3 shadow-lg border-0 rounded-4" style={{ backgroundColor: "#f8f9fa" }}>
        <Card.Body className="px-2">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <Card.Title className="h4 mb-1 text-primary">
                Venta #{encabezadoVenta?.idVenta}
              </Card.Title>
              <small className="text-muted">Detalles de la venta</small>
            </div>
            <DownloadDropdown
              onDownloadXLS={onDownloadXLS}
              onDownloadPDF={onDownloadPDF}
              variant="outline-primary"
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-muted">Fecha de Venta:</span>
              <span className="fw-medium">{formatDateToDisplay(encabezadoVenta?.fechaVenta)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-muted">Sucursal:</span>
              <span className="fw-medium text-end" style={{ maxWidth: "60%" }}>
                {encabezadoVenta?.nombreSucursal}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-muted">Usuario:</span>
              <span className="fw-medium">{`@${encabezadoVenta?.usuario}`}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-muted">Turno:</span>
              <span className="fw-medium">{encabezadoVenta?.ordenTurno || "N/A"}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-muted">Estado:</span>
              <Badge
                bg={encabezadoVenta?.estadoVenta === "C" ? "success" : "danger"}
                className="px-1 py-1"
              >
                {encabezadoVenta?.estadoVenta === "C" ? "Cerrada" : "Pendiente"}
              </Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-muted">Venta Ingresada:</span>
              <span className="fw-medium">
                <Badge bg="primary" className="px-2 py-1">
                  {formatCurrency(encabezadoVenta?.totalVenta)}
                </Badge>
              </span>
            </div>
          </div>

          <h6 className="mb-3 text-uppercase text-muted">Productos Vendidos</h6>
          {detallesVenta?.map((prod, index) => (
            <ProductCardMobile key={prod.idDetalleVenta} product={prod} index={index} />
          ))}

          <h6 className="mb-3 text-uppercase text-muted mt-4">Balance</h6>
          <Card className="mb-3 border-0 rounded-3 shadow-sm" style={{ backgroundColor: "rgba(0,123,255,0.05)" }}>
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted d-flex align-items-center gap-2">
                  <BsCash size={16} /> Monto Esperado
                </span>
                <span className="fw-bold">{formatCurrency(detalleIngresos?.montoEsperado)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted d-flex align-items-center gap-2">
                  <BsWallet size={16} /> Monto Ingresado
                </span>
                <span className="fw-bold">{formatCurrency(detalleIngresos?.montoTotalIngresado)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted d-flex align-items-center gap-2">
                  <BsDashCircle size={16} /> Diferencia
                </span>
                <span className="fw-bold">
                  <Badge bg={detalleIngresos?.diferencia >= 0 ? "success" : "danger"} className="px-2 py-1">
                    {formatCurrency(detalleIngresos?.diferencia)}
                  </Badge>
                </span>
              </div>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="btn btn-primary rounded-circle shadow"
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
    <Card className="mb-3 border-0 rounded-3 shadow-sm" style={{ backgroundColor: "rgba(0,123,255,0.05)" }}>
      <Card.Body className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-primary rounded-pill"># {index + 1}</span>
          <span className="h6 mb-0 text-primary">{product.nombreProducto}</span>
        </div>

        <div className="d-flex justify-content-between small">
          <div className="text-center">
            <div className="text-muted text-nowrap">Cantidad Vendida</div>
            <div className="fw-bold">{product.cantidadVendida}</div>
          </div>
          <div className="text-center">
            <div className="text-muted text-nowrap">Precio Unitario</div>
            <div className="fw-bold">{`Q ${product.precioUnitario.toFixed(2)}`}</div>
          </div>
          <div className="text-center">
            <div className="text-muted text-nowrap">Total</div>
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