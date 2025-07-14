import { useEffect, useState } from "react";
import { consultarDashboardDataService } from "../../services/dashboarddata/dashboardData.service";
import { currentDate } from "../../utils/dateUtils";
import { formatoQuetzalesSimple } from "../../utils/utils";

/* Consulta a BD los permisoso */
export const useGetDashboardData = () => {
    const [dashboardData, setDashboardData] = useState([]);
    const [cantidadEmpleados, setCantidadEmpleados] = useState(0);
    const [cantidadSucursales, setCantidadSucursales] = useState(0);
    const [ingresosMensuales, setIngresosMensuales] = useState([]);
    const [ingresosAnuales, setIngresosAnuales] = useState([]);
    const [resumenMensual, setResumenMensual] = useState(0);
    const [topVentas, setTopVentas] = useState([]);
    const [loadingDashboardData, setLoadingDashboardData] = useState(true);
    const [showErrorDashboardData, setShowErrorDashboardData] = useState(false);

    useEffect(() => {
      const fetchDashboardData = async () => {
        try {
          const response = await consultarDashboardDataService();
           const data = response;
          if (data.status === 200) {
            setDashboardData(data.dataDashboard.dashboardData);
            setCantidadEmpleados(data.dataDashboard.cantidadEmpleados);
            setCantidadSucursales(data.dataDashboard.cantidadSucursales);
            setIngresosMensuales(data.dataDashboard.ingresosMensuales);
            setIngresosAnuales(data.dataDashboard.ingresosAnuales);
            setResumenMensual(data.dataDashboard.resumenMensual);
            setTopVentas(data.dataDashboard.topProductosMasVendidos);
          } 
        } catch (error) {
            setShowErrorDashboardData(true);
        } finally {
            setLoadingDashboardData(false);
        }
      };

      fetchDashboardData();
    }, []);
  
    return { dashboardData, loadingDashboardData, showErrorDashboardData, setDashboardData,
      cantidadEmpleados, cantidadSucursales, ingresosMensuales, ingresosAnuales, resumenMensual, topVentas };
  };
  
  export default useGetDashboardData;
  