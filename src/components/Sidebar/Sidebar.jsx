import React, { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { MdOutlineBakeryDining } from "react-icons/md";
import { FaSun, FaMoon, FaChevronLeft, FaSignOutAlt } from "react-icons/fa";
import * as DarkReader from "darkreader";
import { getUserData, getUserPermissions } from "../../utils/Auth/decodedata";
import { getColorFromName } from "./Sidebar.uitils";
import {
  FiHome,
  FiPieChart,
  FiBox,
  FiCalendar,
  FiShoppingBag,
  FiShoppingCart,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";

const NAV_GROUPS = [
  {
    label: "General",
    items: [
      { to: "/home", icon: FiHome, label: "Inicio", route: null },
      { to: "/dashboard", icon: FiPieChart, label: "Dashboard", route: "/dashboard" },
    ],
  },
  {
    label: "Operación",
    items: [
      { to: "/stock-productos", icon: FiBox, label: "Inventario", route: "/stock-productos" },
      { to: "/ordenes-produccion", icon: FiCalendar, label: "Producción", route: "/ordenes-produccion" },
      { to: "/pedido-especial", icon: FiShoppingBag, label: "Pedido especial", route: "/pedido-especial" },
      { to: "/ventas", icon: FiShoppingCart, label: "Ventas", route: "/ventas" },
    ],
  },
  {
    label: "Análisis",
    items: [
      { to: "/reportes", icon: FiBarChart2, label: "Reportes", route: "/reportes" },
    ],
  },
];

function Sidebar({ expanded, onToggle, mobileOpen, onCloseMobile }) {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isChangingTheme, setIsChangingTheme] = useState(false);
  const permisosUsuario = getUserPermissions();
  const userData = getUserData();

  const permissionsMap = permisosUsuario.reduce((acc, perm) => {
    acc[perm.rutaAcceso] = true;
    return acc;
  }, {});
  const isRouteAllowed = (route) => !route || permissionsMap[route];

  useEffect(() => {
    if (theme === "dark") {
      DarkReader.enable({ brightness: 100, contrast: 100, sepia: 0 });
    } else {
      DarkReader.disable();
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    if (isChangingTheme) return;
    setIsChangingTheme(true);
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    const apply = () => {
      if (newTheme === "dark") {
        DarkReader.enable({ brightness: 99, contrast: 90, sepia: 10 });
      } else {
        DarkReader.disable();
      }
      setIsChangingTheme(false);
    };
    if ("requestIdleCallback" in window) requestIdleCallback(apply);
    else setTimeout(apply, 0);
  }, [theme, isChangingTheme]);

  const handleNavClick = useCallback(() => {
    if (window.innerWidth <= 768) onCloseMobile();
  }, [onCloseMobile]);

  const handleLogout = useCallback(() => {
    // TODO: reemplazar por tu lógica real de logout
    localStorage.removeItem("token");
    window.location.href = "/login";
  }, []);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-[2px] md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed z-40 flex flex-col rounded-2xl border border-line bg-surface shadow-modal transition-all duration-200 ease-in-out
          inset-y-3 left-3
          ${expanded ? "w-72" : "w-[4.5rem]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-[120%] md:translate-x-0"}
        `}
      >
        {/* Botón colapsar */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={expanded ? "Colapsar menú" : "Expandir menú"}
          className="absolute -right-3 top-9 hidden h-6 w-6 items-center justify-center rounded-full border-0 bg-surface text-muted shadow-card transition-transform duration-200 hover:text-brand-700 md:flex"
        >
          <FaChevronLeft size={10} className={`transition-transform duration-200 ${expanded ? "" : "rotate-180"}`} />
        </button>

        {/* Logo */}
        <div className={`flex items-center gap-2.5 px-4 pt-5 pb-3 ${expanded ? "" : "justify-center px-0"}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
            <MdOutlineBakeryDining size={19} />
          </span>
          {expanded && (
            <span className="truncate text-sm font-semibold text-ink">
              Panadería San Gabriel
            </span>
          )}
        </div>

        {/* Usuario: avatar + nombre + tema + logout, todo en una fila, todo a 1 clic */}
        <div className={`flex items-center gap-2 px-3 pb-3 ${expanded ? "" : "flex-col"}`}>
          {userData?.avatar ? (
            <img src={userData.avatar} className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-brand-100" alt="User" />
          ) : (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: getColorFromName(userData?.nombre || "A") }}
            >
              {userData?.nombre?.charAt(0).toUpperCase() || "A"}
            </div>
          )}

          {expanded && (
            <p className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">
              {`${userData?.nombre ?? ""} ${userData?.apellido ?? ""}`}
            </p>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            disabled={isChangingTheme}
            aria-label="Cambiar tema"
            title="Cambiar tema"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-muted transition-colors hover:bg-surface-2 hover:text-brand-700"
          >
            {isChangingTheme ? (
              <span className="h-3.5 w-3.5 animate-spin-smooth rounded-full border-2 border-brand-300 border-t-transparent" />
            ) : theme === "dark" ? (
              <FaMoon size={13} />
            ) : (
              <FaSun size={13} />
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-muted transition-colors hover:bg-danger-50 hover:text-danger-600"
          >
            <FaSignOutAlt size={14} />
          </button>
        </div>

        <div className="mx-3 mb-2 border-t border-line" />

        {/* Navegación agrupada */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => isRouteAllowed(item.route));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label} className="mb-4">
                {expanded && (
                  <p className="mb-1.5 px-2 text-2xs font-semibold uppercase tracking-wider text-muted">
                    {group.label}
                  </p>
                )}
                <div className="flex flex-col gap-0.5">
                  {visibleItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={handleNavClick}
                      title={!expanded ? label : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium no-underline transition-colors duration-150 ${
                          expanded ? "" : "justify-center"
                        } ${
                          isActive
                            ? "bg-brand-600 text-white shadow-brand"
                            : "text-muted hover:bg-surface-2 hover:text-ink"
                        }`
                      }
                    >
                      <Icon size={18} className="shrink-0" />
                      {expanded && <span className="truncate">{label}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Configuraciones — al fondo, como única acción secundaria */}
        {isRouteAllowed("/config") && (
          <div className="border-t border-line px-3 py-3">
            <NavLink
              to="/config"
              onClick={handleNavClick}
              title={!expanded ? "Configuraciones" : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium no-underline transition-colors duration-150 ${
                  expanded ? "" : "justify-center"
                } ${
                  isActive
                    ? "bg-brand-600 text-white shadow-brand"
                    : "text-muted hover:bg-surface-2 hover:text-ink"
                }`
              }
            >
              <FiSettings size={18} className="shrink-0" />
              {expanded && <span className="truncate">Configuraciones</span>}
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
}

export default React.memo(Sidebar);