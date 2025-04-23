import { useEffect, useState } from "react";
import { decryptId } from "../../utils/CryptoParams";
import { consultarStockProductosService } from "../../services/stockservices/stock.service";

/* Consulta a BD los permisoso */
const useGetStockGeneral = (idSucursal) => {
  const [stockGeneral, setStockGeneral] = useState([]);
  const [loadingStockGeneral, setLoadingStockGeneral] = useState(true);
  const [showErrorStockGeneral, setShowErrorStockGeneral] = useState(false);
  const [showInfoStockGeneral, setShowInfoStockGeneral] = useState(false);
  const decryptedIdSucursal = decryptId(decodeURIComponent(idSucursal));
  useEffect(() => {
    const fetchStockGeneral = async () => {
      try {
        const response = await consultarStockProductosService(decryptedIdSucursal);
        const data = response;
        if (data.status === 200) {
          setStockGeneral(data.stockProductos);
        } else {
          setShowInfoStockGeneral(true);
        }
      } catch (error) {
        setShowErrorStockGeneral(true);
      } finally {
        setLoadingStockGeneral(false);
      }
    };

    fetchStockGeneral();
  }, []);

  return {stockGeneral, loadingStockGeneral, showErrorStockGeneral, showInfoStockGeneral, setStockGeneral, };
};

export default useGetStockGeneral;
