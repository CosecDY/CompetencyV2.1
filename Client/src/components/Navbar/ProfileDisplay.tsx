import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
  imageUrl: string;
  email: string;
  role: string;
}

interface ProfileDisplayProps {
  profile: RawProfile | null;
  onLogout: () => void;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ profile, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<SanitizedProfile | null>(null);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const defaultProfileImage = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = defaultProfileImage;
  };

  useEffect(() => {
    if (!profile) {
      setUserProfile(null);
      return;
    }

    const sanitized: SanitizedProfile = {
      firstName: profile.firstName || profile.email?.split("@")[0] || "User",
      lastName: profile.lastName || "",
      imageUrl: profile.profileImage || defaultProfileImage,
      email: profile.email || "No email provided",
      role: profile.role || "user",
    };
    console.log(sanitized.imageUrl);

    setUserProfile(sanitized);
  }, [profile]);

  const toggleMenu = useCallback(() => {
    setShowMenu((prev) => !prev);
  }, []);

  const goProfilePage = () => {
    navigate("/profile");
    setShowMenu(false);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  if (!userProfile) return null;

  return (
    <div
      className="relative"
      ref={menuRef}
    >
      <button
        onClick={toggleMenu}
        aria-label="Open profile menu"
        className="focus:outline-none"
      >
        <img
          src={userProfile.imageUrl}
          alt="Profile"
          className="h-8 w-8 rounded-full object-cover"
          onError={handleImgError}
        />
      </button>

      {showMenu && (
        <div className="fixed right-4 top-14 w-64 bg-white rounded-xl shadow-lg ring-1 ring-gray-200 ring-opacity-5 z-[9999]">
          <div className="px-4 py-3 flex items-center space-x-3">
            <img
              src={userProfile.imageUrl}
              alt="Profile"
              className="h-10 w-10 rounded-full object-cover"
              onError={handleImgError}
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                {userProfile.firstName} {userProfile.lastName}
              </span>
              <span className="text-xs text-gray-500">{userProfile.email}</span>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          <button
            onClick={goProfilePage}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Profile
          </button>

          <div className="border-t border-gray-200"></div>

          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProfileDisplay);
