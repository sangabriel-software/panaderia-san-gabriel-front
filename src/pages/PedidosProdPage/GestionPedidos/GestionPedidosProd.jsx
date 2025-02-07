// src/components/Orders/GestionPedidosProd.jsx
import React, { useState, useEffect } from "react";
import Title from "../../../components/Title/Title";
import { Container } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import DownloadDropdown from "../../../components/DownloadDropdown/DownloadDropdown";
import FilterBar from "../../../components/FilterBar/FilterBar";
import OrderTable from "../../../components/OrdersComponents/OrderCard";

const GestionPedidosProd = ({
  ordersData,
  onViewDetails,
  onDownloadXLS,
  onDownloadPDF,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [filters, setFilters] = useState({ search: "", date: "", status: "" });
  const [filteredOrders, setFilteredOrders] = useState(ordersData || []);

  useEffect(() => {
    // Lógica de filtrado básica
    let filtered = ordersData || [];
    if (filters.search) {
      filtered = filtered.filter((order) =>
        order.orderNumber.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.date) {
      filtered = filtered.filter((order) => order.date === filters.date);
    }
    if (filters.status) {
      filtered = filtered.filter((order) => order.status === filters.status);
    }
    setFilteredOrders(filtered);
  }, [ordersData, filters]);

  return (
    <Container>
      <Title
        title="Órdenes de Producción"
        description="Gestiona los pedidos de la producción a realizar"
      />
      {/* Dropdown para descarga */}
      <DownloadDropdown
        onDownloadXLS={onDownloadXLS}
        onDownloadPDF={onDownloadPDF}
      />
      {/* Barra de filtros */}
      <FilterBar filters={filters} onFilterChange={setFilters} />
      {/* Renderizado condicional según el tamaño de pantalla */}
      {isMobile ? (
        filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} onViewDetails={onViewDetails} />
        ))
      ) : (
        <OrderTable orders={filteredOrders} onViewDetails={onViewDetails} />
      )}
    </Container>
  );
};

export default GestionPedidosProd;
