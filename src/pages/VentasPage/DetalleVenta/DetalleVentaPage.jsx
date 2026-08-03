import React from "react";
import { useNavigate, useParams } from "react-router";
import useGetDetalleVenta from "../../../hooks/ventas/useGetDetalleVenta";
import { decryptId } from "../../../utils/CryptoParams";
import DesktopVentaDetalle from "../../../components/ventas/DesktopVentasDetalle/DesktopVentasDetalle";
import MobileVentaDetalle from "../../../components/ventas/MobileVentaDetalle/MobileVentaDetalle";
import { Container } from "react-bootstrap";
import { BsArrowLeft } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { useMediaQuery } from "react-responsive";
import DotsMove from "../../../components/Spinners/DotsMove";
import { generarPDF, generarXLS } from "./DetalleVenta.utils";

// ─── Page Component ───────────────────────────────────────────────────────────
const DetalleVentaPage = () => {
  const { idVenta }         = useParams();
  const decryptedIdVenta    = decryptId(decodeURIComponent(idVenta));
  const { detalleVenta, loadingDetalleVenta, showErrorDetalleVenta } =
    useGetDetalleVenta(decryptedIdVenta);
  const navigate  = useNavigate();
  const isMobile  = useMediaQuery({ maxWidth: 767 });

  const ventaData = detalleVenta.venta ?? detalleVenta;

  const handleDownloadPDF = async () => {
    try   { 
      await generarPDF(ventaData); 
    }
    catch { 
      console.log("Error generando PDF"); 
    }
  };

  const handleDownloadXLS = async () => {
    try   { 
      await generarXLS(ventaData); 
    }
    catch { 
      console.error("Error generando XLS"); 
    }
  };

  if (loadingDetalleVenta) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <DotsMove />
      </Container>
    );
  }

  if (showErrorDetalleVenta) return <div>Error al cargar los detalles de la venta.</div>;
  if (!detalleVenta)         return <div>No se encontraron detalles para esta venta.</div>;

  return (
    <Container className="mt-4">
      <div className="text-center">
        <div className="row align-items-center">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/ventas")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-6 col-md-8">
            <Title title="Detalle de venta" />
          </div>
        </div>
      </div>

      <div>
        {isMobile ? (
          <MobileVentaDetalle
            venta={detalleVenta}
            onDownloadXLS={handleDownloadXLS}
            onDownloadPDF={handleDownloadPDF}
          />
        ) : (
          <DesktopVentaDetalle
            venta={detalleVenta}
            onDownloadXLS={handleDownloadXLS}
            onDownloadPDF={handleDownloadPDF}
          />
        )}
      </div>
    </Container>
  );
};

export default DetalleVentaPage;