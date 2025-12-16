import React from "react";

interface FormCardProps {
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
}

export const FormCard: React.FC<FormCardProps> = ({ 
  children, 
  className = "",
  highlight = false 
}) => {
  return (
    <div className={`
      bg-gradient-to-br from-white to-gray-50/50 
      rounded-2xl p-6 border border-gray-200 
      shadow-sm hover:shadow-lg 
      transition-all duration-300 
      hover:-translate-y-1 group
      ${highlight ? 'ring-2 ring-teal-200 bg-gradient-to-br from-teal-50/50 to-white' : ''}
      ${className}
    `}>
      {/* Subtle hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-blue-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
