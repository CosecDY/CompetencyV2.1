import React, { FC, ChangeEvent } from "react";

interface TextareaProps {
  label?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  id?: string;
}

const Textarea: FC<TextareaProps> = ({ label, value, onChange, placeholder, rows = 4, className = "", id }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-1 font-semibold text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className="resize-y border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
};

export default Textarea;
