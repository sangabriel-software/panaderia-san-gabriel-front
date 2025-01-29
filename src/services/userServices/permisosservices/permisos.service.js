import api from "../../../config/api";
import getEndpoints, { deleteEndpoints, postEndpoints } from "../../../config/endpoints";

export const AsignarPermisosARol = async (dataRolesPermisos) => {
  try {
      const response = await api.post(`${postEndpoints.INGRESAR_PERMISOSROLES}`, dataRolesPermisos); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const consultarPermisosList = async () => {
    try {
        const response = await api.get(`${getEndpoints.ALL_PERMISOS}`); 
        return response.data;
    } catch (error) {
      throw error;
    }
}

export const consultarRolYPermisosPorId = async (idRol) => {
  try {
      const response = await api.get(`${getEndpoints.ROL_PERMISOS}/${idRol}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const eliminarPermisosARol = async (dataRolesPermisos) => {
  try {
      const response = await api.post(`${deleteEndpoints.ELINAR_PERMISOS}`, dataRolesPermisos); 
      return response.data;
  } catch (error) {
    throw error;
  }
}