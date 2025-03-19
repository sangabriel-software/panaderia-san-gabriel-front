import { getUserPermissions } from "./decodedata";

  // Función para verificar si el usuario tiene acceso a la ruta actual
  export const hasPermission = (rutaActual) => {
      const permisosUsuario = getUserPermissions(); // Obtener los permisos del usuario

    // Verificar si el usuario tiene acceso a la ruta actual
    return permisosUsuario.some((permiso) =>
      rutaActual.startsWith(permiso.rutaAcceso)
    );
};