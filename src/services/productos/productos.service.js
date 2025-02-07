import api from "../../config/api";
import { deleteEndpoints, getEndpoints, postEndpoints, putEndpoints } from "../../config/endpoints";


export const ingresarProducto = async (dataProducto) => {
  try {
      const response = await api.post(`${postEndpoints.INGRESAR_PRODUCTO}`, dataProducto); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const ingresarPrecioProducto = async (dataPrecio) => {
  try {
      const response = await api.post(`${postEndpoints.INGRESAR_PRECIOPRODUCTO}`, dataPrecio); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const ingresarProductoImagen = async (dataImagen) => {
  try {
      const response = await api.post(`${postEndpoints.INGRESAR_IMAGEN_PRODUCTO}`, dataImagen); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

export const consultarProductosService = async () => {
    try {
        const response = await api.get(`${getEndpoints.ALL_PRODUCTOSYPRECIOS}`); 
        return response.data;
    } catch (error) {
      throw error;
    }
}

export const desactivarProductosService = async (idProducto) => {
  try {
    const response = await api.delete(`${deleteEndpoints.DESACTIVAR_PRODUCTOS}/${idProducto}`); 
      return response.data;
  } catch (error) {
    console.log(error)
    throw error;
  }
}

export const actualizarProductoSevice = async (dataProducto) => {
  try {
    const response = await api.put(`${putEndpoints.ACTUALIZAR_PRODUCTO}`, dataProducto); 
      return response.data;
  } catch (error) {
    console.log(error)
    throw error;
  }
}

export const actualizarPrecioProductoSevice = async (dataProducto) => {
  try {
    const response = await api.put(`${putEndpoints.ACTUALIZAR_PRECIO}`, dataProducto); 
      return response.data;
  } catch (error) {
    console.log(error)
    throw error;
  }
}