import React from "react";
import { useNavigate, useParams } from "react-router";
import useGetDetalleVenta from "../../../hooks/ventas/useGetDetalleVenta";
import { decryptId } from "../../../utils/CryptoParams";
import DesktopVentaDetalle from "../../../components/ventas/DesktopVentasDetalle/DesktopVentasDetalle";
import { Container } from "react-bootstrap";
import { BsArrowLeft } from "react-icons/bs";
import Title from "../../../components/Title/Title";

const DetalleVentaPage = () => {
  const { idVenta } = useParams();
  const decryptedIdVenta = decryptId(decodeURIComponent(idVenta));
  const { detalleVenta, loadingDetalleVenta, showErrorDetalleVenta, showInfoDetalleVenta,  } = useGetDetalleVenta(decryptedIdVenta);
  const navigate = useNavigate();
  // Manejo de estados de carga y errores
  if (loadingDetalleVenta) {
    return <div>Cargando detalles de la venta...</div>;
  }

  if (showErrorDetalleVenta) {
    return <div>Error al cargar los detalles de la venta.</div>;
  }

  if (!detalleVenta) {
    return <div>No se encontraron detalles para esta venta.</div>;
  }

  // Funciones para manejar la descarga de archivos (puedes personalizarlas)
  const handleDownloadXLS = () => {
    console.log("Descargando XLS...");
    // Lógica para descargar XLS
  };

  const handleDownloadPDF = () => {
    console.log("Descargando PDF...");
    // Lógica para descargar PDF
  };

  return (
    <Container className="mt-4">
      <div className="text-center">
        <div className="row">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/ventas")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <Title title="Detalle" />
          </div>
        </div>
      </div>

      <div>
        <DesktopVentaDetalle
          venta={detalleVenta} // Pasamos los datos de la venta
          onDownloadXLS={handleDownloadXLS} // Pasamos la función para descargar XLS
          onDownloadPDF={handleDownloadPDF} // Pasamos la función para descargar PDF
        />
      </div>
    </Container>
  );
};

export default DetalleVentaPage;
