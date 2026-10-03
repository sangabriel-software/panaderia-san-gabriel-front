import React, { useMemo, useState, useEffect } from "react";
import {
  FiShoppingCart,
  FiTrendingUp,
  FiPlus,
  FiFileText,
  FiClock,
  FiUser,
  FiPackage,
  FiX,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiChevronRight,
  FiInbox,
  FiArrowLeft,
} from "react-icons/fi";
import { getUserData } from "../../utils/Auth/decodedata";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import useGetOrdenEHeader from "../../hooks/orenesEspeciales/useGetOrdenEHeader";
import { consultarOrdenEspecialByIdService } from "../../services/ordenesEspeciales/ordenesEspeciales.service";
import { getUniqueColor } from "../../utils/utils";
import { getColorFromName } from "../../components/Sidebar/Sidebar.uitils";

const QUICK_ACTIONS = [
  { title: "Nueva Venta", icon: FiShoppingCart, tone: "brand", path: "/ventas/ingresar-venta" },
  { title: "Orden Especial", icon: FiTrendingUp, tone: "accent", path: "/pedido-especial/ingresar-orden-especial" },
  { title: "Agregar Stock", icon: FiPlus, tone: "warning", path: "/stock-productos" },
  { title: "Ingresar Orden", icon: FiFileText, tone: "danger", path: "/ordenes-produccion/ingresar-orden" },
];

const TONE_CLASSES = {
  brand: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  accent: "bg-accent-50 text-accent-700 hover:bg-accent-100",
  warning: "bg-warning-50 text-warning-700 hover:bg-warning-100",
  danger: "bg-danger-50 text-danger-700 hover:bg-danger-100",
};
const TONE_ICON_BG = {
  brand: "bg-brand-600",
  accent: "bg-accent-600",
  warning: "bg-warning-500",
  danger: "bg-danger-600",
};

const RECENT_ACTIVITIES = [
  { id: 1, action: "Nueva venta registrada", time: "Hace 15 min", user: "Juan Pérez", icon: FiShoppingCart },
  { id: 2, action: "Stock actualizado (Harina)", time: "Hace 1 hora", user: "María Gómez", icon: FiPackage },
  { id: 3, action: "Usuario creado (Carlos R.)", time: "Hace 3 horas", user: "Admin", icon: FiUser },
];

function HomePage() {
  const userData = getUserData();
  const navigate = useNavigate();
  const currentHour = dayjs().hour();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { ordenesEspeciales, loadingOrdenEspecial } = useGetOrdenEHeader();

  const proximasEntregas = useMemo(() => {
    if (!ordenesEspeciales) return [];
    return ordenesEspeciales
      .map((orden) => ({
        id: orden.idOrdenEspecial,
        fecha: dayjs(orden.fechaEntrega),
        client: orden.nombreCliente,
        phone: orden.telefonoCliente,
        branch: orden.sucursalEntrega,
        color: getUniqueColor(orden.sucursalEntrega + "orden1256"),
        orderData: orden,
      }))
      .filter((o) => o.fecha.isSame(dayjs(), "day") || o.fecha.isAfter(dayjs(), "day"))
      .sort((a, b) => a.fecha.valueOf() - b.fecha.valueOf())
      .slice(0, 6);
  }, [ordenesEspeciales]);

  const greeting =
    currentHour >= 5 && currentHour < 12
      ? "Buenos días"
      : currentHour >= 12 && currentHour < 19
      ? "Buenas tardes"
      : "Buenas noches";

  const handleSelectOrder = async (item) => {
    setSelectedOrder(item);
    setDrawerOpen(true);
    setLoadingDetails(true);
    try {
      const response = await consultarOrdenEspecialByIdService(item.id);
      setOrderDetails(response.ordenEspecial);
    } catch (error) {
      console.error("Error al cargar los detalles de la orden:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const formatDate = (d) => d.format("dddd D [de] MMMM, h:mm A");

  const relativeLabel = (d) => {
    if (d.isSame(dayjs(), "day")) return "Hoy";
    if (d.isSame(dayjs().add(1, "day"), "day")) return "Mañana";
    return d.format("D MMM");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-600">{greeting}</p>
          <h1 className="text-2xl font-bold text-ink">
            {userData?.nombre} {userData?.apellido}
          </h1>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold text-white shadow-card"
          style={{ backgroundColor: getColorFromName(userData?.nombre || "A") }}
        >
          {userData?.nombre?.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* ── Acciones rápidas ─────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {QUICK_ACTIONS.map(({ title, icon: Icon, tone, path }) => (
          <button
            key={title}
            type="button"
            onClick={() => navigate(path)}
            className={`flex flex-col items-start gap-3 rounded-2xl border-0 p-4 text-left transition-colors duration-150 ${TONE_CLASSES[tone]}`}
          >
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${TONE_ICON_BG[tone]}`}>
              <Icon size={17} />
            </span>
            <span className="text-sm font-semibold">{title}</span>
          </button>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Próximas entregas ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiCalendar size={17} className="text-brand-600" />
              <h2 className="text-sm font-semibold text-ink">Próximas entregas</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/pedido-especial")}
              className="flex items-center gap-1 border-0 bg-transparent text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Ver todas <FiChevronRight size={13} />
            </button>
          </div>

          {loadingOrdenEspecial ? (
            <div className="flex items-center justify-center py-12">
              <span className="h-8 w-8 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
            </div>
          ) : proximasEntregas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-muted">
                <FiInbox size={18} />
              </span>
              <p className="text-sm text-muted">No hay entregas próximas programadas.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {proximasEntregas.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectOrder(item)}
                    className={`flex w-full items-center gap-3 rounded-xl border-0 p-3 text-left transition-colors ${
                      selectedOrder?.id === item.id && drawerOpen
                        ? "bg-brand-50 ring-1 ring-brand-200"
                        : "bg-surface-2/50 hover:bg-brand-50"
                    }`}
                  >
                    <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{item.client}</p>
                      <p className="truncate text-xs text-muted">{item.branch}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-brand-700">
                      {relativeLabel(item.fecha)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Actividad reciente ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <FiClock size={17} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-ink">Actividad reciente</h2>
          </div>

          <ul className="flex flex-col gap-1">
            {RECENT_ACTIVITIES.map(({ id, action, time, user, icon: Icon }, i) => (
              <li key={id} className="relative flex gap-3 pb-5 last:pb-0">
                {i < RECENT_ACTIVITIES.length - 1 && (
                  <span className="absolute left-[15px] top-8 h-full w-px bg-line" />
                )}
                <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Icon size={14} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-ink">{action}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {user} · {time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Panel lateral de detalle ────────────────────────────────────
          Móvil: pantalla completa (inset-0), UN SOLO contenedor con scroll
          (el propio <aside>), crece según el contenido. Botón "Cerrar"
          vive dentro del flujo normal, después de los productos.
          Desktop (sm+): panel de 420px, header fijo + contenido con su
          propio scroll interno, como antes. ──────────────────────────── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] animate-fade-in"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          <aside
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-surface shadow-modal animate-slide-in sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[420px] sm:overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Header — sticky en móvil (queda fijo mientras el panel entero
                hace scroll); en desktop simplemente no se mueve porque el
                <aside> ahí no tiene scroll propio. */}
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-brand-600 px-5 py-4 text-white">
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-white/10 text-white transition-colors hover:bg-white/20 sm:hidden"
              >
                <FiArrowLeft size={16} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white/70">Pedido especial</p>
                <h3 className="truncate text-base font-semibold">
                  Orden #{selectedOrder?.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Cerrar"
                className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-white/10 text-white transition-colors hover:bg-white/20 sm:flex"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Contenido — en móvil sin overflow propio (el <aside> es quien
                scrollea); en desktop sí tiene su propio scroll interno. */}
            <div className="flex-1 p-5 sm:overflow-y-auto">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-16">
                  <span className="h-8 w-8 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
                </div>
              ) : (
                selectedOrder && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedOrder.color }} />
                        <span className="text-sm font-medium text-ink">{selectedOrder.branch}</span>
                      </div>
                      {selectedOrder.fecha.isBefore(dayjs(), "day") ? (
                        <span className="badge bg-brand-100 text-brand-700">Entregado</span>
                      ) : (
                        <span className="badge bg-danger-100 text-danger-700">Sin entregar</span>
                      )}
                    </div>

                    <dl className="flex flex-col divide-y divide-line rounded-xl border border-line">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <FiCalendar size={16} className="shrink-0 text-brand-600" />
                        <div className="min-w-0">
                          <dt className="text-xs text-muted">Fecha de entrega</dt>
                          <dd className="truncate text-sm font-medium capitalize text-ink">
                            {formatDate(selectedOrder.fecha)}
                          </dd>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3">
                        <FiUser size={16} className="shrink-0 text-brand-600" />
                        <div className="min-w-0">
                          <dt className="text-xs text-muted">Cliente</dt>
                          <dd className="truncate text-sm font-medium text-ink">{selectedOrder.client}</dd>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3">
                        <FiPhone size={16} className="shrink-0 text-brand-600" />
                        <div className="min-w-0">
                          <dt className="text-xs text-muted">Teléfono</dt>
                          <dd className="truncate text-sm font-medium text-ink">{selectedOrder.phone}</dd>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3">
                        <FiMapPin size={16} className="shrink-0 text-brand-600" />
                        <div className="min-w-0">
                          <dt className="text-xs text-muted">Sucursal de entrega</dt>
                          <dd className="truncate text-sm font-medium text-ink">{selectedOrder.branch}</dd>
                        </div>
                      </div>
                    </dl>

                    {/* Productos */}
                    <div>
                      <h4 className="mb-2.5 text-sm font-semibold text-ink">Productos</h4>
                      {orderDetails && orderDetails?.ordenDetalle?.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                          {orderDetails.ordenDetalle.map((producto, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between rounded-lg border border-line bg-surface-2/40 px-3 py-2.5 text-sm"
                            >
                              <span className="text-ink">{producto.nombreProducto}</span>
                              <span className="font-semibold text-brand-700">
                                {producto.cantidadUnidades} u.
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-sm text-muted">
                          No hay detalles de productos para esta orden.
                        </p>
                      )}
                    </div>

                    {/* Ingresado por */}
                    <div className="border-t border-line pt-4">
                      <p className="text-xs text-muted">Ingresado por</p>
                      <p className="mt-0.5 text-sm font-medium text-ink">
                        {selectedOrder.orderData?.ordenIngresadaPor || "N/A"}
                      </p>
                    </div>

                    {/* Cerrar — dentro del flujo, justo después del contenido
                        (productos + ingresado por), no un footer fijo aparte */}
                    <button
                      type="button"
                      onClick={closeDrawer}
                      className="w-full rounded-xl border-0 bg-surface-2 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2/70"
                    >
                      Cerrar
                    </button>
                  </div>
                )
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

export default HomePage;