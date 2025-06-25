import api from "../../config/api";
import { getEndpoints, postEndpoints, deleteEndpoints, putEndpoints } from "../../config/endpoints";


export const ingresarOrdenEspecialService = async (ordenEspecial) => {
    try {
        const response = await api.post(`${postEndpoints.INGRESAR_ORDEN_ESPECIAL}`, ordenEspecial); 
        return response.data;
    } catch (error) {
      throw error;
    }
}

export const consultarOrdenesEspecialesService = async (idRol, idSucursal) => {
  try {
    const response = await api.get(`${getEndpoints.CONSULTAR_ORDENES_ESPECIALES}?idRol=${idRol}&idSucursal=${idSucursal}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const consultarOrdenEspecialByIdService = async (idOrdenEspecial) => {
  try {
    const response = await api.get(`${getEndpoints.CONSULTAR_ORDENES_ESPECIALES_POR_ID}/${idOrdenEspecial}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const eliminarOrdenEspecialService = async (idOrdenEspecial) => {
  try {
    const response = await api.delete(`${deleteEndpoints.ELIMINAR_ORDEN_ESPECIAL}/${idOrdenEspecial}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const actualizarOrdenEspecialService = async (ordenEspecial) => {
  try {
    const response = await api.put(`${putEndpoints.ACTUALIZAR_ORDEN_ESPECIAL}`, ordenEspecial);
    return response.data;
  } catch (error) {
    throw error;
  }
};

