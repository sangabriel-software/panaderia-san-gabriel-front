import api from "../../config/api";
import { deleteEndpoints, getEndpoints, postEndpoints, putEndpoints, } from "../../config/endpoints";

export const consultarRecetasService = async () => {
    try {
        const response = await api.get(`${getEndpoints.CONSULTAR_RECETAS}`); 
        return response.data;
    } catch (error) {
      throw error;
    }
}

export const ingresarRecetaService = async (dataReceta) => {
  try {
      const response = await api.post(`${postEndpoints.INGRESAR_RECETA}`, dataReceta); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const actualizarRecetaService = async (dataReceta) => {
  try {
      const response = await api.put(`${putEndpoints.ACTUALIZAR_RECETA}`, dataReceta); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const elminarSUcursalService = async (idProducto) => {
  try {
    const response = await api.delete(`${deleteEndpoints.ELIMINAR_RECETA}/${idProducto}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}
