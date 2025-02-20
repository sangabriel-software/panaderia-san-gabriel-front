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