import React, { useState, useEffect, useRef } from "react";
import { FiLoader } from "react-icons/fi";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  onSelect?: (value: string) => void;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ value, onChange, options, placeholder = "", disabled = false, isLoading = false, className = "", onSelect }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    onSelect?.(val);
    setShowDropdown(false);
  };

  const shouldShowDropdown = showDropdown && options.length > 0 && !(options.length === 1 && options[0] === value);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        className={`w-full rounded-lg border px-3 py-2 transition-all duration-200
          bg-admin-surface border-admin-border text-admin-text 
          placeholder:text-admin-muted/70
          focus:outline-none focus:ring-2 focus:ring-admin-primary/20 focus:border-admin-primary 
          disabled:bg-admin-bg disabled:text-admin-muted disabled:cursor-not-allowed
          ${className}`}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        disabled={disabled}
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-primary animate-spin">
          <FiLoader size={18} />
        </div>
      )}

      {shouldShowDropdown && (
        <ul
          className="absolute z-[9999] w-full max-h-60 overflow-y-auto mt-1 rounded-lg border shadow-xl
          bg-white border-admin-border"
        >
          {options.map((opt, idx) => (
            <li
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt);
              }}
              className="px-3 py-2 text-sm cursor-pointer transition-colors duration-150
                text-admin-text 
                hover:bg-admin-light hover:text-admin-primary
                border-b border-admin-border/50 last:border-0"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
