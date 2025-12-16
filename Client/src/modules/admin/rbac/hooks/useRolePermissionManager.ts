import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RolePermissionsService } from "modules/admin/rbac/services/rbac/rolePermissionsService";
import { RolePermission } from "modules/admin/rbac/types/rbac/rolePermissionTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useRolePermissionManager(roleId: number | null, onToast?: ToastCallback) {
  const queryClient = useQueryClient();

  // Fetch RolePermissions
  const rolePermissionsQuery = useQuery<RolePermission[], Error>({
    queryKey: ["rolePermissions", roleId],
    queryFn: () => {
      if (roleId === null) return Promise.resolve([]);
      return RolePermissionsService.getRolePermissions(roleId);
    },
    enabled: roleId !== null,
  });

  // Assign
  const assignPermissionToRole = useMutation<RolePermission, Error, { roleId: number; assetId: number; operationId: number }>({
    mutationFn: ({ roleId, assetId, operationId }: { roleId: number; assetId: number; operationId: number }) => RolePermissionsService.assignPermissionToRole(roleId, assetId, operationId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rolePermissions", variables.roleId] });
      onToast?.("Permission assigned to role successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to assign permission to role", "error");
    },
  });

  // Revoke
  const revokePermissionFromRole = useMutation<void, Error, { roleId: number; assetId: number; operationId: number }>({
    mutationFn: ({ roleId, assetId, operationId }: { roleId: number; assetId: number; operationId: number }) => RolePermissionsService.revokePermissionFromRole(roleId, assetId, operationId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rolePermissions", variables.roleId] });
      onToast?.("Permission revoked from role successfully", "success");
    },
  });

  return {
    rolePermissionsQuery,
    assignPermissionToRole,
    revokePermissionFromRole,
  };
}
