import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@Contexts/AuthContext";
import { FiLock } from "react-icons/fi";

interface AdminGuardProps {
  children?: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Checking permissions...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const allowedAdminRoles = ["Admin", "SuperAdmin"];
  console.log("Current User Role:", user.role);

  if (!user.role || !allowedAdminRoles.includes(user.role)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-xl shadow-lg text-center border border-gray-200">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <FiLock className="h-8 w-8 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>

          <p className="text-gray-500 mb-8">
            คุณไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ (Admin Zone)
            <br />
            สถานะปัจจุบันของคุณคือ: <span className="font-semibold text-gray-800">{user.role || "No Role"}</span>
          </p>

          <button
            onClick={() => navigate("/home", { replace: true })}
            className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AdminGuard;
