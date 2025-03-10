import api from "../../config/api";
import { getEndpoints, postEndpoints, deleteEndpoints } from "../../config/endpoints";


export const consultarVentasPorUsuarioService = async (usuario) => {
  try {
    const idUsuario = usuario.rol === 'Admin' ? "" : usuario.idUsuario;
    const response = await api.get(`${getEndpoints.CONSULTAR_VENTAS_USUARIO}?idUsuario=${idUsuario}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const ingresarVentaService = async (dateVenta) => {
  try {
      const response = await api.post(`${postEndpoints.INGRESAR_VENTA}`, dateVenta); 
      return response.data;
  } catch (error) {
  
    throw error;
  }
}

export const eliminarVentaService = async (idVenta) => {
  try {
    const response = await api.delete(`${deleteEndpoints.ELMINAR_VENTA}/${idVenta}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const consultarDetalleVenta = async (idVenta) => {
  try {
    const response = await api.get(`${getEndpoints.CONSULTAR_DETALLE_VENTA}/${idVenta}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};