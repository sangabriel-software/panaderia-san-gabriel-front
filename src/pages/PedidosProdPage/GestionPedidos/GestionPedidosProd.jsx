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
import { getCurrentItems } from "./GestionPedidosProdUtils";

const GestionPedidosProd = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { ordenesProduccion, loadingOrdenes } = useGetOrdenesProduccion();
  const [filters, setFilters] = useState({ search: "", date: "", sucursal: "" });
  const filteredOrders = useFilterOrders(ordenesProduccion, filters);

  /* Variables para la paginacion */
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const currentOrders = getCurrentItems(filteredOrders, currentPage, ordersPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container>
      <Title title="Órdenes de Producción" description="Gestiona los pedidos de la producción a realizar" />
      <AddButton buttonText="Ingresar Orden" />
      <FilterBar filters={filters} onFilterChange={setFilters} ordenesProduccion={ordenesProduccion} />

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
                onDeleteOrder={() => {}}
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
        <OrderTable orders={filteredOrders} onViewDetails={() => {}} />
      )}
    </Container>
  );
};

export default GestionPedidosProd;
