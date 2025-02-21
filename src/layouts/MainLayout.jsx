import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavigationBar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';

function MainLayout() {
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const location = useLocation();

  // Cerrar el Sidebar en móviles cuando cambia la ruta
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setShowSidebar(false);
    }
  }, [location]);

  // Actualizar la visibilidad del Sidebar al cambiar el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="app">
      <NavigationBar onMenuClick={toggleSidebar} />
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />
      <div className={`content-wrapper ${!showSidebar ? 'sidebar-closed' : ''}`}>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;