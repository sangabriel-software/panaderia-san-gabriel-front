import { useEffect, useState } from "react";
import { cosultarStockGeneralService } from "../../services/stockservices/stock.service";

/**
 * Stock disponible para vender en una sucursal y fecha.
 *
 * - `idSucursal` es el ID numérico tal cual (no viene de la URL), por eso NO se aplica
 *   decodeURIComponent ni decryptId.
 * - No consulta mientras falte la sucursal o la fecha.
 * - Vuelve a consultar cuando cambia cualquiera de los dos y descarta respuestas viejas.
 */
const useGetStockVentas = (idSucursal, fechaDelDia) => {
  const [stockVentas, setStockVentas] = useState([]);
  const [loadingStockVentas, setLoadingStockVentas] = useState(false);
  const [showErrorStockVentas, setShowErrorStockVentas] = useState(false);
  const [showInfoStockVentas, setShowInfoStockVentas] = useState(false);

  useEffect(() => {
    if (!idSucursal || !fechaDelDia) {
      setStockVentas([]);
      return undefined;
    }

    let cancelado = false;

    const fetchStockVentas = async () => {
      setLoadingStockVentas(true);
      setShowErrorStockVentas(false);
      setShowInfoStockVentas(false);

      try {
        const data = await cosultarStockGeneralService(Number(idSucursal), fechaDelDia);
        if (cancelado) return;

        if (data?.status === 200) {
          // La respuesta trae `stockProductos`; `stockVentas` queda solo como respaldo.
          setStockVentas(data.stockProductos ?? data.stockVentas ?? []);
        } else {
          setStockVentas([]);
          setShowInfoStockVentas(true);
        }
      } catch (error) {
        if (cancelado) return;
        setStockVentas([]);
        setShowErrorStockVentas(true);
      } finally {
        if (!cancelado) setLoadingStockVentas(false);
      }
    };

    fetchStockVentas();

    return () => {
      cancelado = true;
    };
  }, [idSucursal, fechaDelDia]);

  return {
    stockVentas,
    loadingStockVentas,
    showErrorStockVentas,
    showInfoStockVentas,
    setStockVentas,
  };
};

export default useGetStockVentas;