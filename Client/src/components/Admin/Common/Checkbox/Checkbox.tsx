import React from "react";
import classNames from "classnames";
import { FiCheck } from "react-icons/fi";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onCheckedChange, disabled = false, label, className, ...props }) => {
  return (
    <label className={classNames("inline-flex items-center gap-2 select-none", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer", className)}>
      <div className="relative flex items-center justify-center">
        <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onCheckedChange(e.target.checked)} {...props} />

        <div
          className={classNames(
            "h-5 w-5 rounded border transition-all duration-200 ease-in-out",
            "bg-admin-surface border-admin-border",
            checked ? "bg-admin-primary border-admin-primary text" : "hover:bg-admin-light",
            "peer-focus:ring-2 peer-focus:ring-admin-primary/20 peer-focus:ring-offset-1"
          )}
        ></div>

        <FiCheck size={24} className={classNames("absolute text-green-500 transition-transform duration-200 pointer-events-none", checked ? "scale-100" : "scale-0")} />
      </div>

      {/* Label Text */}
      {label && <span className="text-sm text-admin-text">{label}</span>}
    </label>
  );
};

export default Checkbox;
