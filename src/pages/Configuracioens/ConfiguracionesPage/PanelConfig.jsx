import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiUserPlus,
  FiMapPin,
  FiClipboard,
  FiLock,
  FiArrowRight,
  FiSettings,
  FiLayers,
} from "react-icons/fi";
import { MdStorage, MdKitchen, MdPoll, MdOutlineCalendarToday, MdNotificationsActive, MdCategory } from "react-icons/md";
import useValidarPermisos from "../../../hooks/configuraciones/useValidarPermisos";
import { rutas } from "./config.routes";
import { handleNavigate } from "./PanelConfig.utils";
import { getUserData } from "../../../utils/Auth/decodedata";

function PanelConfig() {
  const navigate = useNavigate();
  const permisos = useValidarPermisos(rutas);
  const usuario = getUserData();
  const esAdmin = usuario?.usuario === "admin" || usuario?.usuario === "aagarcia";

  const CONFIG_GROUPS = [
    {
      label: "Usuarios y accesos",
      items: [
        {
          title: "Creación de Usuarios",
          description: "Gestiona los usuarios que tienen acceso al sistema",
          icon: FiUsers,
          route: "/users",
          allowed: permisos.usuarios,
        },
        {
          title: "Gestión de Roles y Permisos",
          description: "Gestiona los roles y permisos para los usuarios",
          icon: FiUserPlus,
          route: "/users/roles",
          allowed: permisos.usuarios,
        },
        {
          title: "Reseteo de contraseñas",
          description: "Realiza el reseteo de contraseña de un usuario",
          icon: FiLock,
          route: "/reset-pass",
          allowed: permisos.resetPass,
        },
      ],
    },
    {
      label: "Operación",
      items: [
        {
          title: "Sucursales",
          description: "Creación de nuevas sucursales",
          icon: FiMapPin,
          route: "/sucursales",
          allowed: permisos.sucursales,
        },
        {
          title: "Productos",
          description: "Creación de nuevos productos",
          icon: FiClipboard,
          route: "/productos",
          allowed: permisos.productos,
        },
        {
          title: "Categorías",
          description: "Configura las categorías de productos",
          icon: MdCategory,
          route: "/categorias",
          allowed: permisos.categorias,
        },
        {
          title: "Gestionar Materia Prima",
          description: "Gestiona la cantidad de materia prima por producto producido",
          icon: MdStorage,
          route: "/config/gestionar-materia-prima",
          allowed: permisos.gestionarMateriaPrima,
        },
      ],
    },
    {
      label: "Sistema",
      items: [
        {
          title: "Configuración del Perfil",
          description: "Gestiona tus credenciales de acceso y nombre de usuario",
          icon: MdKitchen,
          route: "/config/configuracion-perfil",
          allowed: permisos.configuracionPerfil,
        },
        {
          title: "Configurar Encuestas",
          description: "Configura encuestas de satisfacción de servicios",
          icon: MdPoll,
          route: "/encuestas-config",
          allowed: permisos.encuestas,
        },
        {
          title: "Habilitar Notificaciones",
          description: "Habilita notificaciones especiales para usuarios",
          icon: MdNotificationsActive,
          route: "/habilitar-notificaciones",
          allowed: permisos.notificaciones,
        },
        ...(esAdmin
          ? [
              {
                title: "Activar Fecha en curso",
                description: "Activa el día en curso para ingreso de orden de producción",
                icon: MdOutlineCalendarToday,
                route: "/activar-fecha-produccion",
                allowed: permisos.activarFechaProduccion,
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiSettings size={19} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink">Configuraciones</h1>
          <p className="text-sm text-muted">Administra usuarios, operación y ajustes del sistema</p>
        </div>
      </header>

      {/* ── Secciones agrupadas por categoría ───────────────────────────── */}
      <div className="flex flex-col gap-6">
        {CONFIG_GROUPS.map((group) => (
          <section key={group.label}>
            <h2 className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
              <FiLayers size={12} /> {group.label}
            </h2>

            <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
              {group.items.map(({ title, description, icon: Icon, route, allowed }, i) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => allowed && handleNavigate(route, navigate)}
                  disabled={!allowed}
                  title={!allowed ? "No tienes permiso para acceder a esta sección" : undefined}
                  className={`group flex w-full items-center gap-4 border-0 bg-transparent p-4 text-left transition-colors ${
                    i > 0 ? "border-t border-line" : ""
                  } ${allowed ? "hover:bg-brand-50/50" : "cursor-not-allowed"}`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      allowed
                        ? "bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white"
                        : "bg-surface-2 text-muted"
                    }`}
                  >
                    <Icon size={19} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${allowed ? "text-ink" : "text-muted"}`}>{title}</p>
                    <p className="truncate text-xs text-muted">{description}</p>
                  </div>

                  {allowed ? (
                    <FiArrowRight
                      size={16}
                      className="shrink-0 text-muted transition-all duration-150 group-hover:translate-x-1 group-hover:text-brand-600"
                    />
                  ) : (
                    <FiLock size={14} className="shrink-0 text-muted" />
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default PanelConfig;