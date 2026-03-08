import React, { useState } from "react";
import Title from "../../../components/Title/Title";
import { Container } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router-dom"; // ✅ react-router-dom
import { BsExclamationTriangleFill, BsFillInfoCircleFill } from "react-icons/bs";
import FilterBar from "../../../components/FilterBar/FilterBar";
import OrderTable from "../../../components/OrdersComponents/OrderTable";
import OrderCard from "../../../components/OrdersComponents/OrderCard";
import AddButton from "../../../components/AddButton/AddButton";
import PaginationComponent from "../../../components/PaginationComponent/PaginationComponent";
import OrderCardSkeleton from "../../../components/OrderCardSkeleton/OrderCardSkeleton";
import ConfirmPopUp from "../../../components/Popup/ConfirmPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import Alert from "../../../components/Alerts/Alert";
import PDFViewerModal from "../../../PDFViewerModal/PDFViewerModal";
import useGetOrdenesProduccion from "../../../hooks/ordenesproduccion/useGetOrdenesProduccion";
import useFilterOrders from "../../../hooks/ordenesproduccion/useFilterOrders";
import { handleViewDetalle } from "../DetallesOrdenesProd/DetallesOrdenesProdUtils";
import { getInitialFilters, handleFilterChange, handleClearAllFilters, hasActiveFilters, getCurrentItems, handleConfirmDeleteOrdenProduccion, handleDeleteOrder, handleViewPdf } from "./GestionPedidosProdUtils";

const GestionPedidosProd = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const navigate = useNavigate();

  // ── Filtros ────────────────────────────────
  const [filters, setFilters] = useState(getInitialFilters);

  // ── Datos ──────────────────────────────────
  const { ordenesProduccion, loadingOrdenes, showErrorOrdenes, showInfoOrdenes, setOrdenesProduccion } = useGetOrdenesProduccion();
  const filteredOrders = useFilterOrders(ordenesProduccion, filters);
  const activeFilters = hasActiveFilters(filters);

  // ── Paginación ─────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const currentOrders = getCurrentItems(filteredOrders, currentPage, ordersPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // ── Popups ─────────────────────────────────
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [ordenToDelete, setOrdenToDelete] = useState(null);

  // ── PDF ────────────────────────────────────
  const [loadingViewPdf, setLoadingViewPdf] = useState(null);
  const [pdfData, setPdfData] = useState(null);

  const handleOpenPdfViewer = async (idOrder) => {
    setLoadingViewPdf(idOrder);
    try {
      const pdfUrl = await handleViewPdf(idOrder);
      setPdfData({ url: pdfUrl, filename: `orden-produccion-${idOrder}.pdf` });
    } catch (error) {
      console.error("Error al cargar PDF:", error);
      setErrorPopupMessage("No se pudo cargar el PDF. Intenta nuevamente.");
      setIsPopupErrorOpen(true);
    } finally {
      setLoadingViewPdf(null);
    }
  };

  return (
    <Container>
      <Title
        title="Órdenes de Producción"
        description="Gestiona los pedidos de la producción a realizar"
      />

      <AddButton
        buttonText="Ingresar Orden"
        onRedirect={() => navigate("ingresar-orden")}
      />

      <FilterBar
        filters={filters}
        onFilterChange={(newFilters) => handleFilterChange(newFilters, setFilters)}
        onClearAll={() => handleClearAllFilters(setFilters)}
        hasActiveFilters={activeFilters}
        ordenesProduccion={ordenesProduccion}
      />

      {/* ── Lista móvil ── */}
      {isMobile ? (
        loadingOrdenes ? (
          [...Array(5)].map((_, index) => <OrderCardSkeleton key={index} />)
        ) : (
          <>
            {currentOrders.map((order) => (
              <OrderCard
                key={order.idOrdenProduccion}
                order={order}
                onViewDetails={() => handleViewDetalle(order.idOrdenProduccion, navigate)}
                onDeleteOrder={() =>
                  handleConfirmDeleteOrdenProduccion(order.idOrdenProduccion, setOrdenToDelete, setIsPopupOpen)
                }
              />
            ))}
            <PaginationComponent
              totalItems={filteredOrders.length}
              itemsPerPage={ordersPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </>
        )
      ) : (
        /* ── Tabla desktop ── */
        loadingOrdenes ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-primary my-5" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <OrderTable
            orders={filteredOrders}
            onDelete={(idOrder) =>
              handleConfirmDeleteOrdenProduccion(idOrder, setOrdenToDelete, setIsPopupOpen)
            }
            onViewPdf={handleOpenPdfViewer}
            loadingViewPdf={loadingViewPdf}
          />
        )
      )}

      {/* ── Alertas ── */}
      {filteredOrders.length === 0 && activeFilters && (
        <div className="row justify-content-center my-3">
          <div className="col-md-6 text-center">
            <Alert
              type="primary"
              message="No se encontraron ordenes que coincidan con la búsqueda."
              icon={<BsFillInfoCircleFill />}
            />
          </div>
        </div>
      )}

      {filteredOrders.length === 0 && !loadingOrdenes && !showErrorOrdenes && showInfoOrdenes && (
        <div className="row justify-content-center my-3">
          <div className="col-md-6 text-center">
            <Alert
              type="primary"
              message="No se han ingresado órdenes de producción."
              icon={<BsFillInfoCircleFill />}
            />
          </div>
        </div>
      )}

      {showErrorOrdenes && (
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <Alert
              type="danger"
              message="Hubo un error al consultar las órdenes de producción. Intenta más tarde..."
              icon={<BsExclamationTriangleFill />}
            />
          </div>
        </div>
      )}

      {/* ── Popups ── */}
      <ConfirmPopUp
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Confirmar Eliminación"
        message="¿Está seguro de eliminar la orden?"
        onConfirm={() =>
          handleDeleteOrder(ordenToDelete, setOrdenesProduccion, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen)
        }
        onCancel={() => setIsPopupOpen(false)}
      />

      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />

      {/* ── Visor PDF ── */}
      {pdfData && (
        <PDFViewerModal
          pdfUrl={pdfData.url}
          filename={pdfData.filename}
          onClose={() => setPdfData(null)}
        />
      )}
    </Container>
  );
};

export default GestionPedidosProd;