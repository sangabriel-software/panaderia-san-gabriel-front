import React, { useState } from "react";
import Title from "../../../components/Title/Title";
import { Container } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import FilterBar from "../../../components/FilterBar/FilterBar";
import OrderTable from "../../../components/OrdersComponents/OrderTable";
import OrderCard from "../../../components/OrdersComponents/OrderCard";
import useGetOrdenesProduccion from "../../../hooks/ordenesproduccion/useGetOrdenesProduccion";
import AddButton from "../../../components/AddButton/AddButton";
import useFilterOrders from "../../../hooks/ordenesproduccion/useFilterOrders";
import PaginationComponent from "../../../components/PaginationComponent/PaginationComponent";
import OrderCardSkeleton from "../../../components/OrderCardSkeleton/OrderCardSkeleton";
import {
  getCurrentItems,
  handleConfirmDeleteOrdenProduccion,
  handleDeleteOrder,
} from "./GestionPedidosProdUtils";
import ConfirmPopUp from "../../../components/Popup/ConfirmPopup";
import Alert from "../../../components/Alerts/Alert";
import {
  BsExclamationTriangleFill,
  BsFillInfoCircleFill,
} from "react-icons/bs";

const GestionPedidosProd = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const {
    ordenesProduccion,
    loadingOrdenes,
    showErrorOrdenes,
    showInfoOrdenes,
    setOrdenesProduccion,
  } = useGetOrdenesProduccion();
  const [filters, setFilters] = useState({
    search: "",
    date: "",
    sucursal: "",
  });
  const filteredOrders = useFilterOrders(ordenesProduccion, filters);

  // Variables de estado para mostrar popup y almacenar la orden a eliminar
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [ordenToDelete, setOrdenToDelete] = useState(null);

  /* Variables para la paginacion */
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const currentOrders = getCurrentItems(
    filteredOrders,
    currentPage,
    ordersPerPage
  );
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container>
      <Title
        title="Órdenes de Producción"
        description="Gestiona los pedidos de la producción a realizar"
      />
      <AddButton buttonText="Ingresar Orden" />
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        ordenesProduccion={ordenesProduccion}
      />

      {isMobile ? (
        loadingOrdenes ? (
          [...Array(5)].map((_, index) => <OrderCardSkeleton key={index} />)
        ) : (
          <>
            {currentOrders.map((order) => (
              <OrderCard
                key={order.idOrdenProduccion}
                order={order}
                onViewDetails={() => {}}
                onDeleteOrder={() =>
                  handleConfirmDeleteOrdenProduccion(
                    order.idOrdenProduccion,
                    setOrdenToDelete,
                    setIsPopupOpen
                  )
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
      ) : loadingOrdenes ? (
        <div className="d-flex justify-content-center  my-5">
          <div className="spinner-border text-primary my-5 my-5" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <OrderTable
          orders={filteredOrders}
          onDelete={(idOrder) =>
            handleConfirmDeleteOrdenProduccion(
              idOrder,
              setOrdenToDelete,
              setIsPopupOpen
            )
          }
        />
      )}

      {/* Alertas mostrar error y notificacion de informacion */}
      {filteredOrders.length === 0 &&
        (filters.search || filters.date || filters.sucursal) && (
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <Alert
                type="primary"
                message="No se encontraron productos que coincidan con la búsqueda."
                icon={<BsFillInfoCircleFill />}
              />
            </div>
          </div>
        )}

      {filteredOrders.length === 0 &&
        !loadingOrdenes &&
        !showErrorOrdenes &&
        showInfoOrdenes && (
          <div className="row justify-content-center">
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

      {/* Popup confirmacion de eliminación */}
      <ConfirmPopUp
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Confirmar Eliminación"
        message="¿Está seguro de eliminar la orden?"
        onConfirm={() => {
          handleDeleteOrder(
            ordenToDelete,
            setOrdenesProduccion,
            setIsPopupOpen,
            setErrorPopupMessage,
            setIsPopupErrorOpen
          );
        }}
        onCancel={() => setIsPopupOpen(false)}
      />
    </Container>
  );
};

export default GestionPedidosProd;
