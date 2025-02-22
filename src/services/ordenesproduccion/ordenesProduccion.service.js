import api from "../../config/api";
import { getEndpoints, postEndpoints, deleteEndpoints } from "../../config/endpoints";


export const consultarOrdenesProduccion = async () => {
  try {
    const response = await api.get(getEndpoints.CONSULTAR_ORDENES_PRODUCCION);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const consultarDetallenOrdenProduccion = async (idOrdenProduccion) => {
  try {
    const response = await api.get(`${getEndpoints.CONSULTAR_DETALLES_ORDENES_PRODUCCION}/${idOrdenProduccion}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const eliminarOrdenProduccionService = async (idOrdenProduccion) => {
  try {
    const response = await api.delete(`${deleteEndpoints.ELIMINAR_ORDEN_PRODUCCION}/${idOrdenProduccion}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const ingresarOrdenProduccionService = async (dataOrden) => {
  try {
      const response = await api.post(`${postEndpoints.INGRESAR_ORDEN_PRODUCCION}`, dataOrden); 
      return response.data;
  } catch (error) {
    throw error;
  }
}


export const consultarDetallenOrdenPorCriterio = async (ordenData) => {
  try {
    const response = await api.get(`${getEndpoints.CONSULTAR_ORDEN_POR_CRITERIOS}?ordenTurno=${ordenData.ordenTurno}&fechaAproducir=${ordenData.fechaAprducir}&idSucursal${ordenData.idsucursl}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
