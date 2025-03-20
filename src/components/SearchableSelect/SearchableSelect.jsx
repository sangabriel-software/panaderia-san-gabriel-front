import React, { useState } from "react";
import "./SearchableSelect.css"

const SearchableSelect = ({ options, placeholder, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar si el dropdown está abierto

  // Filtrar opciones basadas en el término de búsqueda
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar la selección de una opción
  const handleSelect = (option) => {
    setSearchTerm(option.label); // Establecer el valor seleccionado en el input
    onSelect(option); // Pasar la opción seleccionada al componente padre
    setIsOpen(false); // Cerrar el dropdown
  };

  // Limpiar el input y la selección
  const handleClear = () => {
    setSearchTerm(""); // Limpiar el término de búsqueda
    onSelect(null); // Notificar al componente padre que no hay selección
  };

  return (
    <div className="searchable-select-container">
      {/* Contenedor del input y el botón de limpieza */}
      <div className="input-with-clear">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true); // Abrir el dropdown al escribir
          }}
          onFocus={() => setIsOpen(true)} // Abrir el dropdown al hacer clic
          onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Cerrar el dropdown al perder el foco
          className="form-control custom-input"
        />
        {/* Botón de limpieza (x) */}
        {searchTerm && (
          <button className="clear-button" onClick={handleClear}>
            ×
          </button>
        )}
      </div>

      {/* Lista de opciones (dropdown) */}
      {isOpen && (
        <div className="searchable-select-dropdown">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className="searchable-select-option"
                onMouseDown={() => handleSelect(option)} // Usar onMouseDown para evitar que el input pierda el foco
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="searchable-select-option no-results">
              No hay resultados
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;