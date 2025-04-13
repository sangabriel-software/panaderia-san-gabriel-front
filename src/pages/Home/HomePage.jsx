import React, { useState } from 'react';
import { 
  FiBox, FiDollarSign, FiUsers, FiPieChart, 
  FiShoppingCart, FiPlus, FiTrendingUp, FiFileText,
  FiClock, FiUser, FiPackage, FiX,
  FiSun, FiMoon
} from 'react-icons/fi';
import "./HomePage.styles.css";
import { getUserData } from '../../utils/Auth/decodedata';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { FaClock, FaMoon, FaSun } from 'react-icons/fa';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: date => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { es }
});

const calendarMessages = {
  allDay: 'Todo el día',
  previous: '<',
  next: '>',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay órdenes programadas',
  showMore: total => `+ Ver más (${total})`
};

const HomePage = () => {
  const userData = getUserData();
  const navigate = useNavigate();
  const currentHour = dayjs().hour();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getGreeting = () => {
    if (currentHour >= 5 && currentHour < 12) {
      return { text: "Buenos días", icon: <FaSun className="me-2 text-warning" /> };
    } else if (currentHour >= 12 && currentHour < 19) {
      return { text: "Buenas tardes", icon: <FaSun className="me-2 text-warning text-amber-500" /> };
    } else {
      return { text: "Buenas noches", icon: <FaMoon className="me-2 text-warning text-indigo-300" /> };
    }
  };

  const greeting = getGreeting();

  const stats = [
    { title: "Stock Crítico", value: "15", icon: <FiBox size={24} />, color: "bg-danger", link: "/inventory" },
    { title: "Ventas Hoy", value: "$1,240,500", icon: <FiDollarSign size={24} />, color: "bg-success", link: "/sales" },
    { title: "Usuarios", value: "8", icon: <FiUsers size={24} />, color: "bg-info", link: "/users" },
    { title: "Sucursales", value: "3", icon: <FiPieChart size={24} />, color: "bg-warning", link: "/branches" }
  ];

  const quickActions = [
    { title: "Nueva Venta", icon: <FiShoppingCart size={20} />, variant: "primary", action: () => navigate('/ventas/ingresar-venta') },
    { title: "Agregar Stock", icon: <FiPlus size={20} />, variant: "success", action: () => navigate('/stock-productos') },
    { title: "Ver Reportes", icon: <FiTrendingUp size={20} />, variant: "warning", action: () => navigate('/reports') },
    { title: "Ingresar Orden", icon: <FiFileText size={20} />, variant: "info", action: () => navigate('/ordenes-produccion/ingresar-orden') },
  ];

  const recentActivities = [
    { id: 1, action: "Nueva venta registrada", time: "Hace 15 min", user: "Juan Pérez", icon: <FiShoppingCart /> },
    { id: 2, action: "Stock actualizado (Harina)", time: "Hace 1 hora", user: "María Gómez", icon: <FiPackage /> },
    { id: 3, action: "Usuario creado (Carlos R.)", time: "Hace 3 horas", user: "Admin", icon: <FiUser /> }
  ];

  const specialOrders = [
    {
      id: 1,
      title: "Orden Especial",
      start: new Date(new Date().setDate(new Date().getDate() + 2)),
      end: new Date(new Date().setDate(new Date().getDate() + 2)),
      client: "Hotel Las Palmas",
      products: "200 panes especiales, 50 tortas",
      notes: "Entregar antes de las 10 AM",
      status: "pendiente",
      color: "#0D6EFD"
    },
    {
      id: 2,
      title: "Orden Especial",
      start: new Date(new Date().setDate(new Date().getDate() + 4)),
      end: new Date(new Date().setDate(new Date().getDate() + 4)),
      client: "Colegio San José",
      products: "300 panes integrales, 200 panes blancos",
      notes: "Empacar en bolsas individuales",
      status: "confirmado",
      color: "#0D6EFD"
    }
  ];

  const handleSelectEvent = (event) => {
    setSelectedOrder(event);
    setShowModal(true);
  };

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    }
  });

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="homepage-dashboard">
      {/* Header optimizado para móviles con avatar visible */}
      <header className="homepage-header">
        <div className="d-flex align-items-center">
          <h1 className="h4 mb-0 fw-bold text-dark homepage-greeting-text">
            {greeting.icon} {greeting.text}
          </h1>
        </div>
        
        <div className="homepage-user-info">
          <span className="homepage-user-name">{`${userData.nombre} ${userData.apellido}`}</span>
          <div className="homepage-avatar">
            {userData.nombre.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="homepage-main-content container-fluid py-4">
        <div className="row">
          {/* Calendario (8 columnas en desktop, 12 en móvil) */}
          <div className="col-lg-8 col-md-12 mb-4">
            <div className="homepage-card shadow-sm h-100">
              <div className="homepage-card-header">
                <h2 className="h5 fw-bold mb-0 d-flex align-items-center">
                  <FiClock className="me-2 text-muted" /> Calendario de Órdenes Especiales
                </h2>
              </div>
              <div className="homepage-card-body p-3">
                <div className="homepage-calendar" style={{ height: 530 }}>
                  <Calendar
                    localizer={localizer}
                    events={specialOrders}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    messages={calendarMessages}
                    defaultView="month"
                    views={['month', 'week', 'day']}
                    culture="es"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas (4 columnas en desktop, 12 en móvil) */}
          <div className="col-lg-4 col-md-12 mb-4">
            <div className="homepage-card shadow-sm h-100">
              <div className="homepage-card-header">
                <h2 className="h5 fw-bold mb-0 d-flex align-items-center">
                  <FaClock className="me-2 text-info" /> Acciones Rápidas
                </h2>
              </div>
              <div className="homepage-card-body">
                <div className="d-grid gap-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className={`homepage-quick-action-btn btn btn-${action.variant}`}
                      onClick={action.action}
                    >
                      <div className="mb-2">{action.icon}</div>
                      <span>{action.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actividades Recientes (12 columnas - ancho completo) */}
        <div className="row">
          <div className="col-12">
            <div className="homepage-card shadow-sm">
              <div className="homepage-card-header">
                <h2 className="h5 fw-bold mb-0 d-flex align-items-center">
                  <FiClock className="me-2 text-muted" /> Actividad Reciente
                </h2>
              </div>
              <div className="homepage-card-body p-0">
                <ul className="list-group list-group-flush">
                  {recentActivities.map(activity => (
                    <li key={activity.id} className="list-group-item border-0 py-3 homepage-activity-item">
                      <div className="d-flex align-items-start">
                        <div className="homepage-activity-icon">
                          {activity.icon}
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 fw-semibold">{activity.action}</p>
                          <small className="text-muted d-block">
                            <span className="me-2">Por: {activity.user}</span>
                            <span>{activity.time}</span>
                          </small>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="homepage-modal">
        <Modal.Header className=" text-white">
          <Modal.Title>Detalles del Pedido Especial</Modal.Title>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={() => setShowModal(false)}
            aria-label="Cerrar"
          />
        </Modal.Header>
        <Modal.Body className="homepage-animate-fade">
          {selectedOrder && (
            <div className="row">
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-4">
                  <div 
                    className="rounded-circle me-3" 
                    style={{ width: '20px', height: '20px', backgroundColor: selectedOrder.color }}
                  />
                  <h4 className="mb-0 fw-bold">{selectedOrder.title}</h4>
                </div>
                
                <div className="mb-3">
                  <h6 className="text-muted mb-2">Fecha de Entrega</h6>
                  <p className="fs-5">{formatDate(selectedOrder.start)}</p>
                </div>

                <div className="mb-3">
                  <h6 className="text-muted mb-2">Cliente</h6>
                  <p className="fs-5">{selectedOrder.client}</p>
                </div>

                <div className="mb-3">
                  <h6 className="text-muted mb-2">Estado</h6>
                  <span className={`homepage-badge ${
                    selectedOrder.status === 'pendiente' ? 'bg-warning text-dark' : 
                    selectedOrder.status === 'confirmado' ? 'bg-success' : 'bg-secondary'
                  }`}>
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="homepage-card h-100">
                  <div className="homepage-card-header bg-light">
                    <h5 className="mb-0">Detalles del Pedido</h5>
                  </div>
                  <div className="homepage-card-body">
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">Productos</h6>
                      <p>{selectedOrder.products}</p>
                    </div>
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">Notas Especiales</h6>
                      <p className="fst-italic">{selectedOrder.notes}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={() => navigate('/ordenes-produccion')}>
            Ver orden completa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HomePage;