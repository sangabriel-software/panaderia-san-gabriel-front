import React from "react";
import { Container } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import { BsArrowLeft } from "react-icons/bs";
import { useNavigate, useParams } from "react-router";
import Title from "../../../components/Title/Title";
import MobileOrderDetails from "../../../components/OrdenesDetalle/MobileOrderDetails/MobileOrderDetails";
import DesktopOrderDetails from "../../../components/OrdenesDetalle/DesktopOrderDetails/DesktopOrderDetails";
import useGetDetalleOrden from "../../../hooks/ordenesproduccion/useGetDetalleOrden";
import { decryptId } from "../../../utils/CryptoParams";

const DetallesOrdenesProduccionPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { idOrdenProduccion } = useParams();
  const decryptedIdRol = decryptId(decodeURIComponent(idOrdenProduccion));
  const {detalleOrden, loadingDetalleOrdene, showErrorDetalleOrdene, showInfoDetalleOrden, } = useGetDetalleOrden(decryptedIdRol);
  const handleDownloadXLS = () => console.log("Descargando XLS...");
  const handleDownloadPDF = () => console.log("Descargando PDF...");

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

      {loadingDetalleOrdene ? (
        <div className="d-flex justify-content-center  my-5 mt-5">
          <div className="spinner-border text-primary my-5 mt-5" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : isMobile ? (
        <MobileOrderDetails
          order={detalleOrden}
          onDownloadXLS={handleDownloadXLS}
          onDownloadPDF={handleDownloadPDF}
        />
      ) : (
        <DesktopOrderDetails
          order={detalleOrden}
          onDownloadXLS={handleDownloadXLS}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </Container>
  );
};

export default DetallesOrdenesProduccionPage;
