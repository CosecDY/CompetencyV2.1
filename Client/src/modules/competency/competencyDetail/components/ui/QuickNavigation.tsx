import React from "react";
import { FaChevronRight } from "react-icons/fa";

interface QuickNavItem {
  label: string;
  href: string;
}

interface QuickNavigationProps {
  source: "sfia" | "tpqi";
  items: QuickNavItem[];
}

const QuickNavigation: React.FC<QuickNavigationProps> = ({ source, items }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {items.map((item) => (
        <button
          key={item.label}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
            source === "sfia"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          <span>{item.label}</span>
          <FaChevronRight className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
};

export default QuickNavigation;
