import React, { useState } from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import { BsArrowLeft } from "react-icons/bs";
import { useNavigate, useParams } from "react-router";
import Title from "../../../components/Title/Title";
import MobileOrderDetails from "../../../components/OrdenesDetalle/MobileOrderDetails/MobileOrderDetails";
import DesktopOrderDetails from "../../../components/OrdenesDetalle/DesktopOrderDetails/DesktopOrderDetails";
import useGetDetalleOrden from "../../../hooks/ordenesproduccion/useGetDetalleOrden";
import { decryptId } from "../../../utils/CryptoParams";
import MobileMateriaPrimaDetails from "../../../components/IngredientesOrden/MobileMateriaPrimaDetails";
import DesktopMateriaPrimaDetails from "../../../components/IngredientesOrden/DesktopMateriaPrimaDetails";
import { useGetConsumoIngredientes } from "../../../hooks/consumoIngredientes/useGetConsumoIngredientes";
import { handleDownloadPDF } from "./DetallesOrdenesProdUtils";
import { generateOrderExcel } from "../../../utils/PdfUtils/ExcelUtils";

const DetallesOrdenesProduccionPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { idOrdenProduccion } = useParams();
  const decryptedIdRol = decryptId(decodeURIComponent(idOrdenProduccion));
  const { detalleOrden, loadingDetalleOrdene } = useGetDetalleOrden(decryptedIdRol);
  const { detalleConsumo } = useGetConsumoIngredientes(decryptedIdRol);
  const [view, setView] = useState("productos");

  const handleDownloadExcel = () => {
    const success = generateOrderExcel(
      decryptedIdRol, 
      detalleOrden.detalleOrden, 
      detalleConsumo, 
      detalleOrden.encabezadoOrden
    );

    if (!success) {
      alert("Error al generar el archivo Excel");
    }
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
            <Title title="Detalle" />
          </div>
        </div>
      </div>

      <Row className="mb-4">
        <Col className="d-flex justify-content-center col-6 col-md-3 pe-1">
          <Button
            variant={view === "productos" ? "primary" : "outline-primary"}
            onClick={() => setView("productos")}
            className="btn-sm w-100"
          >
            Detalle Productos
          </Button>
        </Col>
        <Col className="d-flex justify-content-center col-6 col-md-3 ps-1">
          <Button
            variant={view === "materiaPrima" ? "primary" : "outline-primary"}
            onClick={() => setView("materiaPrima")}
            className="btn-sm w-100"
          >
            Detalle Materia Prima
          </Button>
        </Col>
      </Row>

      {loadingDetalleOrdene ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : view === "productos" ? (
        isMobile ? (
          <MobileOrderDetails
            order={detalleOrden}
            onDownloadXLS={handleDownloadExcel}
            onDownloadPDF={() => handleDownloadPDF(decryptedIdRol, detalleOrden, detalleConsumo)}
          />
        ) : (
          <DesktopOrderDetails
            order={detalleOrden}
            detalleConsumo={detalleConsumo}
            onDownloadXLS={handleDownloadExcel}
            onDownloadPDF={() => handleDownloadPDF(decryptedIdRol, detalleOrden, detalleConsumo)}
          />
        )
      ) : isMobile ? (
        <MobileMateriaPrimaDetails
          order={detalleOrden}
          detalleConsumo={detalleConsumo}
          onDownloadXLS={handleDownloadExcel}
          onDownloadPDF={() => handleDownloadPDF(decryptedIdRol, detalleOrden, detalleConsumo)}
        />
      ) : (
        <DesktopMateriaPrimaDetails
          order={detalleOrden}
          detalleConsumo={detalleConsumo}
          onDownloadXLS={handleDownloadExcel}
          onDownloadPDF={() => handleDownloadPDF(decryptedIdRol, detalleOrden, detalleConsumo)}
        />
      )}
    </Container>
  );
};

export default DetallesOrdenesProduccionPage;