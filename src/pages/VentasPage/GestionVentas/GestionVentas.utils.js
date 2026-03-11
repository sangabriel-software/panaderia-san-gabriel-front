import { eliminarVentaService } from "../../../services/ventas/ventas.service";
import dayjs from "dayjs";

// ─────────────────────────────────────────────
// CONSTANTES DE FILTROS
// ─────────────────────────────────────────────

export const FILTERS_STORAGE_KEY = "gestion_ventas_filters";

const getToday = () => dayjs().format("YYYY-MM-DD");

export const EMPTY_FILTERS = { search: "", date: "", sucursal: "" };

// ─────────────────────────────────────────────
// FUNCIONES DE FILTROS
// ─────────────────────────────────────────────

export const getInitialFilters = () => {
  try {
    const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, date: parsed.date || getToday() };
    }
    return EMPTY_FILTERS;
  } catch {
    return EMPTY_FILTERS;
  }
};

export const handleFilterChange = (newFilters, setFilters) => {
  setFilters(newFilters);
  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
  } catch {
    // ignorar errores de escritura
  }
};

export const handleClearAllFilters = (setFilters) => {
  setFilters(EMPTY_FILTERS);
  try {
    localStorage.removeItem(FILTERS_STORAGE_KEY);
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
// FUNCIONES DE VENTAS
// ─────────────────────────────────────────────

export const handleConfirmDeleteVenta = (idOrder, setVentaToDelete, setIsPopupOpen) => {
  setVentaToDelete(idOrder);
  setIsPopupOpen(true);
};

export const handleDeleteVenta = async (ventaToDelete, setVentas, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen, setIsloading) => {
  setIsloading(true);
  if (ventaToDelete) {
    try {
      const resDelete = await eliminarVentaService(ventaToDelete);
      if (resDelete.status === 200) {
        setVentas((ventas) => ventas.filter((venta) => venta.idVenta !== ventaToDelete));
      }
    } catch (error) {
      setErrorPopupMessage("No se pudo eliminar la venta, intente más tarde.");
      setIsPopupErrorOpen(true);
    } finally {
      setIsloading(false);
      setIsPopupOpen(false);
    }
  }
};