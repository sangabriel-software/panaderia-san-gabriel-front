import api from "../../config/api";
import {  getEndpoints,  } from "../../config/endpoints";


export const generarReporteHistorialStockService = async (idProducto, idSucursal, fechaInicio, fechaFin) => {
  try {
      const response = await api.get(`${getEndpoints.GET_HISTORIAL_STOCK}?idProducto=${idProducto}&idSucursal=${idSucursal}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`); 
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

export const generarReporteVentasEliminadasService = async (fechaInicio, fechaFin, idSucursal) => {
  try {
      const response = await api.get(`${getEndpoints.GET_REPORTE_VENTAS_ELIMINADAS}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&idSucursal=${idSucursal}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const generarReporteBalanceStockService = async (fecha, idSucursal, turno) => {
  try {
      const response = await api.get(`${getEndpoints.GET_REPORTE_BALANCE_STOCK}?fecha=${fecha}&idSucursal=${idSucursal}&turno=${turno}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}