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

// Función para obtener las iniciales de un nombre
export const getInitials = (name) => {
  const words = name.split(" ");
  return words.map((word) => word[0]).join("").toUpperCase();
};

export const formatoQuetzalesSimple = (monto) => {
  if (isNaN(monto)) {
    throw new Error("El valor proporcionado no es un número válido");
  }
  
  const numero = Number(monto);
  const partes = numero.toFixed(2).split('.');
  
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `Q ${partes.join('.')}`;
}