import React from "react";

interface SectionCardProps {
  title: string;
  description: string;
  icon: string;
  borderColor: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  icon,
  borderColor,
  children,
  className = ""
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className={`border-l-4 ${borderColor} pl-6 py-2 bg-gradient-to-r from-white to-gray-50 rounded-r-xl`}>
        <h3 className="text-xl font-bold text-gray-900 flex items-center mb-2">
          <i className={`${icon} mr-3 text-2xl`}></i>
          {title}
          <span className="text-red-500 ml-2">*</span>
        </h3>
        <p className="text-gray-600 font-medium">{description}</p>
      </div>
      
      {/* Section Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};
