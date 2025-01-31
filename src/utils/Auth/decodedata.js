import { getLocalStorage } from "./localstorage";

// Función para decodificar un token JWT
export const decodeJWT = (token) => {
  try {
    const payload = token.split(".")[1];
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
export const getUserData = (token) => {
  const decoded = decodeJWT(token);
  return decoded ? decoded.usuario : null;
};

// Función para obtener los permisos del usuario desde el token
export const getUserPermissions = (token) => {
  const decoded = decodeJWT(token);
  return decoded ? decoded.permisos : null;
};
