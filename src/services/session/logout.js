import { useNavigate } from "react-router-dom";
import { removeLocalStorage } from "../../utils/Auth/localstorage";

const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeLocalStorage("token");

    // Redirigir al usuario a la página de inicio de sesión
    navigate("/");
  };

  return { handleLogout };
};

export default useLogout;
