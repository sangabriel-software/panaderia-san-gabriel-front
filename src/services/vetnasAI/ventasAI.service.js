import api from "../../config/api";
import { postEndpoints } from "../../config/endpoints";

export const ingresarVentaAIService = async (formData) => {
  try {
    const response = await api.post(
      `${postEndpoints.INGRESAR_VENTA_AI}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // ✅ sobreescribe solo para esta llamada
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
