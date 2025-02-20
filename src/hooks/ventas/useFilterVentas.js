// src/hooks/useFilterOrders.js
import { useState, useEffect } from "react";

const useFilterVentas = (ventasData, filters) => {
  const [filteredVentas, setFilteredVemtas] = useState([]);

  useEffect(() => {
    let filtered = ventasData || [];

    // Filtrar por "search" (id de la venta)
    if (filters.search) {
      filtered = filtered.filter((venta) =>
        venta.idVenta
          .toString()
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      );
    }

    // Filtrar por fecha (usando el campo "fechaAProducir")
    if (filters.date) {
      filtered = filtered.filter((venta) => venta.fechaVenta === filters.date);
    }

    // Filtrar por sucursal
    if (filters.sucursal) {
      filtered = filtered.filter((venta) => venta.nombreSucursal === filters.sucursal);
    }

    setFilteredVemtas(filtered);
  }, [ventasData, filters]);

  return filteredVentas;
};

export default useFilterVentas;