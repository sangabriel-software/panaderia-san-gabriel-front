import { forwardRef, useEffect, useId, useRef, useState } from "react";

// Resalta en negrita la parte de la etiqueta que coincide con lo escrito
function HighlightedLabel({ label, term }) {
  const query = term.trim();
  if (!query) return label;

  const start = label.toLowerCase().indexOf(query.toLowerCase());
  if (start === -1) return label;

  const end = start + query.length;
  return (
    <>
      {label.slice(0, start)}
      <span className="font-semibold text-brand-600">{label.slice(start, end)}</span>
      {label.slice(end)}
    </>
  );
}

const SearchableSelect = forwardRef(function SearchableSelect(
  { options = [], placeholder = "Buscar...", onSelect },
  ref
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  // La ref que llega del padre apunta al input; internamente también la necesitamos
  const setRefs = (node) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mantiene visible la opción activa al navegar con el teclado
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const activeEl = listRef.current.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  const handleSelect = (option) => {
    setSearchTerm(option.label);
    onSelect?.(option);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    setActiveIndex(0);
    onSelect?.(null);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) return setIsOpen(true);
      setActiveIndex((i) => (filteredOptions.length ? (i + 1) % filteredOptions.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) return setIsOpen(true);
      setActiveIndex((i) =>
        filteredOptions.length ? (i - 1 + filteredOptions.length) % filteredOptions.length : 0
      );
    } else if (e.key === "Enter" && isOpen && filteredOptions[activeIndex]) {
      e.preventDefault();
      handleSelect(filteredOptions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div
      className="relative w-full"
      // Cierra solo cuando el foco sale de todo el componente (input, botón y lista)
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setIsOpen(false);
      }}
    >
      <div className="relative">
        {/* Icono de búsqueda */}
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="m14 14 3.5 3.5" />
        </svg>

        <input
          ref={setRefs}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && filteredOptions[activeIndex] ? `${listId}-${activeIndex}` : undefined
          }
          autoComplete="off"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setActiveIndex(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-muted shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
        />

        {/* Botón limpiar, o flecha cuando no hay texto */}
        {searchTerm ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Limpiar búsqueda"
            // Evita que el input pierda el foco al presionar el botón
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-line hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        ) : (
          <svg
            className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m5 8 5 5 5-5" />
          </svg>
        )}
      </div>

      {/* Lista de opciones */}
      {isOpen && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-xl shadow-black/10">
          {filteredOptions.length > 0 ? (
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              className="max-h-60 overflow-y-auto p-1.5"
            >
              {filteredOptions.map((option, index) => {
                const isActive = index === activeIndex;
                const isSelected = option.label === searchTerm;

                return (
                  <li
                    key={option.value}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    data-active={isActive}
                    // onMouseDown evita que el input pierda el foco antes de seleccionar
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(option);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive ? "bg-brand-50 text-ink" : "text-ink"
                    }`}
                  >
                    <span className="truncate">
                      <HighlightedLabel label={option.label} term={searchTerm} />
                    </span>
                    {isSelected && (
                      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m4 10.5 4 4 8-9" />
                      </svg>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-1 px-4 py-6 text-center">
              <svg className="h-6 w-6 text-muted" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="9" cy="9" r="6" />
                <path d="m14 14 3.5 3.5" />
              </svg>
              <p className="text-sm font-medium text-ink">Sin resultados</p>
              <p className="text-xs text-muted">Prueba con otra palabra</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default SearchableSelect;