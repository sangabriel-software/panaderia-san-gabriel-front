import api from "../../config/api";
import { getEndpoints, postEndpoints } from "../../config/endpoints";

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
