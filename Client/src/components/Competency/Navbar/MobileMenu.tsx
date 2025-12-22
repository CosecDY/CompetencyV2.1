import React from "react";
import { NavItem } from "./types";
import MobileMenuHeader from "./MobileMenuHeader";
import MobileMenuItems from "./MobileMenuItems";
import MobileMenuAuth from "./MobileMenuAuth";

interface MobileMenuProps {
  menuOpen: boolean;
  navItems: NavItem[];
  isLoggedIn: boolean;
  isActiveNavItem: (path: string) => boolean;
  onClose: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ menuOpen, navItems, isLoggedIn, isActiveNavItem, onClose, onLogin, onLogout }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] md:hidden transition-all duration-500 ease-in-out ${menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-label="Close menu overlay"
      />

      {/* Menu Container */}
      <div
        className={`mobile-menu fixed inset-auto top-0 right-0 m-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-[9999] md:hidden transform transition-all duration-500 ease-out ${
          menuOpen ? "translate-x-0 opacity-100 scale-100 pointer-events-auto" : "translate-x-full opacity-0 scale-95 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <MobileMenuHeader menuOpen={menuOpen} onClose={onClose} />
        <MobileMenuItems menuOpen={menuOpen} navItems={navItems} isActiveNavItem={isActiveNavItem} onClose={onClose} />
        <MobileMenuAuth menuOpen={menuOpen} isLoggedIn={isLoggedIn} navItemsCount={navItems.length} onLogin={onLogin} onLogout={onLogout} onClose={onClose} />
      </div>
    </>
  );
};

export default MobileMenu;
