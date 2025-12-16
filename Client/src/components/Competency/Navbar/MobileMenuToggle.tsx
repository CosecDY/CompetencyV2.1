import React from "react";
import { FaBars, FaTimes } from "react-icons/fa";

interface MobileMenuToggleProps {
  menuOpen: boolean;
  onToggle: () => void;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({
  menuOpen,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`menu-button flex items-center justify-center w-10 h-10 text-teal-600 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg transition-all duration-300 hover:bg-teal-50 transform ${
        menuOpen ? "rotate-90 scale-110" : "rotate-0 scale-100"
      }`}
      aria-label="Toggle menu"
      aria-expanded={menuOpen}
    >
      {menuOpen ? (
        <FaTimes className="h-5 w-5" />
      ) : (
        <FaBars className="h-5 w-5" />
      )}
    </button>
  );
};

export default MobileMenuToggle;
