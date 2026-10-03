import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { clearbetterUser } from "../../observability/betterStack";
import { removeLocalStorage } from "../../utils/Auth/localstorage";

const useLogout = () => {
  const navigate = useNavigate(); // ✅ nivel superior del hook

  const handleLogout = useCallback(() => {
    removeLocalStorage("userData");
    removeLocalStorage("token");
    sessionStorage.clear();
    clearbetterUser();

    navigate("/login", { replace: true });
  }, [navigate]);

  return { handleLogout };
};

export default useLogout;