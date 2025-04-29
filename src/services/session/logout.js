import { removeLocalStorage } from "../../utils/Auth/localstorage";
import { toast } from "react-toastify";

const useLogout = () => {
  const handleLogout = () => {
    // Mostrar notificación de proceso
    toast.loading("Cerrando sesión...", {
      toastId: 'logout-process',
      autoClose: false,
      autoClose: 2000,
    });

    // Esperar un momento para que el usuario vea el mensaje
    setTimeout(() => {
      // Limpiar datos
      removeLocalStorage("userData");
      removeLocalStorage("token");
      
      // Redirigir con parámetro
      window.location.href = "/login?logout=success";
    }, 1000);
  };

  return { handleLogout };
};

export default useLogout;