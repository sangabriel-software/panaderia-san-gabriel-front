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
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: si el backend responde 401 (token inválido o revocado),
// se limpia la sesión y se manda al login.
// La condición sobre pathname evita redirigir en el propio login (credenciales incorrectas).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("lastRoute");
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default api;