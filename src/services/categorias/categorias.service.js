import api from "../../config/api";
import { deleteEndpoints, getEndpoints, postEndpoints, putEndpoints } from "../../config/endpoints";

export const ingresarCategoriaService = async (categoria) => {
  try {
      const response = await api.post(`${postEndpoints.INGRESAR_CATEGORIA}`, categoria); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const consultarCategoriasService = async () => {
  try {
    const response = await api.get(getEndpoints.CONSULTAR_CATEGORIAS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const actualizarCategoriaService = async (categoria) => {
  try {
    const response = await api.put(`${putEndpoints.ACTUALIZAR_CATEGORIA}`, categoria);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const eliminarCategoriaService = async (idCategoria) => {
  try {
    const response = await api.delete(`${deleteEndpoints.ELIMINAR_CATEGORIA}/${idCategoria}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
