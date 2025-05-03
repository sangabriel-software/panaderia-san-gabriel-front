
export const obtenerUnidadesFrances = (cantidadIngresada) => {
    // Convertir a string por si viene como número
    const valorStr = cantidadIngresada.toString();
    
    // Separar parte entera y decimal
    const partes = valorStr.split('.');
    
    const filaFrances = partes[0] ? parseInt(partes[0], 10) : 0;
    const unidadFrances = partes[1] ? parseInt(partes[1], 10) : 0;
  
    const francesUnidad = filaFrances * 6;
  
    const totalUnidadesFrances = francesUnidad + unidadFrances;
    
    return totalUnidadesFrances;
  };