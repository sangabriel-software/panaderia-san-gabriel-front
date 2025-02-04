import { desactivarProductosService } from "../../../services/productos/productos.service"
import { currentDate } from "../../../utils/dateUtils"


export const crearPayloadProducto = (data) => {
    const productoPayload = {
        nombreProducto: data.nombreProducto,
        idCategoria: data.idCategoria ,
        fechaCreacion: currentDate(),
    }

    return productoPayload
} 

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

// IngresarProductosUtils.js

// Función para resetear el formulario
export const resetForm = (reset, setSelectedImage, setImagePreview, setIsResetImageInput) => {
  reset(); // Limpia los campos del formulario
  setSelectedImage(null); // Resetea la imagen seleccionada
  setImagePreview(null); // Resetea la vista previa de la imagen
  setIsResetImageInput(true);
};