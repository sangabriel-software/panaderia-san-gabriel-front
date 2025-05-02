import api from "../../config/api";
import { deleteEndpoints, getEndpoints, postEndpoints, putEndpoints, } from "../../config/endpoints";


// export const ingresarStockProductos = async (dataStock) => {
//   try {
//       const response = await api.post(`${postEndpoints.INGRESAR_STOCK}`, dataStock); 
//       return response.data;
//   } catch (error) {
//     throw error;
//   }
// }

export const consultarGestionDeDescuentoStockService = async (idSucursal) => {
  try {
      const response = await api.get(`${getEndpoints.DESCUENTO_DE_STOCK}/${idSucursal}`); 
      return response.data;
  } catch (error) {
    throw error;
  }
}

// export const consultarStockProductosDelDiaService = async (idSucursal, fechaDelDia) => {
//     try {
//         const response = await api.get(`${getEndpoints.STOCK_DEL_DIA}?idSucursal=${idSucursal}&fecha=${fechaDelDia}`); 
//         return response.data;
//     } catch (error) {
//       throw error;
//     }
// }