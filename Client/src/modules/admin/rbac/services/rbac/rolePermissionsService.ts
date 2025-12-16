import { AxiosResponse } from "axios";
import api from "@Services/api";
import { RolePermission } from "modules/admin/rbac/types/rbac/rolePermissionTypes";

export const RolePermissionsService = {
  assignPermissionToRole: async (roleId: number, assetId: number, operationId: number): Promise<RolePermission> => {
    const res = await api.post("/admin/rbac/role-permissions", { roleId, assetId, operationId });
    return res.data;
  },

  revokePermissionFromRole: async (roleId: number, assetId: number, operationId: number): Promise<void> => {
    await api.delete("/admin/rbac/role-permissions", { data: { roleId, assetId, operationId } });
  },

  getRolePermissions: async (roleId: number): Promise<RolePermission[]> => {
    const res: AxiosResponse<RolePermission[]> = await api.get(`/admin/rbac/role-permissions/role/${roleId}`);
    return res.data;
  },
};
