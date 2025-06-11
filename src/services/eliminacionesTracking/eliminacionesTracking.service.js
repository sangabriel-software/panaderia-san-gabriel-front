import api from "../../config/api";
import { deleteEndpoints, getEndpoints, postEndpoints, } from "../../config/endpoints";



export const consultarEliminacionesService = async (procesoEliminado, fecha) => {
  try {
      const response = await api.get(`${getEndpoints.CONSULTAR_ELIMINACIONES}?procesoEliminado=${procesoEliminado}&fecha=${fecha}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}
