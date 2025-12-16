import React from "react";

interface FrameworkBadgeProps {
  framework: string;
  getFrameworkIcon: (framework: string) => React.ReactNode;
  getFrameworkColor: (framework: string) => string;
}

const FrameworkBadge: React.FC<FrameworkBadgeProps> = ({ framework, getFrameworkIcon, getFrameworkColor }) => (
  <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${getFrameworkColor(framework)} text-white px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg`}>
    {getFrameworkIcon(framework)}
    <span>{framework?.toUpperCase()} Framework</span>
  </div>
);

export default FrameworkBadge;
