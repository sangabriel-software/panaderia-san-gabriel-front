// Función para calcular el stock mostrado (dividir por 6 si es Frances)
export const calcularStockMostrado = (producto) => {
    if (producto.nombreProducto === "Frances") {
        return producto.cantidadExistente / 6;
    }
    return producto.cantidadExistente;
};

// Función para convertir valor ingresado a unidades (especial para Frances)
export const convertirValorAUnidades = (valor) => {
    // Separar parte entera y decimal
    const partes = valor.toString().split('.');
    const filas = partes.length > 0 ? parseInt(partes[0]) : 0;
    const unidadesExtra = partes.length > 1 ? parseInt(partes[1].substring(0, 1)) : 0; // Solo primer decimal

    return (filas / 6) + unidadesExtra;
};
