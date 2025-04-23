import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavigationBar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';

function MainLayout() {
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const location = useLocation();
  const contentRef = useRef(null);

  // Cerrar el Sidebar en móviles cuando cambia la ruta
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setShowSidebar(false);
    }
  }, [location]);

  // Actualizar la visibilidad del Sidebar al cambiar el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      const shouldShow = window.innerWidth > 768;
      setShowSidebar(shouldShow);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Manejar clic fuera del sidebar para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768 && 
          showSidebar && 
          contentRef.current && 
          contentRef.current.contains(event.target)) {
        setShowSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebar]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="app">
      <NavigationBar onMenuClick={toggleSidebar} />
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />
      <div 
        ref={contentRef}
        className={`content-wrapper ${!showSidebar ? 'sidebar-closed' : ''}`}
      >
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;