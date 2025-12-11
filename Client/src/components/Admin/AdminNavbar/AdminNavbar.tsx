import React, { useContext, useState } from "react";
import { FiMenu, FiHome } from "react-icons/fi";
import { Link } from "react-router-dom";
import AuthContext from "@Contexts/AuthContext";
import Login from "../../Navbar/Login";
import ProfileDisplay from "../../Navbar/ProfileDisplay";

interface AdminNavbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ onToggleSidebar }) => {
  const auth = useContext(AuthContext);
  const { user, loading, login } = auth!;
  const isLoggedIn = !!user;
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-40 right-0 h-16 bg-white border border-gray-200 flex items-center px-4 md:px-6 transition-all duration-200">
      {/* Logo */}
      <Link to="/home" className="group flex items-center gap-2 transition-all duration-300 hover:scale-105">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-600 ring-offset-2 transition-all group-hover:bg-indigo-700">
          <span className="text-lg font-bold">C</span>
        </div>

        <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-800 to-indigo-700">CompetencyV2</span>
      </Link>

      {/* Mobile sidebar toggle */}
      <div className="flex items-center ml-4">
        <button onClick={onToggleSidebar} className="text-gray-500 hover:text-gray-700 md:hidden mr-3" aria-label="Toggle sidebar">
          <FiMenu size={22} />
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center ml-auto space-x-5">
        <Link to="/home" className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 transition duration-200" title="Back to Home">
          <FiHome size={20} />
          <span className="hidden md:block text-sm font-medium">Home</span>
        </Link>

        {loading ? (
          <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
        ) : isLoggedIn ? (
          <ProfileDisplay profile={user} onLogout={async () => await auth?.logout()} />
        ) : (
          <>
            <button onClick={() => setLoginOpen(true)} className="flex items-center space-x-1 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-indigo-700 transition">
              Login
            </button>
            <Login
              open={loginOpen}
              onClose={() => setLoginOpen(false)}
              handleLogin={async (resp) => {
                await login(resp.credential!);
                setLoginOpen(false);
              }}
            />
          </>
        )}
      </div>
    </header>
  );
};

export default AdminNavbar;
