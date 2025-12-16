import React, { forwardRef, ChangeEvent } from "react";

export interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  value: string | number | "";
  onChange: (value: string | number | "") => void;
  options: Option[];
  className?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ value, onChange, options, className = "", name, placeholder, disabled = false }, ref) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "") {
      onChange("");
    } else {
      const numVal = Number(val);
      onChange(isNaN(numVal) ? val : numVal);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <select
        ref={ref}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-disabled={disabled}
        className={`
            appearance-none
            block w-full px-3 py-2 text-sm
            border border-gray-300 rounded-3xl
            bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 mr-1">
        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8l4 4 4-4" />
        </svg>
      </div>
    </div>
  );
});

Select.displayName = "Select";

export default Select;
