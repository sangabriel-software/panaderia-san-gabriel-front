import React, { useState, useEffect } from "react";
import { Badge, Card, Button, Dropdown } from "react-bootstrap";
import { formatDateToDisplay } from "../../utils/dateUtils";
import { BsBox, BsClipboard, BsCalendar, BsDownload, BsFileEarmarkPdf, BsFileEarmarkExcel, BsPerson, BsClock, BsPersonBadge, BsClipboardCheck, BsBuilding, BsArrowUp } from "react-icons/bs";

const MobileMateriaPrimaDetails = ({ order, detalleConsumo, onDownloadXLS, onDownloadPDF }) => {
  const encabezado = order?.encabezadoOrden;
  const detalleOrden = order.detalleOrden;
  
  // Filtrar productos por tipo de producción
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

  // Calcular total de harina de ingredientes (con decimales)
  const totalHarinaIngredientes = detalleConsumo?.reduce((total, item) => {
    return item.Ingrediente.toLowerCase().includes('harina') ? 
           total + (parseFloat(item.CantidadUsada) || 0) : total;
  }, 0) || 0;

  // Calcular total de harina de productos (con decimales)
  const totalHarinaProductos = prodHarina.reduce((total, producto) => {
    return total + (parseFloat(producto.cantidadHarina) || 0);
  }, 0) || 0;

  // Total general de harina (redondeado)
  const totalGeneralHarina = Math.round(totalHarinaIngredientes + totalHarinaProductos);

  // Calcular el total de la cantidad usada por ingrediente (con decimales)
  const totalPorIngrediente = detalleConsumo?.reduce((acc, item) => {
    if (!acc[item.Ingrediente]) {
      acc[item.Ingrediente] = { cantidad: 0, unidad: item.UnidadMedida };
    }
    acc[item.Ingrediente].cantidad += (parseFloat(item.CantidadUsada) || 0);
    return acc;
  }, {});

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

          {/* Resumen de Harina */}
          <div className="mt-4">
            <h6 className="mb-3 text-uppercase text-secondary" style={{ color: "#556270" }}>Resumen de Harina</h6>
            
            <Card className="mb-3 border-0 rounded-3 shadow-sm" style={{ backgroundColor: "#E8F5E9" }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span><strong>Harina bandejas solicitadas:</strong></span>
                  <span className="fw-bold">{Math.round(totalHarinaIngredientes.toFixed(2))} Lb</span>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-3 border-0 rounded-3 shadow-sm" style={{ backgroundColor: "#E8F5E9" }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span><strong> Harina libras solicitadas:</strong></span>
                  <span className="fw-bold">{Math.round(totalHarinaProductos.toFixed(2))} Lb</span>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 rounded-3 shadow-sm" style={{ backgroundColor: "#FFEBEE" }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Total harina:</span>
                  <span className="fw-bold text-danger">{totalGeneralHarina} Lb</span>
                </div>
              </Card.Body>
            </Card>
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
          <BsArrowUp size={20} />
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
            <div className="fw-bold text-dark">{parseFloat(detalle.CantidadUsada).toFixed(2)}</div>
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