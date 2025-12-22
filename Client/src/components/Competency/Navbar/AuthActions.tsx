import React from "react";
import { FaSignInAlt } from "react-icons/fa";
import ProfileDisplay from "./ProfileDisplay";
import { User } from "./types";

interface AuthActionsProps {
  isLoggedIn: boolean;
  user?: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isMobile?: boolean;
}

const AuthActions: React.FC<AuthActionsProps> = ({ isLoggedIn, user, onLogin, onLogout, isMobile = false }) => {
  // --- MOBILE VIEW ---
  if (isMobile) {
    return (
      <div className="md:hidden flex items-center space-x-3">
        {!isLoggedIn && (
          <button
            onClick={onLogin}
            className="flex items-center justify-center w-9 h-9 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full shadow-md hover:shadow-teal-500/40 hover:from-teal-600 hover:to-teal-700 transition-all duration-300 active:scale-95"
            aria-label="Login"
          >
            <FaSignInAlt className="h-4 w-4" />
          </button>
        )}
        {isLoggedIn && (
          <div className="scale-90">
            <ProfileDisplay profile={user ?? null} onLogout={onLogout} />
          </div>
        )}
      </div>
    );
  }

  // --- DESKTOP VIEW ---
  return (
    <div className="hidden md:flex items-center space-x-4">
      {isLoggedIn ? (
        <ProfileDisplay profile={user ?? null} onLogout={onLogout} />
      ) : (
        <button
          onClick={onLogin}
          className="group flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white text-sm font-bold px-6 py-2 rounded-lg shadow-md hover:shadow-lg  transition-all duration-300  active:scale-95"
        >
          <span className="tracking-wide">Log In</span>
        </button>
      )}
    </div>
  );
};

export default AuthActions;
