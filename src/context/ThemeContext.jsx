import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  THEME_KEY,
  THEMES,
  getStoredTheme,
  saveTheme,
  applyTheme,
} from "./theme.utils";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // El estado es la fuente de verdad. localStorage solo es la persistencia.
  const [theme, setTheme] = useState(getStoredTheme);

  // Cada vez que cambia el estado: se aplica la clase en <html> y se guarda.
  // Por eso el cambio es inmediato y no hace falta recargar.
  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  // Sincroniza entre pestañas/ventanas (el evento "storage" solo se dispara en las OTRAS pestañas)
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === THEME_KEY || event.key === null) {
        setTheme(getStoredTheme());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === THEMES.DARK,
      setTheme,
      toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }
  return context;
}