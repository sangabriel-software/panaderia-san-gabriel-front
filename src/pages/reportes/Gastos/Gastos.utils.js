

  export const handleConsultar = async ( isFormValid, loading, setLoading, setError, setHasSearched, setGastos, consultarGastosService, fechaInicio, fechaFin, idSucursal ) => {
    if (!isFormValid || loading) return;
    setLoading(true);
    setError(null);
    setHasSearched(false);
    try {
      const result = await consultarGastosService(fechaInicio, fechaFin, idSucursal);
      setGastos(Array.isArray(result) ? result : result?.reporte || []);
      setHasSearched(true);
    } catch {
      setError("No se pudo obtener la información. Intente nuevamente.");
      setGastos([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };