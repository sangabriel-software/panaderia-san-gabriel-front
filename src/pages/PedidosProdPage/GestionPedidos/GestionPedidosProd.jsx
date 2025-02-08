// src/components/Orders/GestionPedidosProd.jsx
import React, { useState, useEffect } from "react";
import Title from "../../../components/Title/Title";
import { Container } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import FilterBar from "../../../components/FilterBar/FilterBar";
import OrderTable from "../../../components/OrdersComponents/OrderTable";
import OrderCard from "../../../components/OrdersComponents/OrderCard";
import useGetOrdenesProduccion from "../../../hooks/ordenesproduccion/useGetOrdenesProduccion";
import AddButton from "../../../components/AddButton/AddButton";
import useFilterOrders from "../../../hooks/ordenesproduccion/useFilterOrders";

const GestionPedidosProd = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  // Obtener las órdenes de producción
  const { ordenesProduccion, loadingOrdenes } = useGetOrdenesProduccion();
  // Estado para los filtros
  const [filters, setFilters] = useState({ search: "", date: "", sucursal: "" });
  // Usar el hook para filtrar las órdenes
  const filteredOrders = useFilterOrders(ordenesProduccion, filters);

  // Función para ver detalles
  const onViewDetails = (order) => {
    console.log("Ver detalles de la orden:", order);
  };

  // Funciones para descarga
  const onDownloadXLS = () => {
    console.log("Descargar XLS");
  };

  const onDownloadPDF = () => {
    console.log("Descargar PDF");
  };

  if (loadingOrdenes) {
    return <div className="loading">Cargando Ordenes...</div>;
  }

  return (
    <Container>
      <Title
        title="Órdenes de Producción"
        description="Gestiona los pedidos de la producción a realizar"
      />
      <AddButton buttonText="Ingresar Orden" />
      <FilterBar filters={filters} onFilterChange={setFilters} ordenesProduccion={ordenesProduccion} />
      {isMobile ? (
        filteredOrders.map((order) => (
          <OrderCard
            key={order.idOrdenProduccion}
            order={order}
            onViewDetails={onViewDetails}
          />
        ))
      ) : (
        <OrderTable orders={filteredOrders} onViewDetails={onViewDetails} />
      )}
    </Container>
  );
};

export default GestionPedidosProd;