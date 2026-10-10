// Maneja el error de "chunk inexistente" que ocurre cuando se hace un deploy nuevo
// mientras el usuario tiene la pestaña abierta con la versión anterior.
// Recarga una sola vez y silencia el error (consola, BetterStack, etc.).
// Debe importarse PRIMERO en main.jsx para registrar sus listeners antes que los demás.

const RELOAD_KEY = "chunk-reload-at";
const RELOAD_WINDOW_MS = 60 * 1000; // máximo una recarga por minuto (evita bucles)

const CHUNK_ERROR_RE =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i;

let reloading = false;

const isChunkError = (value) =>
  CHUNK_ERROR_RE.test(String(value?.message ?? value ?? ""));

// Devuelve true si se inició la recarga (o ya estaba en curso).
function reloadOnce() {
  if (reloading) return true;

  let last = 0;
  try {
    last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
  } catch {
    // sessionStorage no disponible: seguimos sin protección anti-bucle
  }

  // Si ya se recargó hace poco y sigue fallando, es otro problema: no lo ocultamos.
  if (Date.now() - last <= RELOAD_WINDOW_MS) return false;

  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // ignorar
  }

  reloading = true;
  window.location.reload();
  return true;
}

// Error al precargar un chunk (evento propio de Vite)
window.addEventListener("vite:preloadError", (event) => {
  if (reloadOnce()) event.preventDefault();
});

// Promesa rechazada por el import() dinámico (React.lazy)
window.addEventListener("unhandledrejection", (event) => {
  if (!isChunkError(event.reason)) return;
  if (reloadOnce()) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

// Error global lanzado por React al fallar el lazy durante el render
window.addEventListener("error", (event) => {
  if (!isChunkError(event.error ?? event.message)) return;
  if (reloadOnce()) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});