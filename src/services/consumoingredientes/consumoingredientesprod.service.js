import api from "../../config/api";
import { getEndpoints, postEndpoints, deleteEndpoints } from "../../config/endpoints";

export const consultarDetalleConsumoProduccion = async (idOrdenProduccion) => {
  try {
    const response = await api.get(`${getEndpoints.CONSULTAR_CONSUMO_INGREDIENTES}/${idOrdenProduccion}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
