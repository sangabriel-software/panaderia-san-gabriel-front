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

export const generarReporteVentasService = async (fechaInicio, fechaFin, idSucursal) => {
  try {
      const response = await api.get(`${getEndpoints.GET_REPORTE_VENTAS}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&idSucursal=${idSucursal}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const generarReportePerdidasService = async (fechaInicio, fechaFin, idSucursal) => {
  try {
      const response = await api.get(`${getEndpoints.GET_REPORTE_PERDIDAS}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&idSucursal=${idSucursal}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}