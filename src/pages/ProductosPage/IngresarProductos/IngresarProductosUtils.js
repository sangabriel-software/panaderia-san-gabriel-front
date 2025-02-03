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