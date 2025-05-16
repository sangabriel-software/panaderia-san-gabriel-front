import api from "../../config/api";
import {  getEndpoints,  } from "../../config/endpoints";


export const generarReporteHistorialStockService = async (idProducto, idSucursal) => {
  try {
      const response = await api.get(`${getEndpoints.GET_HISTORIAL_STOCK}?idProducto=${idProducto}&idSucursal=${idSucursal}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}