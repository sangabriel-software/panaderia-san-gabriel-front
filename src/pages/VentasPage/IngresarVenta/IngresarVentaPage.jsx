import React, { useState } from "react";
import dayjs from "dayjs";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import SalesSummary from "../../../components/ventas/SalesSumamary/SalesSummary";
import Title from "../../../components/Title/Title";
import { BsArrowLeft, BsListUl, BsFileEarmarkSpreadsheet } from "react-icons/bs";
import { getUserData } from "../../../utils/Auth/decodedata";
import {
  filterProductsByName,
  handleGuardarVenta,
  handleGuardarVentaBatch,
  handleModificarDatos,
} from "./IngresarVenta.Utils";
import "./IngresarVentaPage.css";
import { useBuscarOrden } from "../../../hooks/ventas/useBuscarOrden";
import { useCategoriasActivas } from "../../../hooks/ventas/useCategoriasActivas";
import ModalSeleccionarSucursalTurno from "../../../components/ventas/ModalInicio/ModalSeleccionarSucursalTurno";
import CardResumenVenta from "../../../components/ventas/CardResumenVenta/CardResumenVenta";
import SeccionProductos from "../../../components/ventas/SeccionProductos/SeccionProductos";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import ModalVentaEsperada from "../../../components/ventas/ModalVentaEsperada/ModalVentaEsperada";
import ModalGastos from "../../../components/ventas/ModalGastos/ModalGastos";
import CargaArchivoVenta from "../../../components/ventas/CargarArchivoVenta/CargaArchivoVenta";

const IngresarVentaPage = () => {
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isPopupSuccessOpen, setIsPopupSuccessOpen] = useState(false);

  const usuario = getUserData();

  const [orden, setOrden] = useState([]);
  const [productos, setProductos] = useState([]);
  const [stockGeneral, setStockGeneral] = useState([]);
  const [stockDelDia, setStockDelDia] = useState([]);
  const [ordenYProductos, setOrdenYProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [hasOrdenes, setHasOrdenes] = useState(null);
  const [showVentaEsperadaModal, setShowVentaEsperadaModal] = useState(false);
  const [showGastosModal, setShowGastosModal] = useState(false);
  const [showSalesSummary, setShowSalesSummary] = useState(false);
  const [ventaTotal, setVentaTotal] = useState(0);
  const [ventaReal, setVentaReal] = useState(null);
  const [gastos, setGastos] = useState([]);

  // ============================================
  // NUEVO: MODO DE INGRESO (manual / csv)
  // ============================================
  const [modoIngreso, setModoIngreso] = useState("manual"); // "manual" | "csv"
  const [csvFile, setCsvFile] = useState(null);

  const navigate = useNavigate();

  // ============================================
  // REACT HOOK FORM
  // ============================================
  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      turno: "AM",
      sucursal: "",
    },
  });

  const turnoValue = watch("turno");
  const sucursalValue = watch("sucursal");

  const [trayQuantities, setTrayQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // ============================================
  // CUSTOM HOOK SUCURSALES
  // ============================================
  const { sucursales, loadingSucursales } = useGetSucursales();

  // ============================================
  // CUSTOM HOOK BUSCAR ORDEN
  // ============================================
  useBuscarOrden(
    turnoValue,
    sucursalValue,
    setIsLoading,
    setOrden,
    setProductos,
    setOrdenYProductos,
    setShowModal,
    setErrorPopupMessage,
    setIsPopupErrorOpen,
    setHasOrdenes,
    setStockGeneral,
    setStockDelDia
  );

  // ============================================
  // CUSTOM HOOK CATEGORIAS
  // ============================================
  const { activeCategory, setActiveCategory, categorias } =
    useCategoriasActivas(ordenYProductos);

  // ============================================
  // FILTRAR PRODUCTOS
  // ============================================
  const filteredProducts = filterProductsByName(ordenYProductos, searchTerm);

  const productsToShow = searchTerm
    ? filteredProducts
    : filteredProducts.filter((p) => p.nombreCategoria === activeCategory);

  // ============================================
  // MODIFICAR DATOS
  // ============================================
  const handleModificarDatosWrapper = () => {
    handleModificarDatos(setValue, setShowModal, setHasOrdenes);
    // al volver a seleccionar sucursal/turno, reseteamos el modo de ingreso
    setModoIngreso("manual");
    setCsvFile(null);
  };

  // ============================================
  // GUARDAR VENTA (MODO MANUAL)
  // ============================================
  const handleGuardarVentaWrapper = async () => {
    await handleGuardarVenta(
      setIsLoading,
      orden,
      sucursalValue,
      usuario,
      productos,
      trayQuantities,
      setShowSalesSummary,
      navigate,
      setErrorPopupMessage,
      setIsPopupErrorOpen,
      setIsPopupSuccessOpen,
      reset,
      setTrayQuantities,
      ventaReal,
      turnoValue,
      gastos
    );
  };

  // ============================================
  // GUARDAR VENTA (MODO CSV)
  // ============================================
  const handleGuardarVentaBatchWrapper = async (gastosRegistrados) => {
    await handleGuardarVentaBatch(
      setIsLoading,
      csvFile,
      orden,
      sucursalValue,
      usuario,
      turnoValue,
      ventaReal,
      gastosRegistrados,
      setShowVentaEsperadaModal,
      setShowGastosModal,
      setErrorPopupMessage,
      setIsPopupErrorOpen,
      setIsPopupSuccessOpen,
      reset,
      setCsvFile,
      setModoIngreso
    );
  };

  // ============================================
  // INICIAR CIERRE DE VENTA (valida CSV si aplica)
  // ============================================
  const handleIniciarCierreVenta = () => {
    if (modoIngreso === "csv" && !csvFile) {
      setErrorPopupMessage(
        "Debes cargar un archivo CSV antes de continuar con la venta."
      );
      setIsPopupErrorOpen(true);
      return;
    }
    setShowVentaEsperadaModal(true);
  };

  // ============================================
  // CONTINUAR VENTA ESPERADA
  // ============================================
  const handleContinuarVentaEsperada = (ventaRealIngresada) => {
    setVentaReal(ventaRealIngresada);
    setShowVentaEsperadaModal(false);
    setShowGastosModal(true);
  };

  // ============================================
  // CONTINUAR GASTOS
  // ============================================
  const handleContinuarConGastos = (gastosRegistrados) => {
    setGastos(gastosRegistrados);
    setShowGastosModal(false);

    if (modoIngreso === "csv") {
      // En modo CSV se omite el resumen y se guarda directo
      handleGuardarVentaBatchWrapper(gastosRegistrados);
    } else {
      setShowSalesSummary(true);
    }
  };

  return (
    <Container>
      {/* MODAL SELECCIONAR SUCURSAL Y TURNO */}
      <ModalSeleccionarSucursalTurno
        showModal={showModal}
        handleCloseModal={() => navigate("/ventas")}
        turnoValue={turnoValue}
        setValue={setValue}
        control={control}
        errors={errors}
        loadingSucursales={loadingSucursales}
        sucursales={sucursales}
        register={register}
        isLoading={isLoading}
        navigate={navigate}
        hasOrdenes={hasOrdenes}
        isAdmin={usuario.idRol === 1}
        usuarioSucursal={usuario}
      />

      {/* MODAL VENTA ESPERADA */}
      <ModalVentaEsperada
        show={showVentaEsperadaModal}
        handleClose={() => setShowVentaEsperadaModal(false)}
        onContinue={handleContinuarVentaEsperada}
        ventaTotal={ventaTotal}
      />

      {/* MODAL GASTOS */}
      <ModalGastos
        show={showGastosModal}
        handleClose={() => setShowGastosModal(false)}
        onContinue={handleContinuarConGastos}
      />

      {/* ENCABEZADO */}
      <div className="text-center mb-">
        <div className="d-flex align-items-center justify-content-center gap-5">
          <button
            className="btn btn-return rounded-circle shadow-sm"
            onClick={() => navigate("/ventas")}
          >
            <BsArrowLeft size={20} />
          </button>

          <Title title="Ingresar venta" className="gradient-text" icon="🍞" />
        </div>
      </div>

      {/* RESUMEN VENTA */}
      {!showModal && (
        <CardResumenVenta
          sucursales={sucursales}
          sucursalValue={sucursalValue}
          turnoValue={turnoValue}
          usuario={usuario}
          handleModificarDatosWrapper={handleModificarDatosWrapper}
          isLoading={isLoading}
          setShowSalesSummary={handleIniciarCierreVenta}
        />
      )}

      {/* ============================================ */}
      {/* SELECTOR DE MODO DE INGRESO */}
      {/* ============================================ */}
      {!showModal && (
        <div className="modo-ingreso-selector">
          <button
            type="button"
            className={`modo-ingreso-btn ${
              modoIngreso === "manual" ? "active" : ""
            }`}
            onClick={() => setModoIngreso("manual")}
          >
            <BsListUl size={18} />
            Ingreso manual
          </button>
          <button
            type="button"
            className={`modo-ingreso-btn ${
              modoIngreso === "csv" ? "active" : ""
            }`}
            onClick={() => setModoIngreso("csv")}
          >
            <BsFileEarmarkSpreadsheet size={18} />
            Cargar CSV
          </button>
        </div>
      )}

      {/* PRODUCTOS - MODO MANUAL */}
      {!showModal && modoIngreso === "manual" && (
        <SeccionProductos
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categorias={categorias}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          ordenYProductos={ordenYProductos}
          productsToShow={productsToShow}
          trayQuantities={trayQuantities}
          setTrayQuantities={setTrayQuantities}
          stockGeneral={stockGeneral}
          stockDelDia={stockDelDia}
        />
      )}

      {/* CARGA DE ARCHIVO - MODO CSV */}
      {!showModal && modoIngreso === "csv" && (
        <CargaArchivoVenta csvFile={csvFile} setCsvFile={setCsvFile} />
      )}

      {/* SALES SUMMARY (solo aplica a modo manual) */}
      <SalesSummary
        show={showSalesSummary}
        handleClose={() => setShowSalesSummary(false)}
        orderData={{
          sucursal: sucursalValue,
          turno: turnoValue,
          fechaAProducir: dayjs().format("YYYY-MM-DD"),
          nombrePanadero: usuario.usuario,
        }}
        trayQuantities={trayQuantities}
        productos={productos}
        sucursales={sucursales}
        isLoading={isLoading}
        onConfirm={handleGuardarVentaWrapper}
        ventaReal={ventaReal}
        gastos={gastos}
      />

      {/* POPUP EXITO */}
      <SuccessPopup
        isOpen={isPopupSuccessOpen}
        onClose={() => setIsPopupSuccessOpen(false)}
        title="¡Éxito!"
        message="La Venta se agregó correctamente"
        nombreBotonVolver="Ver Ventas"
        nombreBotonNuevo="Ingresar venta"
        onView={() => navigate("/ventas")}
        onNew={() => {
          setShowModal(true);
          setIsPopupSuccessOpen(false);
          reset();
          setGastos([]);
          setModoIngreso("manual");
          setCsvFile(null);
        }}
      />

      {/* POPUP ERROR */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />
    </Container>
  );
};

export default IngresarVentaPage;