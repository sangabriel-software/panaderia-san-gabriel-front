import { eliminarOrdenProduccionService } from "../../../services/ordenesproduccion/ordenesProduccion.service";
import { consultarDetallenOrdenProduccion } from "../../../services/ordenesproduccion/ordenesProduccion.service";
import { consultarDetalleConsumoProduccion } from "../../../services/consumoingredientes/consumoingredientesprod.service";
import { generatePDFBlob } from "../../../utils/PdfUtils/PdfUtils";
import OrderDetailsPdf from "../../../components/PDFs/OrdenDetails/OrderDetailsPdf";
import React from "react";
import { getLocalStorage, removeLocalStorage, setLocalStorage } from "../../../utils/Auth/localstorage";

// ─────────────────────────────────────────────
// CONSTANTES DE FILTROS
// ─────────────────────────────────────────────

export const FILTERS_STORAGE_KEY = "gestion_pedidos_prod_filters";

export const EMPTY_FILTERS = { search: "", date: "", sucursal: "" };

// ─────────────────────────────────────────────
// FUNCIONES DE FILTROS
// ─────────────────────────────────────────────

export const getInitialFilters = () => {
  try {
    const saved = getLocalStorage(FILTERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : EMPTY_FILTERS;
  } catch {
    return EMPTY_FILTERS;
  }
};

export const handleFilterChange = (newFilters, setFilters) => {
  setFilters(newFilters);
  try {
   setLocalStorage(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
  } catch {
    // ignorar errores de escritura
  }
};

export const handleClearAllFilters = (setFilters) => {
  setFilters(EMPTY_FILTERS);
  try {
    removeLocalStorage(FILTERS_STORAGE_KEY);
  } catch {
    // ignorar errores
  }
};

export const hasActiveFilters = (filters) =>
  Boolean(filters.search || filters.date || filters.sucursal);

// ─────────────────────────────────────────────
// FUNCIONES DE PAGINACIÓN
// ─────────────────────────────────────────────

export const getPaginationIndices = (currentPage, itemsPerPage) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  return { indexOfFirstItem, indexOfLastItem };
};

export const getCurrentItems = (items, currentPage, itemsPerPage) => {
  const { indexOfFirstItem, indexOfLastItem } = getPaginationIndices(currentPage, itemsPerPage);
  return items.slice(indexOfFirstItem, indexOfLastItem);
};

// ─────────────────────────────────────────────
// FUNCIONES DE ÓRDENES
// ─────────────────────────────────────────────

export const handleConfirmDeleteOrdenProduccion = (idOrder, setOrdenToDelete, setIsPopupOpen) => {
  setOrdenToDelete(idOrder);
  setIsPopupOpen(true);
};

export const handleDeleteOrder = async (
  ordenToDelete,
  setOrdenesProduccion,
  setIsPopupOpen,
  setErrorPopupMessage,
  setIsPopupErrorOpen
) => {
  if (!ordenToDelete) return;
  try {
    const resDelete = await eliminarOrdenProduccionService(ordenToDelete);
    if (resDelete.status === 200) {
      setOrdenesProduccion((ordenes) =>
        ordenes.filter((orden) => orden.idOrdenProduccion !== ordenToDelete)
      );
      setIsPopupOpen(false);
    }
  } catch (error) {
    if (error.status === 409 && error.data.error.code === 402) {
      setIsPopupOpen(false);
      setErrorPopupMessage("Para eliminar el rol debe eliminar los usuarios al que está relacionado");
      setIsPopupErrorOpen(true);
    }
  }
};

export const handleViewPdf = async (idOrdenProduccion) => {
  try {
    const order = await consultarDetallenOrdenProduccion(idOrdenProduccion);
    const detalleConsumo = await consultarDetalleConsumoProduccion(idOrdenProduccion);
    const { encabezadoOrden, detalleOrden } = order.detalleOrden;

    const documento = React.createElement(OrderDetailsPdf, {
      detalleOrden,
      encabezadoOrden: encabezadoOrden || {},
      detalleConsumo: detalleConsumo.IngredientesConsumidos,
    });

    const blob = await generatePDFBlob(documento);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    throw error;
  }
};