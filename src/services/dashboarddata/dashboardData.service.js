import api from "../../config/api";
import { getEndpoints } from "../../config/endpoints";

export const consultarDashboardDataService = async () => {
    try {
        const response = await api.get(`${getEndpoints.CONSULTAR_DASHBOARD_DATA}`); 
        return response.data;
    } catch (error) {
      throw error;
    }
}
