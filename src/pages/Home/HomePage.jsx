import React from 'react';
import { 
  FiBox, FiDollarSign, FiUsers, FiPieChart, 
  FiShoppingCart, FiPlus, FiTrendingUp, FiFileText,
  FiClock, FiUser, FiPackage, 
  FiSun,
  FiMoon
} from 'react-icons/fi';
import "./HomePage.styles.css";
import { getUserData } from '../../utils/Auth/decodedata';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { FaMoon, FaSun } from 'react-icons/fa';

const HomePage = () => {
  const userData = getUserData();
  const navigate = useNavigate();
  const currentHour = dayjs().hour();

  const getGreeting = () => {
    if (currentHour >= 5 && currentHour < 12) {
      return { text: "Buenos días", icon: <FaSun className="me-2 text-warning" /> };
    } else if (currentHour >= 12 && currentHour < 19) {
      return { text: "Buenas tardes", icon: <FaSun className="me-2 text-amber-500" /> };
    } else {
      return { text: "Buenas noches", icon: <FaMoon className="me-2 text-indigo-300" /> };
    }
  };

  const greeting = getGreeting();

  // Datos de ejemplo
  const stats = [
    { title: "Stock Crítico", value: "15", icon: <FiBox size={24} />, color: "bg-danger", link: "/inventory" },
    { title: "Ventas Hoy", value: "$1,240,500", icon: <FiDollarSign size={24} />, color: "bg-success", link: "/sales" },
    { title: "Usuarios", value: "8", icon: <FiUsers size={24} />, color: "bg-info", link: "/users" },
    { title: "Sucursales", value: "3", icon: <FiPieChart size={24} />, color: "bg-warning", link: "/branches" }
  ];

  const quickActions = [
    { 
      title: "Nueva Venta", 
      icon: <FiShoppingCart size={20} />, 
      variant: "primary",
      action: () => navigate('/ventas/ingresar-venta')
    },
    { 
      title: "Agregar Stock", 
      icon: <FiPlus size={20} />, 
      variant: "success",
      action: () => navigate('/stock-productos')
    },
    { 
      title: "Ver Reportes", 
      icon: <FiTrendingUp size={20} />, 
      variant: "warning",
      action: () => navigate('/reports')
    },
    { 
      title: "Ingresar Orden", 
      icon: <FiFileText size={20} />, 
      variant: "info",
      action: () => navigate('/ordenes-produccion/ingresar-orden')
    },
  ];

  const recentActivities = [
    { id: 1, action: "Nueva venta registrada", time: "Hace 15 min", user: "Juan Pérez", icon: <FiShoppingCart /> },
    { id: 2, action: "Stock actualizado (Harina)", time: "Hace 1 hora", user: "María Gómez", icon: <FiPackage /> },
    { id: 3, action: "Usuario creado (Carlos R.)", time: "Hace 3 horas", user: "Admin", icon: <FiUser /> }
  ];

  return (
    <div className="container-fluid p-0 min-vh-100 bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
        <h1 className="h4 mb-0 fw-bold text-primary">{greeting.icon} {greeting.text}</h1>
        <div className="d-flex align-items-center">
          <span className="me-3 fw-semibold">{`${userData.nombre} ${userData.apellido}`}</span>
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            {userData.nombre.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container-fluid py-4">
        {/* Sección de Acciones Rápidas (Destacada) */}
        <section className="mb-5">
          <h2 className="h5 fw-bold mb-4 d-flex align-items-center">
            <FiClock className="me-2 text-warning" /> Acciones Rápidas
          </h2>
          <div className="row g-4">
            {quickActions.map((action, index) => (
              <div key={index} className="col-xl-3 col-lg-4 col-md-6">
                <button 
                  className={`btn btn-${action.variant} w-100 py-3 d-flex flex-column align-items-center shadow-sm`}
                  onClick={action.action}
                >
                  <div className="mb-2">{action.icon}</div>
                  <span>{action.title}</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="row">
          {/* Estadísticas */}
          <div className="col-lg-8 mb-4">
            <h2 className="h5 fw-bold mb-4">Resumen General</h2>
            <div className="row g-4">
              {stats.map((item, index) => (
                <div key={index} className="col-md-6 col-xl-3">
                  <div 
                    className={`card text-white ${item.color} h-100 border-0 shadow-sm cursor-pointer`}
                    onClick={() => navigate(item.link)}
                  >
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h3 className="card-title fw-bold mb-1">{item.value}</h3>
                        <p className="card-text mb-0">{item.title}</p>
                      </div>
                      <div className="bg-white bg-opacity-25 p-2 rounded-circle">
                        {item.icon}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividades Recientes */}
          <div className="col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white border-0">
                <h2 className="h5 fw-bold mb-0 d-flex align-items-center">
                  <FiClock className="me-2 text-muted" /> Actividad Reciente
                </h2>
              </div>
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  {recentActivities.map(activity => (
                    <li key={activity.id} className="list-group-item border-0 py-3">
                      <div className="d-flex align-items-start">
                        <div className="bg-light p-2 rounded me-3">
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
    </div>
  );
};

export default HomePage;