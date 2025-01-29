import React, { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PrivateRoute = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Función para verificar si el token ha expirado
  const isTokenExpired = (token) => {
    if (!token) return true; // Si no hay token, asumimos que ha expirado

    try {
      const payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));
      const currentTime = Math.floor(Date.now() / 1000); // Timestamp actual en segundos
      return currentTime > decodedPayload.exp; // True si el token ha expirado
    } catch (error) {
      console.error("Error decodificando el token:", error);
      return true; // Si hay un error, asumimos que el token es inválido
    }
  };

  useEffect(() => {
    if (!token) {
      // Si no hay token, mostrar un mensaje y redirigir al login
      toast.error("Necesitas iniciar sesión para acceder.", {
        autoClose: 5000,
      });
      navigate("/login", { state: { from: "unauthorized" } }); // Redirige al login con un estado
    } else if (isTokenExpired(token)) {
      // Si el token existe pero ha expirado, mostrar un mensaje y redirigir al login
      toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", {
        autoClose: 5000,
      });
      localStorage.removeItem("token"); // Elimina el token expirado
      navigate("/login", { state: { from: "expired" } }); // Redirige al login con un estado
    }
  }, [token, navigate]);

  // Si el token es válido, renderiza las rutas hijas
  return token && !isTokenExpired(token) ? <Outlet /> : null;
};

export default PrivateRoute;