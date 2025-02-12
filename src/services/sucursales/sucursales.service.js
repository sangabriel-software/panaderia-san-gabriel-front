import api from "../../config/api";
import { getEndpoints, } from "../../config/endpoints";

export const consultarSucursalesService = async () => {
    try {
        const response = await api.get(`${getEndpoints.CONSULTAR_SUCURSALES}`); 
        return response.data;
    } catch (error) {
      throw error;
    }
}