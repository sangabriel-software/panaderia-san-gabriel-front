import React, { useState } from "react";
import { Container, Button, ButtonGroup } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import { BsArrowLeft } from "react-icons/bs";
import { useNavigate, useParams } from "react-router";
import Title from "../../../components/Title/Title";
import MobileOrderDetails from "../../../components/OrdenesDetalle/MobileOrderDetails/MobileOrderDetails";
import DesktopOrderDetails from "../../../components/OrdenesDetalle/DesktopOrderDetails/DesktopOrderDetails";
import useGetDetalleOrden from "../../../hooks/ordenesproduccion/useGetDetalleOrden";
import { decryptId } from "../../../utils/CryptoParams";
import OrderDetailsPdf from "../../../components/PDFs/OrdenDetails/OrderDetailsPdf";
import { generateAndDownloadPDF } from "../../../utils/PdfUtils/PdfUtils";
import MobileMateriaPrimaDetails from "../../../components/IngredientesOrden/MobileMateriaPrimaDetails";
import DesktopMateriaPrimaDetails from "../../../components/IngredientesOrden/DesktopMateriaPrimaDetails";
import { useGetConsumoIngredientes } from "../../../hooks/consumoIngredientes/useGetConsumoIngredientes";

const DetallesOrdenesProduccionPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { idOrdenProduccion } = useParams();
  const decryptedIdRol = decryptId(decodeURIComponent(idOrdenProduccion));
  const { detalleOrden, loadingDetalleOrdene, showErrorDetalleOrdene, showInfoDetalleOrden } = useGetDetalleOrden(decryptedIdRol);
  const { detalleConsumo, loadingDetalleConsumo, showErrorDetalleConsumo, showInfoDetalleConsumo } = useGetConsumoIngredientes(decryptedIdRol);
  const [view, setView] = useState("productos");

  const handleDownloadPDF = () => {
    const documento = <OrderDetailsPdf detalleOrden={detalleOrden.detalleOrden} encabezadoOrden={detalleOrden.encabezadoOrden || {}} detalleConsumo={detalleConsumo} />;
    const fileName = `orden_produccion_${decryptedIdRol}.pdf`;
    generateAndDownloadPDF(documento, fileName);
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

      <ButtonGroup className="mb-4">
        <Button variant={view === "productos" ? "primary" : "outline-primary"} onClick={() => setView("productos")}>
          Detalle Productos
        </Button>
        <Button variant={view === "materiaPrima" ? "primary" : "outline-primary"} onClick={() => setView("materiaPrima")}>
          Detalle Materia Prima
        </Button>
      </ButtonGroup>

      {loadingDetalleOrdene ? (
        <div className="d-flex justify-content-center my-5 mt-5">
          <div className="spinner-border text-primary my-5 mt-5" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : view === "productos" ? (
        isMobile ? (
          <MobileOrderDetails
            order={detalleOrden}
            onDownloadXLS={() => console.log("Descargando XLS...")}
            onDownloadPDF={handleDownloadPDF}
          />
        ) : (
          <DesktopOrderDetails
            order={detalleOrden}
            detalleConsumo={detalleConsumo}
            onDownloadXLS={() => console.log("Descargando XLS...")}
            onDownloadPDF={handleDownloadPDF}
          />
        )
      ) : isMobile ? (
        <MobileMateriaPrimaDetails
          order={detalleOrden}
          detalleConsumo={detalleConsumo}
          onDownloadXLS={() => console.log("Descargando XLS...")}
          onDownloadPDF={handleDownloadPDF}
        />
      ) : (
        <DesktopMateriaPrimaDetails
          order={detalleOrden}
          detalleConsumo={detalleConsumo}
          onDownloadXLS={() => console.log("Descargando XLS...")}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </Container>
  );
};

export default DetallesOrdenesProduccionPage;