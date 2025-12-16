import React from "react";
import { FaSignInAlt } from "react-icons/fa";

interface MobileMenuAuthProps {
  menuOpen: boolean;
  isLoggedIn: boolean;
  navItemsCount: number;
  onLogin: () => void;
  onLogout: () => void;
  onClose: () => void;
}

const MobileMenuAuth: React.FC<MobileMenuAuthProps> = ({
  menuOpen,
  isLoggedIn,
  navItemsCount,
  onLogin,
  onLogout,
  onClose,
}) => {
  return (
    <div
      className={`flex flex-col pt-3 mt-6 mx-5 border-t border-gray-200 transform transition-all duration-300 ${
        menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      style={{
        transitionDelay: menuOpen
          ? `${200 + navItemsCount * 100 + 100}ms`
          : "0ms",
      }}
    >
      {isLoggedIn ? (
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className={`flex items-center justify-center w-full text-red-600 hover:text-red-700 font-medium py-4 px-4 text-base rounded-xl hover:bg-red-50 transition-all duration-300 border border-red-200 hover:border-red-300 transform ${
            menuOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-95"
          }`}
          style={{
            transitionDelay: menuOpen
              ? `${200 + navItemsCount * 100 + 150}ms`
              : "0ms",
          }}
        >
          <span>Sign Out</span>
        </button>
      ) : (
        <button
          onClick={() => {
            onLogin();
            onClose();
          }}
          className={`flex items-center justify-center space-x-3 w-full max-w-[95%] mx-auto text-teal-600 font-medium py-4 px-4 text-base rounded-xl bg-white border border-teal-200 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 ease-in-out hover:scale-105 transform shadow-lg ${
            menuOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-95"
          }`}
          style={{
            transitionDelay: menuOpen
              ? `${200 + navItemsCount * 100 + 150}ms`
              : "0ms",
          }}
        >
          <FaSignInAlt className="h-5 w-5" />
          <span>Login</span>
        </button>
      )}
    </div>
  );
};

export default MobileMenuAuth;
