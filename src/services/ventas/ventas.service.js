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