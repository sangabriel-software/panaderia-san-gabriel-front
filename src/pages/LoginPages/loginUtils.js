import { iniciarSesion } from "../../services/authServices/auth.service";
import { setLocalStorage } from "../../utils/Auth/localstorage";
import { toast } from "react-toastify";

/**
 * Maneja el proceso de inicio de sesión.
 * @param {Object} data - Datos del formulario de inicio de sesión.
 * @param {Function} navigate - Función para redirigir al usuario.
 * @param {Function} setIsLoading - Función para manejar el estado de carga.
 */
export const handleLogin = async (data, navigate, setIsLoading) => {
  setIsLoading(true);

  try {
    const response = await iniciarSesion(data);

    if (response.status === 200) {
      // Guardamos el token en localStorage
      setLocalStorage("token", response.authUser);

      // Mostrar notificación de éxito
      toast.success("Inicio de sesión exitoso", {
        autoClose: 1000,
      });

      // Redirigir al dashboard después de un pequeño retraso
      setTimeout(() => {
        navigate("/dashboard");
      }, 500); // 1 segundo de retraso
    }

  } catch (error) {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 404) {
        toast.error("Usuario o contraseña incorrectos.", {
          autoClose: 2000,
        });
      } 

      if(error.response.status === 403){
        toast.error("Usuario Bloqueado, comunicate con el administrador", {
          autoClose: 2000,
        });
      }
      
    } else {
      toast.error("Servicio no disponible, intenta más tarde.", {
        autoClose: 2000,
      });
    }
  } finally {
    setIsLoading(false);
  }
};
