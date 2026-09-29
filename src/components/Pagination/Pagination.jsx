import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const maxVisible = 5; // el propio contenedor con overflow-x-auto resuelve el caso móvil
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const pageBtn = (active) =>
    `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-0 text-sm font-medium transition-colors ${
      active ? "bg-brand-600 text-white shadow-brand" : "bg-transparent text-muted hover:bg-surface-2 hover:text-ink"
    }`;

  return (
    <div className="flex items-center justify-center gap-1 overflow-x-auto py-1">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiChevronLeft size={16} />
      </button>

      {start > 1 && (
        <>
          <button type="button" onClick={() => onPageChange(1)} className={pageBtn(false)}>
            1
          </button>
          {start > 2 && <span className="px-1 text-muted">···</span>}
        </>
      )}

      {pages.map((p) => (
        <button key={p} type="button" onClick={() => onPageChange(p)} className={pageBtn(p === currentPage)}>
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-muted">···</span>}
          <button type="button" onClick={() => onPageChange(totalPages)} className={pageBtn(false)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}

export default Pagination;