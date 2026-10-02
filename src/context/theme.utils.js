// src/utils/theme.utils.js

export const THEME_KEY = "theme";

export const THEMES = {
  DARK: "dark",
  LIGHT: "light",
};

// Mismos valores que --color-bg en index.css (se usan para la barra de estado / título)
export const THEME_COLORS = {
  [THEMES.DARK]: "#020617",
  [THEMES.LIGHT]: "#ffffff",
};

// Por defecto: dark (igual que el script de index.html)
export const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
  } catch (error) {
    return THEMES.DARK;
  }
};

export const saveTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    // Sin acceso a localStorage (modo privado, etc.): el tema solo vive en memoria
  }
};

// Aplica el tema al <html>: es lo que Tailwind (darkMode: 'class') y index.css leen
export const applyTheme = (theme) => {
  const isDark = theme === THEMES.DARK;

  document.documentElement.classList.toggle("dark", isDark);

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute("content", THEME_COLORS[theme]);
};