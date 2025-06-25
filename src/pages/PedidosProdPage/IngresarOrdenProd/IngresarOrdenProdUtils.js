import dayjs from "dayjs";
import { consultarDetallenOrdenProduccion, ingresarOrdenProduccionService } from "../../../services/ordenesproduccion/ordenesProduccion.service";
import React, { useEffect } from "react";
import { generateAndDownloadPDF } from "../../../utils/PdfUtils/PdfUtils";
import { consultarDetalleConsumoProduccion } from "../../../services/consumoingredientes/consumoingredientesprod.service";
import OrderDetailsPdf from "../../../components/PDFs/OrdenDetails/OrderDetailsPdf";
import { getUserData } from "../../../utils/Auth/decodedata";
import { getCurrentDateTimeWithSeconds } from "../../../utils/dateUtils";

export const getInitials = (name) => {
  const names = name.split(" ");
  const initials = names.map((n) => n[0]).join("");
  return initials.toUpperCase();
};

// Function to get a unique color for each product
export const getUniqueColor = (text) => {
const assignedColors = {}; // Almacena los colores asignados de manera persistente

    if (assignedColors[text]) {
        return assignedColors[text]; // Retorna el color si ya está asignado
    }
    // Generar un hash basado en el texto
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Convertir el hash en un color hexadecimal
    const color = `#${((hash & 0xFFFFFF) >>> 0).toString(16).padStart(6, '0')}`;
    assignedColors[text] = color;
    return color;
};

// filterLogic.js

export const filterProductsByName = (products, searchTerm, usuario) => {
  if (!searchTerm) return products;

  // Si el usuario no es admin, excluir los productos de "Panaderia"
  const filteredProducts = usuario.idRol === 1 && usuario.rol === "Admin"
    ? products
    : products.filter((p) => p.nombreCategoria !== "Panaderia");

  return filteredProducts.filter((producto) =>
    producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const getFilteredProductsByCategory = (productos, searchTerm) => {
  // Filtrar solo productos de panadería (idCategoria = 1)
  const panaderiaProducts = productos.filter((p) => p.idCategoria === 1 || p.idCategoria === 2);

  // Si hay término de búsqueda, filtrar por nombre dentro de los productos de panadería
  if (searchTerm) {
    const searchTermLower = searchTerm.toLowerCase();
    return panaderiaProducts.filter((p) => 
      p.nombreProducto.toLowerCase().includes(searchTermLower)
    );
  }

  // Si no hay término de búsqueda, devolver todos los productos de panadería
  return panaderiaProducts;
};

const crearPyaloadOrdenProduccion = (data, trayQuantities) => {
  const {idUsuario} = getUserData();
  const detalleOrden = Object.entries(trayQuantities)
    .filter(([_, { cantidad }]) => cantidad > 0) // Filtra por cantidad > 0
    .map(([idProducto, { cantidad, idCategoria, tipoProduccion, controlarStock, controlarStockDiario }]) => ({
      idProducto: Number(idProducto),
      idCategoria: idCategoria,
      cantidadBandejas: tipoProduccion === "bandejas" ? cantidad : 0,
      cantidadHarina: tipoProduccion !== "bandejas" ? cantidad : 0,
      tipoProduccion: tipoProduccion,
      controlarStock: controlarStock,
      controlarStockDiario: controlarStockDiario,
      fechaCreacion: dayjs().format("YYYY-MM-DD"),
    }));

  if (detalleOrden.length === 0) {
    return null;
  }

  return {
    encabezadoOrden: {
      idSucursal: Number(data.sucursal),
      ordenTurno: data.turno,
      nombrePanadero: data.nombrePanadero,
      fechaAProducir: dayjs(data.fechaAProducir).format("YYYY-MM-DD"),
      idUsuario: idUsuario, // Se asume que el usuario está logueado
      fechaCreacion: dayjs().format("YYYY-MM-DD"),
      fechaActualizacion: getCurrentDateTimeWithSeconds(),
    },
    detalleOrden,
  };
};


export const descargarPdfDuranteIngresoOrden = async (idOrdenProduccion) => {
  try {
    const order = await consultarDetallenOrdenProduccion(idOrdenProduccion);
    const detalleConsumo = await consultarDetalleConsumoProduccion(idOrdenProduccion);
    const { encabezadoOrden, detalleOrden } = order.detalleOrden;

    const documento = React.createElement(OrderDetailsPdf, {
      detalleOrden: detalleOrden,
      encabezadoOrden: encabezadoOrden || {},
      detalleConsumo: detalleConsumo.IngredientesConsumidos,
    });
    const fileName = `orden_produccion_${encabezadoOrden.idOrdenProduccion}.pdf`;
    generateAndDownloadPDF(documento, fileName);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
  }
};

/* Funcion para ingreso de productos */
export const handleIngresarOrdenProduccionSubmit = async ( data, trayQuantities, setTrayQuantities, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen, setIsLoading, reset ) => {
  setIsLoading(true); // Activar el loading del input
  try {
    if (trayQuantities.length === 0 || Object.keys(trayQuantities).length === 0){
      setErrorPopupMessage(
        "Ingresar la cantidad de productos para al menos un producto."
      );
      return;
    }

    setErrorPopupMessage("");
    const payload = crearPyaloadOrdenProduccion(data, trayQuantities);
    const resIngresoOrden = await ingresarOrdenProduccionService(payload);
    if (resIngresoOrden.status === 200) {
      reset();
      setTrayQuantities([])
      setIsPopupOpen(true);
      descargarPdfDuranteIngresoOrden(resIngresoOrden.idOrdenProduccion.idOrdenGenerada);
    }
  } catch (error) {
    if(error.status === 409){
    setErrorPopupMessage(error.response.data.error.message);
    }else{
    setErrorPopupMessage("Hubo un error al ingresar la orden. Inténtelo mas tarde.");
    }
    setIsPopupErrorOpen(true);
  } finally {
    setIsLoading(false); // Desactivar el loading del input
  }
};

export const scrollToAlert = (errorPopupMessage, isPopupErrorOpen, alertRef) => {
  useEffect(() => {
    if (errorPopupMessage && !isPopupErrorOpen && alertRef.current) {
      alertRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [errorPopupMessage, isPopupErrorOpen]);
};

// Obtener el nombre de la sucursal del usuario
export const getUserSucursalName = (sucursales, userData) => {
  if (!userData.idSucursal) return "Sin sucursal asignada";
  const sucursal = sucursales.find(s => s.idSucursal === userData.idSucursal);
  return sucursal ? sucursal.nombreSucursal : "Sucursal no encontrada";
};