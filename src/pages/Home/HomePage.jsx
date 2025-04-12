import React from 'react';
import { 
  FiBox, FiDollarSign, FiUsers, FiPieChart, 
  FiShoppingCart, FiSettings, FiLogOut 
} from 'react-icons/fi';
import "./HomePage.styles.css";
import { getUserData } from '../../utils/Auth/decodedata';

const HomePage = () => {
    const userData = getUserData();
    console.log(userData);
  // Datos de ejemplo (puedes reemplazar con datos reales de tu API)
  const stats = [
    { title: "Stock Crítico", value: "15", icon: <FiBox size={24} />, color: "bg-danger" },
    { title: "Ventas Hoy", value: "$1,240,500", icon: <FiDollarSign size={24} />, color: "bg-success" },
    { title: "Usuarios Activos", value: "8", icon: <FiUsers size={24} />, color: "bg-info" },
    { title: "Sucursales", value: "3", icon: <FiPieChart size={24} />, color: "bg-warning" }
  ];

  const recentActivities = [
    { id: 1, action: "Nueva venta registrada", time: "Hace 15 min", user: "Juan Pérez" },
    { id: 2, action: "Stock actualizado (Harina)", time: "Hace 1 hora", user: "María Gómez" },
    { id: 3, action: "Usuario creado (Carlos R.)", time: "Hace 3 horas", user: "Admin" }
  ];

  return (
    <div className="dashboard-container">
      {/* --- Sidebar --- */}


      {/* --- Main Content --- */}
      <div className="main-content">
        {/* Header */}
        <header className="bg-light p-3 d-flex justify-content-between align-items-center">
          <h1 className="h4 mb-0">Resumen General</h1>
          <div className="user-profile d-flex align-items-center">
            <span  className="me-2 name-user">{`${userData.nombre} ${userData.apellido}`}</span>
            <div className="avatar bg-primary text-white rounded-circle">{userData.nombre.charAt(0).toUpperCase()}</div>
          </div>
        </header>



        {/* Recent Activities & Quick Actions */}
        <div className="container-fluid mt-4">
          <div className="row">
            {/* Actividades Recientes */}
            <div className="col-lg-8 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Actividad Reciente</h5>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    {recentActivities.map(activity => (
                      <li key={activity.id} className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>{activity.action}</strong>
                            <p className="small text-muted mb-0">Por: {activity.user}</p>
                          </div>
                          <span className="text-muted small">{activity.time}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="col-lg-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Acciones Rápidas</h5>
                </div>
                <div className="card-body">
                  <button className="btn btn-outline-primary w-100 mb-2">
                    <FiShoppingCart className="me-2" /> Nueva Venta
                  </button>
                  <button className="btn btn-outline-success w-100 mb-2">
                    <FiBox className="me-2" /> Agregar Stock
                  </button>
                  <button className="btn btn-outline-info w-100 mb-2">
                    <FiUsers className="me-2" /> Crear Usuario
                  </button>
                  <button className="btn btn-outline-warning w-100">
                    <FiSettings className="me-2" /> Reportes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;