import { AxiosResponse } from "axios";
import api from "@Services/api";
import { UserRoleAssignmentDto, UserRole, UserRoleListResponse } from "modules/admin/rbac/types/userRoleTypes";

export const UserRoleService = {
  assignRolesToUser: async (payload: UserRoleAssignmentDto): Promise<UserRole[]> => {
    const res: AxiosResponse<UserRole[]> = await api.post("/admin/rbac/user-roles/assign-multiple", payload);
    return res.data;
  },

  revokeRoleFromUser: async (userId: string, roleId: number): Promise<UserRole> => {
    const res: AxiosResponse<UserRole> = await api.delete("/admin/rbac/user-roles", { data: { userId, roleId } });
    return res.data;
  },

  getUserRoles: async (userId: string): Promise<UserRole[]> => {
    const res: AxiosResponse<UserRole[]> = await api.get(`/admin/rbac/user-roles/user/${userId}`);
    return res.data;
  },

  getAllUserRoles: async (params?: { search?: string; page?: number; perPage?: number }): Promise<UserRoleListResponse> => {
    const res: AxiosResponse<UserRoleListResponse> = await api.get("/admin/rbac/user-roles", {
      params,
    });
    return res.data;
  },
};
