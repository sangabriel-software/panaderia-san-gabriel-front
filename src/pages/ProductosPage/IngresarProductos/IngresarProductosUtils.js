import { desactivarProductosService, ingresarPrecioProducto, ingresarProducto, ingresarProductoImagen } from "../../../services/productos/productos.service"
import { compressImage } from "../../../utils/CompressImage/CompressImage"
import { currentDate } from "../../../utils/dateUtils"

/* Funcion para crear paylod datos de productos */
export const crearPayloadProducto = (data) => {
    const productoPayload = {
        nombreProducto: data.nombreProducto,
        idCategoria: data.idCategoria ,
        fechaCreacion: currentDate(),
    }

    return productoPayload
} 

/* Funcion para crar payload de ingreso de precio de productos */
export const crearPayloadPrecioProducto = (data, idProducto) => {
    const precioProductoPayload = {
        idProducto,
        cantidad: data.cantidad,
        precio: data.precio,
        precioPorUnidad: data.precio / data.cantidad,
        fechaInicio: currentDate(),
        fechaFin: data.fechaFin || null
    }

    return precioProductoPayload;

}

/* Funcion para crear paylod para ingreso de imagen */
export const crearPayloadProductoImagen = (idProducto, imagen) => {
    const imagenProductoPayload = {
        idProducto: idProducto,
        imagenB64: imagen,
        fechaCreacion: currentDate()
    }

    return imagenProductoPayload;

}

/* Elminacion de productos*/
export const handleDeleleProducto = (idProducto, setProductoToDelete, setIsPopupOpen) => {
    setProductoToDelete(idProducto);
    setIsPopupOpen(true);
  }


  /* funcion para ejcutar la logica de eliminacion de producto */
export const handleConfirmDeletePreoducto = async (productoToDelete, setProducto, setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen ) => {
  try{

      if (productoToDelete) {
        const resDelete = await desactivarProductosService(productoToDelete);

        if (resDelete.status === 200) {
            setProducto((prevProductos) => prevProductos.filter(producto => producto.idProducto !== productoToDelete));
          setIsPopupOpen(false); 
        }
      }else{

      }
    }catch(error){
      if(error.status === 409 && error.data.error.code === 402){
        setIsPopupOpen(false); 
        setErrorPopupMessage(`Para elminar el rol debe elminar los usuarios al que esta relacionado`);
        setIsPopupErrorOpen(true);
      }

    }
  };


// Función para resetear el formulario
export const resetForm = (reset, setSelectedImage, setImagePreview, setIsResetImageInput) => {
  reset(); // Limpia los campos del formulario
  setSelectedImage(null); // Resetea la imagen seleccionada
  setImagePreview(null); // Resetea la vista previa de la imagen
  setIsResetImageInput(true);
};

/* Funcion para ingreso de productos */
export const handleIngresarProductoSubmit = async (data, setSelectedImage, selectedImage, setImagePreview, setIsResetImageInput,  setIsPopupOpen, setErrorPopupMessage, setIsPopupErrorOpen, setIsLoading, reset) => {
  setIsLoading(true); // Activar el loading del input
    try {
      let resIngresoProducto;
      let imageBase64 = null;

      // Comprime la imagen si está seleccionada
      if (selectedImage) {
        imageBase64 = await compressImage(selectedImage, 20);
      }

      // Crea el payload del producto y lo envía
      const payloadProducto = crearPayloadProducto(data);
      resIngresoProducto = await ingresarProducto(payloadProducto);

      if (resIngresoProducto.status === 201) {
        // Crea el payload del precio y lo envía
        const payloadPrecio = crearPayloadPrecioProducto(data, resIngresoProducto.idProducto);
        const resIngresoPrecio = await ingresarPrecioProducto(payloadPrecio);

        // Si hay imagen, la envía
        if (resIngresoPrecio.status === 201 && selectedImage) {
          const payloadImagen = crearPayloadProductoImagen(resIngresoProducto.idProducto, imageBase64);
          await ingresarProductoImagen(payloadImagen);
        }

        // Muestra el popup de éxito y limpia el formulario
        setIsPopupOpen(true);
        resetForm(reset, setSelectedImage, setImagePreview, setIsResetImageInput);
      }
    } catch (error) {
      if (error.status === 409) {
        setErrorPopupMessage("Ya existe un producto con el nombre ingresado.");
        setIsPopupErrorOpen(true);
      } else {
        setErrorPopupMessage("Hubo un error al ingresar el producto. Inténtelo de nuevo.");
        setIsPopupErrorOpen(true);
      }
    } finally {
      setIsLoading(false); // Desactivar el loading del input
    }
};
