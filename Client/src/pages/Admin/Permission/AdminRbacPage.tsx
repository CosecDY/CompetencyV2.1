import React, { useState } from "react";
import RolePage from "./Role/RolePage";
import { RolePermissionManager } from "./RolePermission/RolePermissionManager";
// import UserRoleAssignmentPage from "./UserRole/UserRoleAssignment";
import PermissionPage from "./Permission/PermissionPage";
import { AdminLayout } from "@Layouts/AdminLayout";
import AssetPage from "./Asset/AssetPage";

const AdminRbacPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"roles" | "rolePermissions" | "permissions" | "assets">("roles");

  return (
    <AdminLayout>
      <div className="mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">RBAC Administration</h1>

        {/* Tab Headers */}
        <div className="flex border-b mb-6 space-x-6">
          <button className={`pb-2 border-b-4 ${activeTab === "roles" ? "border-blue-600 text-blue-600" : "border-transparent"} font-semibold whitespace-nowrap`} onClick={() => setActiveTab("roles")}>
            Roles
          </button>

          <button
            className={`pb-2 border-b-4 ${activeTab === "rolePermissions" ? "border-blue-600 text-blue-600" : "border-transparent"} font-semibold whitespace-nowrap`}
            onClick={() => setActiveTab("rolePermissions")}
          >
            Role Permissions
          </button>

          <button
            className={`pb-2 border-b-4 ${activeTab === "permissions" ? "border-blue-600 text-blue-600" : "border-transparent"} font-semibold whitespace-nowrap`}
            onClick={() => setActiveTab("permissions")}
          >
            Permissions
          </button>

          <button
            className={`pb-2 border-b-4 ${activeTab === "assets" ? "border-blue-600 text-blue-600" : "border-transparent"} font-semibold whitespace-nowrap`}
            onClick={() => setActiveTab("assets")}
          >
            Asset Access
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "roles" && <RolePage />}

          {activeTab === "rolePermissions" && <RolePermissionManager />}

          {activeTab === "permissions" && <PermissionPage />}

          {activeTab === "assets" && <AssetPage />}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRbacPage;
