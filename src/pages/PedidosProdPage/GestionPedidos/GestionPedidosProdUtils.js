// src/utils/paginationUtils.js

import { eliminarOrdenProduccionService } from "../../../services/ordenesproduccion/ordenesProduccion.service";

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
  

  // Función para abrir el popup de confirmación y establecer la orden a eliminar
export  const handleConfirmDeleteOrdenProduccion = (idOrder, setOrdenToDelete, setIsPopupOpen) => {
    setOrdenToDelete(idOrder);
    setIsPopupOpen(true);
};

  // Función para manejar la eliminación de la orden
export const handleDeleteOrder = async (ordenToDelete, setOrdenesProduccion, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen ) => {
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
        if(error.status === 409 && error.data.error.code === 402){
          setIsPopupOpen(false); 
          setErrorPopupMessage(`Para elminar el rol debe elminar los usuarios al que esta relacionado`);
          setIsPopupErrorOpen(true);
        }
      }
    }
};