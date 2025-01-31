
import api from "../../config/api";
import { postEndpoints } from "../../config/endpoints";

export const iniciarSesion = async (dataUSuario) => {
  try {
      const response = await api.post(`${postEndpoints.INICIAR_SESION}`, dataUSuario); 
      return response.data;
  } catch (error) {
    throw error;
  }
}