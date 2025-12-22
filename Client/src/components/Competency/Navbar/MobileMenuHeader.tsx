import React from "react";
import { FaTimes } from "react-icons/fa";

interface MobileMenuHeaderProps {
  menuOpen: boolean;
  onClose: () => void;
}

const MobileMenuHeader: React.FC<MobileMenuHeaderProps> = ({ menuOpen, onClose }) => {
  return (
    <div
      className={`flex items-center justify-between p-4 border-b border-gray-200 transform transition-all duration-300 delay-100 ${
        menuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <span className="text-gray-900 font-semibold text-lg">Menu</span>
      <button
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className={`flex items-center justify-center w-8 h-8 text-teal-600 hover:text-teal-700 focus:outline-none rounded-lg transition-all duration-300 hover:bg-teal-50 transform hover:rotate-90 hover:scale-110 ${
          menuOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
        }`}
        style={{
          transitionDelay: menuOpen ? "150ms" : "0ms",
        }}
        aria-label="Close menu"
      >
        <FaTimes className="h-5 w-5" />
      </button>
    </div>
  );
};

export default MobileMenuHeader;
