import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavigationBar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';

function MainLayout() {
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const location = useLocation();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setShowSidebar(false);
    }
  }, [location]);

  // Update sidebar visibility on window resize
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
      <div className="content-wrapper">
        <Sidebar show={showSidebar} />
        <main className={`main-content ${!showSidebar ? 'expanded' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;