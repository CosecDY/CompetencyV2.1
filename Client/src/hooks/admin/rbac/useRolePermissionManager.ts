import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RolePermissionsService } from "@Services/admin/rbac/rolePermissionsService";
import { RolePermission } from "@Types/admin/rbac/rolePermissionTypes";

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

  // Assign permission
  const assignPermissionToRole = useMutation<
    RolePermission, // return type
    Error,
    { roleId: number; permissionId: number }
  >({
    mutationFn: ({ roleId, permissionId }) => RolePermissionsService.assignPermissionToRole(roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ["rolePermissions", roleId] });
      onToast?.("Permission assigned to role successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to assign permission to role", "error");
    },
  });

  // Revoke permission
  const revokePermissionFromRole = useMutation<void, Error, { roleId: number; permissionId: number }>({
    mutationFn: ({ roleId, permissionId }) => RolePermissionsService.revokePermissionFromRole(roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ["rolePermissions", roleId] });
      onToast?.("Permission revoked from role successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to revoke permission from role", "error");
    },
  });

  return {
    rolePermissionsQuery,
    assignPermissionToRole,
    revokePermissionFromRole,
  };
}
