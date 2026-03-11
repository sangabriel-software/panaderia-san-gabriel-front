import { useState } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // ✅ react-router-dom
import { useMediaQuery } from "react-responsive";
import { BsFillInfoCircleFill, BsExclamationTriangleFill } from "react-icons/bs";

import Title from "../../../components/Title/Title";
import AddButton from "../../../components/AddButton/AddButton";
import VentasTable from "../../../components/ventas/VentasTable/VentasTable";
import VentasCard from "../../../components/ventas/VentasCard/VentasCard";
import PaginationComponent from "../../../components/PaginationComponent/PaginationComponent";
import OrderCardSkeleton from "../../../components/OrderCardSkeleton/OrderCardSkeleton";
import FilterBarVentas from "../../../components/ventas/FilterBar/FilterBarVentas";
import Alert from "../../../components/Alerts/Alert";
import ConfirmPopUp from "../../../components/Popup/ConfirmPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";

import useGetVentas from "../../../hooks/ventas/useGetVentas";
import useFilterVentas from "../../../hooks/ventas/useFilterVentas";
import useGetEliminacionesTracking from "../../../hooks/EliminacionesTracking/useGetEliminacionesTracking";
import { getUserData } from "../../../utils/Auth/decodedata";

import { handleViewDetalleVenta } from "../DetalleVenta/DetalleVenta.utils";
import {
  // filtros
  getInitialFilters,
  handleFilterChange,
  handleClearAllFilters,
  hasActiveFilters,
  // paginación
  getCurrentItems,
  // ventas
  handleConfirmDeleteVenta,
  handleDeleteVenta,
} from "./GestionVentas.utils";

import "./GestionarVentasPage.css";

const GestionVentasPage = () => {
  const navigate = useNavigate();

  // ── Filtros ────────────────────────────────
  const [filters, setFilters] = useState(getInitialFilters);

  // ── Datos ──────────────────────────────────
  const { ventas, loadingVentas, showErrorVentas, showInfoVentas, setVentas } = useGetVentas();
  const filteredVentas = useFilterVentas(ventas, filters);
  const activeFilters = hasActiveFilters(filters);

  const { eliminacionesTracking, loadingEliminacionesTracking, showErrorEliminacionesTracking, setEliminacionesTracking } = useGetEliminacionesTracking("VENTA");
  const userData = getUserData();

  // ── Paginación ─────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const ventasPerPage = 5;
  const currentSales = getCurrentItems(filteredVentas, currentPage, ventasPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // ── Popups ─────────────────────────────────
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [ventaToDelete, setVentaToDelete] = useState(null);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [isLoading, setIsloading] = useState(false);

  // ── Responsive ─────────────────────────────
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    <Container>
      <Title
        title="Ventas"
        description="Gestiona las ventas realizadas en el día"
      />

      <AddButton
        buttonText="Ingresar venta"
        onRedirect={() => navigate("ingresar-venta")}
      />

      <FilterBarVentas
        filters={filters}
        onFilterChange={(newFilters) => handleFilterChange(newFilters, setFilters)}
        onClearAll={() => handleClearAllFilters(setFilters)}
        hasActiveFilters={activeFilters}
        ventas={ventas}
      />

      {/* ── Lista móvil ── */}
      {isMobile ? (
        loadingVentas ? (
          [...Array(5)].map((_, index) => <OrderCardSkeleton key={index} />)
        ) : (
          <>
            {currentSales.map((venta) => (
              <VentasCard
                key={venta.idVenta}
                sale={venta}
                onViewDetails={() => handleViewDetalleVenta(venta.idVenta, navigate)}
                onDeleteSale={() =>
                  handleConfirmDeleteVenta(venta.idVenta, setVentaToDelete, setIsPopupOpen)
                }
                eliminacionesTracking={eliminacionesTracking}
                userData={userData}
              />
            ))}
            <PaginationComponent
              totalItems={filteredVentas.length}
              itemsPerPage={ventasPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </>
        )
      ) : (
        /* ── Tabla desktop ── */
        loadingVentas ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-primary my-5" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <VentasTable
            sales={filteredVentas}
            onDelete={(idVenta) =>
              handleConfirmDeleteVenta(idVenta, setVentaToDelete, setIsPopupOpen)
            }
            onViewPdf={null}
            loadingViewPdf={null}
            eliminacionesTracking={eliminacionesTracking}
            userData={userData}
          />
        )
      )}

      {/* ── Alertas ── */}
      {filteredVentas.length === 0 && activeFilters && (
        <div className="row justify-content-center my-3">
          <div className="col-md-6 text-center">
            <Alert
              type="primary"
              message="No se encontraron ventas que coincidan con la búsqueda."
              icon={<BsFillInfoCircleFill />}
            />
          </div>
        </div>
      )}

      {filteredVentas.length === 0 && !loadingVentas && !showErrorVentas && showInfoVentas && (
        <div className="row justify-content-center my-3">
          <div className="col-md-6 text-center">
            <Alert
              type="primary"
              message="No se han ingresado Ventas."
              icon={<BsFillInfoCircleFill />}
            />
          </div>
        </div>
      )}

      {showErrorVentas && (
        <div className="row justify-content-center my-2">
          <div className="col-md-6 text-center">
            <Alert
              type="danger"
              message="Hubo un error al consultar las ventas. Intenta más tarde..."
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
        message="¿Está seguro de eliminar la venta?"
        isLoading={isLoading}
        onConfirm={() =>
          handleDeleteVenta(
            ventaToDelete,
            setVentas,
            setIsPopupOpen,
            setErrorPopupMessage,
            setIsPopupErrorOpen,
            setIsloading
          )
        }
        onCancel={() => setIsPopupOpen(false)}
      />

      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />
    </Container>
  );
};

export default GestionVentasPage;