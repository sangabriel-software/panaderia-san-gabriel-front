import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageLoader from "./components/PageLoader/PageLoader";

/* AI routes */
const IngresarVentasAI = lazy(() => import("./pages/VentasAI/IngresarVentasAI"));

/* reportes routes */
const ReportesPanel = lazy(() => import("./pages/reportes/reportespanel/ReportesPanel"));
const HistorialStock = lazy(() => import("./pages/reportes/historialStock/HistorialStock"));
const VentasReportPage = lazy(() => import("./pages/reportes/ventasReport/VentasReportPage"));
const ReportePerdidasPage = lazy(() => import("./pages/reportes/ReportePerdidas/ReportePerdidasPage"));
const VentasEliminadasPage = lazy(() => import("./pages/reportes/VentasEliminadas/VentasEliminadas"));
const BalanceStockPage = lazy(() => import("./pages/reportes/BalanceStock/BalanceStock"));
const SobrantesReport = lazy(() => import("./pages/reportes/reporteSobrantes/SobrantesReport"));
const Gastos = lazy(() => import("./pages/reportes/Gastos/Gastos"));
const ProductosVendidos = lazy(() => import("./pages/reportes/ProductosVendidos/ProductosVendidos"));

const AccessDeniedPage = lazy(() => import("./components/AccesoDenegado/AccessDeniedPage"));

const MainLayout = lazy(() => import("./layouts/MainLayout"));
const LoginPage = lazy(() => import("./pages/LoginPages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage/DashboardPage"));
const ManageUsers = lazy(() => import("./pages/UsersPages/Users/ManageUsers/ManageUsers"));
const ManageRoles = lazy(() => import("./pages/UsersPages/Roles/ManageRoles/ManageRoles"));
const CreateRolForm = lazy(() => import("./pages/UsersPages/Roles/CreateRoles/CreateRolForm"));
const UpdateRolesForm = lazy(() => import("./pages/UsersPages/Roles/UpdateRoles/UpdateRolesForm"));
const CreateUsers = lazy(() => import("./pages/UsersPages/Users/createUsers/CreateUsers"));
const PrivateRoute = lazy(() => import("./components/PrivateRoute/PrivateRoute"));
const ManageProducts = lazy(() => import("./pages/ProductosPage/ManageProducts/ManageProducts"));
const IngresarProductos = lazy(() => import("./pages/ProductosPage/IngresarProductos/IngresarProductos"));
const GestionPedidosProd = lazy(() => import("./pages/PedidosProdPage/GestionPedidos/GestionPedidosProd"));
const DetallesOrdenesProduccionPage = lazy(() => import("./pages/PedidosProdPage/DetallesOrdenesProd/DetallesOrdenesProd"));
const IngresarOrdenProd = lazy(() => import("./pages/PedidosProdPage/IngresarOrdenProd/IngresarOrdenProd"));
const GestionVentasPage = lazy(() => import("./pages/VentasPage/GestionVentas/GestionVentasPage"));
const IngresarVentaPage = lazy(() => import("./pages/VentasPage/IngresarVenta/IngresarVentaPage"));
const DetalleVentaPage = lazy(() => import("./pages/VentasPage/DetalleVenta/DetalleVentaPage"));
const GestionDeSucursalesPAge = lazy(() => import("./pages/Sucursales/GestionDeSucursales/GestionDeSucursalesPage"));
const PanelConfig = lazy(() => import("./pages/Configuracioens/ConfiguracionesPage/PanelConfig"));
const GestionDeRecetasPage = lazy(() => import("./pages/RecetasPage/GestionDeRecetasPage"));
const PerfilPage = lazy(() => import("./pages/Configuracioens/PerfilPage/PerfilPage"));
const GestionarStockPage = lazy(() => import("./pages/StockProductos/GestionarStock/GestionarStockPage"));
const StockDiarioPage = lazy(() => import("./pages/StockProductos/StockDiarioPage/StockDiarioPage"));
const IngresarStockGeneralPage = lazy(() => import("./pages/StockProductos/IngresarStock/IngresarStockPage"));
const StockUnificado = lazy(() => import("./pages/StockProductos/StockUnificado/StockUnificado"));
const OrdenesEspecialesList = lazy(() => import("./pages/OrdenesEspeciales/OrdenesEspecialesList/OrdenesEspecialesList"));
const IngresarOrdenEspecialPage = lazy(() => import("./pages/OrdenesEspeciales/ingresar-orden-especial/IngresarIOrdenEspecial"));
const OrdenEspecialDetail = lazy(() => import("./pages/OrdenesEspeciales/DetalleOrdenEspecial/OrdenEspecialDetalle"));
const HomePage = lazy(() => import("./pages/Home/HomePage"));
const StockDescuentosList = lazy(() => import("./pages/StockProductos/DescontarStock/StockDescuentosList/StockDescuentosList"));
const DescontarStock = lazy(() => import("./pages/StockProductos/DescontarStock/DescontarStock/DescontarStock"));
const DetalleDescuento = lazy(() => import("./pages/StockProductos/DescontarStock/DetalleDescuento/DetalleDescuento"));
const GestionarTraslados = lazy(() => import("./pages/Traslados/GestionarTraslados/GestionarTraslados"));
const DetalleTraslados = lazy(() => import("./pages/Traslados/DetalleTraslado/DetalleTraslados"));
const IngresarTraslado = lazy(() => import("./pages/Traslados/IngresarTraslado/IngresarTraslado"));
const CustomerResponses = lazy(() => import("./pages/Encuestas/CustomerResponses/CustomerResponses"));
const ActivarFechaProduccion = lazy(() => import("./pages/Activar-Fecha-Produccion/ActivarFechaProduccion"));
const NotificacionesEspeciales = lazy(() => import("./pages/notificaciones/notificaciones-especiales/NotificacionesEspeciales"));
const CategoriasPage = lazy(() => import("./pages/Categorias/CategoriasPage"));
const CreateSurvey = lazy(() => import("./pages/Encuestas/CreateSurvey/CreateSurvey"));
const ResetPassPage = lazy(() => import("./pages/Reset-Pass/ResetPassPage"));
import CambiarPasswordPage from "./pages/CambiarPassword/CambiarPasswordPage";

const PWAInstallPrompt = lazy(() => import("./components/PWAInstallPrompt/PWAInstallPrompt"));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        theme="light"
        toastClassName="!rounded-xl !border !border-line !bg-surface !text-ink !shadow-modal !font-sans"
        progressClassName="!bg-brand-600"
      />
      <PWAInstallPrompt />

      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/acceso-denegado" element={<AccessDeniedPage />} />
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/surveys">
          <Route path="customer-responses" element={<CustomerResponses />} />
        </Route>

        <Route path="/cambiar-password" element={<CambiarPasswordPage />} />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/users">
              <Route index element={<ManageUsers />} />
              <Route path="create-user" element={<CreateUsers />} />
              <Route path="roles" element={<ManageRoles />} />
              <Route path="createRol" element={<CreateRolForm />} />
              <Route path="editRol/:idRol" element={<UpdateRolesForm />} />
            </Route>

            <Route path="/productos">
              <Route index element={<ManageProducts />} />
              <Route path="ingresar-producto" element={<IngresarProductos />} />
            </Route>

            <Route path="/ordenes-produccion">
              <Route index element={<GestionPedidosProd />} />
              <Route path="detalle-orden/:idOrdenProduccion" element={<DetallesOrdenesProduccionPage />} />
              <Route path="ingresar-orden" element={<IngresarOrdenProd />} />
            </Route>

            <Route path="/ventas">
              <Route index element={<GestionVentasPage />} />
              <Route path="ingresar-venta" element={<IngresarVentaPage />} />
              <Route path="detalle-venta/:idVenta" element={<DetalleVentaPage />} />
            </Route>

            <Route path="/sucursales">
              <Route index element={<GestionDeSucursalesPAge />} />
            </Route>

            <Route path="/config">
              <Route index element={<PanelConfig />} />
              <Route path="gestionar-materia-prima" element={<GestionDeRecetasPage />} />
              <Route path="configuracion-perfil" element={<PerfilPage />} />
            </Route>

            <Route path="/stock-productos">
              <Route index element={<GestionarStockPage />} />
              <Route path="venta-diaria/:idSucursal" element={<StockDiarioPage />} />
              <Route path="ingresar-stock/:idSucursal" element={<IngresarStockGeneralPage />} />
              <Route path="stock-general/:idSucursal" element={<StockUnificado />} />
            </Route>

            <Route path="/pedido-especial">
              <Route index element={<OrdenesEspecialesList />} />
              <Route path="ingresar-orden-especial" element={<IngresarOrdenEspecialPage />} />
              <Route path="detalle-orden-especial/:idOrdenEspecial" element={<OrdenEspecialDetail />} />
            </Route>

            {/* Nota: se removió la "ñ" suelta que quedó pegada al final de este path,
                era texto sin uso dentro del JSX y no debería estar ahí. */}
            <Route path="/descuento-stock">
              <Route path="stock-descuentos-lista/:idSucursal" element={<StockDescuentosList />} />
              <Route path="descontar-stock/:idSucursal" element={<DescontarStock />} />
              <Route path="detalle-descuento/:idDescuento" element={<DetalleDescuento />} />
            </Route>

            <Route path="/reportes">
              <Route index element={<ReportesPanel />} />
              <Route path="ingreso-stock" element={<HistorialStock />} />
              <Route path="ventas" element={<VentasReportPage />} />
              <Route path="perdidas" element={<ReportePerdidasPage />} />
              <Route path="ventas-eliminadas" element={<VentasEliminadasPage />} />
              <Route path="balance-stock" element={<BalanceStockPage />} />
              <Route path="sobrantes-stock" element={<SobrantesReport />} />
              <Route path="gastos" element={<Gastos />} />
              <Route path="productos-vendidos" element={<ProductosVendidos />} />
            </Route>

            <Route path="/traslados-productos">
              <Route path="traslados-lista/:idSucursal" element={<GestionarTraslados />} />
              <Route path="detalles-traslado/:idTraslado/detalle/:idSucursal" element={<DetalleTraslados />} />
              <Route path="ingresar-traslado/:idSucursal" element={<IngresarTraslado />} />
            </Route>

            <Route path="/encuestas-config">
              <Route index element={<CreateSurvey />} />
            </Route>

            <Route path="/activar-fecha-produccion">
              <Route index element={<ActivarFechaProduccion />} />
            </Route>

            <Route path="/habilitar-notificaciones">
              <Route index element={<NotificacionesEspeciales />} />
            </Route>

            <Route path="/categorias">
              <Route index element={<CategoriasPage />} />
            </Route>

            <Route path="/reset-pass">
              <Route index element={<ResetPassPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;