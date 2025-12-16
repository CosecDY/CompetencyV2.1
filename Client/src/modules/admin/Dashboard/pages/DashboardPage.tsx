import React from "react";
import { AdminLayout } from "@Layouts/AdminLayout";
import { Card } from "@Components/Admin/ExportComponent";

// (Optional) ถ้าอยากใส่ไอคอนสวยๆ
import { FiDatabase, FiUsers, FiSettings, FiFileText } from "react-icons/fi";

export const DashboardPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6 px-4 md:px-6 py-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Dashboard</h1>
          <p className="text-sm text-admin-muted mt-1">Welcome back, Administrator.</p>
        </div>

        {/* Welcome / Instruction Card */}
        <Card className="space-y-4">
          <div className="border-b border-admin-border pb-4">
            <h2 className="text-xl font-semibold text-admin-text">Getting Started</h2>
            <p className="text-admin-muted mt-2">Select a module from the sidebar to start managing the system. Here is a quick overview of available modules:</p>
          </div>

          {/* รายการคำแนะนำ (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* 1. Assets */}
            <div className="p-4 rounded-lg bg-admin-bg border border-admin-border flex items-start gap-3">
              <div className="p-2 bg-white rounded-md text-admin-primary shadow-sm">
                <FiDatabase size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-admin-text">Assets Management</h3>
                <p className="text-sm text-admin-muted">Manage system tables, database descriptions, and resources.</p>
              </div>
            </div>

            {/* 2. RBAC (User & Roles) */}
            <div className="p-4 rounded-lg bg-admin-bg border border-admin-border flex items-start gap-3">
              <div className="p-2 bg-white rounded-md text-admin-primary shadow-sm">
                <FiUsers size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-admin-text">User & Roles (RBAC)</h3>
                <p className="text-sm text-admin-muted">Manage users, assign roles, and configure permissions.</p>
              </div>
            </div>

            {/* 3. Frameworks */}
            <div className="p-4 rounded-lg bg-admin-bg border border-admin-border flex items-start gap-3">
              <div className="p-2 bg-white rounded-md text-admin-primary shadow-sm">
                <FiFileText size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-admin-text">Competency Frameworks</h3>
                <p className="text-sm text-admin-muted">Setup SFIA, TPQI standards and assessment criteria.</p>
              </div>
            </div>

            {/* 4. System */}
            <div className="p-4 rounded-lg bg-admin-bg border border-admin-border flex items-start gap-3">
              <div className="p-2 bg-white rounded-md text-admin-primary shadow-sm">
                <FiSettings size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-admin-text">System Settings</h3>
                <p className="text-sm text-admin-muted">View logs, manage backups, and system configurations.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
