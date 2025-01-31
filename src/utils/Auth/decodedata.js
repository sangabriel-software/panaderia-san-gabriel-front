import { getLocalStorage } from "./localstorage";

// Función para decodificar un token JWT
export const decodeJWT = (token) => {
  try {
    // Elimina las comillas al inicio y al final si existen
    const cleanedToken = token.replace(/^"|"$/g, "");

    // Extrae el payload
    const payload = cleanedToken.split(".")[1];

    // Decodifica el payload
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch (error) {
    return null;
  }
};

// Función para obtener la fecha de expiración del token
export const getTokenExpiration = () => {
  const token = getLocalStorage("token");
  const decoded = decodeJWT(token);
  return decoded ? decoded.exp : null;
};

// Función para obtener los datos del usuario desde el token
export const getUserData = () => {
  const token = getLocalStorage("token");
  const decoded = decodeJWT(token);
  return decoded ? decoded.usuario : null;
};

// Función para obtener los permisos del usuario desde el token
export const getUserPermissions = () => {
  const token = getLocalStorage("token");
  const decoded = decodeJWT(token);
  return decoded ? decoded.permisos : null;
};
