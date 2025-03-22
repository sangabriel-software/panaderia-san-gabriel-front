import { useNavigate } from "react-router-dom";
import { removeLocalStorage } from "../../utils/Auth/localstorage";
import { toast } from "react-toastify";

const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeLocalStorage("userData");
    removeLocalStorage("token");

    // Mostrar notificación de cierre de sesión
    toast.success("Se ha cerrado la sesión", {
      autoClose: 3000,
    });

    // Redirigir al usuario a la página de inicio de sesión
    navigate("/");
  };

  return { handleLogout };
};

export default useLogout;
