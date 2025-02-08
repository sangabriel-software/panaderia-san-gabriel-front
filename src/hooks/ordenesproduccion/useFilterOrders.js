// src/hooks/useFilterOrders.js
import { useState, useEffect } from "react";

const useFilterOrders = (ordersData, filters) => {
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    let filtered = ordersData || [];

    // Filtrar por "search" (id de la orden)
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

    // Filtrar por sucursal
    if (filters.sucursal) {
      filtered = filtered.filter((order) => order.nombreSucursal === filters.sucursal);
    }

    setFilteredOrders(filtered);
  }, [ordersData, filters]);

  return filteredOrders;
};

export default useFilterOrders;