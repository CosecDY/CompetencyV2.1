import React, { useContext, useState } from "react";
import { FiMenu, FiHome } from "react-icons/fi";
import { Link } from "react-router-dom";
import AuthContext from "@Contexts/AuthContext";
import Login from "@Components/Competency/Navbar/Login";
import ProfileDisplay from "@Components/Competency/Navbar/ProfileDisplay";

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
    <header className="fixed top-0 left-0 z-40 right-0 h-16 bg-surface border-border flex items-center px-4 md:px-6 transition-all duration-200 ">
      {/* Logo Section */}
      <Link to="/home" className="group flex items-center gap-2 transition-all duration-300 hover:scale-105">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary ring-2 ring-primary ring-offset-2 ring-offset-surface transition-all group-hover:bg-primary-hover">
          <span className="text-lg text-white font-bold">C</span>
        </div>

        <span className="text-2xl font-bold tracking-tight text-maintext bg-clip-text bg-gradient-to-r from-primary to-primary">CompetencyV2</span>
      </Link>

      {/* Mobile sidebar toggle */}
      <div className="flex items-center ml-4">
        <button onClick={onToggleSidebar} className="text-muted hover:text-maintext md:hidden mr-3 transition-colors" aria-label="Toggle sidebar">
          <FiMenu size={22} />
        </button>
      </div>

      {/* Middle Section: Greeting */}
      <div className="hidden lg:flex flex-1 justify-center">
        {isLoggedIn && !loading && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-background rounded-full border border-border animate-in fade-in slide-in-from-top-2 duration-500">
            <span className="text-muted text-lm font-medium">Hello,</span>
            <span className="text-brand text-lm font-bold">{user.firstName || "Administrator"}</span>
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center ml-auto space-x-5">
        <Link to="/home" className="flex items-center space-x-2 text-muted hover:text-primary transition duration-200" title="Back to Home">
          <FiHome size={20} />
          <span className="hidden md:block text-sm font-medium">Home</span>
        </Link>

        {loading ? (
          <div className="w-9 h-9 rounded-full bg-muted/20 animate-pulse" />
        ) : isLoggedIn ? (
          <ProfileDisplay profile={user} onLogout={async () => await auth?.logout()} />
        ) : (
          <>
            <button onClick={() => setLoginOpen(true)} className="flex items-center space-x-1 bg-primary text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-primary-hover transition ">
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
