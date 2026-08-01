import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import useGetSucursales from "../../hooks/sucursales/useGetSucursales";
import { getUserData } from "../../utils/Auth/decodedata";
import { ingresarVentaAIService } from "../../services/vetnasAI/ventasAI.service";
import "./IngresarVentas.styles.css";
import { getCurrentDateTimeWithSeconds } from "../../utils/dateUtils";

const STEPS = ["turno", "foto", "monto", "gastos"];

const IngresarVentasAI = () => {
  const { sucursales, loadingSucursales } = useGetSucursales();
  const usuario = getUserData();
  const navigate = useNavigate();
  const today = dayjs().format("DD [de] MMMM [de] YYYY");
  const isDesktop = useMediaQuery({ minWidth: 768 });

  const [turno,        setTurno]        = useState("");
  const [sucursal,     setSucursal]     = useState("");
  const [imagen,       setImagen]       = useState(null);
  const [preview,      setPreview]      = useState(null);
  const [ventaReal,    setVentaReal]    = useState("");
  const [gastos,       setGastos]       = useState([]);
  const [nuevoGasto,   setNuevoGasto]   = useState({ detalle: "", subtotal: "" });
  const [step,         setStep]         = useState(0);
  const [loadingPhase, setLoadingPhase] = useState(null);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState(null);
  const [sobrantes,    setSobrantes]    = useState([]);
  const [gastoPendienteError, setGastoPendienteError] = useState(false);

  const inputCamaraRef  = useRef(null);
  const inputGaleriaRef = useRef(null);

  const stepsComplete = [
    turno && sucursal,
    !!imagen,
    ventaReal && parseFloat(ventaReal) > 0,
    true,
  ];

  const hayGastoPendiente =
    nuevoGasto.detalle.trim() !== "" || nuevoGasto.subtotal !== "";

  const formularioCompleto =
    stepsComplete.slice(0, 3).every(Boolean) && !hayGastoPendiente;

  useEffect(() => {
    if (turno && sucursal && step === 0) setStep(1);
  }, [turno, sucursal]);

  useEffect(() => {
    if (imagen && step === 1) setStep(2);
  }, [imagen]);

  useEffect(() => {
    if (ventaReal && parseFloat(ventaReal) > 0 && step === 2) setStep(3);
  }, [ventaReal]);

  // Limpiar error de gasto pendiente al limpiar inputs
  useEffect(() => {
    if (!hayGastoPendiente) setGastoPendienteError(false);
  }, [hayGastoPendiente]);

  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const agregarGasto = () => {
    if (!nuevoGasto.detalle.trim() || !nuevoGasto.subtotal) return;
    setGastos((prev) => [...prev, {
      detalleGasto: nuevoGasto.detalle.trim(),
      subtotal: parseFloat(nuevoGasto.subtotal),
    }]);
    setNuevoGasto({ detalle: "", subtotal: "" });
    setGastoPendienteError(false);
  };

  const eliminarGasto = (index) =>
    setGastos((prev) => prev.filter((_, i) => i !== index));

  const totalGastos = gastos.reduce((a, g) => a + g.subtotal, 0);

  const handleEnviar = async () => {
    // Validar gasto pendiente
    if (hayGastoPendiente) {
      setGastoPendienteError(true);
      // Scroll al paso de gastos
      document.getElementById("paso-gastos")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!stepsComplete.slice(0, 3).every(Boolean)) return;

    setError(null);
    setLoadingPhase("imagen");

    const timer = setTimeout(() => setLoadingPhase("venta"), 7000);

    try {
      const fechaActual = dayjs().format("YYYY-MM-DD");

      const payload = {
        encabezadoVenta: {
          idOrdenProduccion: null,
          idUsuario: usuario.idUsuario,
          idSucursal: sucursal,
          ventaTurno: turno,
          fechaVenta: fechaActual,
          fechaCreacion: fechaActual,
          fechaYHoraVenta: getCurrentDateTimeWithSeconds(),
        },
        detalleIngreso: {
          montoTotalIngresado: parseFloat(ventaReal),
          fechaIngreso: fechaActual,
        },
        gastosDiarios: gastos.length > 0 ? {
          encabezadoGastosDiarios: {
            idUsuario: usuario.idUsuario,
            montoTotalGasto: totalGastos,
            fechaIngreso: fechaActual,
          },
          detalleGastosDiarios: gastos.map((g) => ({
            detalleGasto: g.detalleGasto,
            subTotal: g.subtotal,
          })),
        } : {},
      };

      const formData = new FormData();
      formData.append("image", imagen);
      formData.append("venta", JSON.stringify(payload));

      const response = await ingresarVentaAIService(formData);
      clearTimeout(timer);
      if (response.status === 200){
        setSobrantes(response.productos?.detallesVenta || []);
        setSuccess(true);
      } 
      } catch (error) {
        clearTimeout(timer);
        const status = error.response?.status;
        const mensaje = error.response?.data?.error?.message;

        if (status === 422 && mensaje) {
          setError(mensaje);
        } else {
          setError("Hubo un error al procesar la venta. Intenta de nuevo.");
        }
      } finally {
        setLoadingPhase(null);
      }
  };

  const resetForm = () => {
    setTurno(""); setSucursal(""); setImagen(null); setPreview(null);
    setVentaReal(""); setGastos([]); setStep(0); setSuccess(false);
    setError(null); setNuevoGasto({ detalle: "", subtotal: "" });
    setGastoPendienteError(false);
  };

  // ── Loading screen ──
  if (loadingPhase) {
    return (
      <div className="wv-page">
        <div className="wv-loading-screen">
          <div className="wv-loading-spinner" />
          <p className="wv-loading-title">
            {loadingPhase === "imagen" ? "Procesando imagen" : "Ingresando venta"}
          </p>
          <p className="wv-loading-sub">
            {loadingPhase === "imagen"
              ? "Analizando imagen con IA..."
              : "Guardando los datos en el sistema..."}
          </p>
        </div>
      </div>
    );
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="wv-page">
        <div className="wv-success-screen">
          <div className="wv-success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#0F6E56" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="wv-success-title">Venta registrada</p>
          <p className="wv-success-sub">Los datos fueron procesados y guardados correctamente.</p>

          <div className="wv-success-summary">
            <div className="wv-summary-row">
              <span>Turno</span><span>{turno}</span>
            </div>
            <div className="wv-summary-row">
              <span>Venta</span>
              <span style={{ color: "#0F6E56", fontWeight: 500 }}>
                Q {parseFloat(ventaReal).toFixed(2)}
              </span>
            </div>
            {sobrantes.length > 0 && (
              <div className="wv-sobrantes-card">

                <div className="wv-sobrantes-header">
                  <span>📦 Sobrantes ingresados</span>
                  <span>{sobrantes.length}</span>
                </div>

                <div className="wv-sobrantes-list">
                  {sobrantes.map((producto) => (
                    <div className="wv-sobrante-item" key={producto.idProducto}>

                      <span className="wv-sobrante-nombre">
                        {producto.nombreProducto}
                      </span>

                      <span className="wv-sobrante-cantidad">
                        {producto.unidadesNoVendidas}
                      </span>

                    </div>
                  ))}
                </div>

              </div>
            )}
            {gastos.length > 0 && (
              <div className="wv-summary-row">
                <span>Gastos</span>
                <span>Q {totalGastos.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="wv-success-actions">
            <button className="wv-btn-primary" onClick={() => navigate("/ventas")}>
              Ver ventas
            </button>
            <button className="wv-btn-ghost" onClick={resetForm}>
              Ingresar otra venta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wv-page">

      {/* HEADER */}
      <div className="wv-header">
        <button className="wv-back-btn" onClick={() => navigate("/ventas")} aria-label="Volver">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div>
          <p className="wv-header-title">Venta por foto</p>
          <p className="wv-header-date">{today}</p>
        </div>
        <div className="wv-user-chip">
          <div className="wv-user-avatar">
            {usuario?.usuario?.charAt(0).toUpperCase()}
          </div>
          <span>{usuario?.usuario}</span>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="wv-progress-bar">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`wv-progress-dot ${i < step ? "done" : i === step ? "active" : ""}`}
          />
        ))}
      </div>

      {/* LAYOUT DESKTOP */}
      <div className={isDesktop ? "wv-desktop-layout" : ""}>

        {/* Columna izquierda en desktop (pasos 1 y 2) */}
        <div className={isDesktop ? "wv-col" : ""}>

          <div className="wv-body" style={isDesktop ? { padding: "16px 16px 16px 0" } : {}}>

            {/* PASO 1 — Turno y sucursal */}
            <div className="wv-card">
              <div className="wv-step-label">
                <div className={`wv-step-num ${stepsComplete[0] ? "done" : ""}`}>
                  {stepsComplete[0] ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : "1"}
                </div>
                Turno y sucursal
              </div>

              <div className="wv-shift-row">
                {["AM", "PM"].map((t) => (
                  <button
                    key={t}
                    className={`wv-shift-btn ${turno === t ? "active" : ""}`}
                    onClick={() => setTurno(t)}
                    type="button"
                  >
                    <span className="wv-shift-emoji">{t === "AM" ? "🌅" : "🌇"}</span>
                    <span className="wv-shift-name">{t}</span>
                    <span className="wv-shift-time">{t === "AM" ? "6:00 – 14:00" : "14:00 – 22:00"}</span>
                  </button>
                ))}
              </div>

              <select
                className="wv-select"
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                disabled={loadingSucursales}
              >
                <option value="">{loadingSucursales ? "Cargando..." : "Selecciona una sucursal"}</option>
                {sucursales.map((s) => (
                  <option key={s.idSucursal} value={s.idSucursal}>{s.nombreSucursal}</option>
                ))}
              </select>
            </div>

            {/* PASO 2 — Foto */}
            {step >= 1 && (
              <div className="wv-card wv-card-animated">
                <div className="wv-step-label">
                  <div className={`wv-step-num ${stepsComplete[1] ? "done" : ""}`}>
                    {stepsComplete[1] ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : "2"}
                  </div>
                  Foto de la hoja
                </div>

                {!preview ? (
                  <div className="wv-dropzone">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                      stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <p className="wv-drop-text">Toma o carga una foto de la hoja de producción</p>
                    <div className="wv-drop-actions">
                      <button className="wv-btn-sm wv-btn-primary-sm"
                        onClick={() => inputCamaraRef.current.click()} type="button">
                        Tomar foto
                      </button>
                      <button className="wv-btn-sm wv-btn-outline-sm"
                        onClick={() => inputGaleriaRef.current.click()} type="button">
                        Galería
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="wv-preview-wrap">
                    <img src={preview} alt="Vista previa" className="wv-preview-img" />
                    <button
                      className="wv-preview-remove"
                      onClick={() => { setImagen(null); setPreview(null); }}
                      type="button"
                    >
                      Quitar foto
                    </button>
                  </div>
                )}

                <input ref={inputCamaraRef} type="file" accept="image/*"
                  capture="environment" onChange={handleImagen} style={{ display: "none" }} />
                <input ref={inputGaleriaRef} type="file" accept="image/*"
                  onChange={handleImagen} style={{ display: "none" }} />
              </div>
            )}

          </div>
        </div>

        {/* Columna derecha en desktop (pasos 3 y 4) */}
        <div className={isDesktop ? "wv-col" : ""}>

          <div className="wv-body" style={isDesktop ? { padding: "16px 0 16px 16px" } : { paddingTop: 0 }}>

            {/* PASO 3 — Monto */}
            {step >= 2 && (
              <div className="wv-card wv-card-animated">
                <div className="wv-step-label">
                  <div className={`wv-step-num ${stepsComplete[2] ? "done" : ""}`}>
                    {stepsComplete[2] ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : "3"}
                  </div>
                  Monto de la venta
                </div>
                <div className="wv-amount-display">
                  Q <span style={{ color: "#0F6E56" }}>
                    {ventaReal && !isNaN(parseFloat(ventaReal))
                      ? parseFloat(ventaReal).toFixed(2) : "0.00"}
                  </span>
                </div>
                <input
                  type="number"
                  className="wv-input"
                  placeholder="0.00"
                  value={ventaReal}
                  onChange={(e) => setVentaReal(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  step="0.01"
                />
              </div>
            )}

            {/* PASO 4 — Gastos */}
            {step >= 3 && (
              <div className="wv-card wv-card-animated" id="paso-gastos">
                <div className="wv-step-label">
                  <div className="wv-step-num">4</div>
                  Gastos del turno
                  <span className="wv-optional">opcional</span>
                </div>

                <div className="wv-gasto-row">
                  <input
                    type="text"
                    className={`wv-input-sm ${gastoPendienteError ? "wv-input-error" : ""}`}
                    placeholder="Detalle"
                    value={nuevoGasto.detalle}
                    onChange={(e) => {
                      setNuevoGasto((p) => ({ ...p, detalle: e.target.value }));
                      setGastoPendienteError(false);
                    }}
                  />
                  <input
                    type="number"
                    className={`wv-input-sm wv-input-right ${gastoPendienteError ? "wv-input-error" : ""}`}
                    placeholder="Q 0.00"
                    value={nuevoGasto.subtotal}
                    onChange={(e) => {
                      setNuevoGasto((p) => ({ ...p, subtotal: e.target.value }));
                      setGastoPendienteError(false);
                    }}
                    onWheel={(e) => e.target.blur()}
                    step="0.01"
                  />
                  <button
                    className="wv-add-btn"
                    onClick={agregarGasto}
                    disabled={!nuevoGasto.detalle || !nuevoGasto.subtotal}
                    type="button"
                    aria-label="Agregar gasto"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>

                {/* Alerta gasto pendiente */}
                {gastoPendienteError && (
                  <div className="wv-gasto-pendiente-alert">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Agrega el gasto con el botón + antes de enviar, o limpia los campos.
                  </div>
                )}

                {gastos.length > 0 && (
                  <div className="wv-gastos-list">
                    {gastos.map((g, i) => (
                      <div className="wv-gasto-item" key={i}>
                        <span className="wv-gasto-label">{g.detalleGasto}</span>
                        <div className="wv-gasto-right">
                          <span className="wv-gasto-amount">Q {g.subtotal.toFixed(2)}</span>
                          <button className="wv-del-btn" onClick={() => eliminarGasto(i)}
                            type="button" aria-label="Eliminar">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14H6L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="wv-total-bar">
                      <span>Total gastos</span>
                      <span style={{ color: "#0F6E56", fontWeight: 500, fontSize: 18 }}>
                        Q {totalGastos.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && <div className="wv-error">{error}</div>}

            {/* Botón en desktop va inline */}
            {isDesktop && (
              <div className="wv-desktop-footer">
                <button
                  className={`wv-btn-send ${(!stepsComplete.slice(0,3).every(Boolean)) ? "disabled" : ""}`}
                  onClick={handleEnviar}
                  disabled={!stepsComplete.slice(0, 3).every(Boolean)}
                  type="button"
                >
                  Enviar venta
                </button>
                {hayGastoPendiente && (
                  <p className="wv-footer-hint" style={{ color: "#E24B4A" }}>
                    Tienes un gasto sin agregar. Agrégalo o limpia los campos.
                  </p>
                )}
                {!stepsComplete.slice(0, 3).every(Boolean) && (
                  <p className="wv-footer-hint">Completa turno, sucursal, foto y monto para continuar.</p>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* FOOTER fijo solo en mobile */}
      {!isDesktop && (
        <div className="wv-footer">
          <button
            className={`wv-btn-send ${!stepsComplete.slice(0,3).every(Boolean) ? "disabled" : ""}`}
            onClick={handleEnviar}
            disabled={!stepsComplete.slice(0, 3).every(Boolean)}
            type="button"
          >
            Enviar venta
          </button>
          {hayGastoPendiente && (
            <p className="wv-footer-hint" style={{ color: "#E24B4A" }}>
              Tienes un gasto sin agregar. Agrégalo o limpia los campos.
            </p>
          )}
          {!hayGastoPendiente && !stepsComplete.slice(0, 3).every(Boolean) && (
            <p className="wv-footer-hint">Completa turno, sucursal, foto y monto para continuar.</p>
          )}
        </div>
      )}

    </div>
  );
};

export default IngresarVentasAI;