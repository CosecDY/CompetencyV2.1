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

const AuthActions: React.FC<AuthActionsProps> = ({
  isLoggedIn,
  user,
  onLogin,
  onLogout,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <div className="md:hidden flex items-center space-x-3">
        {!isLoggedIn && (
          <button
            onClick={onLogin}
            className="flex items-center justify-center bg-white text-teal-600 hover:bg-teal-600 hover:text-white p-2 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200 ease-in-out border border-teal-600"
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

  return (
    <div className="hidden md:flex items-center space-x-4">
      {isLoggedIn ? (
        <ProfileDisplay profile={user ?? null} onLogout={onLogout} />
      ) : (
        <button
          onClick={onLogin}
          className="flex items-center space-x-2 bg-white text-teal-600 hover:bg-teal-600 hover:text-white text-sm font-medium px-4 lg:px-5 py-2 lg:py-2.5 rounded-3xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 ease-in-out hover:scale-105 transform border border-teal-600"
        >
          <FaSignInAlt className="h-4 w-4" />
          <span>Login</span>
        </button>
      )}
    </div>
  );
};

export default AuthActions;
