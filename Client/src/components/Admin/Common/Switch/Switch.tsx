import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled = false, id, className }) => {
  return (
    <label htmlFor={id} className={`relative inline-flex items-center cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className ?? ""}`}>
      <input type="checkbox" id={id} checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <div className={`w-11 h-6 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-300"}`} />
      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transform transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </label>
  );
};

export default Switch;
