import React, { useState, useCallback } from "react";
import { useRoleManager } from "@Hooks/admin/rbac/useRoleManager";
import { useRolePermissionManager } from "@Hooks/admin/rbac/useRolePermissionManager";
import { useOperationManager } from "@Hooks/admin/rbac/useOperationManager";
import { useAssetManager } from "@Hooks/admin/rbac/useAssetManager";
import { Checkbox, Spinner, Toast } from "@Components/Common/ExportComponent";
import { DataTable } from "@Components/ExportComponent";
import { ColumnDef } from "@tanstack/react-table";
import { Operation } from "@Types/admin/rbac/operationTypes";

type AssetRow = {
  assetName: string;
  create?: Operation;
  view?: Operation;
  edit?: Operation;
  delete?: Operation;
};

export const RolePermissionManager: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [togglingOperationId, setTogglingOperationId] = useState<number | null>(null);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };
  const { assetsQuery } = useAssetManager({ page: 1, perPage: 50 }, handleToast);
  const assets = assetsQuery.data?.data || [];
  // Roles
  const { rolesQuery } = useRoleManager({ page: 1, perPage: 50 }, handleToast);
  const roles = rolesQuery.data?.data || [];
  const selectedRole = roles.find((r) => r.id === selectedRoleId) || null;

  // Role permissions
  const { rolePermissionsQuery, assignPermissionToRole, revokePermissionFromRole } = useRolePermissionManager(selectedRole?.id ?? null, handleToast);
  const rolePermissions = rolePermissionsQuery.data || [];

  // Operations
  const { operationsQuery } = useOperationManager({ page: 1, perPage: 50 }, handleToast);
  const operations = operationsQuery.data?.data || [];

  const isLoading = rolesQuery.isLoading || rolePermissionsQuery.isLoading || operationsQuery.isLoading;
  const isError = rolesQuery.isError || rolePermissionsQuery.isError || operationsQuery.isError;

  // Toggle operation
  const handleToggleOperation = (operation: Operation, checked: boolean) => {
    if (!selectedRole) return handleToast("Please select a role first.", "info");
    setTogglingOperationId(operation.id);

    // ใช้ optional chaining ป้องกัน undefined
    const permissionRecord = rolePermissions.find((p) => p.permission?.id === operation.id);

    const mutationOptions = {
      onSuccess: () => {
        rolePermissionsQuery.refetch();
        setTogglingOperationId(null);
      },
      onError: (error: any) => {
        console.error("Mutation error:", error);
        handleToast(`Failed to ${checked ? "assign" : "revoke"} permission: ${error.message || "Unknown error"}`, "error");
        setTogglingOperationId(null);
      },
    };

    if (checked) {
      if (!permissionRecord) {
        assignPermissionToRole.mutate({ roleId: selectedRole.id, permissionId: operation.id }, mutationOptions);
      } else {
        handleToast("Permission already assigned.", "info");
        setTogglingOperationId(null);
      }
    } else {
      if (permissionRecord) {
        revokePermissionFromRole.mutate({ roleId: selectedRole.id, permissionId: permissionRecord.permission!.id }, mutationOptions);
      } else {
        handleToast("Permission is not assigned to this role.", "info");
        setTogglingOperationId(null);
      }
    }
  };

  // Columns
  const columns: ColumnDef<AssetRow>[] = [
    { accessorKey: "assetName", header: "Asset Name" },
    ...(["create", "view", "edit", "delete"] as (keyof AssetRow)[]).map((opName) => ({
      id: opName,
      header: opName.charAt(0).toUpperCase() + opName.slice(1),
      cell: ({ row }) => {
        const op = row.original[opName];
        if (!op) return null;

        const isAssigned = rolePermissions.some((p) => p.permission?.id === op.id);
        const isToggling = togglingOperationId === op.id;

        return (
          <div className="flex items-center justify-center">
            <Checkbox checked={isAssigned} disabled={isToggling} onCheckedChange={(checked) => handleToggleOperation(op, checked as boolean)} />
            {isToggling && <Spinner />}
          </div>
        );
      },
    })),
  ];

  // fetchPage for pagination
  // fetchPage for pagination
  const fetchPage = useCallback(
    async (pageIndex: number, pageSize: number) => {
      const assetMap: Record<string, AssetRow> = {};

      operations.forEach((op) => {
        const assetName = op.assetName || "Unknown";
        if (!assetMap[assetName]) {
          assetMap[assetName] = { assetName };
        }

        if (["create", "view", "edit", "delete"].includes(op.name)) {
          assetMap[assetName][op.name as keyof AssetRow] = op;
        }
      });

      const assetRows: AssetRow[] = Object.values(assetMap);

      const start = pageIndex * pageSize;
      const data = assetRows.slice(start, start + pageSize);
      return { data, total: assetRows.length };
    },
    [operations]
  );

  return (
    <div className="p-4  mx-auto rounded-lg shadow-sm mt-6 bg-white">
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Select Role:</label>
        {rolesQuery.isLoading ? (
          <Spinner />
        ) : rolesQuery.isError ? (
          <p className="text-red-500">Failed to load roles.</p>
        ) : (
          <select className="border rounded p-2 w-full max-w-sm" value={selectedRoleId ?? ""} onChange={(e) => setSelectedRoleId(Number(e.target.value))}>
            <option value="">-- Select a Role --</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {!selectedRole ? (
        <p className="text-gray-500 italic mt-4">Select a role to manage its permissions.</p>
      ) : isLoading ? (
        <Spinner />
      ) : isError ? (
        <p className="text-red-500">Error loading data. Please try again.</p>
      ) : (
        <DataTable<AssetRow> columns={columns} fetchPage={fetchPage} initialPageSize={10} pageSizes={[5, 10, 20]} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
