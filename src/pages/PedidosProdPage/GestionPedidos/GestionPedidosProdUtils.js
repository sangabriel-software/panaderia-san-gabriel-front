import { eliminarOrdenProduccionService } from "../../../services/ordenesproduccion/ordenesProduccion.service";
import { consultarDetallenOrdenProduccion } from "../../../services/ordenesproduccion/ordenesProduccion.service";
import { consultarDetalleConsumoProduccion } from "../../../services/consumoingredientes/consumoingredientesprod.service";
import { generatePDFBlob } from "../../../utils/PdfUtils/PdfUtils"; // IMPORTAR DESDE PdfUtils
import OrderDetailsPdf from "../../../components/PDFs/OrdenDetails/OrderDetailsPdf";
import React from "react";

/**
 * Calcula los índices del primer y último elemento para la paginación.
 * @param {number} currentPage - La página actual.
 * @param {number} itemsPerPage - Cantidad de elementos por página.
 * @returns {object} - Un objeto con indexOfFirstItem e indexOfLastItem.
 */
export const getPaginationIndices = (currentPage, itemsPerPage) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  return { indexOfFirstItem, indexOfLastItem };
};

/**
 * Retorna los elementos actuales basándose en la página actual y la cantidad de elementos por página.
 * @param {Array} items - La lista completa de elementos.
 * @param {number} currentPage - La página actual.
 * @param {number} itemsPerPage - Cantidad de elementos por página.
 * @returns {Array} - Los elementos correspondientes a la página actual.
 */
export const getCurrentItems = (items, currentPage, itemsPerPage) => {
  const { indexOfFirstItem, indexOfLastItem } = getPaginationIndices(currentPage, itemsPerPage);
  return items.slice(indexOfFirstItem, indexOfLastItem);
};

/**
 * Función para abrir el popup de confirmación y establecer la orden a eliminar.
 * @param {string} idOrder - El ID de la orden a eliminar.
 * @param {function} setOrdenToDelete - Función para establecer la orden a eliminar.
 * @param {function} setIsPopupOpen - Función para abrir/cerrar el popup.
 */
export const handleConfirmDeleteOrdenProduccion = (idOrder, setOrdenToDelete, setIsPopupOpen) => {
  setOrdenToDelete(idOrder);
  setIsPopupOpen(true);
};

/**
 * Función para manejar la eliminación de la orden.
 * @param {string} ordenToDelete - El ID de la orden a eliminar.
 * @param {function} setOrdenesProduccion - Función para actualizar la lista de órdenes.
 * @param {function} setIsPopupOpen - Función para cerrar el popup.
 * @param {function} setErrorPopupMessage - Función para establecer un mensaje de error.
 * @param {function} setIsPopupErrorOpen - Función para abrir/cerrar el popup de error.
 */
export const handleDeleteOrder = async (ordenToDelete, setOrdenesProduccion, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen) => {
  if (ordenToDelete) {
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
        setErrorPopupMessage(`Para eliminar el rol debe eliminar los usuarios al que está relacionado`);
        setIsPopupErrorOpen(true);
      }
    }
  }
};

/**
 * Función para generar y retornar la URL del PDF (MODIFICADA)
 * @param {string} idOrdenProduccion - El ID de la orden de producción.
 * @returns {Promise<string>} - URL del PDF generado
 */
export const handleViewPdf = async (idOrdenProduccion) => {
  try {
    const order = await consultarDetallenOrdenProduccion(idOrdenProduccion);
    const detalleConsumo = await consultarDetalleConsumoProduccion(idOrdenProduccion);
    const { encabezadoOrden, detalleOrden } = order.detalleOrden;

    const documento = React.createElement(OrderDetailsPdf, {
      detalleOrden: detalleOrden,
      encabezadoOrden: encabezadoOrden || {},
      detalleConsumo: detalleConsumo.IngredientesConsumidos,
    });

    // Generar el Blob y crear URL
    const blob = await generatePDFBlob(documento);
    const url = URL.createObjectURL(blob);
    
    return url; // RETORNAMOS LA URL
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    throw error; // LANZAMOS EL ERROR
  }
};