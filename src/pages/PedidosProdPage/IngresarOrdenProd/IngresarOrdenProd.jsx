import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClipboard,
  FiDownload,
  FiFileText,
  FiHome,
  FiLock,
  FiMoon,
  FiSend,
  FiSun,
  FiUploadCloud,
  FiUser,
  FiX,
} from "react-icons/fi";

import Alert from "../../../components/Alerts/Alert";
import useGetProductosYPrecios from "../../../hooks/productosprecios/useGetProductosYprecios";
import useGetFechaProduccion from "../../../hooks/fecha-produccion/useGetFechaProduccion";
import { useGetSucursales } from "../../../hooks/sucursales/useGetSucursales";
import { ingresarOrdenProduccionBatchService } from "../../../services/ordenesproduccion/ordenesProduccion.service";
import { getUserData } from "../../../utils/Auth/decodedata";
import { getCurrentDateTimeWithSeconds } from "../../../utils/dateUtils";
import { descargarPlantillaOrden } from "../../../utils/PdfUtils/ExcelUtils";
import {
  descargarPdfDuranteIngresoOrden,
  getUserSucursalName,
} from "./IngresarOrdenProdUtils";

// ─── Constantes y utilidades ───────────────────────────────────────────────────

const COLUMNAS_REQUERIDAS = ["idProducto", "cantidad", "tipoProduccion"];
const AVISO_POCO_TIEMPO = 10 * 60; // segundos

// Clases reutilizadas (utilidades explícitas, sin .card/.btn-* para no chocar con Bootstrap)
const CARD = "rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5";
const INPUT =
  "w-full rounded-xl border border-line bg-bg py-2.5 pl-10 pr-3.5 text-base text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";
const ICONO_CAMPO = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-600 dark:text-brand-400";

const TURNOS = [
  {
    valor: "AM",
    Icono: FiSun,
    activo:
      "peer-checked:border-warning-500/60 peer-checked:bg-warning-500/15 peer-checked:text-warning-700 dark:peer-checked:text-warning-300",
  },
  {
    valor: "PM",
    Icono: FiMoon,
    activo:
      "peer-checked:border-accent-500/60 peer-checked:bg-accent-500/15 peer-checked:text-accent-700 dark:peer-checked:text-accent-300",
  },
];

const formatCountdown = (seconds) => {
  if (seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

const esXlsx = (file) => !!file && file.name.toLowerCase().endsWith(".xlsx");

// ─── Piezas pequeñas ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, tone, title, subtitle }) => (
  <div className="flex items-center gap-3">
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
      <Icon size={17} />
    </span>
    <div className="min-w-0">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
    </div>
  </div>
);

const Field = ({ label, htmlFor, error, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-muted">
      {label}
    </label>
    <div className="relative">{children}</div>
    {error && <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400">{error}</p>}
  </div>
);

// ─── Banner de ventana activa ──────────────────────────────────────────────────

const VentanaActivaBanner = ({ segundosRestantes, expiraEn }) => {
  const [restantes, setRestantes] = useState(segundosRestantes);
  const [visible, setVisible] = useState(true);
  const totalRef = useRef(Math.max(segundosRestantes, 1));

  // Contador contra una hora de fin fija: no se atrasa si la pestaña queda en segundo plano.
  useEffect(() => {
    totalRef.current = Math.max(segundosRestantes, 1);
    const finaliza = Date.now() + segundosRestantes * 1000;

    const tick = () => {
      const faltan = Math.max(0, Math.round((finaliza - Date.now()) / 1000));
      setRestantes(faltan);
      if (faltan === 0) clearInterval(id);
    };

    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [segundosRestantes]);

  if (!visible || restantes <= 0) return null;

  const pocoTiempo = restantes <= AVISO_POCO_TIEMPO;
  const porcentaje = Math.min(100, (restantes / totalRef.current) * 100);
  const expiraFormateado = expiraEn ? dayjs(expiraEn.replace(" ", "T")).format("HH:mm") : "--:--";

  return (
    <div
      role="status"
      className={`mb-4 overflow-hidden rounded-2xl border shadow-card animate-fade-in ${
        pocoTiempo
          ? "border-warning-500/40 bg-warning-500/10"
          : "border-brand-500/30 bg-brand-500/10"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            pocoTiempo ? "bg-warning-500" : "bg-brand-500 animate-brand-glow"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-md font-semibold text-ink">Ingreso del día habilitado</p>
          <p className="text-sm text-muted">Vence a las {expiraFormateado}</p>
        </div>
        <span
          className={`font-mono text-2xl font-semibold tabular-nums ${
            pocoTiempo ? "text-warning-700 dark:text-warning-300" : "text-brand-700 dark:text-brand-300"
          }`}
        >
          {formatCountdown(restantes)}
        </span>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Cerrar aviso"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:text-ink"
        >
          <FiX size={17} />
        </button>
      </div>
      <div className="h-1 w-full bg-ink/5">
        <div
          className={`h-full transition-[width] duration-1000 ease-linear ${
            pocoTiempo ? "bg-warning-500" : "bg-brand-500"
          }`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────────

const IngresarOrdenProd = () => {
  const navigate = useNavigate();
  const userData = getUserData();
  const esAdmin = userData.idRol === 1;

  const { sucursales, loadingSucursales, showErrorSucursales } = useGetSucursales();
  const { productos, loadigProducts } = useGetProductosYPrecios();
  const { diaProduccion, loadingFechaProduccion } = useGetFechaProduccion();

  const csvInputRef = useRef(null);
  const dragDepth = useRef(0);

  const [csvFile, setCsvFile] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");

  // Ventana de ingreso del día
  const today = dayjs().format("YYYY-MM-DD");
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
  const registroActivo =
    Array.isArray(diaProduccion) && diaProduccion.length > 0 ? diaProduccion[0] : null;
  const ventanaActiva = registroActivo?.fecha_produccion_a_setear === "today";
  const segundosRestantes = registroActivo?.segundos_restantes ?? 0;
  const expiraEn = registroActivo?.expira_en ?? null;
  const fechaMinima = ventanaActiva ? today : tomorrow;
  const fechaDefault = ventanaActiva ? today : tomorrow;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
  } = useForm({
    defaultValues: {
      sucursal: esAdmin ? "" : String(userData.idSucursal ?? ""),
      turno: "AM",
      fechaAProducir: fechaDefault,
      nombrePanadero: "",
    },
  });

  useEffect(() => {
    if (!esAdmin && userData.idSucursal) {
      setValue("sucursal", String(userData.idSucursal));
    }
  }, [esAdmin, userData.idSucursal, setValue]);

  useEffect(() => {
    if (!loadingFechaProduccion) setValue("fechaAProducir", fechaDefault);
  }, [loadingFechaProduccion, fechaDefault, setValue]);

  // ── Archivo ──────────────────────────────────────────────────────────────────

  const mostrarError = (mensaje) => {
    setErrorPopupMessage(mensaje);
    setIsPopupErrorOpen(true);
  };

  const seleccionarArchivo = (file) => {
    if (!file) return;
    if (esXlsx(file)) {
      setCsvFile(file);
    } else {
      mostrarError("Solo se permiten archivos .xlsx");
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  };

  const quitarArchivo = (e) => {
    e.stopPropagation();
    setCsvFile(null);
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  const abrirSelector = () => csvInputRef.current?.click();

  const onDropzoneKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirSelector();
    }
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    dragDepth.current += 1;
    setIsDraggingOver(true);
  };

  const onDragOver = (e) => e.preventDefault();

  const onDragLeave = (e) => {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDraggingOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    dragDepth.current = 0;
    setIsDraggingOver(false);
    seleccionarArchivo(e.dataTransfer.files[0]);
  };

  // ── Envío ────────────────────────────────────────────────────────────────────

  const limpiarFormulario = () => {
    setCsvFile(null);
    if (csvInputRef.current) csvInputRef.current.value = "";
    reset({
      sucursal: getValues("sucursal"),
      turno: "AM",
      fechaAProducir: fechaDefault,
      nombrePanadero: "",
    });
  };

  const onSubmit = async (data) => {
    if (!csvFile) {
      mostrarError("Selecciona el archivo .xlsx con la producción.");
      return;
    }

    setCsvLoading(true);

    try {
      const ordenHaader = JSON.stringify({
        idSucursal: data.sucursal,
        ordenTurno: data.turno,
        nombrePanadero: data.nombrePanadero,
        fechaAProducir: data.fechaAProducir,
        idUsuario: userData.idUsuario,
        fechaCreacion: getCurrentDateTimeWithSeconds(),
      });

      const formData = new FormData();
      const fechaArchivo = dayjs().format("YYYYMMDD-HHmmss");
      formData.append("ordenProduccionBatch", csvFile, `orden-produccion-${fechaArchivo}.xlsx`);
      formData.append("ordenHaader", ordenHaader);

      const res = await ingresarOrdenProduccionBatchService(formData);

      if (res.status === 200) {
        descargarPdfDuranteIngresoOrden(res.ordenProduccion.idOrdenGenerada);
      }

      // Se limpia al terminar para evitar un doble envío mientras el aviso está visible
      limpiarFormulario();
      setIsPopupOpen(true);
    } catch (error) {
      if (error.status === 409) {
        mostrarError(error.response?.data?.error?.message ?? "La orden ya existe.");
      } else {
        mostrarError("Hubo un error al ingresar la orden. Inténtelo más tarde.");
      }
    } finally {
      setCsvLoading(false);
    }
  };

  // ── Estado visual del dropzone ───────────────────────────────────────────────

  const dropzoneEstado = isDraggingOver
    ? "border-brand-500 bg-brand-500/15"
    : csvFile
      ? "border-solid border-success-500/50 bg-success-500/10"
      : "border-brand-500/40 bg-brand-500/5 hover:border-brand-500 hover:bg-brand-500/10";

  const envioVacio = !csvFile && !csvLoading;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* ── Header ── */}
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/ordenes-produccion")}
          aria-label="Volver a órdenes de producción"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
        >
          <FiArrowLeft size={17} />
        </button>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiClipboard size={19} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">Nueva orden de producción</h1>
          <p className="text-sm text-muted">Completa los datos del turno y sube el archivo con la producción</p>
        </div>
      </header>

      {ventanaActiva && (
        <VentanaActivaBanner segundosRestantes={segundosRestantes} expiraEn={expiraEn} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* ── Datos de la orden ── */}
          <section className={`${CARD} space-y-4`}>
            <SectionHeader
              icon={FiClipboard}
              tone="bg-brand-500/15 text-brand-600 dark:text-brand-300"
              title="Datos de la orden"
              subtitle="Se aplican a todo el archivo"
            />

            <Field label="Fecha de producción" htmlFor="fechaAProducir" error={errors.fechaAProducir?.message}>
              <FiCalendar size={16} className={ICONO_CAMPO} />
              <input
                id="fechaAProducir"
                type="date"
                min={fechaMinima}
                className={INPUT}
                {...register("fechaAProducir", { required: "Selecciona una fecha" })}
              />
            </Field>
            {ventanaActiva && (
              <p className="-mt-2 flex items-center gap-1.5 text-sm text-brand-700 dark:text-brand-300">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                Hoy está habilitado para ingresar órdenes
              </p>
            )}

            {/* Turno: radios reales con color por turno */}
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-muted">Turno</legend>
              <div className="grid grid-cols-2 gap-2">
                {TURNOS.map(({ valor, Icono, activo }) => (
                  <label key={valor} className="relative cursor-pointer">
                    <input type="radio" value={valor} className="peer sr-only" {...register("turno")} />
                    <span
                      className={`flex items-center justify-center gap-2 rounded-xl border border-line bg-bg py-2.5 text-md font-semibold text-muted transition-colors hover:bg-surface-2 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/40 ${activo}`}
                    >
                      <Icono size={16} />
                      {valor}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Sucursal */}
            <div>
              {loadingSucursales ? (
                <>
                  <span className="mb-1.5 block text-sm font-medium text-muted">Sucursal</span>
                  <div className="h-[42px] animate-pulse rounded-xl bg-surface-2" />
                </>
              ) : esAdmin ? (
                <Field label="Sucursal" htmlFor="sucursal" error={errors.sucursal?.message}>
                  <FiHome size={16} className={ICONO_CAMPO} />
                  <select
                    id="sucursal"
                    className={`${INPUT} appearance-none pr-9`}
                    {...register("sucursal", { required: "Selecciona una sucursal" })}
                  >
                    <option value="">Seleccionar sucursal</option>
                    {sucursales.map((s) => (
                      <option key={s.idSucursal} value={s.idSucursal}>
                        {s.nombreSucursal}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                </Field>
              ) : (
                <Field label="Sucursal" htmlFor="sucursal-asignada">
                  <FiHome size={16} className={ICONO_CAMPO} />
                  <input
                    id="sucursal-asignada"
                    type="text"
                    readOnly
                    value={getUserSucursalName(sucursales, userData)}
                    className={`${INPUT} cursor-not-allowed pr-9 opacity-80`}
                  />
                  <FiLock
                    size={14}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input type="hidden" {...register("sucursal", { required: true })} />
                </Field>
              )}
              {showErrorSucursales && (
                <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400">
                  No se pudieron cargar las sucursales.
                </p>
              )}
            </div>

            {/* Panadero */}
            <Field label="Panadero responsable" htmlFor="nombrePanadero" error={errors.nombrePanadero?.message}>
              <FiUser size={16} className={ICONO_CAMPO} />
              <input
                id="nombrePanadero"
                type="text"
                autoComplete="off"
                placeholder="Nombre del panadero"
                className={INPUT}
                {...register("nombrePanadero", {
                  required: "Ingresa el nombre del panadero",
                  validate: (v) => v.trim().length > 0 || "Ingresa el nombre del panadero",
                })}
              />
            </Field>
          </section>

          {/* ── Archivo ── */}
          <section className={`${CARD} flex flex-col gap-4`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <SectionHeader
                icon={FiFileText}
                tone="bg-accent-500/15 text-accent-600 dark:text-accent-300"
                title="Archivo de producción"
              />
              <button
                type="button"
                onClick={() => descargarPlantillaOrden(productos)}
                disabled={loadigProducts || !productos || productos.length === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-accent-500/30 bg-accent-500/10 px-3.5 py-2 text-sm font-medium text-accent-700 transition-colors hover:bg-accent-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-accent-300"
              >
                <FiDownload size={15} />
                Descargar plantilla
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              <span>Columnas requeridas:</span>
              {COLUMNAS_REQUERIDAS.map((col) => (
                <code
                  key={col}
                  className="rounded-md bg-brand-500/10 px-1.5 py-0.5 font-mono text-xs text-brand-700 dark:text-brand-300"
                >
                  {col}
                </code>
              ))}
            </div>

            {/* Zona de carga */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Seleccionar archivo .xlsx"
              onClick={abrirSelector}
              onKeyDown={onDropzoneKeyDown}
              onDragEnter={onDragEnter}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`flex min-h-[190px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${dropzoneEstado}`}
            >
              <input
                ref={csvInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(e) => seleccionarArchivo(e.target.files[0])}
              />

              {isDraggingOver ? (
                <div className="flex flex-col items-center gap-2 text-brand-700 dark:text-brand-300">
                  <FiUploadCloud size={44} />
                  <p className="text-lg font-medium">Suelta el archivo aquí</p>
                </div>
              ) : csvFile ? (
                <div className="flex w-full max-w-md items-center gap-3 text-left">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-500/20 text-success-700 dark:text-success-300">
                    <FiFileText size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-medium text-ink">{csvFile.name}</p>
                    <p className="text-sm text-muted">{(csvFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={quitarArchivo}
                    aria-label="Quitar archivo"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-500/10 hover:text-danger-600"
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
                    Toca para elegir un archivo{" "}
                    <span className="text-brand-600 dark:text-brand-300">.xlsx</span>
                  </p>
                  <p className="text-sm text-muted">o arrástralo y suéltalo aquí</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Barra de acción fija ── */}
        <div className="sticky bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] z-10 lg:bottom-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-modal backdrop-blur">
            <p className="flex min-w-0 items-center gap-2 pl-1 text-md text-muted">
              {csvFile ? (
                <FiCheckCircle size={16} className="shrink-0 text-success-600 dark:text-success-400" />
              ) : (
                <span className="h-2 w-2 shrink-0 rounded-full bg-warning-500" />
              )}
              <span className="truncate">
                {csvFile ? "Archivo listo para enviar" : "Selecciona un archivo para continuar"}
              </span>
            </p>

            <button
              type="submit"
              disabled={envioVacio || csvLoading}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-md font-semibold transition-colors ${
                envioVacio
                  ? "cursor-not-allowed border border-line bg-surface-2 text-muted"
                  : "border-0 bg-brand-600 text-white shadow-brand hover:bg-brand-500"
              }`}
            >
              {csvLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin-smooth rounded-full border-2 border-white/40 border-t-white" />
                  Procesando...
                </>
              ) : (
                <>
                  <FiSend size={16} />
                  Enviar orden
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ── Avisos flotantes ── */}
      {isPopupErrorOpen && (
        <Alert
          floating
          position="top-right"
          type="danger"
          title="Ocurrió un error"
          message={errorPopupMessage}
          onDismiss={() => setIsPopupErrorOpen(false)}
          autoClose
          duration={3000}
        />
      )}

      {isPopupOpen && (
        <Alert
          floating
          position="top-right"
          type="success"
          title="¡Orden ingresada!"
          message="La orden de producción se agregó correctamente."
          onDismiss={() => setIsPopupOpen(false)}
          autoClose
          duration={3000}
          actions={[
            {
              label: "Ver órdenes",
              variant: "primary",
              onClick: () => navigate("/ordenes-produccion"),
            },
            {
              label: "Ingresar otra",
              variant: "secondary",
              onClick: () => setIsPopupOpen(false),
            },
          ]}
        />
      )}
    </div>
  );
};

export default IngresarOrdenProd;