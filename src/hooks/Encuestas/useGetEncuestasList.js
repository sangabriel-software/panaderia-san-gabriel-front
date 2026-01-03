import { useEffect, useState } from "react";
import { currentDate } from "../../utils/dateUtils";
import { consultarCampaniaServices, consultarEcuestasServices, consultarPreguntasPorCampaniaService } from "../../services/Encuestas/encuestas.service";

/* Consulta a BD si hay campanias activas y si si, consulta las prguntas. */
export const useGetEncuestasList = () => {
  const [loading, setLoading] = useState(true);
  const [showError, setShowError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [encuestas, setEncuestas] = useState([]);

  useEffect(() => {
    const fetchEncuestas = async () => {
      try {
        setLoading(true); // Asegura el estado inicial de carga
  
        const resEncuestas = await consultarEcuestasServices();
  
        // 1. Validar primera respuesta y que existan campañas
        if (resEncuestas?.status === 200 && resEncuestas.encuestas?.length > 0) {
          setEncuestas(resEncuestas.encuestas);
        } else {
          setShowInfo(true);
        }
      } catch (error) {
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };
  
    fetchEncuestas();
  }, []); // Añadida dependencia si fechadelDia cambia
  
    return { encuestas, loading, showError, showInfo, setEncuestas };
  };
  
  export default useGetEncuestasList;
