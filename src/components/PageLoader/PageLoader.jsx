import sgMark from "../../assets/sg-mark.svg";

// IMPORTANTE: este componente debe verse IDÉNTICO al splash estático de index.html
// (clases .app-loading). Si cambias tamaños, separación o colores aquí, cámbialos allá también.
function PageLoader() {
  return (
    // min-h-[100dvh] (y no min-h-screen) para que el centrado coincida con el splash fijo del index en móvil
    <div className="flex min-h-[100dvh] items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        {/* rounded-[17px] = radio del squircle del SVG a 64px (antes: rounded-2xl = 14px) */}
        <img
          src={sgMark}
          alt="Panadería San Gabriel"
          width={64}
          height={64}
          className="h-16 w-16 animate-brand-glow rounded-[17px]"
        />
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
        </div>
      </div>
    </div>
  );
}

export default PageLoader;