import { AxiosResponse } from "axios";
import api from "@Services/api";
import { RolePermission } from "@Types/admin/rbac/rolePermissionTypes";

export const RolePermissionsService = {
  assignPermissionToRole: async (roleId: number, permissionId: number): Promise<RolePermission> => {
    const res: AxiosResponse<RolePermission> = await api.post("/admin/rbac/role-permissions", { roleId, permissionId });
    return res.data;
  },

  revokePermissionFromRole: async (roleId: number, permissionId: number): Promise<void> => {
    await api.delete("/admin/rbac/role-permissions", { data: { roleId, permissionId } });
  },

  // แก้ตรงนี้
  getRolePermissions: async (roleId: number): Promise<RolePermission[]> => {
    const res: AxiosResponse<RolePermission[]> = await api.get(`/admin/rbac/role-permissions/role/${roleId}`);
    return res.data;
  },
};
