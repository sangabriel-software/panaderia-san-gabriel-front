import { useNavigate, useParams } from "react-router";
import useGetStockDelDia from "../../../hooks/stock/useGetStockDelDia";
import { BsArrowLeft } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { Container, Spinner, Alert } from "react-bootstrap";
import "./StockDiarioPage.styles.css";
import { FaStore, FaCalendarAlt, FaBoxOpen } from "react-icons/fa";
import DotsMove from "../../../components/Spinners/DotsMove";
import { formatDateToDisplay } from "../../../utils/dateUtils";

const StockDiarioPage = () => {
  const { idSucursal } = useParams();
  const { stockDelDia, loadingStockDiario } = useGetStockDelDia(idSucursal);
  const navigate = useNavigate();

  if (loadingStockDiario) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <DotsMove />
      </Container>
    );
  }

  // Verificar si stockDelDia es un array válido
  const isArray = Array.isArray(stockDelDia);
  const isEmptyStock =
    !isArray ||
    stockDelDia.length === 0 ||
    (stockDelDia.length === 1 && stockDelDia[0].idStockDiario === 0);

  // Obtener datos de sucursal (con protección)
  const sucursalData = isArray && stockDelDia.length > 0 ? stockDelDia[0] : {};
  const fechaValidez = sucursalData?.fechaValidez || "";

  return (
    <Container className="stock-diario-container">
      {/* ---------------- Titulo ----------------- */}
      <div className="text-center mb-3">
        <div className="row">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/stock-productos")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <Title
              title={`Stock Diario - ${
                sucursalData.nombreSucursal || "Sucursal"
              }`}
              description={`Productos disponibles para hoy - ${formatDateToDisplay(
                fechaValidez
              )}`}
            />
          </div>
        </div>
      </div>

      {/* Contenido condicional */}
      {isEmptyStock ? (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <Alert variant="info" className="stock-diario-empty-alert">
              <FaBoxOpen className="me-2" />
              No hay productos en el stock.
            </Alert>
          </div>
        </div>
      ) : (
        <div className="stock-diario-grid">
          {isArray &&
            stockDelDia.map((producto) => (
              <div key={producto.idStockDiario} className="stock-diario-card">
                <h3 className="stock-diario-product-name">
                  {producto.nombreProducto}
                </h3>
                <div className="stock-diario-quantity-container">
                  <span className="stock-diario-quantity">
                    {producto.cantidadExistente}
                  </span>
                  <span className="stock-diario-quantity-label">
                    unidades disponibles
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </Container>
  );
};

export default StockDiarioPage;
