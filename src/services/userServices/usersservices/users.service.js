import api from "../../../config/api";
import { getEndpoints, deleteEndpoints, postEndpoints, putEndpoints } from "../../../config/endpoints";


export const crearUsuario = async (dataUSuario) => {
  try {
      const response = await api.post(`${postEndpoints.CREAR_USUARIO}`, dataUSuario); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const consultarUsuarios = async () => {
    try {
        const response = await api.get(`${getEndpoints.ALL_USERS}`); 
        return response.data;
    } catch (error) {
      throw error;
    }
}

export const elminarUsuario = async (idUsuario) => {
  try {
      const response = await api.delete(`${deleteEndpoints.ELMINAR_USUARIOS}/${idUsuario}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const bloquearUsuario = async (idUsuario) => {
  try {
      const response = await api.put(`${putEndpoints.BLOQUEAR_USUARIO}/${idUsuario}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const desbloquearUsuario = async (idUsuario) => {
  try {
      const response = await api.put(`${putEndpoints.DESBLOQUEAR_USAURIO}/${idUsuario}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const actualizarDatosUsuario = async (dataUSuario) => {
  try {
      const response = await api.put(`${putEndpoints.ACTUALIZAR_DATOS_USUARIO}`, dataUSuario); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const cambiarPassService = async (dataNewPass) => {
  try {
      const response = await api.put(`${putEndpoints.CAMBIAR_PASS}`, dataNewPass); 
      return response.data;
  } catch (error) {
    throw error;
  }
}
