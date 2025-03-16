import api from "../../config/api";
import { deleteEndpoints, getEndpoints, postEndpoints, putEndpoints, } from "../../config/endpoints";

export const consultarSucursalesService = async () => {
    try {
        const response = await api.get(`${getEndpoints.CONSULTAR_SUCURSALES}`); 
        return response.data;
    } catch (error) {
      throw error;
    }
}

export const ingresarSucursalService = async (dataSucursal) => {
  try {
      const response = await api.post(`${postEndpoints.INGRESAR_SUCURSAL}`, dataSucursal); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const actualizarSucursalService = async (dataSucursal) => {
  try {
      const response = await api.put(`${putEndpoints.ACTUALIZAR_SUCURSALES}`, dataSucursal); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const elminarSUcursalService = async (idSucursal) => {
  try {
    const response = await api.delete(`${deleteEndpoints.ELMINAR_SUCURSAL}/${idSucursal}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}
