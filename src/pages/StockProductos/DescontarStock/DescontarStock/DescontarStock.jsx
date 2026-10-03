import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  FiArrowLeft,
  FiSearch,
  FiX,
  FiFilter,
  FiChevronDown,
  FiMinusCircle,
} from "react-icons/fi";
import { getInitials, getUniqueColor } from "../../../../utils/utils";
import Alert from "../../../../components/Alerts/Alert";
import useGetSucursales from "../../../../hooks/sucursales/useGetSucursales";
import { decryptId } from "../../../../utils/CryptoParams";
import { descontarStockService } from "../../../../services/descuentoDeStock/descuentoDeStock.service";
import { getUserData } from "../../../../utils/Auth/decodedata";
import useGetStockGeneral from "../../../../hooks/stock/useGetStockGeneral";
import useGetStockDelDia from "../../../../hooks/stock/useGetStockDelDia";

const selectClass =
  "w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-3.5 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

function DescontarStock() {
  const { idSucursal } = useParams();
  const navigate = useNavigate();
  const { stockGeneral: initialStockGeneral, loadingStockGeneral } = useGetStockGeneral(idSucursal);
  const { stockDelDia: initialStockDelDia, loadingStockDiario } = useGetStockDelDia(idSucursal);
  const { sucursales, loadingSucursales } = useGetSucursales();
  const [stockValues, setStockValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoDescuento, setTipoDescuento] = useState("MAYOREO");
  const [turno, setTurno] = useState("");
  const [localStock, setLocalStock] = useState({ general: [], dia: [] });
  const userData = getUserData();

  // Alertas flotantes (reemplazan los popups modales)
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");

  useEffect(() => {
    setLocalStock({
      general: initialStockGeneral || [],
      dia: initialStockDelDia || [],
    });
  }, [initialStockGeneral, initialStockDelDia]);

  const decryptedIdSucursal = decryptId(decodeURIComponent(idSucursal));
  const sucursal = sucursales?.find((item) => Number(item.idSucursal) === Number(decryptedIdSucursal));

  const calcularStockMostrado = (producto) => producto.cantidadExistente;

  // Combinación de stocks (día + general), solo productos con stock > 0
  const combinedStock = useMemo(() => {
    if ((!localStock.dia || localStock.dia.length === 0) && (!localStock.general || localStock.general.length === 0)) {
      return [];
    }

    const productosDia = Array.isArray(localStock.dia)
      ? localStock.dia
          .filter((item) => item?.idStockDiario !== 0 && item.cantidadExistente > 0)
          .map((item) => ({ ...item, esStockDiario: true, cantidadMostrada: calcularStockMostrado(item) }))
      : [];

    const productosGenerales = Array.isArray(localStock.general)
      ? localStock.general
          .filter(
            (genItem) =>
              genItem.cantidadExistente > 0 &&
              !productosDia.some((diaItem) => diaItem.idProducto === genItem.idProducto)
          )
          .map((item) => ({ ...item, esStockDiario: false, cantidadMostrada: calcularStockMostrado(item) }))
      : [];

    return [...productosDia, ...productosGenerales];
  }, [localStock]);

  const categorias = useMemo(() => {
    try {
      if (!Array.isArray(combinedStock) || combinedStock.length === 0) return ["Todas"];
      const categoriasUnicas = [
        ...new Set(combinedStock.map((item) => item?.nombreCategoria).filter((cat) => cat && typeof cat === "string")),
      ];
      return ["Todas", ...categoriasUnicas];
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      return ["Todas"];
    }
  }, [combinedStock]);

  const productosFiltrados = useMemo(() => {
    if (!Array.isArray(combinedStock)) return [];
    return combinedStock.filter((producto) => {
      const matchesSearch = producto?.nombreProducto?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false;
      const matchesCategory = categoriaActiva === "Todas" || producto?.nombreCategoria === categoriaActiva;
      return matchesSearch && matchesCategory;
    });
  }, [combinedStock, searchTerm, categoriaActiva]);

  const clearSearch = () => setSearchTerm("");

  const handleStockChange = (idProducto, value) => {
    const producto = combinedStock.find((p) => p.idProducto === Number(idProducto));
    const esFrances = producto?.nombreProducto === "Frances";

    // Frances: máximo un decimal
    if (esFrances && value.includes(".") && value.split(".")[1]?.length > 1) {
      value = parseFloat(value).toFixed(1);
    }

    const nuevoValor = value === "" ? "" : parseFloat(value);

    if (!producto) return;

    const maxPermitido = producto.cantidadMostrada;

    if (nuevoValor > maxPermitido) {
      setErrorPopupMessage(
        `No puedes descontar más de ${maxPermitido} ${esFrances ? "filas" : "unidades"} de ${producto.nombreProducto}`
      );
      setIsPopupErrorOpen(true);
      return;
    }

    setStockValues((prev) => ({
      ...prev,
      [idProducto]: value,
    }));
  };

  const actualizarStockLocal = (productosDescontados) => {
    setLocalStock((prev) => {
      const newStock = { ...prev };

      productosDescontados.forEach(({ idProducto, stockADescontar, esStockDiario }) => {
        if (esStockDiario) {
          newStock.dia = newStock.dia.map((item) =>
            item.idProducto === idProducto
              ? { ...item, cantidadExistente: item.cantidadExistente - stockADescontar }
              : item
          );
        } else {
          newStock.general = newStock.general.map((item) =>
            item.idProducto === idProducto
              ? { ...item, cantidadExistente: item.cantidadExistente - stockADescontar }
              : item
          );
        }
      });

      return newStock;
    });
  };

  const productosConCantidad = Object.values(stockValues).filter((val) => val > 0).length;
  const isFormValid = productosConCantidad > 0 && turno !== "";
  const botonInactivo = !isFormValid && !isLoading;

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const productosConStock = Object.entries(stockValues)
        .filter(([_, value]) => value > 0)
        .map(([idProducto, value]) => ({
          idProducto: Number(idProducto),
          value: value,
        }));

      if (productosConStock.length === 0) {
        setErrorPopupMessage("Debe ingresar al menos un producto con cantidad a descontar");
        setIsPopupErrorOpen(true);
        setIsLoading(false);
        return;
      }

      if (!turno) {
        setErrorPopupMessage("Debe seleccionar un turno");
        setIsPopupErrorOpen(true);
        setIsLoading(false);
        return;
      }

      const productosCompletos = productosConStock.map((item) => ({
        ...combinedStock.find((p) => p.idProducto === item.idProducto),
        stockADescontar: item.value,
      }));

      const now = new Date();
      const fechaDescuento = format(now, "yyyy-MM-dd HH:mm:ss");
      const fechaCreacion = format(now, "yyyy-MM-dd");

      const payload = {
        descuentoInfo: {
          idSucursal: decryptedIdSucursal,
          idUsuario: userData.idUsuario,
          tipoDescuento: tipoDescuento,
          descuentoTurno: turno,
          fechaDescuento: fechaDescuento,
          fechaCreacion: fechaCreacion,
        },
        detalleDescuento: productosCompletos.map((producto) => ({
          idProducto: producto.idProducto,
          tipoProduccion: producto.tipoProduccion,
          controlarStock: producto.controlarStock ? 1 : 0,
          controlarStockDiario: producto.esStockDiario ? 1 : 0,
          stockADescontar: producto.stockADescontar,
          fechaDescuento: fechaDescuento,
        })),
      };

      const response = await descontarStockService(payload);

      if (response) {
        actualizarStockLocal(
          productosCompletos.map((p) => ({
            idProducto: p.idProducto,
            stockADescontar: p.stockADescontar,
            esStockDiario: p.esStockDiario,
          }))
        );

        setIsPopupOpen(true);
        setStockValues({});
        setTurno("");
      } else {
        throw new Error("No se recibió respuesta del servidor");
      }
    } catch (error) {
      console.error("Error al descontar stock:", error);
      setErrorPopupMessage(
        error.response?.data?.message || error.message || "Ocurrió un error al descontar el stock"
      );
      setIsPopupErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingStockGeneral || loadingStockDiario || loadingSucursales) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* ── Alertas flotantes ────────────────────────────────────────── */}
      {isPopupErrorOpen && (
        <Alert
          floating
          position="top-right"
          type="danger"
          title="No se pudo completar"
          message={errorPopupMessage}
          onDismiss={() => setIsPopupErrorOpen(false)}
        />
      )}

      {isPopupOpen && (
        <Alert
          floating
          position="top-right"
          type="success"
          title="¡Descuento registrado!"
          message="Se descontó el stock de los productos correctamente."
          onDismiss={() => setIsPopupOpen(false)}
          actions={[
            {
              label: "Ver gestiones",
              variant: "primary",
              onClick: () => navigate(`/descuento-stock/stock-descuentos-lista/${encodeURIComponent(idSucursal)}`),
            },
            {
              label: "Descontar nuevo",
              variant: "secondary",
              onClick: () => {
                setIsPopupOpen(false);
                setStockValues({});
                setTurno("");
              },
            },
          ]}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/descuento-stock/stock-descuentos-lista/${encodeURIComponent(idSucursal)}`)}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning-500 text-white">
          <FiMinusCircle size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">
            Descontar inventario {sucursal?.nombreSucursal}
          </h1>
          <p className="text-sm text-muted">Ingresa las cantidades que vas a descontar del stock</p>
        </div>
      </header>

      {combinedStock.length === 0 && (
        <Alert
          type="info"
          title="Sin productos con stock"
          message="No hay productos con stock disponible para descontar en esta sucursal."
        />
      )}

      {/* ── Datos del descuento ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="tipoDescuento" className="mb-1.5 block text-xs font-medium text-muted">
              Tipo de descuento
            </label>
            <div className="relative">
              <select
                id="tipoDescuento"
                value={tipoDescuento}
                onChange={(e) => setTipoDescuento(e.target.value)}
                className={selectClass}
              >
                <option value="MAYOREO">Venta por mayoreo</option>
                <option value="MAL ESTADO">Pérdida</option>
                <option value="CORRECCION">Corrección de stock</option>
              </select>
              <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>

          <div>
            <label htmlFor="turno" className="mb-1.5 block text-xs font-medium text-muted">
              Turno
            </label>
            <div className="relative">
              <select
                id="turno"
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                required
                className={selectClass}
              >
                <option value="">Seleccionar turno</option>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
              <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
            {!turno && <p className="mt-1 text-2xs text-muted">Requerido para descontar</p>}
          </div>
        </div>
      </div>

      {/* ── Filtros ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-muted transition-colors hover:text-ink"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          {categorias.length > 1 && (
            <div className="relative shrink-0 sm:hidden">
              <FiFilter size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <select
                value={categoriaActiva}
                onChange={(e) => setCategoriaActiva(e.target.value)}
                className="w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-10 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              >
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
              <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          )}
        </div>

        {categorias.length > 1 && (
          <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                type="button"
                onClick={() => setCategoriaActiva(categoria)}
                className={`shrink-0 rounded-full border-0 px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  categoriaActiva === categoria
                    ? "bg-brand-600 text-white shadow-brand"
                    : "bg-surface-2 text-muted hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabla de productos ───────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-surface-2/95">
            <tr>
              <th className="w-[38%] border-b border-line px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted sm:w-1/3 sm:px-4">
                Producto
              </th>
              <th className="w-[22%] border-b border-line px-1 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted sm:w-1/3 sm:px-4">
                <span className="sm:hidden">Stock</span>
                <span className="hidden sm:inline">Stock actual</span>
              </th>
              <th className="w-[40%] border-b border-line px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted sm:w-1/3 sm:px-4">
                <span className="sm:hidden">Descontar</span>
                <span className="hidden sm:inline">Cantidad a descontar</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados?.length > 0 ? (
              productosFiltrados.map((producto, i) => {
                const esFrances = producto.nombreProducto === "Frances";
                return (
                  <tr
                    key={`${producto.idProducto}-${producto.esStockDiario ? "dia" : "gen"}`}
                    className={`border-b border-line last:border-0 transition-colors hover:bg-brand-50/50 ${
                      i % 2 === 1 ? "bg-surface-2/30" : ""
                    }`}
                  >
                    <td className="px-2 py-3 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs"
                          style={{ backgroundColor: getUniqueColor(producto.nombreProducto) }}
                        >
                          {getInitials(producto.nombreProducto)}
                        </span>
                        <span className="min-w-0 break-words font-medium text-ink">{producto.nombreProducto}</span>
                      </div>
                    </td>

                    <td className="px-1 py-3 text-center sm:px-4">
                      <span className="inline-flex min-w-[2.25rem] justify-center rounded-full bg-teal-50 px-2 py-1 text-sm font-bold text-teal-700 sm:min-w-[3rem] sm:px-2.5">
                        {producto.cantidadExistente}
                      </span>
                    </td>

                    <td className="px-2 py-3 sm:px-4">
                      <input
                        type="number"
                        min="0"
                        max={producto.cantidadMostrada}
                        step={esFrances ? "0.1" : "any"}
                        value={stockValues[producto.idProducto] || ""}
                        onChange={(e) => handleStockChange(producto.idProducto, e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        placeholder="0"
                        className="mx-auto block w-full max-w-[5.5rem] rounded-lg border border-line bg-surface px-2 py-2 text-center text-sm font-semibold text-ink transition-colors focus:border-danger-500 focus:outline-none focus:ring-2 focus:ring-danger-500/25"
                      />
                      <p className="mt-1 text-center text-2xs text-muted">{esFrances ? "Filas" : "Unidades"}</p>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="px-4 py-10 text-center text-sm text-muted">
                  No hay productos disponibles en esta categoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Barra de acción, fija al fondo ───────────────────────────── */}
      <div className="sticky bottom-4 z-10 flex justify-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !isFormValid}
          className={`flex w-full max-w-md items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors sm:w-auto sm:px-10 ${
            botonInactivo
              ? "cursor-not-allowed border border-line bg-surface-2 text-muted"
              : "border-0 bg-danger-600 text-white shadow-danger hover:bg-danger-500"
          } ${isLoading ? "cursor-wait" : ""}`}
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
              Descontando...
            </>
          ) : (
            <>
              <FiMinusCircle size={16} />
              Descontar
              {productosConCantidad > 0 && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{productosConCantidad}</span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default DescontarStock;