export const setLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
        return null
    }
  };

  export const getLocalStorage = (key) => {
    try {
      // Obtiene el valor del localStorage
      const value = localStorage.getItem(key);
      return value;
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