import { useEffect, useState } from "react";
import { decryptId } from "../../utils/CryptoParams";
import { consultarDetalleDescuentosService } from "../../services/descuentoDeStock/descuentoDeStock.service";


/* Consulta a BD los permisoso */
const useGetDetalleDescuento = (idDescuento) => {
  const [descuentoDetalle, setDescuentoDetalle] = useState([]);
  const [loadingDescuentoDetalle, setLoadingDescuentoDetalle] = useState(true);
  const [showErrorDescuentoDetalle, setShowErrorDescuentoDetalle] = useState(false);
  const [showInfoDescuentoDetalle, setShowInfoDescuentoDetalle] = useState(false);
  const decryptedIdDescuento = decryptId(decodeURIComponent(idDescuento));
  console.log(decryptedIdDescuento);
  useEffect(() => {
    const fetchDescuentoDetalle = async () => {
      try {
        const response = await consultarDetalleDescuentosService(decryptedIdDescuento);
        const data = response;
        console.log(data);
        if (data.status === 200) {
          setDescuentoDetalle(data.descuentoStock);
        } else {
          setShowInfoDescuentoDetalle(true);
        }
      } catch (error) {
        setShowErrorDescuentoDetalle(true);
      } finally {
        setLoadingDescuentoDetalle(false);
      }
    };

    fetchDescuentoDetalle();
  }, []);

  return {descuentoDetalle, loadingDescuentoDetalle, showErrorDescuentoDetalle, showInfoDescuentoDetalle, setDescuentoDetalle, };
};

export default useGetDetalleDescuento;
