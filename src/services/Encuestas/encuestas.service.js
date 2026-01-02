import api from "../../config/api";
import { deleteEndpoints, getEndpoints, postEndpoints, putEndpoints, } from "../../config/endpoints";


export const consultarCampaniaServices = async (fechaHoy) => {
  try {
      const response = await api.get(`${getEndpoints.GET_CAMPANIA_ENCUESTA}?fechaHoy=${fechaHoy}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const consultarPreguntasPorCampaniaService = async (idCampania) => {
    try {
        const response = await api.get(`${getEndpoints.GET_PREGUNTAS_CAMPANIA}?idCampania=${idCampania}`); 
        return response.data;
    } catch (error) {
      throw error;
    }
}

export const registrarRespuestaService = async (data) => {
    try{
        const response = await api.post(`${postEndpoints.REGISTRAR_PREGUNTAS}`, data);
        return response.data;
    }catch(error){
        throw error;
    }
}

export const crearCampaniaServices = async (data) => {
  try{
      const response = await api.post(`${postEndpoints.CREAR_CAMPANIA}`, data);
      return response.data;
  }catch(error){
      throw error;
  }
}

export const consultarEcuestasServices = async () => {
  try{
    const response = await api.get(`${getEndpoints.GET_ENCUESTAS}`);
    return response.data;
  }catch(error){
    throw error;
  }
}