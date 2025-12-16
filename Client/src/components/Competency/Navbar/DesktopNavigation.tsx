import React from "react";
import { Link } from "react-router-dom";
import { NavItem } from "./types";

interface DesktopNavigationProps {
  navItems: NavItem[];
  isActiveNavItem: (path: string) => boolean;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ navItems, isActiveNavItem }) => {
  return (
    <div className="hidden md:flex justify-center">
      <div className="flex items-center space-x-6 lg:space-x-8">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`relative font-medium transition-all duration-300 hover:scale-105 text-sm lg:text-base 
            ${
              isActiveNavItem(item.path)
                ? "text-teal-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-teal-600 after:transition-all after:duration-300"
                : "text-gray-600 hover:text-teal-600 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-teal-600 hover:after:w-full after:transition-all after:duration-300"
            } 
            ${item.className || ""} `}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DesktopNavigation;
