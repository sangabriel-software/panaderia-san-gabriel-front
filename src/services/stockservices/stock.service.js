import api from "../../config/api";
import { deleteEndpoints, getEndpoints, postEndpoints, putEndpoints, } from "../../config/endpoints";

export const consultarStockProductosDelDiaService = async (idSucursal, fechaDelDia) => {
    try {
        const response = await api.get(`${getEndpoints.STOCK_DEL_DIA}?idSucursal=${idSucursal}&fecha=${fechaDelDia}`); 
        return response.data;
    } catch (error) {
      throw error;
    }
}