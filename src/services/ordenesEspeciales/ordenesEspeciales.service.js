import api from "../../config/api";
import { getEndpoints, postEndpoints, deleteEndpoints } from "../../config/endpoints";


export const ingresarOrdenProduccionService = async (ordenEspecial) => {
    try {
        const response = await api.post(`${postEndpoints.INGRESAR_ORDEN_ESPECIAL}`, ordenEspecial); 
        return response.data;
    } catch (error) {
      throw error;
    }
  }

export const consultarOrdenesEspecialesService = async () => {
  try {
    const response = await api.get(getEndpoints.CONSULTAR_ORDENES_ESPECIALES);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const consultarOrdenEspecialByIdService = async (idOrdenEspecial) => {
  try {
    const response = await api.get(`${getEndpoints.CONSULTAR_ORDENES_ESPECIALES_POR_ID}/${idOrdenEspecial}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/*export const eliminarOrdenProduccionService = async (idOrdenProduccion) => {
  try {
    const response = await api.delete(`${deleteEndpoints.ELIMINAR_ORDEN_PRODUCCION}/${idOrdenProduccion}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const consultarDetalleOrdenPorCriterio = async (ordenTurno, fechaAprducir, idSucursal) => {
  try {
    const response = await api.get(`${getEndpoints.CONSULTAR_ORDEN_POR_CRITERIOS}?ordenTurno=${ordenTurno}&fechaAproducir=${fechaAprducir}&idSucursal=${idSucursal}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};*/
