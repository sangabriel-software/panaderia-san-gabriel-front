import api from "../../config/api";
import getEndpoints from "../../config/endpoints";


export const consultarProductosService = async () => {
    try {
        const response = await api.get(`${getEndpoints.ALL_PRODUCTOSYPRECIOS}`); 
        return response.data;
    } catch (error) {
      throw error;
    }
}