import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { Container} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import SalesSummary from "../../../components/ventas/SalesSumamary/SalesSummary";
import Title from "../../../components/Title/Title";
import { BsArrowLeft } from "react-icons/bs";
import { getUserData } from "../../../utils/Auth/decodedata";
import { filterProductsByName, handleGuardarVenta, handleModificarDatos } from "./IngresarVenta.Utils";
import "./IngresarVentaPage.css";
import { useBuscarOrden } from "../../../hooks/ventas/useBuscarOrden";
import { useCategoriasActivas } from "../../../hooks/ventas/useCategoriasActivas";
import ModalSeleccionarSucursalTurno from "../../../components/ventas/ModalInicio/ModalSeleccionarSucursalTurno";
import CardResumenVenta from "../../../components/ventas/CardResumenVenta/CardResumenVenta";
import SeccionProductos from "../../../components/ventas/SeccionProductos/SeccionProductos";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import DotsMove from "../../../components/Spinners/DotsMove";

const IngresarVentaPage = () => {
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isPopupSuccessOpen, setIsPopupSuccessOpen] = useState(false);
  const usuario = getUserData();
  const [orden, setOrden] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ordenYProductos, setOrdenYProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const navigate = useNavigate();

  const { register, watch, setValue, formState: { errors }, reset} = useForm({ defaultValues: { turno: "AM", sucursal: "" } });
  const turnoValue = watch("turno");
  const sucursalValue = watch("sucursal");
  const [trayQuantities, setTrayQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showSalesSummary, setShowSalesSummary] = useState(false);

  //Custom Hook para consultar las sucursales
  const { sucursales, loadingSucursales } = useGetSucursales();

  // Custom hook para manejar la búsqueda de ventas
  useBuscarOrden( turnoValue, sucursalValue, setIsLoading, setOrden, setProductos, setOrdenYProductos, setShowModal, setErrorPopupMessage, setIsPopupErrorOpen );

  // custom hook para manejar categorías
  const { activeCategory, setActiveCategory, categorias } = useCategoriasActivas(ordenYProductos);

  //Filtrar productos por nombre
  const filteredProducts = filterProductsByName(ordenYProductos, searchTerm);
  const productsToShow = searchTerm ? filteredProducts : filteredProducts.filter((p) => p.nombreCategoria === activeCategory); 

  //Modifcar datos ingreasdos
  const handleModificarDatosWrapper = () => {
    handleModificarDatos(setValue, setShowModal);
  };

  //Guardar Venta
  const handleGuardarVentaWrapper = async () => {
    await handleGuardarVenta(setIsLoading, orden, sucursalValue, usuario, productos, trayQuantities, setShowSalesSummary,
                             navigate, setErrorPopupMessage, setIsPopupErrorOpen, setIsPopupSuccessOpen, reset, setTrayQuantities);
  };


  return (
    <Container>
      {/* Modal para ingreso de datos para la consulta de ordenes */}
      <ModalSeleccionarSucursalTurno
        showModal={showModal}
        handleCloseModal={() => navigate("/ventas")}
        turnoValue={turnoValue}
        setValue={setValue}
        errors={errors}
        loadingSucursales={loadingSucursales}
        sucursales={sucursales}
        register={register}
        isLoading={isLoading}
        navigate={navigate}
      />

      {/* Encabezado */}
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

      {!showModal && (
        // Encabezado de la venta
        <CardResumenVenta
          sucursales={sucursales}
          sucursalValue={sucursalValue}
          turnoValue={turnoValue}
          usuario={usuario}
          handleModificarDatosWrapper={handleModificarDatosWrapper}
          isLoading={isLoading}
          setShowSalesSummary={setShowSalesSummary}
        />
      )}

      {/* Sección de Productos */}
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
        />
      )}

      {/* Modal de SalesSummary */}
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
        onConfirm={handleGuardarVentaWrapper} // Lógica de guardado aquí
        paymentData={{
          montoTotal: 0, // Aquí puedes calcular el monto total
          metodoPago: "Efectivo", // Método de pago por defecto
          estadoPago: "Pendiente", // Estado de pago por defecto
        }}
      />

      {/* Popup de Éxito */}
      <SuccessPopup
        isOpen={isPopupSuccessOpen}
        onClose={() => setIsPopupSuccessOpen(false)}
        title="¡Éxito!"
        message="La Venta se agrego correctamente"
        nombreBotonVolver="Ver Ventas"
        nombreBotonNuevo="Ingresar venta"
        onView={() => navigate("/ventas")}
        onNew={() => {
          setShowModal(true);
          setIsPopupSuccessOpen(false);
          reset();
        }}
      />

      {/* Popup errores */}
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