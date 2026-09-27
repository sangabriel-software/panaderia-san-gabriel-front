import sgMark from "../../assets/sg-mark.svg";

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <img
          src={sgMark}
          alt="Panadería San Gabriel"
          className="h-16 w-16 animate-brand-glow rounded-2xl"
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