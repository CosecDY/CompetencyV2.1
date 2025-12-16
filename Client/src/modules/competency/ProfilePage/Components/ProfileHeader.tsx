import React from "react";

interface ProfileHeaderProps {
  lastUpdated: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  lastUpdated,
}) => {
  return (
    <div className="text-center mb-16 mt-12 animate-fade-in">
      <div className="relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-72 h-72 bg-gradient-to-br from-teal-400 to-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent mb-2 py-5 tracking-tight">
            ข้อมูลส่วนบุคคล
          </h1>

          {/* Elegant underline */}
          <div className="w-12 h-px bg-teal-400 mx-auto mb-8"></div>

          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto font-medium mb-6">
            จัดการข้อมูลส่วนตัวของคุณเพื่อประสบการณ์การใช้งานที่ดีที่สุด
            <br className="hidden md:block" />
            <span className="text-teal-600 font-semibold">
              ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัย
            </span>
          </p>

          {/* Last updated badge */}
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-600 font-medium">
                <i className="fas fa-clock mr-2 text-teal-500"></i>{" "}
                อัพเดตล่าสุด:
              </span>
              <span className="font-semibold text-gray-800">{lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
