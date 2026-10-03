import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiHome,
  FiLock,
  FiMoon,
  FiPlus,
  FiSave,
  FiSearch,
  FiShoppingCart,
  FiSun,
  FiTrash2,
  FiUser,
  FiX,
  FiArrowLeft,
  FiFileText,
  FiList,
  FiUploadCloud,
} from "react-icons/fi";

import Alert from "../../../components/Alerts/Alert";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { getUserData } from "../../../utils/Auth/decodedata";
import { getUniqueColor } from "../../../utils/utils";
import { cosultarStockGeneralService } from "../../../services/stockservices/stock.service";
import { ingresarVentaService, ingresarVentaBatchService } from "../../../services/ventas/ventas.service";

// ═══════════════════════════════════════════════════════════════════════════════
// Constantes y utilidades
// ═══════════════════════════════════════════════════════════════════════════════

const PASOS = [
  { id: 1, label: "Turno" },
  { id: 2, label: "Productos" },
  { id: 3, label: "Efectivo" },
  { id: 4, label: "Gastos" },
  { id: 5, label: "Resumen" },
];

// Un producto sin existencia no tiene nada que vender ni que sobrar: no se muestra ni se envía.
const SOLO_CON_EXISTENCIA = true;

const CARD = "rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5";
const INPUT =
  "w-full rounded-xl border border-line bg-bg py-2.5 px-3.5 text-base text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";
const TH = "border-b border-line px-2 py-3 text-xs font-semibold uppercase tracking-wide text-muted sm:px-4";
const TD = "px-2 py-3 sm:px-4";

const redondear = (n, decimales = 2) => {
  const f = 10 ** decimales;
  return Math.round((Number(n) + Number.EPSILON) * f) / f;
};

const q = (valor) =>
  `Q.${redondear(valor).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const limpiarTexto = (t) => (t ? String(t).replace(/\s+/g, " ").trim() : "");

const iniciales = (nombre = "") =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

const esFrances = (producto) => producto.nombreProducto === "Frances";

// Solo dígitos y un punto, con límite de decimales. ".5" → "0.5"
const limpiarDecimal = (valor, decimales = 2) => {
  let t = String(valor).replace(/[^\d.]/g, "");
  const i = t.indexOf(".");
  if (i !== -1) t = t.slice(0, i + 1) + t.slice(i + 1).replace(/\./g, "").slice(0, decimales);
  if (t.startsWith(".")) t = `0${t}`;
  return t;
};

const mensajeError = (error, modo = "manual") =>
  error?.response?.data?.error?.message ??
  error?.response?.data?.message ??
  (modo === "excel"
    ? "No se pudo procesar el archivo o registrar la venta. Revisa el archivo e inténtalo de nuevo."
    : "Hubo un error al guardar la venta. Inténtalo de nuevo.");

// ─── Validaciones ──────────────────────────────────────────────────────────────

// 0 <= noVendidas <= existencia. "Frances" admite incrementos de 0.5; el resto, solo enteros.
const validarNoVendidas = (producto, crudo) => {
  const texto = String(crudo ?? "").trim().replace(/\.$/, "");
  if (texto === "") return ""; // vacío = 0
  if (!/^\d+(\.\d+)?$/.test(texto)) return "Número inválido";
  const n = Number(texto);
  if (esFrances(producto)) {
    if (!Number.isInteger(n * 2)) return "Usa incrementos de 0.5";
  } else if (!Number.isInteger(n)) {
    return "Solo números enteros";
  }
  if (n > producto.cantidadExistente) return `Máximo ${producto.cantidadExistente}`;
  return "";
};

const validarMonto = (crudo, { permitirCero }) => {
  const texto = String(crudo ?? "").trim();
  if (texto === "") return "Ingresa el monto";
  if (!/^\d+(\.\d{1,2})?$/.test(texto)) return "Monto inválido (máximo 2 decimales)";
  if (!permitirCero && Number(texto) <= 0) return "Debe ser mayor que 0";
  return "";
};

// Archivo Excel: obligatorio, extensión .xlsx y con contenido
const validarArchivo = (archivo) => {
  if (!archivo) return "Selecciona el archivo Excel (.xlsx) con el detalle de la venta";
  if (!archivo.name.toLowerCase().endsWith(".xlsx")) return "El archivo debe tener extensión .xlsx";
  if (archivo.size === 0) return "El archivo está vacío";
  return "";
};

// ─── Stock: normalización de la respuesta ──────────────────────────────────────

// Une duplicados por idProducto (stock general + stock diario) y usa
// `controlarStockDiario`, ignorando la llave extraña "controlarStockDiario:1".
const normalizarStock = (lista) => {
  const mapa = new Map();
  (Array.isArray(lista) ? lista : []).forEach((item) => {
    const existente = Number(item.cantidadExistente || 0);
    const previo = mapa.get(item.idProducto);
    if (previo) {
      previo.cantidadExistente += existente;
      return;
    }
    mapa.set(item.idProducto, {
      idProducto: item.idProducto,
      nombreProducto: limpiarTexto(item.nombreProducto),
      idCategoria: item.idCategoria,
      nombreCategoria: limpiarTexto(item.nombreCategoria),
      cantidadExistente: existente,
      controlarStock: Number(item.controlarStock || 0),
      controlarStockDiario: Number(item.controlarStockDiario || 0),
      orden: Number(item.orden ?? 0),
    });
  });
  return [...mapa.values()]
    .filter((p) => !SOLO_CON_EXISTENCIA || p.cantidadExistente > 0)
    .sort((a, b) => a.orden - b.orden || a.idProducto - b.idProducto);
};

// ─── Payload (contrato del backend, sin cambios) ───────────────────────────────

const construirPayload = ({ modo, usuario, idSucursal, turno, fechaVenta, productos, noVendidas, monto, gastos }) => {
  const montoTotalGasto = gastos.reduce((acc, g) => acc + Math.round(Number(g.monto) * 100), 0) / 100;

  return {
    encabezadoVenta: {
      idOrdenProduccion: null,
      idUsuario: usuario.idUsuario,
      idSucursal: Number(idSucursal),
      ventaTurno: turno, // "AM" | "PM"
      fechaVenta,
      fechaCreacion: fechaVenta,
      fechaYHoraVenta: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    },
    // Modo manual: los productos salen del formulario. Modo Excel: los procesa el backend desde el archivo.
    ...(modo === "manual" && {
      detalleVenta: productos.map((p) => ({
        idProducto: p.idProducto,
        controlarStock: p.controlarStock,
        controlarStockDiario: p.controlarStockDiario,
        idCategoria: p.idCategoria,
        fechaCreacion: fechaVenta,
        unidadesNoVendidas: Number(String(noVendidas[p.idProducto] ?? "").replace(/\.$/, "") || 0),
      })),
    }),
    detalleIngreso: {
      montoTotalIngresado: Number(Number(monto).toFixed(2)),
      fechaIngreso: fechaVenta,
    },
    gastosDiarios: {
      encabezadoGastosDiarios: {
        idUsuario: usuario.idUsuario,
        montoTotalGasto,
        fechaIngreso: fechaVenta,
      },
      detalleGastosDiarios: gastos.map((g) => ({
        detalleGasto: g.detalle.trim(),
        subTotal: Number(Number(g.monto).toFixed(2)),
      })),
    },
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// Piezas de UI
// ═══════════════════════════════════════════════════════════════════════════════

const Stepper = ({ paso, onIr }) => (
  <nav aria-label="Progreso del registro" className="overflow-x-auto pb-1">
    <ol className="flex min-w-max items-center gap-2 sm:min-w-0">
      {PASOS.map((p, i) => {
        const completado = p.id < paso;
        const activo = p.id === paso;
        return (
          <li key={p.id} className="flex flex-1 items-center gap-2 last:flex-none">
            <button
              type="button"
              disabled={!completado}
              onClick={() => onIr(p.id)}
              aria-current={activo ? "step" : undefined}
              className="flex items-center gap-2 border-0 bg-transparent p-0 disabled:cursor-default"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  completado
                    ? "bg-brand-600 text-white shadow-brand"
                    : activo
                      ? "bg-brand-500/15 text-brand-700 ring-2 ring-brand-500 dark:text-brand-300"
                      : "bg-surface-2 text-muted"
                }`}
              >
                {completado ? <FiCheck size={16} /> : p.id}
              </span>
              <span
                className={`text-md font-medium ${activo ? "text-ink" : "hidden text-muted sm:inline"} ${
                  completado ? "sm:text-ink" : ""
                }`}
              >
                {p.label}
              </span>
            </button>
            {i < PASOS.length - 1 && <span className="h-px min-w-[1rem] flex-1 bg-line" />}
          </li>
        );
      })}
    </ol>
  </nav>
);

const Campo = ({ label, error, children }) => (
  <div>
    <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
    {children}
    {error && <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400">{error}</p>}
  </div>
);

const InputMonto = ({ value, onChange, error, placeholder = "0.00", id, ariaLabel, grande }) => (
  <div>
    <div className="relative">
      <span
        className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-muted ${
          grande ? "text-xl" : "text-base"
        }`}
      >
        Q
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={ariaLabel}
        aria-invalid={Boolean(error)}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(limpiarDecimal(e.target.value, 2))}
        onFocus={(e) => e.target.select()}
        className={`${INPUT} pl-9 text-right font-semibold tabular-nums ${grande ? "py-4 text-3xl" : ""} ${
          error ? "!border-danger-500 focus:!ring-danger-500/25" : ""
        }`}
      />
    </div>
    {error && <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400">{error}</p>}
  </div>
);

const InfoItem = ({ icon: Icon, label, children }) => (
  <div className="flex min-w-0 items-center gap-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300">
      <Icon size={16} />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <p className="truncate text-md font-semibold text-ink">{children}</p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Paso 1 — Sucursal y turno
// ═══════════════════════════════════════════════════════════════════════════════

const TURNOS = [
  {
    valor: "AM",
    Icono: FiSun,
    activo: "border-warning-500/60 bg-warning-500/15 text-warning-700 dark:text-warning-300",
  },
  {
    valor: "PM",
    Icono: FiMoon,
    activo: "border-accent-500/60 bg-accent-500/15 text-accent-700 dark:text-accent-300",
  },
];

const PasoSucursalTurno = ({
  esAdmin,
  sucursalesActivas,
  loadingSucursales,
  showErrorSucursales,
  idSucursal,
  setIdSucursal,
  turno,
  setTurno,
  fecha,
  nombreUsuario,
  errorSucursal,
  errorTurno,
}) => (
  <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
    {showErrorSucursales && (
      <Alert type="danger" title="No se pudieron cargar las sucursales" message="Intenta recargar la página." />
    )}

    <section className={`${CARD} flex flex-col gap-5`}>
      <Campo label="Sucursal" error={errorSucursal}>
        {loadingSucursales ? (
          <div className="h-[46px] animate-pulse rounded-xl bg-surface-2" />
        ) : (
          <div className="relative">
            <FiHome size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-600 dark:text-brand-400" />
            <select
              value={idSucursal}
              onChange={(e) => setIdSucursal(e.target.value)}
              disabled={!esAdmin}
              aria-label="Sucursal"
              className={`${INPUT} appearance-none pl-10 pr-9 ${!esAdmin ? "cursor-not-allowed opacity-80" : ""}`}
            >
              <option value="">Seleccionar sucursal</option>
              {sucursalesActivas.map((s) => (
                <option key={s.idSucursal} value={s.idSucursal}>
                  {s.nombreSucursal}
                </option>
              ))}
            </select>
            {esAdmin ? (
              <FiChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            ) : (
              <FiLock size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
            )}
          </div>
        )}
      </Campo>

      <Campo label="Turno" error={errorTurno}>
        <div role="radiogroup" aria-label="Turno" className="grid grid-cols-2 gap-3">
          {TURNOS.map(({ valor, Icono, activo }) => {
            const seleccionado = turno === valor;
            return (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={seleccionado}
                onClick={() => setTurno(valor)}
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-md font-semibold transition-colors ${
                  seleccionado ? activo : "border-line bg-bg text-muted hover:bg-surface-2"
                }`}
              >
                <Icono size={16} />
                {valor}
              </button>
            );
          })}
        </div>
      </Campo>
    </section>

    <section className={`${CARD} grid grid-cols-1 gap-4 sm:grid-cols-2`}>
      <InfoItem icon={FiCalendar} label="Fecha">
        {dayjs(fecha).format("DD/MM/YYYY")}
      </InfoItem>
      <InfoItem icon={FiUser} label="Ingresado por">
        {nombreUsuario}
      </InfoItem>
    </section>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Paso 2 — Productos (misma estructura de tabla que el inventario)
// ═══════════════════════════════════════════════════════════════════════════════

const enfocarSiguiente = (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const inputs = Array.from(document.querySelectorAll("[data-nv-input]"));
  inputs[inputs.indexOf(e.currentTarget) + 1]?.focus();
};

const TablaProductosManual = ({ productos, noVendidas, setNoVendida, errores }) => {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  const categorias = useMemo(
    () => ["Todas", ...new Set(productos.map((p) => p.nombreCategoria).filter(Boolean))],
    [productos]
  );

  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return productos.filter(
      (p) =>
        (categoria === "Todas" || p.nombreCategoria === categoria) &&
        (!termino || p.nombreProducto.toLowerCase().includes(termino))
    );
  }, [productos, busqueda, categoria]);

  return (
    <div className="flex flex-col gap-4">
      <Alert
        type="info"
        title="Registra las unidades que sobraron"
        message="Escribe cuántas unidades NO se vendieron de cada producto. Déjalo en 0 si se vendió todo. Las vendidas se calculan solas."
      />

      {/* Filtros */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <FiSearch size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-xl border border-line bg-bg py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
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
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full appearance-none rounded-xl border border-line bg-bg py-2.5 pl-10 pr-9 text-sm font-medium text-ink transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              >
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          )}
        </div>

        {categorias.length > 1 && (
          <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
            {categorias.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(c)}
                className={`shrink-0 rounded-full border-0 px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  categoria === c
                    ? "bg-brand-600 text-white shadow-brand"
                    : "bg-surface-2 text-muted hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <p className="mt-3 text-xs text-muted">
          Mostrando {visibles.length} de {productos.length} productos
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-surface-2/95">
            <tr>
              <th className={`${TH} w-[42%] text-left sm:w-[30%]`}>Producto</th>
              <th className={`${TH} hidden text-center sm:table-cell sm:w-[16%]`}>Categoría</th>
              <th className={`${TH} w-[20%] text-center sm:w-[14%]`}>
                <span className="sm:hidden">Exist.</span>
                <span className="hidden sm:inline">Existencia</span>
              </th>
              <th className={`${TH} w-[38%] text-center sm:w-[24%]`}>
                <span className="sm:hidden">No vend.</span>
                <span className="hidden sm:inline">No vendidas</span>
              </th>
              <th className={`${TH} hidden text-center sm:table-cell sm:w-[16%]`}>Vendidas</th>
            </tr>
          </thead>
          <tbody>
            {visibles.length > 0 ? (
              visibles.map((p, i) => {
                const crudo = noVendidas[p.idProducto] ?? "";
                const error = errores[p.idProducto];
                const numero = Number(String(crudo).replace(/\.$/, "") || 0);
                const vendidas = error ? null : redondear(p.cantidadExistente - numero, 1);
                const frances = esFrances(p);

                return (
                  <tr
                    key={p.idProducto}
                    data-error={error ? "true" : undefined}
                    className={`border-b border-line transition-colors last:border-0 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 ${
                      i % 2 === 1 ? "bg-surface-2/30" : ""
                    }`}
                  >
                    <td className={TD}>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs"
                          style={{ backgroundColor: getUniqueColor(p.nombreProducto) }}
                        >
                          {iniciales(p.nombreProducto)}
                        </span>
                        <div className="min-w-0">
                          <p className="break-words font-medium text-ink">{p.nombreProducto}</p>
                          <p className="text-2xs text-muted sm:hidden">{p.nombreCategoria}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${TD} hidden text-center text-muted sm:table-cell`}>{p.nombreCategoria}</td>
                    <td className={`${TD} text-center`}>
                      <span className="inline-flex min-w-[2.25rem] justify-center rounded-full bg-brand-500/15 px-2 py-1 text-sm font-bold tabular-nums text-brand-700 dark:text-brand-300 sm:min-w-[3rem] sm:px-2.5">
                        {p.cantidadExistente}
                      </span>
                    </td>
                    <td className={TD}>
                      <input
                        data-nv-input
                        type="text"
                        inputMode={frances ? "decimal" : "numeric"}
                        enterKeyHint="next"
                        autoComplete="off"
                        aria-label={`Unidades no vendidas de ${p.nombreProducto}`}
                        aria-invalid={Boolean(error)}
                        placeholder="0"
                        value={crudo}
                        onChange={(e) =>
                          setNoVendida(
                            p.idProducto,
                            frances ? limpiarDecimal(e.target.value, 1) : e.target.value.replace(/\D/g, "")
                          )
                        }
                        onFocus={(e) => e.target.select()}
                        onKeyDown={enfocarSiguiente}
                        className={`mx-auto block w-full max-w-[5.5rem] rounded-lg border bg-bg px-2 py-2 text-center text-sm font-semibold tabular-nums text-ink transition-colors focus:outline-none focus:ring-2 ${
                          error
                            ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/25"
                            : "border-line focus:border-brand-500 focus:ring-brand-500/25"
                        }`}
                      />
                      {error ? (
                        <p className="mt-1 text-center text-2xs text-danger-600 dark:text-danger-400">{error}</p>
                      ) : (
                        <p className="mt-1 text-center text-2xs text-muted sm:hidden">
                          {vendidas !== null && `Vend.: ${vendidas}`}
                        </p>
                      )}
                    </td>
                    <td className={`${TD} hidden text-center sm:table-cell`}>
                      {vendidas !== null && (
                        <span className="inline-flex min-w-[3rem] justify-center rounded-full bg-success-500/15 px-2.5 py-1 text-sm font-bold tabular-nums text-success-700 dark:text-success-300">
                          {vendidas}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                  No hay productos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Paso 3 — Dinero ingresado
// ═══════════════════════════════════════════════════════════════════════════════

const PasoEfectivo = ({ monto, setMonto, error }) => (
  <div className="mx-auto w-full max-w-2xl">
    <section className={`${CARD} flex flex-col gap-4`}>
      <div>
        <h2 className="text-xl font-semibold text-ink">Dinero ingresado</h2>
        <p className="text-sm text-muted">Monto total en efectivo que entregó el vendedor al terminar el turno.</p>
      </div>
      <Campo label="Monto total ingresado">
        <InputMonto grande id="monto-ingresado" value={monto} onChange={setMonto} error={error} />
      </Campo>
    </section>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Paso 4 — Gastos
// ═══════════════════════════════════════════════════════════════════════════════

const PasoGastos = ({ gastos, totalGastos, onAgregar, onCambiar, onEliminar, errores }) => (
  <div className="mx-auto w-full max-w-2xl">
    <section className={`${CARD} flex flex-col gap-4`}>
      <div>
        <h2 className="text-xl font-semibold text-ink">Gastos del turno</h2>
        <p className="text-sm text-muted">Opcional. Si no hubo gastos, continúa al siguiente paso.</p>
      </div>

      {gastos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          Sin gastos registrados.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {gastos.map((g, i) => (
            <li key={g.id} className="rounded-xl border border-line bg-bg p-3">
              <div className="flex items-start gap-2">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[1fr_9rem]">
                  <div>
                    <input
                      type="text"
                      aria-label={`Descripción del gasto ${i + 1}`}
                      aria-invalid={Boolean(errores[g.id]?.detalle)}
                      placeholder="Ej. Jabón"
                      value={g.detalle}
                      onChange={(e) => onCambiar(g.id, { detalle: e.target.value })}
                      className={`${INPUT} ${errores[g.id]?.detalle ? "!border-danger-500" : ""}`}
                    />
                    {errores[g.id]?.detalle && (
                      <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400">{errores[g.id].detalle}</p>
                    )}
                  </div>
                  <InputMonto
                    ariaLabel={`Monto del gasto ${i + 1}`}
                    value={g.monto}
                    onChange={(valor) => onCambiar(g.id, { monto: valor })}
                    error={errores[g.id]?.monto}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onEliminar(g.id)}
                  aria-label={`Eliminar gasto ${i + 1}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onAgregar}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-brand-500/50 bg-brand-500/5 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-500/10 dark:text-brand-300"
      >
        <FiPlus size={15} /> Agregar gasto
      </button>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-md text-muted">Total gastos</span>
        <span className="text-2xl font-bold tabular-nums text-warning-700 dark:text-warning-300">{q(totalGastos)}</span>
      </div>
    </section>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Paso 5 — Resumen
// ═══════════════════════════════════════════════════════════════════════════════

const PasoResumen = ({ modo, archivo, sucursal, turno, fecha, nombreUsuario, productos, noVendidas, monto, gastos, totalGastos }) => (
  <div className="flex flex-col gap-4">
    <section className={`${CARD} grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
      <InfoItem icon={FiHome} label="Sucursal">
        {sucursal}
      </InfoItem>
      <InfoItem icon={turno === "AM" ? FiSun : FiMoon} label="Turno">
        {turno}
      </InfoItem>
      <InfoItem icon={FiCalendar} label="Fecha">
        {dayjs(fecha).format("DD/MM/YYYY")}
      </InfoItem>
      <InfoItem icon={FiUser} label="Usuario">
        {nombreUsuario}
      </InfoItem>
    </section>

    {modo === "manual" ? (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-lg font-semibold text-ink">Productos</h2>
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
          {productos.length} productos
        </span>
      </div>
      <table className="w-full table-fixed border-collapse text-sm">
        <thead className="bg-surface-2/95">
          <tr>
            <th className={`${TH} w-[40%] text-left`}>Producto</th>
            <th className={`${TH} w-[20%] text-center`}>
              <span className="sm:hidden">Exist.</span>
              <span className="hidden sm:inline">Existencia</span>
            </th>
            <th className={`${TH} w-[20%] text-center`}>
              <span className="sm:hidden">No vend.</span>
              <span className="hidden sm:inline">No vendidas</span>
            </th>
            <th className={`${TH} w-[20%] text-center`}>
              <span className="sm:hidden">Vend.</span>
              <span className="hidden sm:inline">Vendidas</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p, i) => {
            const nv = Number(String(noVendidas[p.idProducto] ?? "").replace(/\.$/, "") || 0);
            return (
              <tr
                key={p.idProducto}
                className={`border-b border-line last:border-0 ${i % 2 === 1 ? "bg-surface-2/30" : ""}`}
              >
                <td className={`${TD} break-words font-medium text-ink`}>{p.nombreProducto}</td>
                <td className={`${TD} text-center tabular-nums text-muted`}>{p.cantidadExistente}</td>
                <td className={`${TD} text-center tabular-nums text-ink`}>{nv}</td>
                <td className={`${TD} text-center`}>
                  <span className="inline-flex min-w-[2.5rem] justify-center rounded-full bg-success-500/15 px-2 py-1 text-sm font-bold tabular-nums text-success-700 dark:text-success-300">
                    {redondear(p.cantidadExistente - nv, 1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
    ) : (
      <section className={`${CARD} flex items-center gap-3`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-500/20 text-success-700 dark:text-success-300">
          <FiFileText size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted">Productos desde archivo Excel</p>
          <p className="truncate text-md font-semibold text-ink">{archivo?.name}</p>
          <p className="text-xs text-muted">Los productos se procesan al guardar la venta.</p>
        </div>
      </section>
    )}

    <div className="grid gap-4 lg:grid-cols-2">
      <section className={`${CARD} flex items-center justify-between gap-4`}>
        <div>
          <p className="text-sm text-muted">Dinero ingresado</p>
          <p className="text-3xl font-bold tabular-nums text-ink">{q(monto)}</p>
        </div>
      </section>

      <section className={CARD}>
        <p className="mb-3 text-sm text-muted">Gastos del turno</p>
        {gastos.length === 0 ? (
          <p className="text-md text-muted">Sin gastos registrados.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {gastos.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 text-md">
                <span className="min-w-0 truncate text-ink">{g.detalle.trim()}</span>
                <span className="shrink-0 font-semibold tabular-nums text-ink">{q(g.monto)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="text-md text-muted">Total gastos</span>
          <span className="text-xl font-bold tabular-nums text-warning-700 dark:text-warning-300">{q(totalGastos)}</span>
        </div>
      </section>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Paso 2 — Modo de ingreso de productos: manual o archivo Excel
// ═══════════════════════════════════════════════════════════════════════════════

const COLUMNAS_EXCEL = ["Código", "Producto", "Stock Actual", "Cantidad"];

const MODOS = [
  { valor: "manual", Icono: FiList, corto: "Manual", largo: "Ingreso manual" },
  { valor: "excel", Icono: FiFileText, corto: "Cargar Excel", largo: "Cargar archivo Excel (.xlsx)" },
];

const SelectorModo = ({ modo, onCambiar }) => (
  <div
    role="radiogroup"
    aria-label="Modo de ingreso de productos"
    className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-surface-2 p-1"
  >
    {MODOS.map(({ valor, Icono, corto, largo }) => {
      const activo = modo === valor;
      return (
        <button
          key={valor}
          type="button"
          role="radio"
          aria-checked={activo}
          onClick={() => onCambiar(valor)}
          className={`flex items-center justify-center gap-2 rounded-xl border-0 px-3 py-3 text-md font-semibold transition-colors ${
            activo ? "bg-brand-600 text-white shadow-brand" : "bg-transparent text-muted hover:bg-bg hover:text-ink"
          }`}
        >
          <Icono size={16} />
          <span className="sm:hidden">{corto}</span>
          <span className="hidden sm:inline">{largo}</span>
        </button>
      );
    })}
  </div>
);

const CargaArchivo = ({ archivo, error, onSeleccionar, onQuitar }) => {
  const inputRef = useRef(null);
  const dragDepth = useRef(0);
  const [arrastrando, setArrastrando] = useState(false);

  const abrirSelector = () => inputRef.current?.click();

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirSelector();
    }
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    dragDepth.current += 1;
    setArrastrando(true);
  };
  const onDragOver = (e) => e.preventDefault();
  const onDragLeave = (e) => {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setArrastrando(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    dragDepth.current = 0;
    setArrastrando(false);
    onSeleccionar(e.dataTransfer.files?.[0]);
  };

  const estado = arrastrando
    ? "border-brand-500 bg-brand-500/15"
    : error
      ? "border-danger-500 bg-danger-500/5"
      : archivo
        ? "border-solid border-success-500/50 bg-success-500/10"
        : "border-brand-500/40 bg-brand-500/5 hover:border-brand-500 hover:bg-brand-500/10";

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => {
          onSeleccionar(e.target.files?.[0]);
          e.target.value = ""; // permite volver a elegir el mismo archivo
        }}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label="Seleccionar archivo .xlsx"
        onClick={abrirSelector}
        onKeyDown={onKeyDown}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex min-h-[190px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${estado}`}
      >
        {arrastrando ? (
          <div className="flex flex-col items-center gap-2 text-brand-700 dark:text-brand-300">
            <FiUploadCloud size={44} />
            <p className="text-lg font-medium">Suelta el archivo aquí</p>
          </div>
        ) : archivo ? (
          <div className="flex w-full max-w-md items-center gap-3 text-left">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-500/20 text-success-700 dark:text-success-300">
              <FiFileText size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-medium text-ink">{archivo.name}</p>
              <p className="text-sm text-muted">
                {(archivo.size / 1024).toFixed(1)} KB · Toca para cambiar el archivo
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuitar();
              }}
              aria-label="Quitar archivo"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600"
            >
              <FiX size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
              <FiUploadCloud size={26} />
            </span>
            <p className="text-lg font-medium text-ink">
              Toca para elegir un archivo <span className="text-brand-600 dark:text-brand-300">.xlsx</span>
            </p>
            <p className="text-sm text-muted">o arrástralo y suéltalo aquí</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>}
    </div>
  );
};

const PasoProductos = ({
  modo,
  setModo,
  productos,
  noVendidas,
  setNoVendida,
  errores,
  archivo,
  onSeleccionarArchivo,
  onQuitarArchivo,
  errorArchivo,
}) => (
  <div className="flex flex-col gap-4">
    <SelectorModo modo={modo} onCambiar={setModo} />

    {modo === "manual" ? (
      <TablaProductosManual
        productos={productos}
        noVendidas={noVendidas}
        setNoVendida={setNoVendida}
        errores={errores}
      />
    ) : (
      <section className={`${CARD} flex flex-col gap-4`}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-500/15 text-accent-600 dark:text-accent-300">
            <FiFileText size={17} />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-ink">Archivo de productos</h2>
            <p className="text-sm text-muted">Se procesa al guardar la venta; no necesitas ingresarlos a mano.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <span>Columnas requeridas:</span>
          {COLUMNAS_EXCEL.map((col) => (
            <code
              key={col}
              className="rounded-md bg-brand-500/10 px-1.5 py-0.5 font-mono text-xs text-brand-700 dark:text-brand-300"
            >
              {col}
            </code>
          ))}
        </div>

        <CargaArchivo
          archivo={archivo}
          error={errorArchivo}
          onSeleccionar={onSeleccionarArchivo}
          onQuitar={onQuitarArchivo}
        />
      </section>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Página
// ═══════════════════════════════════════════════════════════════════════════════

const IngresarVentaPage = () => {
  const navigate = useNavigate();
  const usuario = getUserData();
  const esAdmin = usuario?.idRol === 1;
  const nombreUsuario = usuario?.nombreUsuario || usuario?.nombre || usuario?.usuario || "—";

  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();

  // ── Estado del wizard ──
  const [paso, setPaso] = useState(1);
  const [fechaVenta, setFechaVenta] = useState(() => dayjs().format("YYYY-MM-DD"));
  // null = el usuario (solo admin) aún no ha elegido; se usa la sucursal asignada
  const [idSucursalElegida, setIdSucursalElegida] = useState(null);
  const [turno, setTurno] = useState("");
  const [productos, setProductos] = useState([]);
  const [stockKey, setStockKey] = useState(null); // sucursal|fecha del stock cargado
  const [noVendidas, setNoVendidas] = useState({});
  const [monto, setMonto] = useState("");
  const [gastos, setGastos] = useState([]);
  const [modo, setModo] = useState("manual"); // "manual" | "excel"
  const [archivo, setArchivo] = useState(null);
  const [errorSeleccionArchivo, setErrorSeleccionArchivo] = useState("");

  const [cargandoStock, setCargandoStock] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [intento, setIntento] = useState(false); // se intentó avanzar con errores
  const [aviso, setAviso] = useState(null);

  const guardandoRef = useRef(false);
  const idGasto = useRef(0);

  const listaSucursales = Array.isArray(sucursales) ? sucursales : [];
  const sucursalesActivas = useMemo(() => listaSucursales.filter((s) => s.estado === "A"), [listaSucursales]);

  // Sucursal según rol: se compara siempre como texto (puede llegar número o cadena) y solo
  // se acepta si existe como opción válida del dropdown. Sin dato asignado no se elige ninguna.
  const idAsignado =
    usuario?.idSucursal !== undefined && usuario?.idSucursal !== null && String(usuario.idSucursal).trim() !== ""
      ? String(usuario.idSucursal)
      : "";
  const asignadaDisponible = idAsignado !== "" && sucursalesActivas.some((s) => String(s.idSucursal) === idAsignado);
  const sucursalPorDefecto = asignadaDisponible ? idAsignado : "";
  // Admin (idRol 1): parte de la asignada pero puede cambiarla; una carga tardía no pisa su elección.
  // Resto de roles: siempre la asignada, sin importar nada más.
  const idSucursal = esAdmin ? (idSucursalElegida ?? sucursalPorDefecto) : sucursalPorDefecto;
  const sucursalSeleccionada = listaSucursales.find((s) => String(s.idSucursal) === String(idSucursal));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [paso]);

  // ── Validaciones por paso ──
  const errorSucursal = idSucursal
    ? ""
    : esAdmin
      ? "Selecciona una sucursal"
      : "No tienes una sucursal activa asignada. Contacta al administrador.";
  const errorTurno = turno ? "" : "Selecciona un turno";

  const erroresProductos = useMemo(() => {
    const errores = {};
    productos.forEach((p) => {
      const e = validarNoVendidas(p, noVendidas[p.idProducto]);
      if (e) errores[p.idProducto] = e;
    });
    return errores;
  }, [productos, noVendidas]);
  const cantidadErroresProductos = Object.keys(erroresProductos).length;

  const errorMonto = validarMonto(monto, { permitirCero: true });
  const errorArchivo = errorSeleccionArchivo || (intento ? validarArchivo(archivo) : "");

  const erroresGastos = useMemo(() => {
    const errores = {};
    gastos.forEach((g) => {
      const detalle = g.detalle.trim() ? "" : "Describe el gasto";
      const m = validarMonto(g.monto, { permitirCero: false });
      if (detalle || m) errores[g.id] = { detalle, monto: m };
    });
    return errores;
  }, [gastos]);
  const hayErroresGastos = Object.keys(erroresGastos).length > 0;

  const totalGastos = gastos.reduce((acc, g) => acc + Math.round(Number(g.monto || 0) * 100), 0) / 100;

  const mensajeBloqueo = (() => {
    if (!intento) return "";
    if (paso === 1) return errorSucursal || errorTurno;
    if (paso === 2 && modo === "excel") return errorArchivo;
    if (paso === 2 && modo === "manual" && cantidadErroresProductos > 0)
      return `Corrige ${cantidadErroresProductos} ${cantidadErroresProductos === 1 ? "producto marcado" : "productos marcados"} en rojo.`;
    if (paso === 3) return errorMonto;
    if (paso === 4 && hayErroresGastos) return "Completa o elimina los gastos incompletos.";
    return "";
  })();

  // ── Stock: se consulta al pulsar "Siguiente" en el paso 1 ──
  const asegurarStock = async () => {
    const key = `${idSucursal}|${fechaVenta}`;
    if (key === stockKey && productos.length > 0) return true; // ya cargado: conserva lo digitado

    setCargandoStock(true);
    try {
      const respuesta = await cosultarStockGeneralService(Number(idSucursal), fechaVenta);
      if (respuesta?.status !== 200) {
        setAviso({ type: "info", title: "Sin stock disponible", message: "No se encontró stock para esta sucursal." });
        return false;
      }
      const lista = normalizarStock(respuesta.stockProductos ?? respuesta.stockVentas);
      if (lista.length === 0) {
        setAviso({
          type: "info",
          title: "Sin productos con existencia",
          message: "Esta sucursal no tiene productos con existencia para registrar la venta.",
        });
        return false;
      }
      setProductos(lista);
      setNoVendidas({});
      setStockKey(key);
      return true;
    } catch (error) {
      console.error("Error al consultar el stock:", error);
      setAviso({
        type: "danger",
        title: "No se pudo consultar el stock",
        message: "Verifica tu conexión e inténtalo de nuevo.",
      });
      return false;
    } finally {
      setCargandoStock(false);
    }
  };

  // ── Navegación ──
  const siguiente = async () => {
    setIntento(true);

    if (paso === 1) {
      if (errorSucursal || errorTurno) return;
      if (!(await asegurarStock())) return;
    }
    if (paso === 2 && modo === "excel" && validarArchivo(archivo)) return;
    if (paso === 2 && modo === "manual" && cantidadErroresProductos > 0) {
      document.querySelector('[data-error="true"]')?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    if (paso === 3 && errorMonto) return;
    if (paso === 4 && hayErroresGastos) return;

    setIntento(false);
    setPaso((p) => p + 1);
  };

  const anterior = () => {
    setIntento(false);
    setPaso((p) => Math.max(1, p - 1));
  };

  const irAPaso = (destino) => {
    if (destino < paso) {
      setIntento(false);
      setPaso(destino);
    }
  };

  // ── Archivo Excel ──
  const seleccionarArchivo = (file) => {
    if (!file) return;
    const mensaje = validarArchivo(file);
    if (mensaje) {
      setErrorSeleccionArchivo(mensaje); // se conserva el archivo anterior, si había uno
      return;
    }
    setErrorSeleccionArchivo("");
    setArchivo(file);
  };

  const quitarArchivo = () => {
    setArchivo(null);
    setErrorSeleccionArchivo("");
  };

  // ── Gastos ──
  const agregarGasto = () => {
    idGasto.current += 1;
    setGastos((g) => [...g, { id: idGasto.current, detalle: "", monto: "" }]);
  };
  const cambiarGasto = (id, cambios) => setGastos((g) => g.map((x) => (x.id === id ? { ...x, ...cambios } : x)));
  const eliminarGasto = (id) => setGastos((g) => g.filter((x) => x.id !== id));

  // ── Guardar ──
  const reiniciar = () => {
    setPaso(1);
    setFechaVenta(dayjs().format("YYYY-MM-DD"));
    setIdSucursalElegida(null);
    setModo("manual");
    setArchivo(null);
    setErrorSeleccionArchivo("");
    setTurno("");
    setProductos([]);
    setStockKey(null); // el stock cambió con esta venta: se vuelve a consultar
    setNoVendidas({});
    setMonto("");
    setGastos([]);
    setIntento(false);
  };

  const guardar = async () => {
    if (guardandoRef.current) return; // evita doble clic
    guardandoRef.current = true;
    setGuardando(true);

    try {
      if (modo === "excel") {
        const errorDeArchivo = validarArchivo(archivo);
        if (errorDeArchivo) {
          setAviso({ type: "danger", title: "Falta el archivo", message: errorDeArchivo });
          return;
        }
      }

      const payload = construirPayload({
        modo,
        usuario,
        idSucursal,
        turno,
        fechaVenta,
        productos,
        noVendidas,
        monto,
        gastos,
      });

      let respuesta;
      if (modo === "excel") {
        // Una sola petición multipart: la venta como JSON + el archivo. Los nombres de las partes
        // ("venta" y "archivo") son los que recibe hoy el backend. El Content-Type lo resuelve el servicio.
        const formData = new FormData();
        formData.append("venta", JSON.stringify(payload));
        formData.append("archivo", archivo);
        respuesta = await ingresarVentaBatchService(formData);
      } else {
        respuesta = await ingresarVentaService(payload);
      }
      if (respuesta?.status && respuesta.status >= 300) {
        throw Object.assign(new Error("Respuesta no exitosa"), { response: { data: respuesta } });
      }

      reiniciar();
      setAviso({
        type: "success",
        title: "¡Venta registrada!",
        message: "La venta se guardó correctamente.",
        actions: [
          { label: "Ver ventas", variant: "primary", onClick: () => navigate("/ventas") },
          { label: "Ingresar otra", variant: "secondary", onClick: () => setAviso(null) },
        ],
      });
    } catch (error) {
      console.error("Error al guardar la venta:", error);
      setAviso({ type: "danger", title: "No se pudo guardar la venta", message: mensajeError(error, modo) });
    } finally {
      guardandoRef.current = false;
      setGuardando(false);
    }
  };

  // ── Render ──
  const ocupado = cargandoStock || guardando;
  const ultimoPaso = paso === PASOS.length;

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Header */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/ventas")}
          aria-label="Volver a ventas"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiShoppingCart size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Ingresar venta</h1>
          <p className="text-sm text-muted">
            Paso {paso} de {PASOS.length} · {PASOS[paso - 1].label}
          </p>
        </div>
      </header>

      <Stepper paso={paso} onIr={irAPaso} />

      {/* Contenido del paso */}
      {paso === 1 && (
        <PasoSucursalTurno
          esAdmin={esAdmin}
          sucursalesActivas={sucursalesActivas}
          loadingSucursales={loadingSucursales}
          showErrorSucursales={showErrorSucursales}
          idSucursal={idSucursal}
          setIdSucursal={setIdSucursalElegida}
          turno={turno}
          setTurno={setTurno}
          fecha={fechaVenta}
          nombreUsuario={nombreUsuario}
          errorSucursal={intento ? errorSucursal : ""}
          errorTurno={intento ? errorTurno : ""}
        />
      )}

      {paso === 2 && (
        <PasoProductos
          modo={modo}
          setModo={setModo}
          productos={productos}
          noVendidas={noVendidas}
          setNoVendida={(id, valor) => setNoVendidas((prev) => ({ ...prev, [id]: valor }))}
          errores={erroresProductos}
          archivo={archivo}
          onSeleccionarArchivo={seleccionarArchivo}
          onQuitarArchivo={quitarArchivo}
          errorArchivo={errorArchivo}
        />
      )}

      {paso === 3 && <PasoEfectivo monto={monto} setMonto={setMonto} error={intento ? errorMonto : ""} />}

      {paso === 4 && (
        <PasoGastos
          gastos={gastos}
          totalGastos={totalGastos}
          onAgregar={agregarGasto}
          onCambiar={cambiarGasto}
          onEliminar={eliminarGasto}
          errores={intento ? erroresGastos : {}}
        />
      )}

      {paso === 5 && (
        <PasoResumen
          modo={modo}
          archivo={archivo}
          sucursal={sucursalSeleccionada?.nombreSucursal ?? "—"}
          turno={turno}
          fecha={fechaVenta}
          nombreUsuario={nombreUsuario}
          productos={productos}
          noVendidas={noVendidas}
          monto={monto}
          gastos={gastos}
          totalGastos={totalGastos}
        />
      )}

      {/* Barra de navegación */}
      <div className="sticky bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] z-10 lg:bottom-4">
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface/95 p-3 shadow-modal backdrop-blur">
          {mensajeBloqueo && (
            <p role="alert" className="px-1 text-sm font-medium text-danger-600 dark:text-danger-400">
              {mensajeBloqueo}
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={anterior}
              disabled={paso === 1 || ocupado}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-bg px-4 py-3 text-md font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft size={16} /> Atrás
            </button>

            {ultimoPaso ? (
              <button
                type="button"
                onClick={guardar}
                disabled={guardando}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-0 bg-brand-600 px-6 py-3 text-md font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guardando ? (
                  <>
                    <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <FiSave size={16} /> Guardar venta
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={siguiente}
                disabled={ocupado || (paso === 1 && loadingSucursales)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border-0 bg-brand-600 px-6 py-3 text-md font-semibold text-white shadow-brand transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cargandoStock ? (
                  <>
                    <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                    Consultando stock...
                  </>
                ) : (
                  <>
                    Siguiente <FiChevronRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Avisos */}
      {aviso && (
        <Alert
          key={`${aviso.type}-${aviso.title}`}
          floating
          position="top-right"
          type={aviso.type}
          title={aviso.title}
          message={aviso.message}
          actions={aviso.actions}
          onDismiss={() => setAviso(null)}
          autoClose
          duration={aviso.type === "success" ? 5000 : 4000}
        />
      )}
    </div>
  );
};

export default IngresarVentaPage;