import { useNavigate } from "react-router-dom";
import {
  FiBox,
  FiShoppingCart,
  FiCalendar,
  FiPieChart,
  FiRotateCw,
  FiShieldOff,
  FiDollarSign,
  FiShoppingBag,
  FiArrowRight,
  FiBarChart2,
} from "react-icons/fi";

const REPORT_GROUPS = [
  {
    label: "Inventario",
    reports: [
      {
        id: 1,
        title: "Ingreso de Inventario",
        description: "Registro completo de productos ingresados",
        icon: FiBox,
        route: "/reportes/ingreso-stock",
      },
      {
        id: 4,
        title: "Pérdidas de producto",
        description: "Productos registrados con pérdidas",
        icon: FiCalendar,
        route: "/reportes/perdidas",
      },
      {
        id: 6,
        title: "Balance de productos",
        description: "Balance general de inventario",
        icon: FiPieChart,
        route: "/reportes/balance-stock",
      },
      {
        id: 7,
        title: "Sobrante de productos",
        description: "Sobrante de productos por fecha",
        icon: FiShieldOff,
        route: "/reportes/sobrantes-stock",
      },
    ],
  },
  {
    label: "Ventas",
    reports: [
      {
        id: 2,
        title: "Análisis de Ventas",
        description: "Desempeño de ventas por período",
        icon: FiShoppingCart,
        route: "/reportes/ventas",
      },
      {
        id: 5,
        title: "Ventas eliminadas",
        description: "Historial de ventas eliminadas por periodo",
        icon: FiRotateCw,
        route: "/reportes/ventas-eliminadas",
      },
      {
        id: 9,
        title: "Productos Vendidos",
        description: "Productos vendidos por fecha",
        icon: FiShoppingBag,
        route: "/reportes/productos-vendidos",
      },
    ],
  },
  {
    label: "Finanzas",
    reports: [
      {
        id: 8,
        title: "Gastos",
        description: "Gastos realizados diariamente",
        icon: FiDollarSign,
        route: "/reportes/gastos",
      },
    ],
  },
];

function ReportesPanel() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
          <FiBarChart2 size={19} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink">Reportes</h1>
          <p className="text-sm text-muted">Visualiza y genera informes de tus procesos</p>
        </div>
      </header>

      {/* ── Reportes agrupados por categoría ────────────────────────────── */}
      <div className="flex flex-col gap-6">
        {REPORT_GROUPS.map((group) => (
          <section key={group.label}>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">{group.label}</h2>

            <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
              {group.reports.map(({ id, title, description, icon: Icon, route }, i) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigate(route)}
                  className={`group flex w-full items-center gap-4 border-0 bg-transparent p-4 text-left transition-colors hover:bg-brand-50/50 ${
                    i > 0 ? "border-t border-line" : ""
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <Icon size={19} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{title}</p>
                    <p className="truncate text-xs text-muted">{description}</p>
                  </div>

                  <FiArrowRight
                    size={16}
                    className="shrink-0 text-muted transition-all duration-150 group-hover:translate-x-1 group-hover:text-brand-600"
                  />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default ReportesPanel;