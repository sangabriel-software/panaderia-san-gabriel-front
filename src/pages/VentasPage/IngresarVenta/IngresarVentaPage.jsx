import React, { useState } from "react";
import dayjs from "dayjs";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import SalesSummary from "../../../components/ventas/SalesSumamary/SalesSummary";
import Title from "../../../components/Title/Title";
import { BsArrowLeft } from "react-icons/bs";
import { getUserData } from "../../../utils/Auth/decodedata";
import {
  filterProductsByName,
  handleGuardarVenta,
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

  const [showVentaEsperadaModal, setShowVentaEsperadaModal] =
    useState(false);

  const [showGastosModal, setShowGastosModal] = useState(false);

  const [showSalesSummary, setShowSalesSummary] = useState(false);

  const [ventaTotal, setVentaTotal] = useState(0);
  const [ventaReal, setVentaReal] = useState(null);
  const [gastos, setGastos] = useState([]);

  const navigate = useNavigate();

  // ============================================
  // REACT HOOK FORM
  // ============================================
  const {
    register,
    watch,
    setValue,
    control, // <- AGREGADO
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
  const {
    activeCategory,
    setActiveCategory,
    categorias,
  } = useCategoriasActivas(ordenYProductos);

  // ============================================
  // FILTRAR PRODUCTOS
  // ============================================
  const filteredProducts = filterProductsByName(
    ordenYProductos,
    searchTerm
  );

  const productsToShow = searchTerm
    ? filteredProducts
    : filteredProducts.filter(
        (p) => p.nombreCategoria === activeCategory
      );

  // ============================================
  // MODIFICAR DATOS
  // ============================================
  const handleModificarDatosWrapper = () => {
    handleModificarDatos(
      setValue,
      setShowModal,
      setHasOrdenes
    );
  };

  // ============================================
  // GUARDAR VENTA
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
  // CONTINUAR VENTA ESPERADA
  // ============================================
  const handleContinuarVentaEsperada = (ventaReal) => {
    setVentaReal(ventaReal);
    setShowVentaEsperadaModal(false);
    setShowGastosModal(true);
  };

  // ============================================
  // CONTINUAR GASTOS
  // ============================================
  const handleContinuarConGastos = (gastosRegistrados) => {
    setGastos(gastosRegistrados);
    setShowGastosModal(false);
    setShowSalesSummary(true);
  };

  return (
    <Container>
      {/* ============================================ */}
      {/* MODAL SELECCIONAR SUCURSAL Y TURNO */}
      {/* ============================================ */}
      <ModalSeleccionarSucursalTurno
        showModal={showModal}
        handleCloseModal={() => navigate("/ventas")}
        turnoValue={turnoValue}
        setValue={setValue}
        control={control} // <- AGREGADO
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

      {/* ============================================ */}
      {/* MODAL VENTA ESPERADA */}
      {/* ============================================ */}
      <ModalVentaEsperada
        show={showVentaEsperadaModal}
        handleClose={() =>
          setShowVentaEsperadaModal(false)
        }
        onContinue={handleContinuarVentaEsperada}
        ventaTotal={ventaTotal}
      />

      {/* ============================================ */}
      {/* MODAL GASTOS */}
      {/* ============================================ */}
      <ModalGastos
        show={showGastosModal}
        handleClose={() => setShowGastosModal(false)}
        onContinue={handleContinuarConGastos}
      />

      {/* ============================================ */}
      {/* ENCABEZADO */}
      {/* ============================================ */}
      <div className="text-center mb-">
        <div className="d-flex align-items-center justify-content-center gap-5">
          <button
            className="btn btn-return rounded-circle shadow-sm"
            onClick={() => navigate("/ventas")}
          >
            <BsArrowLeft size={20} />
          </button>

          <Title
            title="Ingresar venta"
            className="gradient-text"
            icon="🍞"
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* RESUMEN VENTA */}
      {/* ============================================ */}
      {!showModal && (
        <CardResumenVenta
          sucursales={sucursales}
          sucursalValue={sucursalValue}
          turnoValue={turnoValue}
          usuario={usuario}
          handleModificarDatosWrapper={
            handleModificarDatosWrapper
          }
          isLoading={isLoading}
          setShowSalesSummary={() =>
            setShowVentaEsperadaModal(true)
          }
        />
      )}

      {/* ============================================ */}
      {/* PRODUCTOS */}
      {/* ============================================ */}
      {!showModal && (
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

      {/* ============================================ */}
      {/* SALES SUMMARY */}
      {/* ============================================ */}
      <SalesSummary
        show={showSalesSummary}
        handleClose={() =>
          setShowSalesSummary(false)
        }
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

      {/* ============================================ */}
      {/* POPUP EXITO */}
      {/* ============================================ */}
      <SuccessPopup
        isOpen={isPopupSuccessOpen}
        onClose={() =>
          setIsPopupSuccessOpen(false)
        }
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
        }}
      />

      {/* ============================================ */}
      {/* POPUP ERROR */}
      {/* ============================================ */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() =>
          setIsPopupErrorOpen(false)
        }
        title="¡Error!"
        message={errorPopupMessage}
      />
    </Container>
  );
};

export default IngresarVentaPage;