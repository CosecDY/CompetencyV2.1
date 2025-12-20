import React from "react";
import { AdminLayout } from "@Layouts/AdminLayout";
import { Card } from "@Components/Admin/ExportComponent";
import { FiDatabase, FiUsers, FiSettings, FiFileText } from "react-icons/fi";

export const DashboardPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold text-main-text">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Welcome back, Administrator.</p>
        </div>

        {/* Welcome / Instruction Card */}
        <Card className="p-0 overflow-hidden border-border shadow-soft">
          <div className="p-6 border-b border-border bg-color-card">
            <h2 className="text-xl font-bold text-main-text">Getting Started</h2>
            <p className="text-muted mt-2">Select a module from the sidebar to start managing the system. Here is a quick overview of available modules:</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Assets */}
              <div className="group p-5 rounded-xl bg-background border border-border flex items-start gap-4 transition-all hover:bg-surface hover:shadow-md hover:border-brand/30">
                <div className="p-3 bg-surface rounded-lg text-brand shadow-sm group-hover:bg-brand transition-colors">
                  <FiDatabase size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-main-text group-hover:text-brand transition-colors">Assets Management</h3>
                  <p className="text-sm text-muted leading-relaxed mt-1">Manage system tables, database descriptions, and resources.</p>
                </div>
              </div>

              {/* 2. RBAC (User & Roles) */}
              <div className="group p-5 rounded-xl bg-background border border-border flex items-start gap-4 transition-all hover:bg-surface hover:shadow-md hover:border-brand/30">
                <div className="p-3 bg-surface rounded-lg text-brand shadow-sm group-hover:bg-brand transition-colors">
                  <FiUsers size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-main-text group-hover:text-brand transition-colors">User & Roles (RBAC)</h3>
                  <p className="text-sm text-muted leading-relaxed mt-1">Manage users, assign roles, and configure permissions.</p>
                </div>
              </div>

              {/* 3. Frameworks */}
              <div className="group p-5 rounded-xl bg-background border border-border flex items-start gap-4 transition-all hover:bg-surface hover:shadow-md hover:border-brand/30">
                <div className="p-3 bg-surface rounded-lg text-brand shadow-sm group-hover:bg-brand  transition-colors">
                  <FiFileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-main-text group-hover:text-brand transition-colors">Competency Frameworks</h3>
                  <p className="text-sm text-muted leading-relaxed mt-1">Setup SFIA, TPQI standards and assessment criteria.</p>
                </div>
              </div>

              {/* 4. System */}
              <div className="group p-5 rounded-xl bg-background border border-border flex items-start gap-4 transition-all hover:bg-surface hover:shadow-md hover:border-brand/30">
                <div className="p-3 bg-surface rounded-lg text-brand shadow-sm group-hover:bg-brand transition-colors">
                  <FiSettings size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-main-text group-hover:text-brand transition-colors">System Settings</h3>
                  <p className="text-sm text-muted leading-relaxed mt-1">View logs, manage backups, and system configurations.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
