import axios from 'axios';
import { enviroment } from './config';


const api = axios.create({
  baseURL: enviroment.api_url, // URL base para todas las solicitudes
  headers: {
    'Content-Type': 'application/json', // Encabezado predeterminado
    // Puedes agregar otros encabezados aquí
  }
});

export default api;
