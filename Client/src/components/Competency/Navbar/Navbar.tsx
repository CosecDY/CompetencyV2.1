import React from "react";
import Logo from "./Logo";
import DesktopNavigation from "./DesktopNavigation";
import AuthActions from "./AuthActions";
import MobileMenuToggle from "./MobileMenuToggle";
import MobileMenu from "./MobileMenu";
import { useMobileMenu } from "./hooks/useMobileMenu";
import { useNavigation } from "./hooks/useNavigation";
import { useAuth } from "./hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { auth, isLoggedIn, handleLogout } = useAuth();
  const location = useLocation();

  const { NAV_ITEMS, isActiveNavItem } = useNavigation(isLoggedIn, auth?.user?.role);
  const { menuOpen, toggleMenu, closeMenu } = useMobileMenu();

  const handleLoginClick = () => {
    navigate("/login", { state: { from: location } });
    closeMenu();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 h-[64px] transition-all duration-300 ease-in-out bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full h-full grid grid-cols-2 md:grid-cols-3 items-center px-4 md:px-6">
          {/* Logo - left column */}
          <Logo />

          {/* Desktop Navigation - center column */}
          <DesktopNavigation navItems={NAV_ITEMS} isActiveNavItem={isActiveNavItem} />

          {/* Profile/Login - right column */}
          <div className="flex justify-end items-center">
            {/* Desktop Profile/Login */}
            <AuthActions isLoggedIn={isLoggedIn} user={auth?.user} onLogin={handleLoginClick} onLogout={handleLogout} />

            {/* Mobile Auth and Menu Toggle */}
            <div className="md:hidden flex items-center space-x-3">
              <AuthActions isLoggedIn={isLoggedIn} user={auth?.user} onLogin={handleLoginClick} onLogout={handleLogout} isMobile={true} />
              <MobileMenuToggle menuOpen={menuOpen} onToggle={toggleMenu} />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu menuOpen={menuOpen} navItems={NAV_ITEMS} isLoggedIn={isLoggedIn} isActiveNavItem={isActiveNavItem} onClose={closeMenu} onLogin={handleLoginClick} onLogout={handleLogout} />
      </nav>
    </>
  );
};

export default Navbar;
