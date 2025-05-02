import { useEffect, useState } from "react";
import { decryptId } from "../../utils/CryptoParams";
import { consultarGestionDeDescuentoStockService } from "../../services/DescuentoDeStock/descuentoDeStock.service";

/* Consulta a BD los permisoso */
const useGetStockDescontado = (idSucursal) => {
  const [stockDescontadoList, setStockDescontadoList] = useState([]);
  const [loadingStockDescontado, setLoadingStockDescontado] = useState(true);
  const [showErrorStockDescontado, setShowErrorStockDescontado] = useState(false);
  const [showInfoStockDescontado, setShowInfoStockDescontado] = useState(false);
  const decryptedIdSucursal = decryptId(decodeURIComponent(idSucursal));
  useEffect(() => {
    const fetchStockDescontado = async () => {
      try {
        const response = await consultarGestionDeDescuentoStockService(decryptedIdSucursal);
        const data = response;
        if (data.status === 200) {
          setStockDescontadoList(data.descuentos);
        } else {
          setShowInfoStockDescontado(true);
        }
      } catch (error) {
        setShowErrorStockDescontado(true);
      } finally {
        setLoadingStockDescontado(false);
      }
    };

    fetchStockDescontado();
  }, []);

  return {stockDescontadoList, loadingStockDescontado, showErrorStockDescontado, showInfoStockDescontado, setStockDescontadoList, };
};

export default useGetStockDescontado;
