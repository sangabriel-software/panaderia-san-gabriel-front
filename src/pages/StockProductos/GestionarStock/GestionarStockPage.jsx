import { useNavigate } from "react-router-dom";
import { FiBox, FiPackage, FiMapPin, FiArrowRight, FiInbox } from "react-icons/fi";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { handleNavigate } from "./GestionarStockPage.utils";
import { getUserData } from "../../../utils/Auth/decodedata";

const CARD_TONES = [
  { bg: "bg-brand-50", icon: "bg-brand-600", accent: "text-brand-700" },
  { bg: "bg-accent-50", icon: "bg-accent-600", accent: "text-accent-700" },
  { bg: "bg-warning-50", icon: "bg-warning-500", accent: "text-warning-700" },
];

function GestionarStockPage() {
  const { sucursales, loadingSucursales } = useGetSucursales();
  const navigate = useNavigate();
  const usuario = getUserData();

  const sucursalesAMostrar = loadingSucursales
    ? []
    : usuario.idRol === 1
    ? sucursales
    : sucursales.filter((suc) => suc.idSucursal === usuario.idSucursal);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiBox size={20} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink">Gestión de Inventario</h1>
          <p className="text-sm text-muted">
            {usuario.idRol === 1
              ? "Selecciona una sucursal para gestionar su inventario"
              : "Tu sucursal asignada"}
          </p>
        </div>
      </header>

      {/* ── Contenido ────────────────────────────────────────────────── */}
      {loadingSucursales ? (
        <div className="flex items-center justify-center py-24">
          <span className="h-10 w-10 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : sucursalesAMostrar.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sucursalesAMostrar.map((sucursal, i) => {
            const tone = CARD_TONES[i % CARD_TONES.length];
            return (
              <div
                key={sucursal.idSucursal}
                className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition-shadow duration-150 hover:shadow-modal"
              >
                {/* Encabezado de la tarjeta */}
                <div className="flex items-start gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${tone.icon}`}>
                    <FiPackage size={18} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-ink">
                      {sucursal.nombreSucursal}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                      <FiMapPin size={12} className="shrink-0" />
                      {sucursal.municipioSucursal}, {sucursal.departamentoSucursal}
                    </p>
                  </div>
                </div>

                {/* Acción */}
                <button
                  type="button"
                  onClick={() => handleNavigate(navigate, sucursal.idSucursal, "stock-general")}
                  className={`group flex items-center justify-between rounded-xl border-0 p-3.5 text-left transition-colors duration-150 ${tone.bg} hover:brightness-95`}
                >
                  <div>
                    <p className={`text-sm font-semibold ${tone.accent}`}>Inventario</p>
                    <p className="text-xs text-muted">Productos en inventario</p>
                  </div>
                  <FiArrowRight
                    size={16}
                    className={`shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${tone.accent}`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
            <FiInbox size={20} />
          </span>
          <p className="text-sm text-muted">No tienes sucursales asignadas para gestionar</p>
        </div>
      )}
    </div>
  );
}

export default GestionarStockPage;