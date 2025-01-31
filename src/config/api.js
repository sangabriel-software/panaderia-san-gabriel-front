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
    let token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


export default api;
