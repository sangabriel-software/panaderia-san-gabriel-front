
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