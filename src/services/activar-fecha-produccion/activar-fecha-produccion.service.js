import api from "../../config/api";
import {  getEndpoints, postEndpoints,  } from "../../config/endpoints";

export const consultarFechaProduccionService = async (fecha) => {
  try {
      const response = await api.get(`${getEndpoints.CONSULTAR_FECHA_PRODUCCION}?fecha=${fecha}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const ingresarFechaProduccionService = async (data) => {
  try{
    const response = await api.post(postEndpoints.ACTIVAR_FECHA_PRODUCCION, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}