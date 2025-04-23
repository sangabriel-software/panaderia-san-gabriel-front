import { getUserPermissions } from "./decodedata";
import { exclusiones } from "./exclusiones.routes";

// Función para verificar si el token ha expirado
export const isTokenExpired = (TokenExpired) => {
  if (!TokenExpired) return true;

  try {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime > TokenExpired;
  } catch (error) {
    return true;
  }
};

// Función para verificar si el usuario tiene acceso a la ruta actual
export const hasPermission = (rutaActual) => {
  const permisosUsuario = getUserPermissions(); // Obtener los permisos del usuario

  // Verificar si la ruta actual está en las exclusiones
  if (Object.values(exclusiones).includes(rutaActual)) {
    return true; // Permitir acceso si la ruta está excluida
  }

  // Verificar si el usuario tiene acceso a la ruta actual
  return permisosUsuario.some((permiso) =>
    rutaActual.startsWith(permiso.rutaAcceso)
  );
};
