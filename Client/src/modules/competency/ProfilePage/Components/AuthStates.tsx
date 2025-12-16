import React from "react";

interface AuthStatesProps {
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  isProfileLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const AuthStates: React.FC<AuthStatesProps> = ({
  isAuthLoading,
  isAuthenticated,
  isProfileLoading,
  error,
  onRetry,
}) => {
  // Auth Loading State
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="text-teal-600 font-medium">
            กำลังตรวจสอบการเข้าสู่ระบบ...
          </p>
        </div>
      </div>
    );
  }

  // User Not Authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <i className="fas fa-exclamation-circle text-yellow-500 text-xl"></i>
            <div>
              <h3 className="text-yellow-800 font-medium">กรุณาเข้าสู่ระบบ</h3>
              <p className="text-yellow-600 text-sm">
                คุณจำเป็นต้องเข้าสู่ระบบเพื่อเข้าถึงหน้าโปรไฟล์
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile Loading State
  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="text-teal-600 font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
            <div>
              <h3 className="text-red-800 font-medium">เกิดข้อผิดพลาด</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={onRetry}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            โหลดข้อมูลใหม่
          </button>
        </div>
      </div>
    );
  }

  return null;
};
