import React, { useState, useEffect, useRef } from "react";
import "./CustomSelect.styles.css";

const CustomSelect = ({ options, placeholder = "Selecciona una opción", value, onChange, hasError }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selected = value ? options.find((o) => String(o.value) === String(value)) : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="cs-wrapper" ref={wrapperRef}>
      <div
        className={`cs-trigger ${open ? "open" : ""} ${hasError ? "error" : ""}`}
        onClick={() => setOpen((p) => !p)}
      >
        <span className={`cs-trigger-text ${!selected ? "placeholder" : ""}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`cs-chevron ${open ? "rotated" : ""}`}
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {open && (
        <div className="cs-dropdown">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`cs-option ${String(opt.value) === String(value) ? "selected" : ""}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <span>{opt.label}</span>
              {String(opt.value) === String(value) && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;