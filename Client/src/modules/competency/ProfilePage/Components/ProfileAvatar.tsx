import React from "react";
import { getInitialAvatar } from "@Utils/avatarUtils";

interface ProfileAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  firstName?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ size = "lg", className = "", firstName = "User" }) => {
  const avatar = getInitialAvatar(firstName);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main Avatar */}
      <div
        className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center border-4 border-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group font-bold text-white`}
        style={{ backgroundColor: avatar.color }}
      >
        <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className={`${textSizes[size]} relative z-10 group-hover:scale-110 transition-transform duration-300`}>{avatar.initial}</span>
      </div>

      {/* Online Status Indicator */}
      <div className="absolute top-1 right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
    </div>
  );
};
