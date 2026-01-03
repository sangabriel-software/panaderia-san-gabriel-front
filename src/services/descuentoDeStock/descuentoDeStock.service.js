import api from "../../config/api";
import { deleteEndpoints, getEndpoints, postEndpoints, putEndpoints, } from "../../config/endpoints";


export const descontarStockService = async (dataStock) => {
  try {
      const response = await api.post(`${postEndpoints.DESCONTAR_STOCK}`, dataStock); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const consultarGestionDeDescuentoStockService = async (idSucursal) => {
  try {
      const response = await api.get(`${getEndpoints.DESCUENTO_DE_STOCK}/${idSucursal}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const consultarDetalleDescuentosService = async (idDescuento) => {
    try {
        const response = await api.get(`${getEndpoints.DETALLE_DESCUENTOS}/${idDescuento}`); 
        return response.data;
    } catch (error) {
      throw error;
    }
}

export const cancelarDescuentoStockServices = async (idDescuento) => {
    try {
        const response = await api.delete(`${deleteEndpoints.CANCELAR_DESCUENTO_STOCK}/${idDescuento}`); 
        return response.data;
    } catch (error) {
      throw error;
    }
}