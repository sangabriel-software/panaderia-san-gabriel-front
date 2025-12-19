import { useEffect, useState } from "react";
import { consultarStockProductosDelDiaService } from "../../services/stockservices/stock.service";
import { currentDate } from "../../utils/dateUtils";
import { decryptId } from "../../utils/CryptoParams";

/* Consulta a BD los permisoso */
export const useGetStockDelDia = (idSucursal) => {
    const [stockDelDia, setStockDelDia] = useState([]);
    const [loadingStockDiario, setLoadingStockDiario] = useState(true);
    const [showErrorStockDiario, setShowErrorStockDiario] = useState(false);
    const [showInfoStockDiario, setShowInfoStockDiario] = useState(false);
    const decryptedIdSucursal = decryptId(decodeURIComponent(idSucursal));
    const fechadelDia = currentDate();

    useEffect(() => {
      const fetchStockDiario = async () => {
        try {
          setLoadingStockDiario(true);
          const response = await consultarStockProductosDelDiaService(decryptedIdSucursal, fechadelDia);
          const data = response;
          if (data.status === 200) {
            setStockDelDia(data.stockDiario);

          } else {
            setShowInfoStockDiario(true);
          }
        } catch (error) {
            setShowErrorStockDiario(true);
        } finally {
            setLoadingStockDiario(false);
        }
      };

      fetchStockDiario();
    }, []);
  
    return { stockDelDia, loadingStockDiario, showErrorStockDiario, showInfoStockDiario, setStockDelDia };
  };
  
  export default useGetStockDelDia;
