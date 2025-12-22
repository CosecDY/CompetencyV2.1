import React from "react";
import { Link } from "react-router-dom";
import { NavItem } from "./types";

interface MobileMenuItemsProps {
  menuOpen: boolean;
  navItems: NavItem[];
  isActiveNavItem: (path: string) => boolean;
  onClose: () => void;
}

const MobileMenuItems: React.FC<MobileMenuItemsProps> = ({ menuOpen, navItems, isActiveNavItem, onClose }) => {
  return (
    <div className={`flex flex-col p-4 space-y-2 transform transition-all duration-300 delay-200 ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
      {navItems.map((item, index) => (
        <Link
          key={item.name}
          to={item.path}
          onClick={onClose}
          className={`flex items-center font-medium py-4 px-4 rounded-xl transition-all duration-300 transform hover:translate-x-1 border-b border-gray-100 last:border-b-0 ${
            isActiveNavItem(item.path) ? "text-teal-600 bg-teal-50 border-l-4 border-l-teal-600" : "text-gray-700 hover:text-teal-600 hover:bg-teal-50"
          } ${menuOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
          style={{
            transitionDelay: menuOpen ? `${200 + index * 100}ms` : `${index * 50}ms`,
          }}
        >
          <span className="text-base">{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default MobileMenuItems;
