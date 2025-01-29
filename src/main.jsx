import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true, // Habilita el uso de React.startTransition para actualizaciones.
        v7_relativeSplatPath: true, // Cambia la resolución de rutas relativas en rutas splat (*).
      }}
    >
      <App />
    </BrowserRouter>
  </StrictMode>
);
