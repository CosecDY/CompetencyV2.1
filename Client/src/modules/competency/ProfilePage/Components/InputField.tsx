import React from "react";

interface InputFieldProps {
  label: string;
  field: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: string;
  rows?: number;
  value: string;
  error?: string;
  onChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  field,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  icon,
  rows,
  value,
  error,
  onChange,
  className = ""
}) => {
  const isTextarea = type === "textarea";
  const Component = isTextarea ? "textarea" : "input";

  const getInputClasses = () => {
    if (disabled) {
      return "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed";
    }
    if (error) {
      return "border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-500 placeholder-red-300";
    }
    return "border-gray-300 bg-white hover:border-teal-300 focus:ring-teal-200 focus:border-teal-500 placeholder-gray-400";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-semibold text-gray-800">
        <div className="flex items-center space-x-2">
          {icon && <i className={`${icon}`}></i>}
          <span>{label}</span>
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      </label>
      
      <div className="relative group">
        <Component
          type={isTextarea ? undefined : type}
          rows={rows}
          value={value}
          onChange={onChange(field)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-opacity-20 group-hover:shadow-md ${getInputClasses()} ${isTextarea ? "resize-none min-h-[120px]" : ""}`}
          required={required}
        />
        
        {/* Focus indicator */}
        <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${
          !disabled && !error ? 'group-focus-within:bg-teal-50/50' : ''
        }`}></div>
      </div>
      
      {error && (
        <div className="flex items-start space-x-2 text-red-600 animate-fade-in">
          <i className="fas fa-exclamation-circle mt-0.5 text-sm"></i>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
      {disabled && (
        <div className="flex items-center space-x-2 text-gray-500">
          <i className="fas fa-info-circle text-sm"></i>
          <p className="text-sm">อีเมลไม่สามารถแก้ไขได้</p>
        </div>
      )}
    </div>
  );
};
