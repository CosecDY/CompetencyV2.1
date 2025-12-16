import React from "react";
import { ProfileAvatar } from "./ProfileAvatar";

interface ProfileCardHeaderProps {
  userFirstName: string;
}

export const ProfileCardHeader: React.FC<ProfileCardHeaderProps> = ({
  userFirstName,
}) => {
  return (
    <div className="relative bg-gradient-to-br from-teal-600 to-teal-800 px-8 py-16">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800"></div>

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

      <div className="relative flex flex-col lg:flex-row items-center justify-between">
        <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8 mb-8 lg:mb-0">
          {/* Avatar */}
          <ProfileAvatar size="lg" firstName={userFirstName} />

          <div className="text-white text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold pb-3">
              แก้ไขข้อมูลส่วนบุคคล
            </h2>
            <p className="text-white/90 text-lg mb-4">
              กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-medium">พร้อมแก้ไข</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
