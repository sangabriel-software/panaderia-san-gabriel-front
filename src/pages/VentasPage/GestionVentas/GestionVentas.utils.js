import { eliminarVentaService } from "../../../services/ventas/ventas.service";

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
 * @param {string} idVenta - El ID de la orden a eliminar.
 * @param {function} setVenta - Función para establecer la orden a eliminar.
 * @param {function} setIsPopupOpen - Función para abrir/cerrar el popup.
 */
export const handleConfirmDeleteVenta = (idOrder, setVentaToDelete, setIsPopupOpen) => {
  setVentaToDelete(idOrder);
  setIsPopupOpen(true);
};


/**
 * Función para manejar la eliminación de la orden.
 * @param {string} ventaToDelete - El ID de la orden a eliminar.
 * @param {function} setVentas - Función para actualizar la lista de órdenes.
 * @param {function} setIsPopupOpen - Función para cerrar el popup.
 * @param {function} setErrorPopupMessage - Función para establecer un mensaje de error.
 * @param {function} setIsPopupErrorOpen - Función para abrir/cerrar el popup de error.
 */
export const handleDeleteVenta = async (ventaToDelete, setVentas, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen, setIsloading) => {
  setIsloading(true);
  if (ventaToDelete) {
    try {
      const resDelete = await eliminarVentaService(ventaToDelete);
      if (resDelete.status === 200) {
        setVentas((venta) =>
          venta.filter((venta) => venta.idVenta !== ventaToDelete)
        );
      }
    } catch (error) {
      setErrorPopupMessage(`No se pudo elminar la venta, intente mas tarde.`);
      setIsPopupErrorOpen(true);

    }finally{
      setIsloading(false);
      setIsPopupOpen(false);
    }
  }
};
