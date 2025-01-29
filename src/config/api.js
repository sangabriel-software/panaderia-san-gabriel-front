import axios from "axios";
import { enviroment } from "./config";

const api = axios.create({
  baseURL: enviroment.api_url, // URL base de la API
  headers: {
    "Content-Type": "application/json", // Encabezado predeterminado
  },
});

// Interceptor para agregar el token en cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Obtiene el token del localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Agrega el token al header
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
