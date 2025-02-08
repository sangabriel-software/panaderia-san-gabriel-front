import api from "../../config/api";
import { getEndpoints, postEndpoints } from "../../config/endpoints";


export const consultarOrdenesProduccion = async () => {
  try {
    const response = await api.get(getEndpoints.CONSULTAR_ORDENES_PRODUCCION);
    return response.data;
  } catch (error) {
    throw error;
  }
};