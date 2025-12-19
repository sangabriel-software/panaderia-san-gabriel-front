import { useEffect, useState } from "react";
import { currentDate } from "../../utils/dateUtils";
import { consultarCampaniaServices, consultarPreguntasPorCampaniaService } from "../../services/Encuestas/Encuestas.service";

/* Consulta a BD si hay campanias activas y si si, consulta las prguntas. */
export const useGetCampaniaEncuesta = () => {
  const [loadingCampania, setLoadingCampania] = useState(true);
  const [showErrorCampania, setShowErrorCampania] = useState(false);
  const [showInfoCampania, setShowInfoCampania] = useState(false);
  const [campania, setCampania] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const fechadelDia = currentDate();

  useEffect(() => {
    const fetchCampaniaData = async () => {
      try {
        setLoadingCampania(true); // Asegura el estado inicial de carga
  
        const resCampania = await consultarCampaniaServices(fechadelDia);
  
        // 1. Validar primera respuesta y que existan campañas
        if (resCampania?.status === 200 && resCampania.campania?.length > 0) {
          setCampania(resCampania.campania);
  
          // 2. Encadenar la segunda petición usando el ID de la primera campaña
          const idCampania = resCampania.campania[0].idCampania;
          const resPreguntas = await consultarPreguntasPorCampaniaService(idCampania);
  
          // 3. Validar segunda respuesta
          if (resPreguntas?.status === 200) {
            setPreguntas(resPreguntas.preguntas);
          } else {
            setShowInfoCampania(true);
          }
        } else {
          setShowInfoCampania(true);
        }
      } catch (error) {
        setShowErrorCampania(true);
      } finally {
        setLoadingCampania(false);
      }
    };
  
    fetchCampaniaData();
  }, []); // Añadida dependencia si fechadelDia cambia
  
    return { campania, preguntas, loadingCampania, showErrorCampania, showInfoCampania };
  };
  
  export default useGetCampaniaEncuesta;
