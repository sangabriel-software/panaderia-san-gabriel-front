import React, { useState, useEffect } from "react";
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
} from "react-icons/fi";
import { getUserData } from "../../utils/Auth/decodedata";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useGetOrdenEHeader from "../../hooks/orenesEspeciales/useGetOrdenEHeader";
import { consultarOrdenEspecialByIdService } from "../../services/ordenesEspeciales/ordenesEspeciales.service";
import { getUniqueColor } from "../../utils/utils";
import { getColorFromName } from "../../components/Sidebar/Sidebar.uitils";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { es },
});

const calendarMessages = {
  allDay: "Todo el día",
  previous: "‹",
  next: "›",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay órdenes programadas",
  showMore: (total) => `+ Ver más (${total})`,
};

const QUICK_ACTIONS = [
  {
    title: "Nueva Venta",
    icon: FiShoppingCart,
    tone: "brand",
    path: "/ventas/ingresar-venta",
  },
  {
    title: "Orden Especial",
    icon: FiTrendingUp,
    tone: "accent",
    path: "/pedido-especial/ingresar-orden-especial",
  },
  {
    title: "Agregar Stock",
    icon: FiPlus,
    tone: "warning",
    path: "/stock-productos",
  },
  {
    title: "Ingresar Orden",
    icon: FiFileText,
    tone: "danger",
    path: "/ordenes-produccion/ingresar-orden",
  },
];

// Clases por tono — centralizado para no repetir strings largos por acción
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
  const [showModal, setShowModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { ordenesEspeciales, loadingOrdenEspecial } = useGetOrdenEHeader();
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    if (ordenesEspeciales && ordenesEspeciales.length > 0) {
      const events = ordenesEspeciales.map((orden) => {
        const fechaEntrega = dayjs(orden.fechaEntrega);
        return {
          id: orden.idOrdenEspecial,
          title: `Orden #${orden.idOrdenEspecial}`,
          start: fechaEntrega.startOf("day").toDate(),
          end: fechaEntrega.endOf("day").toDate(),
          client: orden.nombreCliente,
          phone: orden.telefonoCliente,
          branch: orden.sucursalEntrega,
          status: orden.estado === "A" ? "Activo" : "Inactivo",
          color: getUniqueColor(orden.sucursalEntrega + "orden1256"),
          orderData: orden,
        };
      });
      setCalendarEvents(events);
    }
  }, [ordenesEspeciales]);

  const greeting =
    currentHour >= 5 && currentHour < 12
      ? "Buenos días"
      : currentHour >= 12 && currentHour < 19
      ? "Buenas tardes"
      : "Buenas noches";

  const handleSelectEvent = async (event) => {
    setSelectedOrder(event);
    setShowModal(true);
    setLoadingDetails(true);
    try {
      const response = await consultarOrdenEspecialByIdService(event.id);
      setOrderDetails(response.ordenEspecial);
    } catch (error) {
      console.error("Error al cargar los detalles de la orden:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      borderRadius: "8px",
      border: "0px",
      opacity: 0.9,
      color: "white",
      fontSize: "12px",
      fontWeight: 500,
    },
  });

  const formatDate = (date) =>
    date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header: saludo + usuario ──────────────────────────────────── */}
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
        {/* ── Calendario ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <FiCalendar size={17} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-ink">Calendario de Órdenes Especiales</h2>
          </div>

          <div className="h-[520px]">
            {loadingOrdenEspecial ? (
              <div className="flex h-full items-center justify-center">
                <span className="h-8 w-8 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
              </div>
            ) : (
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                messages={calendarMessages}
                defaultView="month"
                views={["month", "week", "day"]}
                culture="es"
              />
            )}
          </div>
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
                {/* Línea del timeline */}
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

      {/* ── Modal de detalle de orden — 100% Tailwind, sin react-bootstrap ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-2xl animate-slide-up overflow-hidden rounded-2xl bg-surface shadow-modal">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line bg-brand-600 px-5 py-4 text-white">
              <h3 className="text-base font-semibold">Detalles del Pedido Especial</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[70vh] overflow-y-auto p-5">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <span className="h-8 w-8 animate-spin-smooth rounded-full border-4 border-brand-200 border-t-brand-600" />
                </div>
              ) : (
                selectedOrder && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Columna izquierda: datos de la orden */}
                    <div>
                      <div className="mb-4 flex items-center gap-2.5">
                        <span
                          className="h-3.5 w-3.5 rounded-full"
                          style={{ backgroundColor: selectedOrder.color }}
                        />
                        <h4 className="text-lg font-bold text-ink">
                          Orden Especial #{selectedOrder.id}
                        </h4>
                      </div>

                      <dl className="flex flex-col gap-3.5">
                        <div>
                          <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
                            Fecha de entrega
                          </dt>
                          <dd className="flex items-center gap-1.5 text-sm text-ink">
                            <FiCalendar size={14} className="text-muted" />
                            {formatDate(selectedOrder.start)}
                          </dd>
                        </div>
                        <div>
                          <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Cliente</dt>
                          <dd className="flex items-center gap-1.5 text-sm text-ink">
                            <FiUser size={14} className="text-muted" />
                            {selectedOrder.client}
                          </dd>
                        </div>
                        <div>
                          <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Teléfono</dt>
                          <dd className="flex items-center gap-1.5 text-sm text-ink">
                            <FiPhone size={14} className="text-muted" />
                            {selectedOrder.phone}
                          </dd>
                        </div>
                        <div>
                          <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
                            Sucursal de entrega
                          </dt>
                          <dd className="flex items-center gap-1.5 text-sm text-ink">
                            <FiMapPin size={14} className="text-muted" />
                            {selectedOrder.branch}
                          </dd>
                        </div>
                        <div>
                          <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Estado</dt>
                          <dd>
                            {dayjs(selectedOrder.orderData.fechaEntrega).isBefore(dayjs(), "day") ? (
                              <span className="badge bg-brand-100 text-brand-700">Entregado</span>
                            ) : (
                              <span className="badge bg-danger-100 text-danger-700">Sin entregar</span>
                            )}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Columna derecha: productos */}
                    <div className="rounded-xl border border-line bg-surface-2/50 p-4">
                      <h5 className="mb-3 text-sm font-semibold text-ink">Productos</h5>
                      {orderDetails && orderDetails?.ordenDetalle?.length > 0 ? (
                        <>
                          <ul className="flex flex-col gap-2">
                            {orderDetails.ordenDetalle.map((producto, index) => (
                              <li
                                key={index}
                                className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm"
                              >
                                <span className="text-ink">{producto.nombreProducto}</span>
                                <span className="font-semibold text-brand-700">
                                  {producto.cantidadUnidades} u.
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 border-t border-line pt-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted">Ingresado por</p>
                            <p className="mt-1 text-sm text-ink">
                              {selectedOrder.orderData?.ordenIngresadaPor || "N/A"}
                            </p>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted">No hay detalles de productos para esta orden.</p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-line px-5 py-3.5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border-0 bg-danger-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;