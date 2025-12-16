import React, { useState } from "react";
import { Checkbox, Toast } from "@Components/Admin/Common/ExportComponent";
import { DataTable } from "@Components/Admin/ExportComponent";
import { ColumnDef, CellContext } from "@tanstack/react-table";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useAssetManager } from "modules/admin/rbac/hooks/useAssetManager";
import { useOperationManager } from "modules/admin/rbac/hooks/useOperationManager";
import { useRoleManager } from "modules/admin/rbac/hooks/useRoleManager";
import { useRolePermissionManager } from "modules/admin/rbac/hooks/useRolePermissionManager";
import { RolePermission } from "modules/admin/rbac/types/rolePermissionTypes";
import { useQueryClient } from "@tanstack/react-query";

type AssetRow = {
  assetId: number;
  assetName: string;
  operations: Record<number, RolePermission | undefined>;
};

export default function RolePermissionTable() {
  const queryClient = useQueryClient();

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [togglingPermissionId, setTogglingPermissionId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  // Roles
  const { rolesQuery } = useRoleManager({ page: 1, perPage: 50 }, handleToast);
  const roles = rolesQuery.data?.data || [];

  React.useEffect(() => {
    if (roles.length > 0 && selectedRoleId === null) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles]);

  const selectedRole = roles.find((r: (typeof roles)[number]) => r.id === selectedRoleId) || null;

  // Assets and Operations
  const { assetsQuery } = useAssetManager({ page: 1, perPage: 50 }, handleToast);
  const { operationsQuery } = useOperationManager({ page: 1, perPage: 50 }, handleToast);
  const assets = assetsQuery?.data?.data || [];
  const operations = operationsQuery?.data?.data || [];

  // Role permissions
  const { rolePermissionsQuery, assignPermissionToRole, revokePermissionFromRole } = useRolePermissionManager(selectedRoleId, handleToast);
  const rolePermissions: RolePermission[] = rolePermissionsQuery?.data || [];

  const fetchPage = async (pageIndex: number, pageSize: number) => {
    const start = pageIndex * pageSize;
    const rows = assets.slice(start, start + pageSize).map((asset) => {
      const ops: Record<number, RolePermission | undefined> = {};
      operations.forEach((op) => {
        const rp = rolePermissions.find((p) => p.permission?.asset?.id === asset.id && p.permission?.operation?.id === op.id);
        ops[op.id] = rp;
      });
      return { assetId: asset.id, assetName: asset.tableName, operations: ops };
    });

    return { data: rows, total: assets.length };
  };

  const handleTogglePermission = (rp: RolePermission | undefined, assetId: number, operationId: number, checked: boolean) => {
    if (!selectedRole) return handleToast("Please select a role first.", "info");

    setTogglingPermissionId(rp?.id ?? operationId);

    const mutationOptions = {
      onSuccess: () => setTogglingPermissionId(null),
      onError: (err: Error) => {
        handleToast(`Failed to ${checked ? "assign" : "revoke"} permission: ${err.message || "Unknown"}`, "error");
        setTogglingPermissionId(null);
      },
    };

    if (checked) {
      if (!rp) assignPermissionToRole.mutate({ roleId: selectedRole.id, assetId, operationId }, mutationOptions);
      else setTogglingPermissionId(null);
    } else {
      if (rp) revokePermissionFromRole.mutate({ roleId: selectedRole.id, assetId, operationId }, mutationOptions);
      else setTogglingPermissionId(null);
    }
  };

  const columns: ColumnDef<AssetRow>[] = [
    { accessorKey: "assetName", header: "Asset Name" },
    ...operations.map((op) => ({
      id: `op-${op.id}`,
      header: op.name,
      cell: ({ row }: CellContext<AssetRow, unknown>) => {
        const rp = row.original.operations[op.id];
        const isAssigned = !!rp;
        const isToggling = togglingPermissionId === (rp?.id ?? op.id);
        return (
          <div className="flex items-center">
            <Checkbox checked={isAssigned} disabled={isToggling} onCheckedChange={(checked) => handleTogglePermission(rp, row.original.assetId, op.id, checked as boolean)} />
          </div>
        );
      },
    })),
  ];

  return (
    <AdminLayout>
      <div className="p-4 mx-auto bg-white rounded-lg">
        <h1 className="mb-2 text-3xl font-Poppins sm:mb-0">Role Permissions Management</h1>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">Select Role</label>
          <select
            className="w-full max-w-sm p-2 border rounded"
            value={selectedRoleId ?? ""}
            onChange={(e) => {
              const roleId = Number(e.target.value);
              setSelectedRoleId(roleId);
              setTogglingPermissionId(null);
              queryClient.invalidateQueries({ queryKey: ["rolePermissions", roleId] });
            }}
          >
            <option value="">-- Select a Role --</option>
            {roles.map((role: (typeof roles)[number]) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {!selectedRole ? (
          <p className="mt-4 italic text-gray-500">Select a role to manage its permissions.</p>
        ) : (
          <DataTable<AssetRow> key={rolePermissionsQuery.data?.length} columns={columns} fetchPage={fetchPage} initialPageSize={10} pageSizes={[5, 10, 20]} />
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  );
}
