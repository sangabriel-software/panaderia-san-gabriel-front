  // Función para capitalizar la primera letra
  export const capitalizeFirstLetter = (text) => {
    if (!text || typeof text !== "string") return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  export const redondearASiguienteMultiploDe5 = (numero) => {
    const num = parseFloat(numero) || 0;
    if (num <= 5) return 5; // Si es menor o igual a 5, devolver 5
    
    // Para números mayores a 5, redondear al siguiente múltiplo de 5
    return Math.ceil(num / 5) * 5;
  };