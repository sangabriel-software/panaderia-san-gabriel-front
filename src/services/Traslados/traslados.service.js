import api from "../../config/api";
import { deleteEndpoints, getEndpoints, postEndpoints, } from "../../config/endpoints";


export const ingresarTrasladoService = async (dataTraslado) => {
  try {
      const response = await api.post(`${postEndpoints.INGRESAR_TRASLADO}`, dataTraslado); 
      return response.data;
  } catch (error) {
    throw error;
  } 
}

export const consultarTrasladosService = async () => {
  try {
      const response = await api.get(`${getEndpoints.CONSULTAR_TRASLADOS}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const consultardetalleTrasladoService = async (idTraslado) => {
  try {
      const response = await api.get(`${getEndpoints.CONSULTAR_DETALLE_TRASLADOS}/${idTraslado}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const eliminarTrasladoService = async (idTraslado) => {
  try {
      const response = await api.delete(`${deleteEndpoints.ELIMINAR_TRASLADO}/${idTraslado}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}