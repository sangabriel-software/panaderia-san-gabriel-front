import api from "../../../config/api";
import {getEndpoints, postEndpoints, deleteEndpoints, putEndpoints } from "../../../config/endpoints";


export const ingresarNuevoRol = async (nuevoRol) => {
  try {
      const response = await api.post(`${postEndpoints.INGRESAR_ROL}`, nuevoRol); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const actualizarRol = async (dataRol) => {
  try {
      const response = await api.put(`${putEndpoints.ACTUALIZAR_ROL}`, dataRol); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const consultarListaDeRoles = async () => {
    try {
        const response = await api.get(`${getEndpoints.ALL_ROLES}`); 
        return response.data;
    } catch (error) {
      throw error;
    }
}

export const eliminarRol = async (idRol) => {
  try {
      const response = await api.delete(`${deleteEndpoints.ELIMINAR_ROL}/${idRol}`); 
      return response.data;
  } catch (error) {
    throw error.response;
  }
}