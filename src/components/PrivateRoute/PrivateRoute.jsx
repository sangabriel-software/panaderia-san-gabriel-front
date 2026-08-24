import React, { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { removeLocalStorage } from "../../utils/Auth/localstorage";
import { getTokenExpiration, getUserData, getUserPermissions } from "../../utils/Auth/decodedata";
import { hasPermission, isTokenExpired } from "../../utils/Auth/validacionpermisos";
import { exclusiones } from "../../utils/Auth/exclusiones.routes";

const PrivateRoute = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const TokenExpired      = getTokenExpiration();
  const permisosUsuario   = getUserPermissions();
  const rutaActual        = location.pathname;
  const userData          = getUserData(); // ✅ obtener datos del usuario
  const mustChangePass    = userData?.cambioContrasenia === 1;

  useEffect(() => {
    if (!TokenExpired) {
      toast.error("Necesitas iniciar sesión para acceder.", { autoClose: 3000 });
      navigate("/login", { state: { from: "unauthorized" }, replace: true });
    } else if (isTokenExpired(TokenExpired)) {
      toast.error("Tu sesión ha expirado.", { autoClose: 3000 });
      removeLocalStorage("token");
      navigate("/login", { state: { from: "expired" }, replace: true });
    } else if (mustChangePass && rutaActual !== "/cambiar-password") {
      // ✅ Si debe cambiar contraseña, solo puede estar en esa ruta
      navigate("/cambiar-password", { replace: true });
    } else if (!hasPermission(rutaActual) && !Object.values(exclusiones).includes(location.pathname)) {
      navigate("/acceso-denegado", { replace: true });
    }
  }, [TokenExpired, navigate, location, permisosUsuario, mustChangePass]);

  return TokenExpired && !isTokenExpired(TokenExpired) && (hasPermission(rutaActual) || Object.values(exclusiones).includes(location.pathname)) ? (
    <Outlet />
  ) : null;
};

export default PrivateRoute;