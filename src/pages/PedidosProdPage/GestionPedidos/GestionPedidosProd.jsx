// src/components/Orders/GestionPedidosProd.jsx
import React, { useState, useEffect } from "react";
import Title from "../../../components/Title/Title";
import { Container } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import DownloadDropdown from "../../../components/DownloadDropdown/DownloadDropdown";
import FilterBar from "../../../components/FilterBar/FilterBar";
import OrderTable from "../../../components/OrdersComponents/OrderTable";
import OrderCard from "../../../components/OrdersComponents/OrderCard";
import useGetOrdenesProduccion from "../../../hooks/ordenesproduccion/useGetOrdenesProduccion";
import AddButton from "../../../components/AddButton/AddButton";

const GestionPedidosProd = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Se asume que useGetOrdenesProduccion devuelve un objeto con "ordenesProduccion"
  const { ordenesProduccion, loadingOrdenes, showErrorOrdenes, showInfoOrdenes } = useGetOrdenesProduccion();

  // Estado para los filtros
  const [filters, setFilters] = useState({ search: "", date: "", status: "" });
  // Estado para los datos de las órdenes
  const [ordersData, setOrdersData] = useState([]);
  // Estado para los pedidos filtrados
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Cuando llegan las órdenes del backend, se setean en ordersData
  useEffect(() => {
    if (ordenesProduccion && ordenesProduccion.length > 0) {
      setOrdersData(ordenesProduccion);
    }
  }, [ordenesProduccion]);

  // Se aplica la lógica de filtrado cada vez que ordersData o filters cambien
  useEffect(() => {
    let filtered = ordersData || [];

    // Filtrar por "search": en este ejemplo se busca por el id de la orden.
    // Si prefieres buscar por otro campo, como el nombre del panadero, cámbialo.
    if (filters.search) {
      filtered = filtered.filter((order) =>
        order.idOrdenProduccion
          .toString()
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      );
    }
    // Filtrar por fecha (usando el campo "fechaAProducir")
    if (filters.date) {
      filtered = filtered.filter((order) => order.fechaAProducir === filters.date);
    }
    // Filtrar por estado (usando "estadoOrden")
    if (filters.status) {
      filtered = filtered.filter((order) => order.estadoOrden === filters.status);
    }
    setFilteredOrders(filtered);
  }, [ordersData, filters]);

  // Función para ver detalles: puede redirigir a otra pantalla o abrir un modal
  const onViewDetails = (order) => {
    console.log("Ver detalles de la orden:", order);
    // Aquí puedes redirigir o abrir un modal
  };

  // Funciones para descarga (implementa la lógica según tu requerimiento)
  const onDownloadXLS = () => {
    console.log("Descargar XLS");
    // Llamar a un endpoint o generar el archivo XLS
  };

  const onDownloadPDF = () => {
    console.log("Descargar PDF");
    // Llamar a un endpoint o generar el archivo PDF
  };

  return (
    <Container>
      <Title
        title="Órdenes de Producción"
        description="Gestiona los pedidos de la producción a realizar"
      />
      {/* boton para crear orden */}
        <AddButton buttonText="Ingresar Orden" />
      {/* Barra de filtros */}
      <FilterBar filters={filters} onFilterChange={setFilters} />
      {/* Renderizado condicional: tarjetas para móvil, tabla para escritorio */}
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
