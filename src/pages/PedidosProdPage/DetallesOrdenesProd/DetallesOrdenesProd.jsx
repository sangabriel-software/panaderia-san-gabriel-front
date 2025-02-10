import React from "react";
import { Container } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import { BsArrowLeft } from "react-icons/bs";
import { useNavigate } from "react-router";
import Title from "../../../components/Title/Title";
import MobileOrderDetails from "../../../components/OrdenesDetalle/MobileOrderDetails/MobileOrderDetails";
import DesktopOrderDetails from "../../../components/OrdenesDetalle/DesktopOrderDetails/DesktopOrderDetails";

const DetallesOrdenesProduccionPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleDownloadXLS = () => console.log("Descargando XLS...");
  const handleDownloadPDF = () => console.log("Descargando PDF...");

  const orden = {
    id: "ORD-1",
    fecha: "07/02/2025",
    sucursal: "San Miguel Dueñas",
    realizadaPor: "Angel Garcia",
    encargado: "Juan Gomez",
    productos: [
      {
        item: 1,
        producto: "Francés",
        bandejas: 40,
        unidades: 2000,
        ventaEstimada: 666.6,
      },
      {
        item: 2,
        producto: "Baguette",
        bandejas: 20,
        unidades: 1000,
        ventaEstimada: 333.3,
      },
    ],
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
            <Title title="ORDEN-1" />
          </div>
        </div>
      </div>

      {isMobile ? (
        <MobileOrderDetails
          order={orden}
          onDownloadXLS={handleDownloadXLS}
          onDownloadPDF={handleDownloadPDF}
        />
      ) : (
        <DesktopOrderDetails
          order={orden}
          onDownloadXLS={handleDownloadXLS}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </Container>
  );
};

export default DetallesOrdenesProduccionPage;