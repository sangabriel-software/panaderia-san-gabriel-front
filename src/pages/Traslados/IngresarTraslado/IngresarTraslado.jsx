import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  FiArrowLeft,
  FiSearch,
  FiX,
  FiFilter,
  FiChevronDown,
  FiTruck,
  FiMapPin,
  FiArrowRight,
  FiInbox,
} from "react-icons/fi";
import { getInitials, getUniqueColor } from "../../../utils/utils";
import Alert from "../../../components/Alerts/Alert";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { getUserData } from "../../../utils/Auth/decodedata";
import {
  consultarStockProductosDelDiaService,
  consultarStockProductosService,
} from "../../../services/stockservices/stock.service";
import { ingresarTrasladoService } from "../../../services/Traslados/traslados.service";

const selectClass =
  "w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-3.5 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted";

function IngresarTraslado() {
  const navigate = useNavigate();
  const { sucursales, loadingSucursales } = useGetSucursales();
  const [sucursalOrigen, setSucursalOrigen] = useState(null);
  const [sucursalDestino, setSucursalDestino] = useState(null);
  const [stockValues, setStockValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [localStock, setLocalStock] = useState({ general: [], dia: [] });
  const [loadingStock, setLoadingStock] = useState(false);
  const userData = getUserData();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const { idSucursal } = useParams();

  useEffect(() => {
    if (!loadingSucursales && sucursales.length > 0 && userData?.idRol !== 1) {
      const sucursalUsuario = sucursales.find((s) => s.idSucursal === userData.idSucursal);
      if (sucursalUsuario) setSucursalOrigen(sucursalUsuario);
    }
  }, [loadingSucursales, sucursales, userData]);

  useEffect(() => {
    const fetchStockData = async () => {
      if (!sucursalOrigen) return;
      setLoadingStock(true);
      try {
        const fechaDelDia = format(new Date(), "yyyy-MM-dd");
        const [stockGeneral, stockDia] = await Promise.all([
          consultarStockProductosService(sucursalOrigen.idSucursal),
          consultarStockProductosDelDiaService(sucursalOrigen.idSucursal, fechaDelDia),
        ]);
        setLocalStock({
          general: stockGeneral?.stockProductos || [],
          dia: stockDia.stockDiario || [],
        });
      } catch (error) {
        console.error("Error fetching stock data:", error);
        setErrorPopupMessage("Error al cargar el stock de la sucursal");
        setIsPopupErrorOpen(true);
      } finally {
        setLoadingStock(false);
      }
    };
    fetchStockData();
  }, [sucursalOrigen]);

  const calcularStockMostrado = (producto) =>
    producto.nombreProducto === "Frances" ? producto.cantidadExistente / 6 : producto.cantidadExistente;

  const convertirValorAUnidades = (valor) => Math.floor(valor);

  const combinedStock = useMemo(() => {
    const productosDia = Array.isArray(localStock.dia)
      ? localStock.dia
          .filter((item) => item?.idStockDiario && item.cantidadExistente > 0)
          .map((item) => ({ ...item, esStockDiario: true, cantidadMostrada: calcularStockMostrado(item) }))
      : [];

    const productosGenerales = Array.isArray(localStock.general)
      ? localStock.general
          .filter((genItem) => genItem.cantidadExistente > 0)
          .map((item) => ({ ...item, esStockDiario: false, cantidadMostrada: calcularStockMostrado(item) }))
      : [];

    const combined = [...productosDia];
    const diaProductIds = new Set(productosDia.map((p) => p.idProducto));
    for (const genProduct of productosGenerales) {
      if (!diaProductIds.has(genProduct.idProducto)) combined.push(genProduct);
    }
    return combined;
  }, [localStock]);

  const categorias = useMemo(() => {
    try {
      if (combinedStock.length === 0) return ["Todas"];
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

    if (esFrances && value.includes(".") && value.split(".")[1]?.length > 1) {
      value = parseFloat(value).toFixed(1);
    }

    const nuevoValor = value === "" ? "" : parseFloat(value);
    if (!producto) return;

    const maxPermitido = producto.cantidadMostrada;
    if (nuevoValor > maxPermitido) {
      setErrorPopupMessage(
        `No puedes trasladar más de ${maxPermitido} ${esFrances ? "filas" : "unidades"} de ${producto.nombreProducto}`
      );
      setIsPopupErrorOpen(true);
      return;
    }

    setStockValues((prev) => ({ ...prev, [idProducto]: value }));
  };

  const actualizarStockLocal = (productosTrasladados) => {
    setLocalStock((prev) => {
      const newStock = { ...prev };
      productosTrasladados.forEach(({ idProducto, stockATrasladar, esStockDiario }) => {
        if (esStockDiario) {
          newStock.dia = newStock.dia.map((item) =>
            item.idProducto === idProducto
              ? { ...item, cantidadExistente: item.cantidadExistente - stockATrasladar }
              : item
          );
        } else {
          newStock.general = newStock.general.map((item) =>
            item.idProducto === idProducto
              ? { ...item, cantidadExistente: item.cantidadExistente - stockATrasladar }
              : item
          );
        }
      });
      return newStock;
    });
  };

  const productosConCantidad = Object.values(stockValues).filter((val) => val > 0).length;
  const isFormValid = productosConCantidad > 0 && sucursalOrigen && sucursalDestino;

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!sucursalOrigen || !sucursalDestino) {
        setErrorPopupMessage("Debe seleccionar sucursal de origen y destino");
        setIsPopupErrorOpen(true);
        setIsLoading(false);
        return;
      }

      if (sucursalOrigen.idSucursal === sucursalDestino.idSucursal) {
        setErrorPopupMessage("No puedes trasladar a la misma sucursal");
        setIsPopupErrorOpen(true);
        setIsLoading(false);
        return;
      }

      const productosConStock = Object.entries(stockValues)
        .filter(([_, value]) => value > 0)
        .map(([idProducto, value]) => ({ idProducto: Number(idProducto), value }));

      if (productosConStock.length === 0) {
        setErrorPopupMessage("Debe ingresar al menos un producto con cantidad a trasladar");
        setIsPopupErrorOpen(true);
        setIsLoading(false);
        return;
      }

      const productosCompletos = productosConStock.map((item) => {
        const producto = combinedStock.find((p) => p.idProducto === item.idProducto);
        return { ...producto, cantidadATrasladar: convertirValorAUnidades(item.value) };
      });

      const now = new Date();
      const fechaTraslado = format(now, "yyyy-MM-dd HH:mm:ss");

      const payload = {
        traladoHeader: {
          idSucursalOrigen: sucursalOrigen.idSucursal,
          idSucursalDestino: sucursalDestino.idSucursal,
          idUsuario: userData.idUsuario,
          fechaTraslado: fechaTraslado,
        },
        trasladoDetalle: productosCompletos.map((producto) => ({
          idProducto: producto.idProducto,
          tipoProduccion: producto.tipoProduccion || "bandejas",
          controlarStock: producto.controlarStock ? 1 : 0,
          controlarStockDiario: producto.esStockDiario ? 1 : 0,
          cantidadATrasladar: producto.cantidadATrasladar,
          fechaTraslado: fechaTraslado,
        })),
      };

      const response = await ingresarTrasladoService(payload);

      if (response) {
        actualizarStockLocal(
          productosCompletos.map((p) => ({
            idProducto: p.idProducto,
            stockATrasladar: p.cantidadATrasladar,
            esStockDiario: p.esStockDiario,
          }))
        );
        setIsPopupOpen(true);
        setStockValues({});
      } else {
        throw new Error("No se recibió respuesta del servidor");
      }
    } catch (error) {
      console.error("Error al trasladar stock:", error);
      setErrorPopupMessage(error.response?.data?.message || error.message || "Ocurrió un error al trasladar el stock");
      setIsPopupErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingSucursales) {
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
          title="¡Traslado registrado!"
          message="Se trasladó el stock correctamente."
          onDismiss={() => setIsPopupOpen(false)}
          actions={[
            { label: "Ver traslados", variant: "primary", onClick: () => navigate(`/traslados-productos/traslados-lista/${encodeURIComponent(idSucursal)}`) },
            { label: "Nuevo traslado", variant: "secondary", onClick: () => setIsPopupOpen(false) },
          ]}
        />
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/traslados-productos/traslados-lista/${encodeURIComponent(idSucursal)}`)}
          aria-label="Volver"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white shadow-accent">
          <FiTruck size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Nuevo Traslado</h1>
          <p className="text-sm capitalize text-muted">
            {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
      </header>

      {/* ── Origen → Destino ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="sucursalOrigen" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
              <FiMapPin size={13} className="text-brand-600" /> Sucursal origen
            </label>
            <div className="relative">
              <select
                id="sucursalOrigen"
                value={sucursalOrigen?.idSucursal || ""}
                onChange={(e) => {
                  const selectedSucursal = sucursales.find((s) => s.idSucursal === Number(e.target.value));
                  setSucursalOrigen(selectedSucursal);
                  setSucursalDestino(null);
                  setStockValues({});
                }}
                disabled={userData.idRol !== 1}
                className={selectClass}
              >
                <option value="">Seleccione origen</option>
                {userData.idRol === 1 ? (
                  sucursales.map((s) => (
                    <option key={s.idSucursal} value={s.idSucursal}>
                      {s.nombreSucursal}
                    </option>
                  ))
                ) : (
                  <option value={userData.idSucursal}>
                    {sucursales.find((s) => s.idSucursal === userData.idSucursal)?.nombreSucursal || "Tu sucursal"}
                  </option>
                )}
              </select>
              <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>

          <span className="hidden shrink-0 items-center justify-center pb-2.5 text-muted sm:flex">
            <FiArrowRight size={18} />
          </span>

          <div className="flex-1">
            <label htmlFor="sucursalDestino" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
              <FiMapPin size={13} className="text-accent-600" /> Sucursal destino
            </label>
            <div className="relative">
              <select
                id="sucursalDestino"
                value={sucursalDestino?.idSucursal || ""}
                onChange={(e) => {
                  const selectedSucursal = sucursales.find((s) => s.idSucursal === Number(e.target.value));
                  setSucursalDestino(selectedSucursal);
                }}
                disabled={!sucursalOrigen}
                className={selectClass}
              >
                <option value="">Seleccione destino</option>
                {sucursales
                  .filter((s) => s.idSucursal !== sucursalOrigen?.idSucursal)
                  .map((s) => (
                    <option key={s.idSucursal} value={s.idSucursal}>
                      {s.nombreSucursal}
                    </option>
                  ))}
              </select>
              <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>
        </div>

        {sucursalOrigen && (
          <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
            <p className="text-xs text-muted">
              Listo para seleccionar productos de <span className="font-medium text-ink">{sucursalOrigen.nombreSucursal}</span>
            </p>
          </div>
        )}
      </div>

      {/* ── Sin sucursal de origen: nada más que mostrar todavía ────────── */}
      {!sucursalOrigen ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiMapPin size={20} />
          </span>
          <p className="text-sm text-muted">Selecciona una sucursal de origen para ver su inventario.</p>
        </div>
      ) : loadingStock ? (
        <div className="flex items-center justify-center py-16">
          <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : (
        <>
          {combinedStock.length === 0 && (
            <Alert
              type="info"
              title="Sin productos con stock"
              message="Esta sucursal no tiene productos disponibles para trasladar."
            />
          )}

          {/* ── Filtros ────────────────────────────────────────────────── */}
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
                    <span className="sm:hidden">Trasladar</span>
                    <span className="hidden sm:inline">Cantidad a trasladar</span>
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
                            className="mx-auto block w-full max-w-[5.5rem] rounded-lg border border-line bg-surface px-2 py-2 text-center text-sm font-semibold text-ink transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/25"
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

          {/* ── Barra de acción, fija al fondo — solo cuando hay destino ──── */}
          {sucursalDestino && (
            <div className="sticky bottom-4 z-10 flex justify-center">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !isFormValid}
                className={`flex w-full max-w-md items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors sm:w-auto sm:px-10 ${
                  productosConCantidad === 0 && !isLoading
                    ? "cursor-not-allowed border border-line bg-surface-2 text-muted"
                    : "border-0 bg-accent-600 text-white shadow-accent hover:bg-accent-500"
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                    Trasladando...
                  </>
                ) : (
                  <>
                    <FiTruck size={16} />
                    Trasladar Stock
                    {productosConCantidad > 0 && (
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{productosConCantidad}</span>
                    )}
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default IngresarTraslado;