import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Form, Dropdown, Alert } from "react-bootstrap";
import { BsArrowLeft, BsX, BsChevronDown } from "react-icons/bs";
import { FaSearch, FaBoxOpen, FaPlus, FaMinus, FaExchangeAlt } from "react-icons/fa";
import DotsMove from "../../../components/Spinners/DotsMove";
import BottomSheet from "../../../components/BottomSheet/BottomSheet";
import FabSpeedDial from "../../../components/FabSpeedDial/FabSpeedDial";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import useGetStockGeneral from "../../../hooks/stock/useGetStockGeneral";
import useGetStockDelDia from "../../../hooks/stock/useGetStockDelDia";
import { getUserData } from "../../../utils/Auth/decodedata";
import { decryptId, encryptId } from "../../../utils/CryptoParams";
import { getInitials, getUniqueColor } from "../IngresarStock/IngresarStock.utils";
import IngresarStockSheet from "./sheets/IngresarStockSheet";
import DescontarStockSheet from "./sheets/DescontarStockSheet";
import TrasladarStockSheet from "./sheets/TrasladarStockSheet";
import "./StockHub.css";

const LAST_SUCURSAL_KEY = "ultimaSucursalStock";
const LOW_STOCK_THRESHOLD = 5;

const StockHub = () => {
  const params = useParams();
  const navigate = useNavigate();
  const usuario = getUserData();
  const esAdmin = usuario.idRol === 1;

  const { sucursales, loadingSucursales } = useGetSucursales();

  // Resuelve la sucursal activa: por URL si viene, si no la última usada, si no la única disponible
  const idSucursalUrl = params.idSucursal ? decryptId(decodeURIComponent(params.idSucursal)) : null;
  const [idSucursalActiva, setIdSucursalActiva] = useState(
    idSucursalUrl || localStorage.getItem(LAST_SUCURSAL_KEY) || (!esAdmin ? usuario.idSucursal : null)
  );

  useEffect(() => {
    if (idSucursalActiva) localStorage.setItem(LAST_SUCURSAL_KEY, idSucursalActiva);
  }, [idSucursalActiva]);

  const sucursalesDisponibles = esAdmin
    ? sucursales
    : sucursales?.filter((s) => s.idSucursal === usuario.idSucursal);

  const sucursal = sucursalesDisponibles?.find(
    (item) => Number(item.idSucursal) === Number(idSucursalActiva)
  );

  // Id cifrado + codificado, en el mismo formato que useParams().idSucursal
  // tenía en las páginas originales (StockUnificado, IngresarStockGeneralPage).
  // idSucursalActiva es el id plano (lo usamos para comparar contra la lista
  // de sucursales y para localStorage); este es el que deben recibir los
  // hooks de datos y los servicios que se llaman desde los sheets.
  const idSucursalParam = useMemo(
    () => (idSucursalActiva ? encodeURIComponent(encryptId(String(idSucursalActiva))) : null),
    [idSucursalActiva]
  );

  const { stockGeneral, loadingStockGeneral } = useGetStockGeneral(idSucursalParam);
  const { stockDelDia, loadingStockDiario } = useGetStockDelDia(idSucursalParam);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [activeSheet, setActiveSheet] = useState(null); // null | 'ingresar' | 'descontar' | 'trasladar'
  const [refreshKey, setRefreshKey] = useState(0);

  const closeSheet = () => setActiveSheet(null);
  const handleStockUpdated = () => {
    // Los hooks de stock deberían exponer un refetch; si no, esta key fuerza
    // a que los componentes hijos vuelvan a pedir datos frescos al montar.
    setRefreshKey((k) => k + 1);
  };

  const combinedStock = useMemo(() => {
    const productosDia = Array.isArray(stockDelDia)
      ? stockDelDia.filter((i) => i?.idStockDiario !== 0).map((i) => ({ ...i, esStockDiario: true }))
      : [];
    const productosGenerales = Array.isArray(stockGeneral)
      ? stockGeneral
          .filter((g) => !productosDia.some((d) => d.idProducto === g.idProducto))
          .map((i) => ({ ...i, esStockDiario: false }))
      : [];
    return [...productosDia, ...productosGenerales];
  }, [stockGeneral, stockDelDia]);

  const categorias = useMemo(() => {
    const unicas = [...new Set(combinedStock.map((i) => i?.nombreCategoria).filter(Boolean))];
    return ["Todas", ...unicas];
  }, [combinedStock]);

  const filteredProducts = useMemo(() => {
    return combinedStock.filter((p) => {
      const matchesSearch = p?.nombreProducto?.toLowerCase()?.includes(searchTerm.toLowerCase());
      const matchesCategory = categoriaActiva === "Todas" || p?.nombreCategoria === categoriaActiva;
      return matchesSearch && matchesCategory;
    });
  }, [combinedStock, searchTerm, categoriaActiva]);

  const kpis = useMemo(() => {
    const totalUnidades = combinedStock.reduce((acc, p) => acc + (Number(p.cantidadExistente) || 0), 0);
    const bajoStock = combinedStock.filter((p) => Number(p.cantidadExistente) <= LOW_STOCK_THRESHOLD).length;
    return { totalProductos: combinedStock.length, totalUnidades, bajoStock };
  }, [combinedStock]);

  // --- Sin sucursal resuelta: pedirla (solo aplica a admins sin selección previa) ---
  if (!loadingSucursales && !idSucursalActiva) {
    return (
      <Container className="stockhub-picker">
        <h1 className="stockhub-picker-title">
          <FaBoxOpen className="me-2" /> Gestión de stock
        </h1>
        <p className="stockhub-picker-subtitle">Elige una sucursal para continuar</p>
        <div className="stockhub-picker-grid">
          {sucursalesDisponibles?.map((s) => (
            <button
              key={s.idSucursal}
              className="stockhub-picker-card"
              onClick={() => setIdSucursalActiva(s.idSucursal)}
            >
              <span className="stockhub-picker-name">{s.nombreSucursal}</span>
              <span className="stockhub-picker-location">
                {s.municipioSucursal}, {s.departamentoSucursal}
              </span>
            </button>
          ))}
        </div>
      </Container>
    );
  }

  if (loadingSucursales || loadingStockGeneral || loadingStockDiario) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <DotsMove />
      </Container>
    );
  }

  return (
    <Container className="stockhub-container">
      <header className="stockhub-header">
        <button className="stockhub-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          <BsArrowLeft size={20} />
        </button>

        <div className="stockhub-header-info">
          {esAdmin && sucursalesDisponibles?.length > 1 ? (
            <Dropdown>
              <Dropdown.Toggle as="button" className="stockhub-sucursal-switch">
                {sucursal?.nombreSucursal || "Selecciona sucursal"}
                <BsChevronDown size={14} className="ms-2" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {sucursalesDisponibles.map((s) => (
                  <Dropdown.Item
                    key={s.idSucursal}
                    active={Number(s.idSucursal) === Number(idSucursalActiva)}
                    onClick={() => setIdSucursalActiva(s.idSucursal)}
                  >
                    {s.nombreSucursal}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <h1 className="stockhub-title">{sucursal?.nombreSucursal}</h1>
          )}
          <p className="stockhub-subtitle">
            {sucursal?.municipioSucursal}, {sucursal?.departamentoSucursal}
          </p>
        </div>
      </header>

      <div className="stockhub-kpis">
        <div className="stockhub-kpi">
          <span className="stockhub-kpi-value">{kpis.totalProductos}</span>
          <span className="stockhub-kpi-label">Productos</span>
        </div>
        <div className="stockhub-kpi">
          <span className="stockhub-kpi-value">{kpis.totalUnidades}</span>
          <span className="stockhub-kpi-label">Unidades</span>
        </div>
        <div className={`stockhub-kpi ${kpis.bajoStock > 0 ? "stockhub-kpi--alert" : ""}`}>
          <span className="stockhub-kpi-value">{kpis.bajoStock}</span>
          <span className="stockhub-kpi-label">Bajo stock</span>
        </div>
      </div>

      <div className="stockhub-filters">
        <div className="stockhub-search">
          <FaSearch className="stockhub-search-icon" />
          <Form.Control
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="stockhub-search-input"
          />
          {searchTerm && (
            <button className="stockhub-search-clear" onClick={() => setSearchTerm("")} aria-label="Limpiar">
              <BsX size={18} />
            </button>
          )}
        </div>

        <Dropdown>
          <Dropdown.Toggle as="button" className="stockhub-cat-toggle">
            {categoriaActiva === "Todas" ? "Categoría" : categoriaActiva}
            <BsChevronDown size={12} className="ms-2" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {categorias.map((cat) => (
              <Dropdown.Item key={cat} active={categoriaActiva === cat} onClick={() => setCategoriaActiva(cat)}>
                {cat}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {filteredProducts.length === 0 ? (
        <Alert variant="info" className="stockhub-empty">
          <FaBoxOpen className="me-2" />
          No hay productos que coincidan con la búsqueda.
        </Alert>
      ) : (
        <ul className="stockhub-list">
          {filteredProducts.map((producto) => {
            const esFrances = producto.nombreProducto === "Frances";
            return (
              <li key={`${producto.idProducto}-${producto.esStockDiario ? "dia" : "gen"}`} className="stockhub-item">
                <div
                  className="stockhub-item-badge"
                  style={{ backgroundColor: getUniqueColor(producto.nombreProducto) }}
                >
                  {getInitials(producto.nombreProducto)}
                </div>
                <div className="stockhub-item-info">
                  <span className="stockhub-item-name">{producto.nombreProducto}</span>
                  <span className="stockhub-item-unit">{esFrances ? "Filas" : "Unidades"}</span>
                </div>
                <span
                  className={`stockhub-item-qty ${
                    Number(producto.cantidadExistente) <= LOW_STOCK_THRESHOLD ? "stockhub-item-qty--low" : ""
                  }`}
                >
                  {producto.cantidadExistente}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <FabSpeedDial
        actions={[
          {
            key: "ingresar",
            label: "Ingresar stock",
            colorClass: "fab--green",
            icon: <FaPlus size={16} />,
            onClick: () => setActiveSheet("ingresar"),
          },
          {
            key: "descontar",
            label: "Descontar stock",
            colorClass: "fab--amber",
            icon: <FaMinus size={16} />,
            onClick: () => setActiveSheet("descontar"),
          },
          {
            key: "trasladar",
            label: "Trasladar producto",
            colorClass: "fab--blue",
            icon: <FaExchangeAlt size={14} />,
            onClick: () => setActiveSheet("trasladar"),
          },
        ]}
      />

      <BottomSheet isOpen={activeSheet === "ingresar"} onClose={closeSheet} title="Ingresar stock">
        <IngresarStockSheet
          key={refreshKey}
          idSucursal={idSucursalParam}
          onSuccess={() => {
            handleStockUpdated();
            closeSheet();
          }}
        />
      </BottomSheet>

      <BottomSheet isOpen={activeSheet === "descontar"} onClose={closeSheet} title="Descontar stock">
        <DescontarStockSheet
          key={refreshKey}
          idSucursal={idSucursalParam}
          productos={combinedStock}
          onSuccess={() => {
            handleStockUpdated();
            closeSheet();
          }}
        />
      </BottomSheet>

      <BottomSheet isOpen={activeSheet === "trasladar"} onClose={closeSheet} title="Trasladar producto">
        <TrasladarStockSheet
          key={refreshKey}
          idSucursalOrigen={idSucursalParam}
          idSucursalOrigenRaw={idSucursalActiva}
          sucursales={sucursalesDisponibles}
          productos={combinedStock}
          onSuccess={() => {
            handleStockUpdated();
            closeSheet();
          }}
        />
      </BottomSheet>
    </Container>
  );
};

export default StockHub;