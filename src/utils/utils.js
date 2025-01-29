  // Función para capitalizar la primera letra
  export const capitalizeFirstLetter = (text) => {
    if (!text || typeof text !== "string") return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };