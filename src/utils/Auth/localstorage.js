export const setLocalStorage = (key, value) => {
    try {
      // Convierte el valor a string (localStorage solo almacena strings)
      const valueToStore = JSON.stringify(value);
      // Guarda el valor en el localStorage
      localStorage.setItem(key, valueToStore);
    } catch (error) {
        return null
    }
  };

  export const getLocalStorage = (key) => {
    try {
      // Obtiene el valor del localStorage
      const value = localStorage.getItem(key);
      // Convierte el valor de string a su tipo original (objeto, array, etc.)
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  };

  export const removeLocalStorage = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
        return null;
    }
  };