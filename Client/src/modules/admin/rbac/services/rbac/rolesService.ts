import { AxiosResponse } from "axios";
import api from "@Services/api";
import { Role, RolePageResult, CreateRoleDto, UpdateRoleDto } from "modules/admin/rbac/types/roleTypes";

export const RolesService = {
  getAllRoles: async (search?: string, page?: number, perPage?: number): Promise<RolePageResult> => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append("page", String(page));
    if (perPage !== undefined) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res: AxiosResponse<RolePageResult> = await api.get("/admin/rbac/roles", { params });

    return res.data;
  },

  getRoleById: async (id: number): Promise<Role> => {
    const res: AxiosResponse<Role> = await api.get(`/admin/rbac/roles/${id}`);
    return res.data;
  },

  createRole: async (payload: CreateRoleDto): Promise<Role> => {
    const res: AxiosResponse<Role> = await api.post("/admin/rbac/roles", payload);
    return res.data;
  },

  updateRole: async (id: number, payload: UpdateRoleDto): Promise<Role> => {
    const res: AxiosResponse<Role> = await api.put(`/admin/rbac/roles/${id}`, payload);
    return res.data;
  },

  deleteRole: async (id: number): Promise<void> => {
    await api.delete(`/admin/rbac/roles/${id}`);
  },
};
