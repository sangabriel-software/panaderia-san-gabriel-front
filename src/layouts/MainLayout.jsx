import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import Sidebar from "../components/Sidebar/Sidebar";

function MainLayout() {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const railWidth = expanded ? "18rem" : "6rem"; // w-72/w-[4.5rem] + p-3 de margen

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Botón flotante, solo en móvil, para abrir el sidebar */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-card md:hidden"
      >
        <FiMenu size={18} />
      </button>

      <div
        className="min-h-screen transition-[padding] duration-200 ease-in-out"
        style={{ paddingLeft: window.innerWidth > 768 ? railWidth : 0 }}
      >
        <main className="animate-fade-in px-4 py-6 pt-16 md:pt-6">
          <div className="app-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;