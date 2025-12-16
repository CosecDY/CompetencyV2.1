import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getInitialAvatar } from "@Utils/avatarUtils";

interface RawProfile {
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  email?: string;
  role?: string;
}

interface SanitizedProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface ProfileDisplayProps {
  profile: RawProfile | null;
  onLogout: () => void;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ profile, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Memoize sanitized profile for performance
  const userProfile: SanitizedProfile | null = useMemo(() => {
    if (!profile) return null;
    return {
      firstName: profile.firstName || profile.email?.split("@")[0] || "User",
      lastName: profile.lastName || "",
      email: profile.email || "No email provided",
      role: profile.role || "user",
    };
  }, [profile]);

  // Memoize avatar data
  const avatar = useMemo(() => (userProfile ? getInitialAvatar(userProfile.firstName) : { initial: "", color: "#ccc" }), [userProfile]);

  const toggleMenu = useCallback(() => setShowMenu((prev) => !prev), []);

  const goProfilePage = useCallback(() => {
    navigate("/profile");
    setShowMenu(false);
  }, [navigate]);

  // Handle click outside to close menu
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  if (!userProfile) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={toggleMenu} aria-label="Open profile menu" className="focus:outline-none">
        <div style={{ backgroundColor: avatar.color }} className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {avatar.initial}
        </div>
      </button>

      {showMenu && (
        <div className="fixed right-4 top-14 w-64 bg-white rounded-xl shadow-lg ring-1 ring-gray-200 ring-opacity-5 z-[9999]">
          <div className="px-4 py-3 flex items-center space-x-3">
            <div style={{ backgroundColor: avatar.color }} className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {avatar.initial}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                {userProfile.firstName} {userProfile.lastName}
              </span>
              <span className="text-xs text-gray-500">{userProfile.email}</span>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          <button onClick={goProfilePage} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Profile
          </button>

          <div className="border-t border-gray-200"></div>

          <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProfileDisplay);
