import { useState } from "react";
import { Container } from "react-bootstrap";
import Title from "../../../components/Title/Title";
import AddButton from "../../../components/AddButton/AddButton";
import { useNavigate } from "react-router";
import useGetVentas from "../../../hooks/ventas/useGetVentas";
import { useMediaQuery } from "react-responsive";
import "./DetalleVentaPage.css";
import VentasTable from "../../../components/ventas/VentasTable/VentasTable";
import VentasCard from "../../../components/ventas/VentasCard/VentasCard";
import PaginationComponent from "../../../components/PaginationComponent/PaginationComponent";
import useFilterOrders from "../../../hooks/ordenesproduccion/useFilterOrders";
import { getCurrentItems } from "./DetallesVentas.utils";
import OrderCardSkeleton from "../../../components/OrderCardSkeleton/OrderCardSkeleton";
import FilterBarVentas from "../../../components/ventas/FilterBar/FilterBarVentas";
import useFilterVentas from "../../../hooks/ventas/useFilterVentas";

const VentaDetallePage = () => {
  const navigate = useNavigate();
  const { ventas, loadingVentas, showErrorVentas, showInfoVentas, setVentas } =
    useGetVentas();
  const [filters, setFilters] = useState({
    search: "",
    date: "",
    sucursal: "",
  });
  const filteredVentas = useFilterVentas(ventas, filters);

  /* Variables para la paginacion */
  const [currentPage, setCurrentPage] = useState(1);
  const ventasPerPage = 5;
  const currentSales = getCurrentItems(
    filteredVentas,
    currentPage,
    ventasPerPage
  );
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Usamos useMediaQuery para detectar si es un dispositivo móvil
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  if (showErrorVentas) return <div>Error al cargar las ventas</div>;

  const handleDelete = (idVenta) => {
    // Lógica para eliminar una venta
    setVentas(ventas.filter((venta) => venta.idVenta !== idVenta));
  };

  const handleViewPdf = (idVenta) => {
    // Lógica para generar un PDF
    console.log("Generar PDF para la venta:", idVenta);
  };

  const handleViewDetails = (venta) => {
    // Lógica para ver detalles de la venta
    console.log("Ver detalles de la venta:", venta);
    navigate(`detalle-venta/${venta.idVenta}`);
  };

  return (
    <Container>
      <Title
        title="Ventas Diarias"
        description="Gestiona las ventas realizadas en el día"
      />
      <AddButton
        buttonText="Ingresar venta"
        onRedirect={() => navigate("ingresar-venta")}
      />

      <FilterBarVentas
        filters={filters}
        onFilterChange={setFilters}
        ventas={ventas}
      />

      {isMobile ? (
        // Vista para móviles con SaleCard
        loadingVentas ? (
          [...Array(5)].map((_, index) => <OrderCardSkeleton key={index} />)
        ) : (
          <>
            {currentSales.map((venta) => (
              <VentasCard
                key={venta.idVenta}
                sale={venta}
                onViewDetails={handleViewDetails}
                onDeleteSale={handleDelete}
              />
            ))}

            <PaginationComponent
              totalItems={filteredVentas.length}
              itemsPerPage={ventasPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </>
        )
      ) : loadingVentas ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary my-5" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        // Usar el componente VentasTable para la vista de PC
        <VentasTable
          sales={filteredVentas}
          onDelete={handleDelete}
          onViewPdf={handleViewPdf}
          loadingViewPdf={null} // Puedes manejar el estado de carga aquí
        />
      )}
    </Container>
  );
};

export default VentaDetallePage;
