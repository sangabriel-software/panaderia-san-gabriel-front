import { useState, useEffect } from "react";
import { consultarListaDeRoles } from "../../services/userServices/rolesservices/roles.service";


/* Consulta a BD los roles */
export const useRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showError, setShowError] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
  
    useEffect(() => {
      const fetchRoles = async () => {
        try {
          const response = await consultarListaDeRoles();
          const data = response;

          if (data.status === 200) {
            setRoles(data.roles);
          } else {
            setShowInfo(true);
          }
          
        } catch (error) {
          if (error.status === 404) {
            setShowError(true);
          }
          setShowError(true);
        } finally {
          setLoading(false);
        }
      };
  
      fetchRoles();
    }, []); // Solo se ejecuta una vez cuando el componente se monta
  
    return { roles, loading, showError, showInfo, setRoles };
  };
  
  export default useRoles;


/* Consulta interna par la pagina de roles*/
export const useRoleSearch = (roles) => {
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNoResults, setShowNoResults] = useState(false);

  // Sincroniza los roles iniciales
  useEffect(() => {
    setFilteredRoles(roles);
  }, [roles]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = roles.filter((role) =>
      role.nombreRol.toLowerCase().includes(query)
    );
    setFilteredRoles(filtered);

    setShowNoResults(filtered.length === 0 && query.length > 0);
  };

  return {
    filteredRoles,
    searchQuery,
    showNoResults,
    handleSearch,
  };
};
