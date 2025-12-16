import React, { InputHTMLAttributes, FC, ReactNode } from "react";
import classNames from "classnames";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  leftIcon?: ReactNode; // ✅ เพิ่มเพื่อรองรับไอคอนแว่นขยาย
  error?: boolean; // ✅ เพิ่มเผื่อกรณี validation error (กรอบแดง)
}

export const Input: FC<InputProps> = ({ className = "", disabled, leftIcon, error, ...rest }) => {
  const baseClass = "block w-full rounded-lg border bg-white text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2";
  const stateClass = error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-primary focus:ring-primary/20"; // 🎨 ใช้สี primary ตรงนี้

  const disabledClass = disabled ? "opacity-60 cursor-not-allowed bg-gray-100 text-gray-500" : "";

  // 3. Padding Styles: ถ้ามี icon ซ้าย ต้องขยับ text หนี
  const paddingClass = leftIcon ? "pl-10 pr-3 py-2" : "px-3 py-2";

  return (
    <div className="relative">
      {/* ส่วนแสดง Icon */}
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <span className="text-lg">{leftIcon}</span>
        </div>
      )}

      <input className={classNames(baseClass, stateClass, disabledClass, paddingClass, className)} disabled={disabled} {...rest} />
    </div>
  );
};

export default Input;
