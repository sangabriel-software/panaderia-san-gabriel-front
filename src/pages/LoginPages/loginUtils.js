import { iniciarSesion } from "../../services/authServices/auth.service";
import { getUserData } from "../../utils/Auth/decodedata";
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
      setLocalStorage("token", response.authUser);
      // Obtener información del usuario desde el token
      const userData = getUserData();
    
      toast.success("Inicio de sesión exitoso", { autoClose: 1000 });
    
      setTimeout(() => {

        // Identificar usuario en Better Stack
        if (userData?.idUsuario) {
          betterstack("user", {
            user_id: String(userData.idUsuario),
            name: (userData.usuario + " " + userData.apellido ) || undefined,
            userName: userData.usuario || undefined,
            email: userData.correo || undefined
          });
      
          // Registrar explícitamente el login
          betterstack("track", "login", {
            user_id: String(userData.idUsuario),
            userName: userData.usuario || undefined,
          });
        }

        if (userData?.cambioContrasenia === 1) {
          navigate("/cambiar-password");
        } else {
          navigate("/home");
        }
      }, 500);
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
